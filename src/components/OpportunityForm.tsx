"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const STAGE_OPTIONS = [
  { value: "PROSPECTING", label: "見込み", probability: 10 },
  { value: "QUALIFICATION", label: "評価", probability: 20 },
  { value: "NEEDS_ANALYSIS", label: "ニーズ分析", probability: 40 },
  { value: "PROPOSAL", label: "提案", probability: 60 },
  { value: "NEGOTIATION", label: "交渉", probability: 80 },
  { value: "CLOSED_WON", label: "成約", probability: 100 },
  { value: "CLOSED_LOST", label: "失注", probability: 0 },
] as const;

interface Account {
  id: string;
  name: string;
}

interface OpportunityData {
  id?: string;
  name: string;
  amount: number | null;
  stage: string;
  probability: number | null;
  closeDate: string | null;
  description: string | null;
  accountId: string | null;
}

interface OpportunityFormProps {
  initialData?: OpportunityData;
  isEdit?: boolean;
}

export default function OpportunityForm({
  initialData,
  isEdit = false,
}: OpportunityFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [accounts, setAccounts] = useState<Account[]>([]);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    amount: initialData?.amount != null ? String(initialData.amount) : "",
    stage: initialData?.stage || "PROSPECTING",
    probability:
      initialData?.probability != null ? String(initialData.probability) : "10",
    closeDate: initialData?.closeDate
      ? initialData.closeDate.slice(0, 10)
      : "",
    description: initialData?.description || "",
    accountId: initialData?.accountId || "",
  });

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch("/api/accounts?limit=100");
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.accounts || []);
      }
    } catch {
      // 取引先の取得に失敗してもフォーム自体は使える
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  function handleStageChange(stage: string) {
    const stageOption = STAGE_OPTIONS.find((s) => s.value === stage);
    setFormData((prev) => ({
      ...prev,
      stage,
      probability: stageOption ? String(stageOption.probability) : prev.probability,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const url = isEdit
        ? `/api/opportunities/${initialData?.id}`
        : "/api/opportunities";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          amount: formData.amount || null,
          stage: formData.stage,
          probability: formData.probability || null,
          closeDate: formData.closeDate || null,
          description: formData.description || null,
          accountId: formData.accountId || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "保存に失敗しました");
      }

      const opportunity = await res.json();
      router.push(`/opportunities/${opportunity.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* 商談名 */}
        <div className="sm:col-span-2">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            商談名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0176D3] focus:outline-none focus:ring-1 focus:ring-[#0176D3]"
            placeholder="商談名を入力"
          />
        </div>

        {/* 取引先 */}
        <div>
          <label
            htmlFor="accountId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            取引先
          </label>
          <select
            id="accountId"
            value={formData.accountId}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, accountId: e.target.value }))
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0176D3] focus:outline-none focus:ring-1 focus:ring-[#0176D3]"
          >
            <option value="">-- 選択してください --</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </div>

        {/* 金額 */}
        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            金額
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
              ¥
            </span>
            <input
              type="number"
              id="amount"
              value={formData.amount}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, amount: e.target.value }))
              }
              className="w-full rounded-lg border border-gray-300 pl-7 pr-3 py-2 text-sm focus:border-[#0176D3] focus:outline-none focus:ring-1 focus:ring-[#0176D3]"
              placeholder="0"
              min="0"
            />
          </div>
        </div>

        {/* ステージ */}
        <div>
          <label
            htmlFor="stage"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            ステージ
          </label>
          <select
            id="stage"
            value={formData.stage}
            onChange={(e) => handleStageChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0176D3] focus:outline-none focus:ring-1 focus:ring-[#0176D3]"
          >
            {STAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 確度 */}
        <div>
          <label
            htmlFor="probability"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            確度 (%)
          </label>
          <input
            type="number"
            id="probability"
            value={formData.probability}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, probability: e.target.value }))
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0176D3] focus:outline-none focus:ring-1 focus:ring-[#0176D3]"
            min="0"
            max="100"
          />
        </div>

        {/* 完了予定日 */}
        <div>
          <label
            htmlFor="closeDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            完了予定日
          </label>
          <input
            type="date"
            id="closeDate"
            value={formData.closeDate}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, closeDate: e.target.value }))
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0176D3] focus:outline-none focus:ring-1 focus:ring-[#0176D3]"
          />
        </div>

        {/* 説明 */}
        <div className="sm:col-span-2">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            説明
          </label>
          <textarea
            id="description"
            rows={4}
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0176D3] focus:outline-none focus:ring-1 focus:ring-[#0176D3]"
            placeholder="商談の説明を入力"
          />
        </div>
      </div>

      {/* ボタン */}
      <div className="flex items-center gap-3 pt-4 border-t">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-[#0176D3] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#032D60] disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? "保存中..." : isEdit ? "更新" : "作成"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
