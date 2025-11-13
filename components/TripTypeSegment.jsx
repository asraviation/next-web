"use client";
export default function TripTypeSegment({ value, onChange, className = "" }) {
  const opts = [
    { key: "one-way",     label: "One Way" },
    { key: "round-trip",  label: "Round Trip" },
    { key: "multi-trip",  label: "Multi Trip" },
  ];
  return (
    <div className={`inline-flex rounded-xl border bg-white p-1 ${className}`} role="radiogroup" aria-label="Trip type">
      {opts.map(o => {
        const active = value === o.key;
        return (
          <label
            key={o.key}
            className={`cursor-pointer px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap
              ${active ? "bg-emerald-600 text-white shadow" : "text-gray-700 hover:bg-gray-100"}`}
          >
            <input
              type="radio"
              className="sr-only"
              name="trip-type"
              value={o.key}
              checked={active}
              onChange={() => onChange(o.key)}
            />
            {o.label}
          </label>
        );
      })}
    </div>
  );
}
