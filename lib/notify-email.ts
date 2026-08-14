// Lead notification email.
//
// Uses Resend's HTTP API — no SMTP library, no extra dependency, works on
// serverless. DORMANT until RESEND_API_KEY and LEAD_NOTIFY_TO are set: without
// them sendLeadEmail() reports "skipped" and the lead is still stored, so a
// missing key never costs you an enquiry.
//
// To enable, add to .env.local (or your host's env):
//   RESEND_API_KEY=re_...
//   LEAD_NOTIFY_TO=sales@asraviation.com
//   LEAD_NOTIFY_FROM=website@yourdomain.com   (must be a Resend-verified domain)

import type { Lead } from "@/lib/leads";

export interface EmailResult {
  sent: boolean;
  skipped?: boolean;
  error?: string;
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.LEAD_NOTIFY_TO);
}

export async function sendLeadEmail(lead: Lead): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_NOTIFY_TO;
  const from = process.env.LEAD_NOTIFY_FROM || "onboarding@resend.dev";

  if (!apiKey || !to) return { sent: false, skipped: true };

  const rows: Array<[string, string]> = [
    ["Service", lead.serviceTitle],
    ["Name", lead.name],
    ["Email", lead.email],
    ["Phone", lead.phone || "—"],
    ["Received", new Date(lead.createdAt).toLocaleString("en-IN")],
  ];

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:600px">
      <h2 style="margin:0 0 4px">New enquiry — ${escapeHtml(lead.serviceTitle)}</h2>
      <p style="color:#666;margin:0 0 16px">Lead #${lead.id} from the ASR Aviation website</p>
      <table cellpadding="6" style="border-collapse:collapse;width:100%">
        ${rows
          .map(
            ([label, value]) =>
              `<tr><td style="background:#f7f7f7;font-weight:600;width:120px">${label}</td><td>${escapeHtml(
                value
              )}</td></tr>`
          )
          .join("")}
      </table>
      <h3 style="margin:20px 0 6px">Message</h3>
      <p style="white-space:pre-wrap;line-height:1.5">${escapeHtml(lead.message || "—")}</p>
    </div>
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: to.split(",").map((address) => address.trim()),
        reply_to: lead.email,
        subject: `New enquiry — ${lead.serviceTitle} (#${lead.id})`,
        html,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      return { sent: false, error: `Resend ${response.status}: ${detail.slice(0, 200)}` };
    }

    return { sent: true };
  } catch (error: any) {
    return { sent: false, error: error?.message || "Email request failed" };
  }
}
