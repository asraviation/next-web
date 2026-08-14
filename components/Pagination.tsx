"use client";

// Shared pager for the admin lists and the customer booking tracker.
// Renders nothing when everything fits on one page.

export interface PaginationProps {
  page: number;          // 1-based
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
  label?: string;        // e.g. "leads"
}

/** Page numbers with ellipses: 1 … 4 5 6 … 20 */
function pageList(current: number, last: number): Array<number | "gap"> {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);

  const pages = new Set<number>([1, last, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= last).sort((a, b) => a - b);

  const out: Array<number | "gap"> = [];
  let previous = 0;
  for (const page of sorted) {
    if (previous && page - previous > 1) out.push("gap");
    out.push(page);
    previous = page;
  }
  return out;
}

export default function Pagination({
  page,
  pageSize,
  total,
  onChange,
  label = "items",
}: PaginationProps) {
  const last = Math.max(1, Math.ceil(total / pageSize));
  if (total <= pageSize) return null;

  const first = (page - 1) * pageSize + 1;
  const upto = Math.min(page * pageSize, total);

  const button =
    "min-w-9 h-9 px-2 rounded-lg text-sm border transition disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-3 mt-6"
      aria-label={`${label} pagination`}
    >
      <p className="text-sm text-gray-500">
        Showing {first}–{upto} of {total} {label}
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className={`${button} border-gray-200 bg-white hover:bg-gray-50`}
          aria-label="Previous page"
        >
          ‹
        </button>

        {pageList(page, last).map((entry, i) =>
          entry === "gap" ? (
            <span key={`gap-${i}`} className="px-1 text-gray-400 select-none">
              …
            </span>
          ) : (
            <button
              key={entry}
              onClick={() => onChange(entry)}
              aria-current={entry === page ? "page" : undefined}
              className={`${button} ${
                entry === page
                  ? "border-yellow-400 bg-yellow-50 text-yellow-800 font-semibold"
                  : "border-gray-200 bg-white hover:bg-gray-50"
              }`}
            >
              {entry}
            </button>
          )
        )}

        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= last}
          className={`${button} border-gray-200 bg-white hover:bg-gray-50`}
          aria-label="Next page"
        >
          ›
        </button>
      </div>
    </nav>
  );
}
