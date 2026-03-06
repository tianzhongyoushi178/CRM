"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";

interface SubmitToSalesButtonProps {
  id: string;
  currentStatus: string;
}

export default function SubmitToSalesButton({
  id,
  currentStatus,
}: SubmitToSalesButtonProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 営業へ提出済・キャンセル・SE依頼不要の場合は非表示
  if (
    currentStatus === "SUBMITTED_TO_SALES" ||
    currentStatus === "CANCELLED" ||
    currentStatus === "NOT_REQUIRED"
  ) {
    return null;
  }

  async function handleSubmit() {
    if (!confirm("営業へ提出してもよろしいですか？")) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/quotation-requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "SUBMITTED_TO_SALES" }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "提出に失敗しました");
      }

      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "提出に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <button
      onClick={handleSubmit}
      disabled={isSubmitting}
      className="inline-flex items-center gap-2 rounded-lg bg-[#0070D2] px-4 py-2 text-sm font-medium text-white hover:bg-[#005FB2] disabled:opacity-50 transition-colors"
    >
      <Send className="h-4 w-4" />
      {isSubmitting ? "提出中..." : "営業へ提出"}
    </button>
  );
}
