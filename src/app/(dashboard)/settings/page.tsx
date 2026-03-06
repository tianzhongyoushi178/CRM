"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { Settings, User, Shield } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("新しいパスワードが一致しません");
      return;
    }

    if (newPassword.length < 6) {
      setError("パスワードは6文字以上にしてください");
      return;
    }

    const res = await fetch("/api/settings/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (res.ok) {
      setMessage("パスワードを変更しました");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      const data = await res.json();
      setError(data.error || "パスワードの変更に失敗しました");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Settings className="h-7 w-7" />
        設定
      </h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* プロフィール */}
        <div className="rounded-xl bg-white p-6 shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-[#1B96FF]" />
            プロフィール
          </h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-500">名前</span>
              <p className="font-medium text-gray-900">{session?.user?.name}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">メールアドレス</span>
              <p className="font-medium text-gray-900">{session?.user?.email}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">役割</span>
              <p className="font-medium text-gray-900">{session?.user?.role}</p>
            </div>
          </div>
        </div>

        {/* パスワード変更 */}
        <div className="rounded-xl bg-white p-6 shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#1B96FF]" />
            パスワード変更
          </h2>

          {message && (
            <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-600">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                現在のパスワード
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1B96FF] focus:outline-none focus:ring-1 focus:ring-[#1B96FF]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                新しいパスワード
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1B96FF] focus:outline-none focus:ring-1 focus:ring-[#1B96FF]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                新しいパスワード（確認）
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1B96FF] focus:outline-none focus:ring-1 focus:ring-[#1B96FF]"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-[#0176D3] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#014486] transition-colors"
            >
              パスワードを変更
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
