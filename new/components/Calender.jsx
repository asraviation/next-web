"use client";
import { useMemo, useState } from "react";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];
const WEEKDAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function Calendar({ onSelectDate, initialDate, className = "" }) {
  const init = initialDate ? new Date(initialDate) : new Date();
  const [year, setYear] = useState(init.getFullYear());
  const [month, setMonth] = useState(init.getMonth()); // 0-11
  const [selected, setSelected] = useState(null);      // {y,m,d} or null

  const today = new Date();

  const cells = useMemo(() => {
    const first = new Date(year, month, 1);
    const startIdx = first.getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev  = new Date(year, month, 0).getDate();

    const arr = [];
    // leading days from previous month
    for (let i = 0; i < startIdx; i++) {
      arr.push({ day: daysInPrev - startIdx + 1 + i, prev: true });
    }
    // current month
    for (let d = 1; d <= daysInMonth; d++) arr.push({ day: d, current: true });
    // trailing to fill full weeks
    while (arr.length % 7 !== 0) arr.push({ day: arr.length, next: true });
    return arr;
  }, [year, month]);

  const goPrev = () => {
    setMonth(m => (m === 0 ? (setYear(y => y - 1), 11) : m - 1));
  };
  const goNext = () => {
    setMonth(m => (m === 11 ? (setYear(y => y + 1), 0) : m + 1));
  };

  const commit = (cell) => {
    let y = year, m = month, d = cell.day;
    if (cell.prev) { if (m === 0) { m = 11; y -= 1; } else { m -= 1; } }
    else if (cell.next && !cell.current) { if (m === 11) { m = 0; y += 1; } else { m += 1; } }
    setSelected({ y, m, d });
    onSelectDate && onSelectDate(y, m, d); // m is 0-11
  };

  const isToday = (d, c) => {
    let y = year, m = month;
    if (c.prev)  { if (m === 0) { m = 11; y -= 1; } else { m -= 1; } }
    if (c.next && !c.current) { if (m === 11) { m = 0; y += 1; } else { m += 1; } }
    return (
      d === today.getDate() &&
      m === today.getMonth() &&
      y === today.getFullYear()
    );
  };

  const isSelected = (d, c) => {
    if (!selected) return false;
    let y = year, m = month;
    if (c.prev)  { if (m === 0) { m = 11; y -= 1; } else { m -= 1; } }
    if (c.next && !c.current) { if (m === 11) { m = 0; y += 1; } else { m += 1; } }
    return selected.y === y && selected.m === m && selected.d === d;
  };

  return (
    <div className={`rounded-xl border bg-white shadow-xl p-3 w-[20rem] ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <button onClick={goPrev} className="h-8 w-8 rounded-lg border hover:bg-gray-50">‹</button>
        <div className="text-sm font-semibold">{MONTHS[month]} {year}</div>
        <button onClick={goNext} className="h-8 w-8 rounded-lg border hover:bg-gray-50">›</button>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-1">
        {WEEKDAYS.map(w => <div key={w} className="py-1">{w}</div>)}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((c, i) => {
          const muted = c.prev || c.next;
          const todayCls = isToday(c.day, c) ? "ring-2 ring-emerald-400" : "";
          const selectedCls = isSelected(c.day, c) ? "bg-emerald-600 text-white" : "";
          return (
            <button
              key={i}
              onClick={() => commit(c)}
              className={`h-9 rounded-lg text-sm transition border
                ${selectedCls || (muted ? "text-gray-400 bg-white border-transparent" : "bg-white hover:bg-emerald-50 border-transparent")}
                ${todayCls}
              `}
            >
              {c.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
