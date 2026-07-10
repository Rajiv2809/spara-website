/**
 * TimePicker24 — Custom time picker format 24 jam.
 * Dropdown custom (bukan <select> native) agar tinggi terkontrol.
 */

import { useState, useRef, useEffect, useMemo } from "react";
import { Icon } from "@iconify/react";

const pad = (n) => String(n).padStart(2, "0");
const HOURS   = Array.from({ length: 24 }, (_, i) => pad(i));
const MINUTES = Array.from({ length: 12 }, (_, i) => pad(i * 5));

function TimeDropdown({ value, options, onChange, disabled, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const listRef = useRef(null);

  // Tutup saat klik di luar
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Scroll ke item aktif saat dropdown terbuka
  useEffect(() => {
    if (!open || !listRef.current || !value) return;
    const active = listRef.current.querySelector("[data-active='true']");
    if (active) active.scrollIntoView({ block: "nearest" });
  }, [open, value]);

  return (
    <div ref={ref} className="relative flex-1">
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={`w-full flex items-center justify-between border rounded-md px-2 py-2 text-sm font-semibold transition
          ${disabled
            ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
            : open
              ? "border-[#C0254A] bg-white"
              : "border-gray-300 bg-white hover:border-[#C0254A]"
          }`}
      >
        <span className={value ? "text-[#3D0C1F]" : "text-gray-400"}>
          {value || placeholder}
        </span>
        <Icon
          icon={open ? "mdi:chevron-up" : "mdi:chevron-down"}
          width={16}
          className="text-gray-400 flex-shrink-0"
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          ref={listRef}
          className="absolute z-[200] top-full mt-1 left-0 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-y-auto"
          style={{ maxHeight: "180px" }}
        >
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              data-active={opt === value}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-center py-2 text-sm font-semibold transition
                ${opt === value
                  ? "bg-[#A3264C] text-white"
                  : "text-[#3D0C1F] hover:bg-pink-50"
                }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TimePicker24({
  value = "",
  onChange,
  label,
  required = false,
  disabled = false,
  minTime = "",
}) {
  const [hh, mm] = value ? value.split(":") : ["", ""];
  const [minHH, minMM] = minTime ? minTime.split(":") : ["", ""];

  const allowedHours = useMemo(() => {
    if (!minTime) return HOURS;
    return HOURS.filter((h) => h >= (minHH ?? "00"));
  }, [minTime, minHH]);

  const allowedMinutes = useMemo(() => {
    if (!minTime || hh !== minHH) return MINUTES;
    return MINUTES.filter((m) => m >= (minMM ?? "00"));
  }, [minTime, hh, minHH, minMM]);

  const handleHour = (newH) => {
    const safeMM =
      minTime && newH === minHH
        ? mm < minMM ? minMM : mm || "00"
        : mm || "00";
    onChange(`${newH}:${safeMM}`);
  };

  const handleMinute = (newM) => {
    onChange(`${hh || "00"}:${newM}`);
  };

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-[13px] font-medium text-[#3D0C1F]">
          {label} {required && "*"}
        </label>
      )}
      <div className="flex items-center gap-1">
        <TimeDropdown
          value={hh}
          options={allowedHours}
          onChange={handleHour}
          disabled={disabled}
          placeholder="JJ"
        />

        <span className="text-[#3D0C1F] font-bold text-base leading-none flex-shrink-0">:</span>

        <TimeDropdown
          value={mm}
          options={allowedMinutes}
          onChange={handleMinute}
          disabled={disabled || !hh}
          placeholder="MM"
        />

        {/* Preview */}
        <div className="flex items-center gap-1 min-w-[52px] ml-1">
          <Icon icon="mdi:clock-outline" className="text-[#A3264C] flex-shrink-0" width={14} />
          <span className="text-[13px] font-bold text-[#3D0C1F]">
            {hh && mm ? `${hh}:${mm}` : "--:--"}
          </span>
        </div>
      </div>
    </div>
  );
}
