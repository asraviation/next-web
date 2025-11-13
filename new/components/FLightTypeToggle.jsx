"use client";
export default function FlightTypeToggle({ value, onChange, className = "" }) {
  const opts = [
    { key: "charter", label: "Charter" },
    { key: "seat",    label: "Seat" },
  ];
  return (
    <div className={`inline-flex rounded-xl border bg-white p-1 ${className}`} role="radiogroup" aria-label="Flight type">
      {opts.map(o => {
        const active = value === o.key;
        return (
          <label
            key={o.key}
            className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition
              ${active ? "bg-black text-white shadow" : "text-gray-700 hover:bg-gray-100"}`}
          >
            <input
              type="radio"
              className="sr-only"
              name="flight-type"
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
