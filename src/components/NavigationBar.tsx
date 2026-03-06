"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, ChevronDown, Pencil } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  hasSubmenu: boolean;
}

const navItems: NavItem[] = [
  { label: "ホーム", href: "/", hasSubmenu: false },
  { label: "取引先", href: "/accounts", hasSubmenu: true },
  { label: "案件", href: "/opportunities", hasSubmenu: true },
  { label: "Chatter", href: "/chatter", hasSubmenu: false },
  { label: "グループ", href: "/groups", hasSubmenu: true },
  { label: "レポート", href: "/reports", hasSubmenu: true },
  { label: "ダッシュボード", href: "/dashboards", hasSubmenu: true },
  { label: "共有カレンダー", href: "/calendars", hasSubmenu: true },
  { label: "SE見積依頼", href: "/quotation-requests", hasSubmenu: true },
  { label: "分析情報検索", href: "/analysis-search", hasSubmenu: false },
  { label: "アイディア", href: "/ideas", hasSubmenu: true },
];

const VISIBLE_COUNT = 8;

function SubmenuDropdown({ item, onClose }: { item: NavItem; onClose: () => void }) {
  const displayName = item.label;
  return (
    <div
      className="absolute left-0 top-full mt-0 w-56 rounded-lg bg-white shadow-lg z-50 py-2"
      style={{ borderColor: "#DDDBDA" }}
    >
      <Link
        href={item.href}
        onClick={onClose}
        className="block px-4 py-2 text-sm hover:bg-gray-50"
        style={{ color: "#3E3E3C" }}
      >
        最近参照したデータ
      </Link>
      <Link
        href={item.href}
        onClick={onClose}
        className="block px-4 py-2 text-sm hover:bg-gray-50"
        style={{ color: "#3E3E3C" }}
      >
        すべての{displayName}
      </Link>
    </div>
  );
}

export default function NavigationBar() {
  const pathname = usePathname();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [showOverflow, setShowOverflow] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const visibleItems = navItems.slice(0, VISIBLE_COUNT);
  const overflowItems = navItems.slice(VISIBLE_COUNT);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const toggleSubmenu = (label: string) => {
    setOpenSubmenu((prev) => (prev === label ? null : label));
    setShowOverflow(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenSubmenu(null);
        setShowOverflow(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav
      ref={navRef}
      className="fixed top-12 left-0 right-0 z-40 flex h-12 items-center justify-between bg-white px-4"
      style={{
        borderBottom: "1px solid #DDDBDA",
        fontFamily: "-apple-system, 'Segoe UI', sans-serif",
      }}
    >
      {/* 左端: アプリランチャー + テキスト */}
      <div className="flex items-center gap-3 mr-4 shrink-0">
        <button className="flex h-8 w-8 items-center justify-center rounded hover:bg-gray-100">
          <LayoutGrid className="h-5 w-5" style={{ color: "#0070D2" }} />
        </button>
        <span className="font-bold text-sm" style={{ color: "#3E3E3C" }}>
          西部電機
        </span>
      </div>

      {/* 中央: タブメニュー */}
      <div className="flex items-center gap-0 flex-1 min-w-0">
        {visibleItems.map((item) => {
          const active = isActive(item.href);
          return (
            <div key={item.label} className="relative flex items-center">
              <Link
                href={item.href}
                className="flex items-center gap-1 px-3 h-12 text-sm font-medium transition-colors hover:bg-gray-50 whitespace-nowrap"
                style={{
                  color: active ? "#0070D2" : "#3E3E3C",
                  borderBottom: active ? "3px solid #0070D2" : "3px solid transparent",
                }}
              >
                {item.label}
              </Link>
              {item.hasSubmenu && (
                <button
                  onClick={() => toggleSubmenu(item.label)}
                  className="flex items-center justify-center h-12 pr-1 hover:bg-gray-50"
                  style={{
                    borderBottom: active ? "3px solid #0070D2" : "3px solid transparent",
                  }}
                >
                  <ChevronDown className="h-3 w-3" style={{ color: "#3E3E3C" }} />
                </button>
              )}
              {openSubmenu === item.label && item.hasSubmenu && (
                <SubmenuDropdown item={item} onClose={() => setOpenSubmenu(null)} />
              )}
            </div>
          );
        })}

        {/* さらに表示 */}
        {overflowItems.length > 0 && (
          <div className="relative">
            <button
              onClick={() => {
                setShowOverflow((prev) => !prev);
                setOpenSubmenu(null);
              }}
              className="flex items-center gap-1 px-3 h-12 text-sm font-medium hover:bg-gray-50 whitespace-nowrap"
              style={{ color: "#3E3E3C", borderBottom: "3px solid transparent" }}
            >
              さらに表示
              <ChevronDown className="h-3 w-3" />
            </button>
            {showOverflow && (
              <div className="absolute left-0 top-full mt-0 w-56 rounded-lg bg-white shadow-lg z-50 py-2">
                {overflowItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <div key={item.label}>
                      <div className="flex items-center justify-between hover:bg-gray-50">
                        <Link
                          href={item.href}
                          className="flex-1 px-4 py-2 text-sm"
                          style={{
                            color: active ? "#0070D2" : "#3E3E3C",
                            fontWeight: active ? 600 : 400,
                          }}
                          onClick={() => setShowOverflow(false)}
                        >
                          {item.label}
                        </Link>
                        {item.hasSubmenu && (
                          <button
                            onClick={() => toggleSubmenu(item.label)}
                            className="px-3 py-2"
                          >
                            <ChevronDown className="h-3 w-3" style={{ color: "#3E3E3C" }} />
                          </button>
                        )}
                      </div>
                      {openSubmenu === item.label && item.hasSubmenu && (
                        <div className="pl-4">
                          <Link
                            href={item.href}
                            onClick={() => {
                              setOpenSubmenu(null);
                              setShowOverflow(false);
                            }}
                            className="block px-4 py-1.5 text-xs hover:bg-gray-50"
                            style={{ color: "#3E3E3C" }}
                          >
                            最近参照したデータ
                          </Link>
                          <Link
                            href={item.href}
                            onClick={() => {
                              setOpenSubmenu(null);
                              setShowOverflow(false);
                            }}
                            className="block px-4 py-1.5 text-xs hover:bg-gray-50"
                            style={{ color: "#3E3E3C" }}
                          >
                            すべての{item.label}
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 右端: 編集アイコン */}
      <div className="shrink-0 ml-2">
        <button className="flex h-8 w-8 items-center justify-center rounded hover:bg-gray-100">
          <Pencil className="h-4 w-4" style={{ color: "#3E3E3C" }} />
        </button>
      </div>
    </nav>
  );
}
