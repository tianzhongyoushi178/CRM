"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Search,
  Star,
  Plus,
  Bell,
  User,
  LogOut,
  Settings,
  CheckSquare,
  Calendar,
  Lightbulb,
  Activity,
  Mail,
  StickyNote,
  CreditCard,
  Briefcase,
} from "lucide-react";

type DropdownName = "favorites" | "actions" | "notifications" | "profile" | null;

const globalActions = [
  { label: "新規ToDo", icon: CheckSquare, color: "text-green-500" },
  { label: "新規行動", icon: Calendar, color: "text-purple-500" },
  { label: "新規アイディア", icon: Lightbulb, color: "text-purple-500" },
  { label: "活動の記録", icon: Activity, color: "text-green-500" },
  { label: "メール", icon: Mail, color: "text-gray-500" },
  { label: "新規メモ", icon: StickyNote, color: "text-orange-500" },
  { label: "新規名刺", icon: CreditCard, color: "text-gray-500" },
  { label: "新規案件", icon: Briefcase, color: "text-orange-500" },
];

export default function GlobalHeader() {
  const { data: session } = useSession();
  const [openDropdown, setOpenDropdown] = useState<DropdownName>(null);
  const headerRef = useRef<HTMLElement>(null);

  const toggleDropdown = (name: DropdownName) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-50 flex h-12 items-center justify-between px-4"
      style={{ backgroundColor: "#0070D2", fontFamily: "-apple-system, 'Segoe UI', sans-serif" }}
    >
      {/* 左側: ロゴ */}
      <div className="flex items-center">
        <Link href="/" className="text-white font-bold text-lg tracking-wide hover:opacity-90">
          Seibu
        </Link>
      </div>

      {/* 中央: 検索バー */}
      <div className="flex-1 flex justify-center px-4">
        <div className="relative w-[400px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
          <input
            type="text"
            placeholder="検索..."
            className="w-full rounded-full py-1.5 pl-10 pr-4 text-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          />
        </div>
      </div>

      {/* 右側: アイコンボタン */}
      <div className="flex items-center gap-1">
        {/* お気に入り */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown("favorites")}
            className="flex h-8 w-8 items-center justify-center rounded text-white/80 hover:bg-white/10"
          >
            <Star className="h-5 w-5" />
          </button>
          {openDropdown === "favorites" && (
            <div className="absolute right-0 top-10 w-64 rounded-lg bg-white shadow-lg z-50">
              <div className="p-4 text-sm" style={{ color: "#3E3E3C" }}>
                <p className="font-semibold mb-2">お気に入り</p>
                <p className="text-gray-400 text-xs">お気に入りはまだありません</p>
              </div>
            </div>
          )}
        </div>

        {/* グローバルアクション */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown("actions")}
            className="flex h-8 w-8 items-center justify-center rounded text-white/80 hover:bg-white/10"
          >
            <Plus className="h-5 w-5" />
          </button>
          {openDropdown === "actions" && (
            <div className="absolute right-0 top-10 w-56 rounded-lg bg-white shadow-lg z-50 py-2">
              {globalActions.map((action) => (
                <button
                  key={action.label}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50"
                  style={{ color: "#3E3E3C" }}
                >
                  <action.icon className={`h-4 w-4 ${action.color}`} />
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 通知 */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown("notifications")}
            className="relative flex h-8 w-8 items-center justify-center rounded text-white/80 hover:bg-white/10"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              3
            </span>
          </button>
          {openDropdown === "notifications" && (
            <div className="absolute right-0 top-10 w-80 rounded-lg bg-white shadow-lg z-50">
              <div className="p-4 text-sm" style={{ color: "#3E3E3C" }}>
                <p className="font-semibold mb-3">通知</p>
                <div className="space-y-3">
                  <div className="flex items-start gap-2 text-xs border-b pb-2" style={{ borderColor: "#DDDBDA" }}>
                    <Bell className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                    <div>
                      <p>新しい案件が割り当てられました</p>
                      <p className="text-gray-400 mt-1">5分前</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-xs border-b pb-2" style={{ borderColor: "#DDDBDA" }}>
                    <Bell className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                    <div>
                      <p>タスクの期限が近づいています</p>
                      <p className="text-gray-400 mt-1">1時間前</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <Bell className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                    <div>
                      <p>取引先が更新されました</p>
                      <p className="text-gray-400 mt-1">3時間前</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* プロファイル */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown("profile")}
            className="flex items-center gap-2 rounded px-2 py-1 text-white/80 hover:bg-white/10"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
              <User className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm text-white hidden sm:inline">
              {session?.user?.name ?? "ユーザー"}
            </span>
          </button>
          {openDropdown === "profile" && (
            <div className="absolute right-0 top-10 w-56 rounded-lg bg-white shadow-lg z-50 py-2">
              <div className="px-4 py-2 border-b" style={{ borderColor: "#DDDBDA" }}>
                <p className="text-sm font-semibold" style={{ color: "#3E3E3C" }}>
                  {session?.user?.name ?? "ユーザー"}
                </p>
                <p className="text-xs text-gray-400">{session?.user?.email ?? ""}</p>
              </div>
              <Link
                href="/settings"
                className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50"
                style={{ color: "#3E3E3C" }}
              >
                <Settings className="h-4 w-4" />
                設定
              </Link>
              <button
                onClick={() => {
                  window.location.href = "/api/auth/signout";
                }}
                className="flex w-full items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50"
                style={{ color: "#3E3E3C" }}
              >
                <LogOut className="h-4 w-4" />
                ログアウト
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
