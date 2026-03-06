"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ActivityType, ActivityStatus, Priority } from "@prisma/client";

const activityTypeLabels: Record<ActivityType, string> = {
  CALL: "電話",
  EMAIL: "メール",
  MEETING: "会議",
  VISIT: "訪問",
  TASK: "タスク",
  OTHER: "その他",
};

const activityStatusLabels: Record<ActivityStatus, string> = {
  OPEN: "未着手",
  IN_PROGRESS: "進行中",
  COMPLETED: "完了",
  CANCELLED: "キャンセル",
};

const priorityLabels: Record<Priority, string> = {
  HIGH: "高",
  NORMAL: "中",
  LOW: "低",
};

interface RelatedRecord {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
}

interface ActivityFormData {
  type: ActivityType;
  subject: string;
  description: string;
  dueDate: string;
  status: ActivityStatus;
  priority: Priority;
  accountId: string;
  contactId: string;
  opportunityId: string;
  leadId: string;
}

interface ActivityFormProps {
  initialData?: Partial<ActivityFormData>;
  activityId?: string;
  isEdit?: boolean;
}

export default function ActivityForm({
  initialData,
  activityId,
  isEdit = false,
}: ActivityFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<ActivityFormData>({
    type: initialData?.type || "CALL",
    subject: initialData?.subject || "",
    description: initialData?.description || "",
    dueDate: initialData?.dueDate || "",
    status: initialData?.status || "OPEN",
    priority: initialData?.priority || "NORMAL",
    accountId: initialData?.accountId || "",
    contactId: initialData?.contactId || "",
    opportunityId: initialData?.opportunityId || "",
    leadId: initialData?.leadId || "",
  });

  const [accounts, setAccounts] = useState<RelatedRecord[]>([]);
  const [contacts, setContacts] = useState<RelatedRecord[]>([]);
  const [opportunities, setOpportunities] = useState<RelatedRecord[]>([]);
  const [leads, setLeads] = useState<RelatedRecord[]>([]);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const [accRes, conRes, oppRes, leadRes] = await Promise.all([
          fetch("/api/accounts?limit=100"),
          fetch("/api/contacts?limit=100"),
          fetch("/api/opportunities?limit=100"),
          fetch("/api/leads?limit=100"),
        ]);
        const accData = await accRes.json();
        const conData = await conRes.json();
        const oppData = await oppRes.json();
        const leadData = await leadRes.json();

        if (accData.accounts) setAccounts(accData.accounts);
        if (conData.contacts) setContacts(conData.contacts);
        if (oppData.opportunities) setOpportunities(oppData.opportunities);
        if (leadData.leads) setLeads(leadData.leads);
      } catch {
        console.error("関連データの取得に失敗しました");
      }
    };
    fetchRelated();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = isEdit ? `/api/activities/${activityId}` : "/api/activities";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          accountId: formData.accountId || null,
          contactId: formData.contactId || null,
          opportunityId: formData.opportunityId || null,
          leadId: formData.leadId || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "エラーが発生しました");
      }

      const activity = await res.json();
      router.push(`/activities/${activity.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    field: keyof ActivityFormData,
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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              種類 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleChange("type", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1B96FF] focus:outline-none focus:ring-1 focus:ring-[#1B96FF]"
              required
            >
              {Object.entries(activityTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
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
              {Object.entries(activityStatusLabels).map(([value, label]) => (
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

      <div className="rounded-xl bg-white p-6 shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">関連先</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              取引先
            </label>
            <select
              value={formData.accountId}
              onChange={(e) => handleChange("accountId", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1B96FF] focus:outline-none focus:ring-1 focus:ring-[#1B96FF]"
            >
              <option value="">-- 選択してください --</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              取引先責任者
            </label>
            <select
              value={formData.contactId}
              onChange={(e) => handleChange("contactId", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1B96FF] focus:outline-none focus:ring-1 focus:ring-[#1B96FF]"
            >
              <option value="">-- 選択してください --</option>
              {contacts.map((con) => (
                <option key={con.id} value={con.id}>
                  {con.lastName} {con.firstName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              商談
            </label>
            <select
              value={formData.opportunityId}
              onChange={(e) => handleChange("opportunityId", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1B96FF] focus:outline-none focus:ring-1 focus:ring-[#1B96FF]"
            >
              <option value="">-- 選択してください --</option>
              {opportunities.map((opp) => (
                <option key={opp.id} value={opp.id}>
                  {opp.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              リード
            </label>
            <select
              value={formData.leadId}
              onChange={(e) => handleChange("leadId", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1B96FF] focus:outline-none focus:ring-1 focus:ring-[#1B96FF]"
            >
              <option value="">-- 選択してください --</option>
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.lastName} {lead.firstName}
                </option>
              ))}
            </select>
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
