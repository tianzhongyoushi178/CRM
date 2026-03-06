"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarNavProps {
  title: string;
  sections: Array<{
    heading?: string;
    items: Array<{ label: string; href: string; active?: boolean }>;
  }>;
}

export default function SidebarNav({ title, sections }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <aside
      className="w-60 shrink-0 bg-white border-r h-full overflow-y-auto"
      style={{ borderColor: "#DDDBDA" }}
    >
      <div className="p-4">
        <h2 className="text-base font-bold mb-4" style={{ color: "#3E3E3C" }}>
          {title}
        </h2>

        {sections.map((section, sectionIdx) => (
          <div key={sectionIdx} className="mb-4">
            {section.heading && (
              <h3
                className="text-xs font-semibold uppercase tracking-wide mb-2 px-3"
                style={{ color: "#706E6B" }}
              >
                {section.heading}
              </h3>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  item.active !== undefined
                    ? item.active
                    : pathname === item.href;

                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="block px-3 py-2 text-sm rounded-r transition-colors"
                      style={{
                        color: isActive ? "#0070D2" : "#3E3E3C",
                        backgroundColor: isActive ? "rgb(239 246 255)" : "transparent",
                        borderLeft: isActive
                          ? "3px solid #0070D2"
                          : "3px solid transparent",
                        fontWeight: isActive ? 600 : 400,
                      }}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}
