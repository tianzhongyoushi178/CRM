"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteCalendarButtonProps {
  calendarId: string;
  calendarName: string;
}

export default function DeleteCalendarButton({
  calendarId,
  calendarName,
}: DeleteCalendarButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`「${calendarName}」を削除してもよろしいですか？この操作は取り消せません。`)) {
      return;
    }

    setIsDeleting(true);

    try {
      const res = await fetch(`/api/calendars/${calendarId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "削除に失敗しました");
      }

      router.push("/calendars");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "削除に失敗しました");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {isDeleting ? "削除中..." : "削除"}
    </button>
  );
}
