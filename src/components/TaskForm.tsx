"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { TaskStatus, Priority } from "@prisma/client";

const taskStatusLabels: Record<TaskStatus, string> = {
  NOT_STARTED: "未着手",
  IN_PROGRESS: "進行中",
  COMPLETED: "完了",
  DEFERRED: "保留",
};

const priorityLabels: Record<Priority, string> = {
  HIGH: "高",
  NORMAL: "中",
  LOW: "低",
};

interface TaskFormData {
  subject: string;
  description: string;
  dueDate: string;
  status: TaskStatus;
  priority: Priority;
}

interface TaskFormProps {
  initialData?: Partial<TaskFormData>;
  taskId?: string;
  isEdit?: boolean;
}

export default function TaskForm({
  initialData,
  taskId,
  isEdit = false,
}: TaskFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<TaskFormData>({
    subject: initialData?.subject || "",
    description: initialData?.description || "",
    dueDate: initialData?.dueDate || "",
    status: initialData?.status || "NOT_STARTED",
    priority: initialData?.priority || "NORMAL",
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = isEdit ? `/api/tasks/${taskId}` : "/api/tasks";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "エラーが発生しました");
      }

      const task = await res.json();
      router.push(`/tasks/${task.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    field: keyof TaskFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="rounded-xl bg-white p-6 shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">タスク情報</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              件名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => handleChange("subject", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1B96FF] focus:outline-none focus:ring-1 focus:ring-[#1B96FF]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ステータス
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleChange("status", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1B96FF] focus:outline-none focus:ring-1 focus:ring-[#1B96FF]"
            >
              {Object.entries(taskStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              優先度
            </label>
            <select
              value={formData.priority}
              onChange={(e) => handleChange("priority", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1B96FF] focus:outline-none focus:ring-1 focus:ring-[#1B96FF]"
            >
              {Object.entries(priorityLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              期日
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleChange("dueDate", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1B96FF] focus:outline-none focus:ring-1 focus:ring-[#1B96FF]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              説明
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1B96FF] focus:outline-none focus:ring-1 focus:ring-[#1B96FF]"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-[#0176D3] px-4 py-2 text-sm font-medium text-white hover:bg-[#032D60] disabled:opacity-50"
        >
          {loading ? "保存中..." : isEdit ? "更新" : "作成"}
        </button>
      </div>
    </form>
  );
}
