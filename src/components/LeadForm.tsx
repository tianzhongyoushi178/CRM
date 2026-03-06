"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LeadStatus, LeadSource } from "@/generated/prisma";

const statusOptions: { value: LeadStatus; label: string }[] = [
  { value: "NEW", label: "新規" },
  { value: "CONTACTED", label: "連絡済み" },
  { value: "WORKING", label: "対応中" },
  { value: "QUALIFIED", label: "適格" },
  { value: "UNQUALIFIED", label: "不適格" },
];

const sourceOptions: { value: LeadSource; label: string }[] = [
  { value: "WEB", label: "Web" },
  { value: "PHONE", label: "電話" },
  { value: "REFERRAL", label: "紹介" },
  { value: "PARTNER", label: "パートナー" },
  { value: "ADVERTISEMENT", label: "広告" },
  { value: "TRADE_SHOW", label: "展示会" },
  { value: "OTHER", label: "その他" },
];

interface LeadFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  status: LeadStatus;
  source: string;
  industry: string;
  description: string;
  address: string;
  city: string;
  prefecture: string;
  postalCode: string;
}

interface LeadFormProps {
  initialData?: Partial<LeadFormData>;
  leadId?: string;
}

export default function LeadForm({ initialData, leadId }: LeadFormProps) {
  const router = useRouter();
  const isEdit = Boolean(leadId);

  const [formData, setFormData] = useState<LeadFormData>({
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    company: initialData?.company || "",
    title: initialData?.title || "",
    status: initialData?.status || "NEW",
    source: initialData?.source || "",
    industry: initialData?.industry || "",
    description: initialData?.description || "",
    address: initialData?.address || "",
    city: initialData?.city || "",
    prefecture: initialData?.prefecture || "",
    postalCode: initialData?.postalCode || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.lastName.trim()) {
      setError("姓は必須です");
      return;
    }

    setLoading(true);

    try {
      const url = isEdit ? `/api/leads/${leadId}` : "/api/leads";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          source: formData.source || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "保存に失敗しました");
      }

      const lead = await res.json();
      router.push(`/leads/${lead.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* 基本情報 */}
      <div className="rounded-xl bg-white p-6 shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              姓 <span className="text-red-500">*</span>
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              value={formData.lastName}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1B96FF] focus:outline-none focus:ring-1 focus:ring-[#1B96FF]"
            />
          </div>
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              名
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1B96FF] focus:outline-none focus:ring-1 focus:ring-[#1B96FF]"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              メール
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1B96FF] focus:outline-none focus:ring-1 focus:ring-[#1B96FF]"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              電話
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1B96FF] focus:outline-none focus:ring-1 focus:ring-[#1B96FF]"
            />
          </div>
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
              会社
            </label>
            <input
              id="company"
              name="company"
              type="text"
              value={formData.company}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1B96FF] focus:outline-none focus:ring-1 focus:ring-[#1B96FF]"
            />
          </div>
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              役職
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1B96FF] focus:outline-none focus:ring-1 focus:ring-[#1B96FF]"
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              ステータス
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1B96FF] focus:outline-none focus:ring-1 focus:ring-[#1B96FF]"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">
              ソース
            </label>
            <select
              id="source"
              name="source"
              value={formData.source}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1B96FF] focus:outline-none focus:ring-1 focus:ring-[#1B96FF]"
            >
              <option value="">選択してください</option>
              {sourceOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
              業種
            </label>
            <input
              id="industry"
              name="industry"
              type="text"
              value={formData.industry}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1B96FF] focus:outline-none focus:ring-1 focus:ring-[#1B96FF]"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              説明
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1B96FF] focus:outline-none focus:ring-1 focus:ring-[#1B96FF]"
            />
          </div>
        </div>
      </div>

      {/* 住所情報 */}
      <div className="rounded-xl bg-white p-6 shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">住所情報</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
              郵便番号
            </label>
            <input
              id="postalCode"
              name="postalCode"
              type="text"
              value={formData.postalCode}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1B96FF] focus:outline-none focus:ring-1 focus:ring-[#1B96FF]"
              placeholder="123-4567"
            />
          </div>
          <div>
            <label htmlFor="prefecture" className="block text-sm font-medium text-gray-700 mb-1">
              都道府県
            </label>
            <input
              id="prefecture"
              name="prefecture"
              type="text"
              value={formData.prefecture}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1B96FF] focus:outline-none focus:ring-1 focus:ring-[#1B96FF]"
            />
          </div>
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              市区町村
            </label>
            <input
              id="city"
              name="city"
              type="text"
              value={formData.city}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1B96FF] focus:outline-none focus:ring-1 focus:ring-[#1B96FF]"
            />
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              住所
            </label>
            <input
              id="address"
              name="address"
              type="text"
              value={formData.address}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1B96FF] focus:outline-none focus:ring-1 focus:ring-[#1B96FF]"
            />
          </div>
        </div>
      </div>

      {/* ボタン */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-[#0176D3] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#014486] focus:outline-none focus:ring-2 focus:ring-[#1B96FF] focus:ring-offset-2 disabled:opacity-50 transition-colors"
        >
          {loading ? "保存中..." : isEdit ? "更新" : "作成"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
