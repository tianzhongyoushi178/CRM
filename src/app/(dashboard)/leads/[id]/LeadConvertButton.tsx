"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightLeft } from "lucide-react";

interface LeadConvertButtonProps {
  leadId: string;
}

export default function LeadConvertButton({ leadId }: LeadConvertButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConvert = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leads/${leadId}/convert`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "変換に失敗しました");
      }

      const data = await res.json();
      router.push(`/accounts/${data.accountId}`);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "変換に失敗しました");
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition-colors"
      >
        <ArrowRightLeft className="h-4 w-4" />
        リード変換
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-xl bg-white p-6 shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              リード変換の確認
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              このリードを変換すると、以下が作成されます：
            </p>
            <ul className="text-sm text-gray-600 mb-6 space-y-1 list-disc list-inside">
              <li>取引先（Account）</li>
              <li>取引先責任者（Contact）</li>
              <li>商談（Opportunity）</li>
            </ul>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleConvert}
                disabled={loading}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "変換中..." : "変換する"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
