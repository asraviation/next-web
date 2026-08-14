// Deals REST endpoint.
//
// Same verb contract as the ASR Hono backend (`/deals`):
//   GET    -> active deals, sorted by departure   (public, rate limited)
//   PUT    -> add a deal                          (admin session required)
//   POST   -> update a deal   { id, ...fields }   (admin session required)
//   DELETE -> remove a deal   { id }              (admin session required)

import { NextResponse } from "next/server";
import { addDeal, deleteDeal, listDeals, updateDeal } from "@/lib/deals";
import { requireAdmin } from "@/lib/admin-auth";
import { checkRateLimit, clientIdentifier, rateLimitHeaders } from "@/lib/rate-limit";
import {
  ValidationError,
  parseDealId,
  readJsonBody,
  validateDealPatch,
  validateNewDeal,
} from "@/lib/validate-deal";

export const dynamic = "force-dynamic";

/** Rate limit, then require an admin session. */
async function guard(request: Request) {
  const limit = checkRateLimit(clientIdentifier(request), "mutation");
  const headers = rateLimitHeaders(limit);

  if (!limit.allowed) {
    return {
      headers,
      response: NextResponse.json(
        { error: "Too many requests. Please slow down." },
        { status: 429, headers }
      ),
    };
  }

  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return {
      headers,
      response: NextResponse.json({ error: auth.error }, { status: auth.status, headers }),
    };
  }

  return { headers, response: null };
}

/** Map thrown validation errors to responses; never leak internals. */
function fail(err: unknown, headers: Record<string, string>, context: string) {
  if (err instanceof ValidationError) {
    return NextResponse.json({ error: err.message }, { status: err.status, headers });
  }
  console.error(`${context}:`, err);
  return NextResponse.json({ error: "Internal server error" }, { status: 500, headers });
}

export async function GET(request: Request) {
  const limit = checkRateLimit(clientIdentifier(request), "read");
  const headers = rateLimitHeaders(limit);

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429, headers }
    );
  }

  try {
    return NextResponse.json(await listDeals(), { headers });
  } catch (err) {
    return fail(err, headers, "Fetch Error");
  }
}

export async function PUT(request: Request) {
  const { headers, response } = await guard(request);
  if (response) return response;

  try {
    const deal = await addDeal(validateNewDeal(await readJsonBody(request)));
    return NextResponse.json({ message: "Deal added successfully", deal }, { headers });
  } catch (err) {
    return fail(err, headers, "Insert Error");
  }
}

export async function POST(request: Request) {
  const { headers, response } = await guard(request);
  if (response) return response;

  try {
    const { id, ...rest } = await readJsonBody(request);
    const dealId = parseDealId(id);
    const patch = validateDealPatch(rest);

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400, headers });
    }

    const deal = await updateDeal(dealId, patch);
    if (!deal) {
      return NextResponse.json(
        { error: "No deal found with the given ID" },
        { status: 404, headers }
      );
    }

    return NextResponse.json({ message: "Deal updated successfully", deal }, { headers });
  } catch (err) {
    return fail(err, headers, "Update Error");
  }
}

export async function DELETE(request: Request) {
  const { headers, response } = await guard(request);
  if (response) return response;

  try {
    const body = await readJsonBody(request);
    const dealId = parseDealId(body?.id);

    const removed = await deleteDeal(dealId);
    if (!removed) {
      return NextResponse.json(
        { error: "No deal found with the given ID" },
        { status: 404, headers }
      );
    }

    return NextResponse.json({ message: "Deal deleted successfully" }, { headers });
  } catch (err) {
    return fail(err, headers, "Delete Error");
  }
}
