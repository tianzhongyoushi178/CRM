"use client";

import { useState } from "react";

interface Opportunity {
  id: string;
  name: string;
}

interface AnalysisResult {
  id: string;
  name: string;
  opportunityId: string | null;
  weight: string | null;
  installHeight: string | null;
  temperatureZone: string | null;
  cleanLevel: string | null;
  explosionProof: string | null;
  oilSmoke: string | null;
  gas: string | null;
  plCsType: string | null;
  loadL: string | null;
  loadW: string | null;
  packageType: string | null;
  opportunity: Opportunity | null;
}

interface SearchFields {
  name: string;
  opportunityName: string;
  weight: string;
  installHeight: string;
  temperatureZone: string;
  cleanLevel: string;
  explosionProof: string;
  oilSmoke: string;
  gas: string;
  plCsType: string;
  loadL: string;
  loadW: string;
  packageType: string;
}

const initialFields: SearchFields = {
  name: "",
  opportunityName: "",
  weight: "",
  installHeight: "",
  temperatureZone: "",
  cleanLevel: "",
  explosionProof: "",
  oilSmoke: "",
  gas: "",
  plCsType: "",
  loadL: "",
  loadW: "",
  packageType: "",
};

export default function AnalysisSearchForm() {
  const [fields, setFields] = useState<SearchFields>(initialFields);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const updateField = (key: keyof SearchFields, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = async () => {
    setIsSearching(true);
    setHasSearched(true);
    try {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(fields)) {
        if (value.trim()) {
          params.set(key, value.trim());
        }
      }
      const res = await fetch(`/api/analysis-search?${params.toString()}`);
      if (!res.ok) throw new Error("検索失敗");
      const data = await res.json() as { results: AnalysisResult[] };
      setResults(data.results);
    } catch (err) {
      console.error("検索に失敗:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-[#DDDBDA] px-3 py-2 text-sm focus:border-[#0070D2] focus:ring-1 focus:ring-[#0070D2] focus:outline-none";
  const labelClass = "block text-sm font-medium text-[#3E3E3C] mb-1";

  return (
    <div className="space-y-6">
      {/* カード1: 分析情報検索 */}
      <div className="bg-white rounded-xl shadow-sm border border-[#DDDBDA] p-6">
        <h2 className="text-base font-bold text-[#3E3E3C] mb-4">
          分析情報検索
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>分析情報名</label>
            <input
              type="text"
              value={fields.name}
              onChange={(e) => updateField("name", e.target.value)}
              className={inputClass}
              placeholder="分析情報名を入力"
            />
          </div>
          <div>
            <label className={labelClass}>案件名</label>
            <input
              type="text"
              value={fields.opportunityName}
              onChange={(e) => updateField("opportunityName", e.target.value)}
              className={inputClass}
              placeholder="案件名を入力"
            />
          </div>
          <div>
            <label className={labelClass}>荷重</label>
            <select
              value={fields.weight}
              onChange={(e) => updateField("weight", e.target.value)}
              className={inputClass}
            >
              <option value="">-- 選択してください --</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>設置場所有効H</label>
            <select
              value={fields.installHeight}
              onChange={(e) => updateField("installHeight", e.target.value)}
              className={inputClass}
            >
              <option value="">-- 選択してください --</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>設置場所温度帯</label>
            <select
              value={fields.temperatureZone}
              onChange={(e) => updateField("temperatureZone", e.target.value)}
              className={inputClass}
            >
              <option value="">-- 選択してください --</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>設置場所クリーン度</label>
            <select
              value={fields.cleanLevel}
              onChange={(e) => updateField("cleanLevel", e.target.value)}
              className={inputClass}
            >
              <option value="">-- 選択してください --</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>非防爆・防爆</label>
            <select
              value={fields.explosionProof}
              onChange={(e) => updateField("explosionProof", e.target.value)}
              className={inputClass}
            >
              <option value="">-- 選択してください --</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>油煙</label>
            <select
              value={fields.oilSmoke}
              onChange={(e) => updateField("oilSmoke", e.target.value)}
              className={inputClass}
            >
              <option value="">-- 選択してください --</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>ガス</label>
            <select
              value={fields.gas}
              onChange={(e) => updateField("gas", e.target.value)}
              className={inputClass}
            >
              <option value="">-- 選択してください --</option>
            </select>
          </div>
        </div>
      </div>

      {/* カード2: 荷姿 */}
      <div className="bg-white rounded-xl shadow-sm border border-[#DDDBDA] p-6">
        <h2 className="text-base font-bold text-[#3E3E3C] mb-4">荷姿</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>PL系・CS系</label>
            <select
              value={fields.plCsType}
              onChange={(e) => updateField("plCsType", e.target.value)}
              className={inputClass}
            >
              <option value="">-- 選択してください --</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>荷L</label>
            <select
              value={fields.loadL}
              onChange={(e) => updateField("loadL", e.target.value)}
              className={inputClass}
            >
              <option value="">-- 選択してください --</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>荷W</label>
            <select
              value={fields.loadW}
              onChange={(e) => updateField("loadW", e.target.value)}
              className={inputClass}
            >
              <option value="">-- 選択してください --</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>荷姿</label>
            <select
              value={fields.packageType}
              onChange={(e) => updateField("packageType", e.target.value)}
              className={inputClass}
            >
              <option value="">-- 選択してください --</option>
            </select>
          </div>
        </div>
      </div>

      {/* 検索ボタン */}
      <div className="flex justify-center">
        <button
          onClick={handleSearch}
          disabled={isSearching}
          className="bg-[#0070D2] text-white rounded-lg px-8 py-3 text-base font-medium hover:bg-[#005FB2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <span>&#128269;</span>
          <span>{isSearching ? "検索中..." : "検索"}</span>
        </button>
      </div>

      {/* 検索結果 */}
      {hasSearched && (
        <div className="bg-white rounded-xl shadow-sm border border-[#DDDBDA] p-6">
          <h2 className="text-base font-bold text-[#3E3E3C] mb-4">
            検索結果（{results.length}件）
          </h2>
          {results.length === 0 ? (
            <p className="text-sm text-[#706E6B] text-center py-8">
              検索条件に一致する結果はありません。
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-[#DDDBDA]">
                    <th className="text-left px-3 py-2 font-medium text-[#3E3E3C]">
                      分析情報名
                    </th>
                    <th className="text-left px-3 py-2 font-medium text-[#3E3E3C]">
                      案件名
                    </th>
                    <th className="text-left px-3 py-2 font-medium text-[#3E3E3C]">
                      荷重
                    </th>
                    <th className="text-left px-3 py-2 font-medium text-[#3E3E3C]">
                      温度帯
                    </th>
                    <th className="text-left px-3 py-2 font-medium text-[#3E3E3C]">
                      クリーン度
                    </th>
                    <th className="text-left px-3 py-2 font-medium text-[#3E3E3C]">
                      防爆
                    </th>
                    <th className="text-left px-3 py-2 font-medium text-[#3E3E3C]">
                      油煙
                    </th>
                    <th className="text-left px-3 py-2 font-medium text-[#3E3E3C]">
                      ガス
                    </th>
                    <th className="text-left px-3 py-2 font-medium text-[#3E3E3C]">
                      PL系・CS系
                    </th>
                    <th className="text-left px-3 py-2 font-medium text-[#3E3E3C]">
                      荷L
                    </th>
                    <th className="text-left px-3 py-2 font-medium text-[#3E3E3C]">
                      荷W
                    </th>
                    <th className="text-left px-3 py-2 font-medium text-[#3E3E3C]">
                      荷姿
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-[#DDDBDA] hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-3 py-2 text-[#0070D2] font-medium">
                        {item.name}
                      </td>
                      <td className="px-3 py-2 text-[#3E3E3C]">
                        {item.opportunity?.name || "-"}
                      </td>
                      <td className="px-3 py-2 text-[#3E3E3C]">
                        {item.weight || "-"}
                      </td>
                      <td className="px-3 py-2 text-[#3E3E3C]">
                        {item.temperatureZone || "-"}
                      </td>
                      <td className="px-3 py-2 text-[#3E3E3C]">
                        {item.cleanLevel || "-"}
                      </td>
                      <td className="px-3 py-2 text-[#3E3E3C]">
                        {item.explosionProof || "-"}
                      </td>
                      <td className="px-3 py-2 text-[#3E3E3C]">
                        {item.oilSmoke || "-"}
                      </td>
                      <td className="px-3 py-2 text-[#3E3E3C]">
                        {item.gas || "-"}
                      </td>
                      <td className="px-3 py-2 text-[#3E3E3C]">
                        {item.plCsType || "-"}
                      </td>
                      <td className="px-3 py-2 text-[#3E3E3C]">
                        {item.loadL || "-"}
                      </td>
                      <td className="px-3 py-2 text-[#3E3E3C]">
                        {item.loadW || "-"}
                      </td>
                      <td className="px-3 py-2 text-[#3E3E3C]">
                        {item.packageType || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
