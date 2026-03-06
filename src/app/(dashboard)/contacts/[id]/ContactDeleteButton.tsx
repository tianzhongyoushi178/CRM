"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

interface ContactDeleteButtonProps {
  contactId: string;
}

export default function ContactDeleteButton({
  contactId,
}: ContactDeleteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("この取引先責任者を削除してもよろしいですか？")) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/contacts/${contactId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "削除に失敗しました");
      }

      router.push("/contacts");
      router.refresh();
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("削除に失敗しました");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
    >
      <Trash2 className="h-4 w-4" />
      {loading ? "削除中..." : "削除"}
    </button>
  );
}
