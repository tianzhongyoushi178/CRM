import type { ReactNode } from "react";

interface DetailFieldProps {
  label: string;
  value: ReactNode;
}

export default function DetailField({ label, value }: DetailFieldProps) {
  const isEmpty =
    value === null || value === undefined || value === "" || value === "-";

  return (
    <div className="py-2">
      <dt className="text-xs text-[#706E6B] uppercase mb-1 font-medium tracking-wide">
        {label}
      </dt>
      <dd className="text-sm text-[#3E3E3C]">{isEmpty ? "\u2014" : value}</dd>
    </div>
  );
}
