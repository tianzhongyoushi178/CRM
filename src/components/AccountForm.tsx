"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AccountRating } from "@prisma/client";

interface AccountFormData {
  name: string;
  industry: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  prefecture: string;
  postalCode: string;
  description: string;
  annualRevenue: string;
  employees: string;
  rating: AccountRating | "";
}

interface AccountFormProps {
  initialData?: {
    id: string;
    name: string;
    industry: string | null;
    phone: string | null;
    website: string | null;
    address: string | null;
    city: string | null;
    prefecture: string | null;
    postalCode: string | null;
    description: string | null;
    annualRevenue: number | null;
    employees: number | null;
    rating: AccountRating | null;
  };
}

const ratingOptions: { value: AccountRating; label: string }[] = [
  { value: "HOT", label: "ホット" },
  { value: "WARM", label: "ウォーム" },
  { value: "COLD", label: "コールド" },
];

export default function AccountForm({ initialData }: AccountFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [formData, setFormData] = useState<AccountFormData>({
    name: initialData?.name || "",
    industry: initialData?.industry || "",
    phone: initialData?.phone || "",
    website: initialData?.website || "",
    address: initialData?.address || "",
    city: initialData?.city || "",
    prefecture: initialData?.prefecture || "",
    postalCode: initialData?.postalCode || "",
    description: initialData?.description || "",
    annualRevenue: initialData?.annualRevenue?.toString() || "",
    employees: initialData?.employees?.toString() || "",
    rating: initialData?.rating || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const url = isEdit
        ? `/api/accounts/${initialData.id}`
        : "/api/accounts";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          rating: formData.rating || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "エラーが発生しました");
      }

      const account = await res.json();
      router.push(`/accounts/${isEdit ? initialData.id : account.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">基本情報</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              取引先名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-[#0176D3] focus:outline-none focus:ring-1 focus:ring-[#0176D3]"
            />
          </div>

          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
              業種
            </label>
            <input
              type="text"
              id="industry"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-[#0176D3] focus:outline-none focus:ring-1 focus:ring-[#0176D3]"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              電話番号
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-[#0176D3] focus:outline-none focus:ring-1 focus:ring-[#0176D3]"
            />
          </div>

          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
              Webサイト
            </label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-[#0176D3] focus:outline-none focus:ring-1 focus:ring-[#0176D3]"
            />
          </div>

          <div>
            <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
              評価
            </label>
            <select
              id="rating"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-[#0176D3] focus:outline-none focus:ring-1 focus:ring-[#0176D3]"
            >
              <option value="">選択してください</option>
              {ratingOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="annualRevenue" className="block text-sm font-medium text-gray-700 mb-1">
              年間売上
            </label>
            <input
              type="number"
              id="annualRevenue"
              name="annualRevenue"
              value={formData.annualRevenue}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-[#0176D3] focus:outline-none focus:ring-1 focus:ring-[#0176D3]"
            />
          </div>

          <div>
            <label htmlFor="employees" className="block text-sm font-medium text-gray-700 mb-1">
              従業員数
            </label>
            <input
              type="number"
              id="employees"
              name="employees"
              value={formData.employees}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-[#0176D3] focus:outline-none focus:ring-1 focus:ring-[#0176D3]"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">住所情報</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
              郵便番号
            </label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-[#0176D3] focus:outline-none focus:ring-1 focus:ring-[#0176D3]"
            />
          </div>

          <div>
            <label htmlFor="prefecture" className="block text-sm font-medium text-gray-700 mb-1">
              都道府県
            </label>
            <input
              type="text"
              id="prefecture"
              name="prefecture"
              value={formData.prefecture}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-[#0176D3] focus:outline-none focus:ring-1 focus:ring-[#0176D3]"
            />
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              市区町村
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-[#0176D3] focus:outline-none focus:ring-1 focus:ring-[#0176D3]"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              住所
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-[#0176D3] focus:outline-none focus:ring-1 focus:ring-[#0176D3]"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">詳細情報</h2>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            説明
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-[#0176D3] focus:outline-none focus:ring-1 focus:ring-[#0176D3]"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-[#0176D3] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#014486] disabled:opacity-50"
        >
          {isSubmitting ? "保存中..." : isEdit ? "更新" : "作成"}
        </button>
      </div>
    </form>
  );
}
