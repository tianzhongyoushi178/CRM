"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, Search, X } from "lucide-react";

// ─── 定数 ───────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: "DRAFT", label: "下書き" },
  { value: "SALES_SUBMITTED", label: "営業提出済" },
  { value: "SE_ASSIGNED", label: "SE担当者アサイン済" },
  { value: "SE_WORKING", label: "SE担当者作業中" },
  { value: "SE_COMPLETED", label: "SE作業完了" },
  { value: "SUBMITTED_TO_SALES", label: "営業へ提出済" },
  { value: "NOT_REQUIRED", label: "SE依頼不要" },
  { value: "CANCELLED", label: "キャンセル" },
] as const;

const INSTALL_ENV_OPTIONS = [
  { value: "", label: "--なし--" },
  { value: "GENERAL", label: "一般" },
  { value: "NON_GENERAL", label: "非一般" },
] as const;

const LOAD_TYPE_OPTIONS = [
  { value: "", label: "--なし--" },
  { value: "ONE_TYPE", label: "1種" },
  { value: "MULTI_TYPE", label: "2種以上" },
] as const;

// ─── SLDS カラー ────────────────────────────────────────
const C = {
  primary: "#0070D2",
  primaryHover: "#005FB2",
  text: "#3E3E3C",
  label: "#706E6B",
  border: "#DDDBDA",
  bg: "#F3F3F3",
  white: "#FFFFFF",
} as const;

// ─── 型定義 ─────────────────────────────────────────────
interface Opportunity {
  id: string;
  name: string;
}

interface QuotationRequestLookup {
  id: string;
  name: string;
}

interface QuotationRequestData {
  id?: string;
  name: string;
  title: string | null;
  status: string;
  assignStatus: string | null;
  opportunityId: string | null;
  accountName: string | null;
  endUserName: string | null;
  quotationNumber: string | null;
  salesBranch: string | null;
  installLocation: string | null;
  installEnvironment: string | null;
  submissionDeadline: string | null;
  seNote: string | null;
  salesOffice: string | null;
  salesPersonName: string | null;
  installEnvType: string | null;
  tempSpecial: boolean;
  cleanRoom: boolean;
  hazardStorage: boolean;
  envOther: boolean;
  tempSpecialDetail: string | null;
  cleanRoomDetail: string | null;
  hazardStorageDetail: string | null;
  envOtherDetail: string | null;
  loadType: string | null;
  loadSize: string | null;
  loadWeight: string | null;
  packageCategory: string | null;
  palletSize: string | null;
  procurementType: string | null;
  buildingType: string | null;
  installSpace: string | null;
  architectDrawing: string | null;
  exteriorDrawing: string | null;
  storageRequirement: string | null;
  constructionDoc: string | null;
  relatedFilePath: string | null;
  reqLayout: boolean;
  reqLoadDetail: boolean;
  reqCapacity: boolean;
  reqOperation: boolean;
  reqOtherDoc: boolean;
  submitLayout: boolean;
  submitCostSheet: boolean;
  submitAxialForce: boolean;
  submitPowerReq: boolean;
  submitSpecSheet: boolean;
  submitOther: boolean;
  desiredDeadline: string | null;
  salesComment: string | null;
  managerComment: string | null;
  sourceQuotationId: string | null;
}

interface QuotationRequestFormProps {
  initialData?: QuotationRequestData;
  isEdit?: boolean;
}

// ─── フォーム state の型 ────────────────────────────────
interface FormState {
  name: string;
  opportunityId: string;
  accountName: string;
  quotationNumber: string;
  installLocation: string;
  salesOffice: string;
  salesPersonName: string;
  endUserName: string;
  salesBranch: string;
  submissionDeadline: string;
  installEnvType: string;
  tempSpecial: boolean;
  cleanRoom: boolean;
  hazardStorage: boolean;
  envOther: boolean;
  tempSpecialDetail: string;
  cleanRoomDetail: string;
  hazardStorageDetail: string;
  envOtherDetail: string;
  loadType: string;
  loadSize: string;
  loadWeight: string;
  packageCategory: string;
  palletSize: string;
  procurementType: string;
  buildingType: string;
  installSpace: string;
  architectDrawing: string;
  exteriorDrawing: string;
  storageRequirement: string;
  constructionDoc: string;
  relatedFilePath: string;
  reqLayout: boolean;
  reqLoadDetail: boolean;
  reqCapacity: boolean;
  reqOperation: boolean;
  reqOtherDoc: boolean;
  submitLayout: boolean;
  submitCostSheet: boolean;
  submitAxialForce: boolean;
  submitPowerReq: boolean;
  submitSpecSheet: boolean;
  submitOther: boolean;
  desiredDeadline: string;
  salesComment: string;
  managerComment: string;
  sourceQuotationId: string;
  status: string;
  assignStatus: string;
}

function buildInitialState(d?: QuotationRequestData): FormState {
  return {
    name: d?.name ?? "",
    opportunityId: d?.opportunityId ?? "",
    accountName: d?.accountName ?? "",
    quotationNumber: d?.quotationNumber ?? "",
    installLocation: d?.installLocation ?? "",
    salesOffice: d?.salesOffice ?? "",
    salesPersonName: d?.salesPersonName ?? "",
    endUserName: d?.endUserName ?? "",
    salesBranch: d?.salesBranch ?? "",
    submissionDeadline: d?.submissionDeadline ? d.submissionDeadline.slice(0, 10) : "",
    installEnvType: d?.installEnvType ?? "",
    tempSpecial: d?.tempSpecial ?? false,
    cleanRoom: d?.cleanRoom ?? false,
    hazardStorage: d?.hazardStorage ?? false,
    envOther: d?.envOther ?? false,
    tempSpecialDetail: d?.tempSpecialDetail ?? "",
    cleanRoomDetail: d?.cleanRoomDetail ?? "",
    hazardStorageDetail: d?.hazardStorageDetail ?? "",
    envOtherDetail: d?.envOtherDetail ?? "",
    loadType: d?.loadType ?? "",
    loadSize: d?.loadSize ?? "",
    loadWeight: d?.loadWeight ?? "",
    packageCategory: d?.packageCategory ?? "",
    palletSize: d?.palletSize ?? "",
    procurementType: d?.procurementType ?? "",
    buildingType: d?.buildingType ?? "",
    installSpace: d?.installSpace ?? "",
    architectDrawing: d?.architectDrawing ?? "",
    exteriorDrawing: d?.exteriorDrawing ?? "",
    storageRequirement: d?.storageRequirement ?? "",
    constructionDoc: d?.constructionDoc ?? "",
    relatedFilePath: d?.relatedFilePath ?? "",
    reqLayout: d?.reqLayout ?? false,
    reqLoadDetail: d?.reqLoadDetail ?? false,
    reqCapacity: d?.reqCapacity ?? false,
    reqOperation: d?.reqOperation ?? false,
    reqOtherDoc: d?.reqOtherDoc ?? false,
    submitLayout: d?.submitLayout ?? false,
    submitCostSheet: d?.submitCostSheet ?? false,
    submitAxialForce: d?.submitAxialForce ?? false,
    submitPowerReq: d?.submitPowerReq ?? false,
    submitSpecSheet: d?.submitSpecSheet ?? false,
    submitOther: d?.submitOther ?? false,
    desiredDeadline: d?.desiredDeadline ? d.desiredDeadline.slice(0, 10) : "",
    salesComment: d?.salesComment ?? "",
    managerComment: d?.managerComment ?? "",
    sourceQuotationId: d?.sourceQuotationId ?? "",
    status: d?.status ?? "DRAFT",
    assignStatus: d?.assignStatus ?? "",
  };
}

// ─── コンポーネント ─────────────────────────────────────
export default function QuotationRequestForm({
  initialData,
  isEdit = false,
}: QuotationRequestFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<FormState>(() => buildInitialState(initialData));

  // セクション開閉
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    basic: true,
    installEnv: true,
    loadType: true,
    installPlace: true,
    storage: true,
    construction: true,
    seRequest: true,
    salesSubmit: true,
    managerNote: true,
    systemInfo: true,
  });

  // ルックアップ: 案件
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [oppSearch, setOppSearch] = useState("");
  const [oppDropdownOpen, setOppDropdownOpen] = useState(false);
  const oppRef = useRef<HTMLDivElement>(null);

  // ルックアップ: 複製元SE見積依頼
  const [quotationRequests, setQuotationRequests] = useState<QuotationRequestLookup[]>([]);
  const [qrSearch, setQrSearch] = useState("");
  const [qrDropdownOpen, setQrDropdownOpen] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  // ─── データ取得 ───
  const fetchOpportunities = useCallback(async () => {
    try {
      const res = await fetch("/api/opportunities?limit=200");
      if (res.ok) {
        const data = await res.json();
        setOpportunities(data.opportunities || []);
      }
    } catch {
      // フォーム自体は使える
    }
  }, []);

  const fetchQuotationRequests = useCallback(async () => {
    try {
      const res = await fetch("/api/quotation-requests?limit=200");
      if (res.ok) {
        const data = await res.json();
        setQuotationRequests(
          (data.quotationRequests || []).map((q: { id: string; name: string }) => ({
            id: q.id,
            name: q.name,
          }))
        );
      }
    } catch {
      // フォーム自体は使える
    }
  }, []);

  useEffect(() => {
    fetchOpportunities();
    fetchQuotationRequests();
  }, [fetchOpportunities, fetchQuotationRequests]);

  // ドロップダウン外クリックで閉じる
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (oppRef.current && !oppRef.current.contains(e.target as Node)) {
        setOppDropdownOpen(false);
      }
      if (qrRef.current && !qrRef.current.contains(e.target as Node)) {
        setQrDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ─── ヘルパー ───
  const set = (key: keyof FormState, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const selectedOppName = opportunities.find((o) => o.id === formData.opportunityId)?.name ?? "";
  const filteredOpps = opportunities.filter((o) =>
    o.name.toLowerCase().includes(oppSearch.toLowerCase())
  );

  const selectedQrName = quotationRequests.find((q) => q.id === formData.sourceQuotationId)?.name ?? "";
  const filteredQrs = quotationRequests.filter((q) =>
    q.name.toLowerCase().includes(qrSearch.toLowerCase())
  );

  // ─── 送信 ───
  function buildPayload(): Record<string, unknown> {
    return {
      name: formData.name,
      opportunityId: formData.opportunityId || null,
      accountName: formData.accountName || null,
      quotationNumber: formData.quotationNumber || null,
      installLocation: formData.installLocation || null,
      salesOffice: formData.salesOffice || null,
      salesPersonName: formData.salesPersonName || null,
      endUserName: formData.endUserName || null,
      salesBranch: formData.salesBranch || null,
      submissionDeadline: formData.submissionDeadline || null,
      installEnvType: formData.installEnvType || null,
      tempSpecial: formData.tempSpecial,
      cleanRoom: formData.cleanRoom,
      hazardStorage: formData.hazardStorage,
      envOther: formData.envOther,
      tempSpecialDetail: formData.tempSpecialDetail || null,
      cleanRoomDetail: formData.cleanRoomDetail || null,
      hazardStorageDetail: formData.hazardStorageDetail || null,
      envOtherDetail: formData.envOtherDetail || null,
      loadType: formData.loadType || null,
      loadSize: formData.loadSize || null,
      loadWeight: formData.loadWeight || null,
      packageCategory: formData.packageCategory || null,
      palletSize: formData.palletSize || null,
      procurementType: formData.procurementType || null,
      buildingType: formData.buildingType || null,
      installSpace: formData.installSpace || null,
      architectDrawing: formData.architectDrawing || null,
      exteriorDrawing: formData.exteriorDrawing || null,
      storageRequirement: formData.storageRequirement || null,
      constructionDoc: formData.constructionDoc || null,
      relatedFilePath: formData.relatedFilePath || null,
      reqLayout: formData.reqLayout,
      reqLoadDetail: formData.reqLoadDetail,
      reqCapacity: formData.reqCapacity,
      reqOperation: formData.reqOperation,
      reqOtherDoc: formData.reqOtherDoc,
      submitLayout: formData.submitLayout,
      submitCostSheet: formData.submitCostSheet,
      submitAxialForce: formData.submitAxialForce,
      submitPowerReq: formData.submitPowerReq,
      submitSpecSheet: formData.submitSpecSheet,
      submitOther: formData.submitOther,
      desiredDeadline: formData.desiredDeadline || null,
      salesComment: formData.salesComment || null,
      managerComment: formData.managerComment || null,
      sourceQuotationId: formData.sourceQuotationId || null,
      status: formData.status,
      assignStatus: formData.assignStatus || null,
    };
  }

  async function handleSubmit(e: React.FormEvent, saveAndNew = false) {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("SE見積依頼名は必須です");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = isEdit
        ? `/api/quotation-requests/${initialData?.id}`
        : "/api/quotation-requests";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "保存に失敗しました");
      }

      if (saveAndNew) {
        setFormData(buildInitialState());
        setError("");
      } else {
        const quotationRequest = await res.json();
        router.push(`/quotation-requests/${quotationRequest.id}`);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ─── 共通スタイル ───
  const inputClass =
    `w-full rounded border border-[${C.border}] px-3 py-2 text-sm text-[${C.text}] ` +
    `focus:border-[${C.primary}] focus:outline-none focus:ring-1 focus:ring-[${C.primary}] ` +
    "placeholder:text-[#C9C7C5] bg-white";
  const readonlyClass =
    `w-full rounded border border-[${C.border}] px-3 py-2 text-sm text-[${C.label}] bg-[${C.bg}] cursor-not-allowed`;
  const labelClass = `block text-xs font-normal text-[${C.label}] mb-1`;
  const checkboxLabelClass = `flex items-center gap-2 text-sm text-[${C.text}] cursor-pointer`;

  // ─── セクションヘッダー ───
  function SectionHeader({ id, title }: { id: string; title: string }) {
    const isOpen = openSections[id] ?? true;
    return (
      <button
        type="button"
        onClick={() => toggleSection(id)}
        className="flex items-center gap-2 w-full py-3 text-left"
      >
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-[#706E6B] flex-shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-[#706E6B] flex-shrink-0" />
        )}
        <span className="text-sm font-bold text-[#3E3E3C]">{title}</span>
      </button>
    );
  }

  // ─── ルックアップフィールド ───
  function LookupField({
    label,
    selectedName,
    searchValue,
    onSearchChange,
    isOpen,
    onToggle,
    onClear,
    items,
    onSelect,
    containerRef,
    placeholder,
  }: {
    label: string;
    selectedName: string;
    searchValue: string;
    onSearchChange: (v: string) => void;
    isOpen: boolean;
    onToggle: () => void;
    onClear: () => void;
    items: { id: string; name: string }[];
    onSelect: (id: string) => void;
    containerRef: React.RefObject<HTMLDivElement | null>;
    placeholder: string;
  }) {
    return (
      <div ref={containerRef} className="relative">
        <label className={labelClass}>{label}</label>
        {selectedName ? (
          <div
            className={`flex items-center justify-between rounded border border-[${C.border}] px-3 py-2 text-sm text-[${C.text}] bg-white`}
          >
            <span className="truncate">{selectedName}</span>
            <button type="button" onClick={onClear} className="ml-2 flex-shrink-0">
              <X className="h-4 w-4 text-[#706E6B] hover:text-[#3E3E3C]" />
            </button>
          </div>
        ) : (
          <div
            className={`flex items-center rounded border border-[${C.border}] bg-white`}
          >
            <Search className="h-4 w-4 text-[#706E6B] ml-3 flex-shrink-0" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={onToggle}
              placeholder={placeholder}
              className="w-full px-2 py-2 text-sm text-[#3E3E3C] focus:outline-none placeholder:text-[#C9C7C5] bg-transparent"
            />
          </div>
        )}
        {isOpen && !selectedName && (
          <div
            className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded border border-[#DDDBDA] bg-white shadow-lg"
          >
            {items.length === 0 ? (
              <div className="px-3 py-2 text-sm text-[#706E6B]">該当なし</div>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelect(item.id);
                    onSearchChange("");
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-[#3E3E3C] hover:bg-[#F3F3F3]"
                >
                  {item.name}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // レンダリング
  // ═══════════════════════════════════════════════════════
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto py-8">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl mx-4">
        {/* ── モーダルヘッダー ── */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b border-[#DDDBDA] rounded-t-lg"
          style={{ backgroundColor: C.white }}
        >
          <h2 className="text-lg font-bold text-[#3E3E3C]">
            {isEdit ? "SE見積依頼を編集" : "SE見積依頼 新規作成"}
          </h2>
          <button
            type="button"
            onClick={() => router.back()}
            className="p-1 rounded hover:bg-[#F3F3F3]"
          >
            <X className="h-5 w-5 text-[#706E6B]" />
          </button>
        </div>

        {/* ── モーダルボディ ── */}
        <form
          onSubmit={(e) => handleSubmit(e)}
          className="px-6 py-4 overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 200px)" }}
        >
          {error && (
            <div className="rounded bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">
              {error}
            </div>
          )}

          {/* ════════════════════════════════════════════ */}
          {/* 1. 基本情報セクション */}
          {/* ════════════════════════════════════════════ */}
          <div className="border-b border-[#DDDBDA]">
            <SectionHeader id="basic" title="基本情報" />
            {openSections.basic && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pb-4">
                {/* 左列 */}
                <div className="space-y-4">
                  {/* SE見積依頼名 */}
                  <div>
                    <label className={labelClass}>
                      SE見積依頼名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => set("name", e.target.value)}
                      className={inputClass}
                      placeholder="SE見積依頼名を入力"
                    />
                  </div>

                  {/* 案件 (ルックアップ) */}
                  <LookupField
                    label="案件"
                    selectedName={selectedOppName}
                    searchValue={oppSearch}
                    onSearchChange={setOppSearch}
                    isOpen={oppDropdownOpen}
                    onToggle={() => setOppDropdownOpen(true)}
                    onClear={() => {
                      set("opportunityId", "");
                      setOppDropdownOpen(false);
                    }}
                    items={filteredOpps}
                    onSelect={(id) => {
                      set("opportunityId", id);
                      setOppDropdownOpen(false);
                    }}
                    containerRef={oppRef}
                    placeholder="案件を検索..."
                  />

                  {/* 取引先名 */}
                  <div>
                    <label className={labelClass}>取引先名</label>
                    <input
                      type="text"
                      value={formData.accountName}
                      onChange={(e) => set("accountName", e.target.value)}
                      className={inputClass}
                      placeholder="取引先名を入力"
                    />
                  </div>

                  {/* 見積番号 (読取専用) */}
                  <div>
                    <label className={labelClass}>見積番号</label>
                    <input
                      type="text"
                      value={formData.quotationNumber}
                      readOnly
                      className={readonlyClass}
                      placeholder="自動生成"
                    />
                  </div>

                  {/* 設置場所 */}
                  <div>
                    <label className={labelClass}>設置場所</label>
                    <input
                      type="text"
                      value={formData.installLocation}
                      onChange={(e) => set("installLocation", e.target.value)}
                      className={inputClass}
                      placeholder="設置場所を入力"
                    />
                  </div>
                </div>

                {/* 右列 */}
                <div className="space-y-4">
                  {/* 営業職場 (読取専用) */}
                  <div>
                    <label className={labelClass}>営業職場</label>
                    <input
                      type="text"
                      value={formData.salesOffice}
                      readOnly
                      className={readonlyClass}
                      placeholder="自動設定"
                    />
                  </div>

                  {/* 営業担当 (読取専用) */}
                  <div>
                    <label className={labelClass}>営業担当</label>
                    <input
                      type="text"
                      value={formData.salesPersonName}
                      readOnly
                      className={readonlyClass}
                      placeholder="自動設定"
                    />
                  </div>

                  {/* エンドユーザ名 */}
                  <div>
                    <label className={labelClass}>エンドユーザ名</label>
                    <input
                      type="text"
                      value={formData.endUserName}
                      onChange={(e) => set("endUserName", e.target.value)}
                      className={inputClass}
                      placeholder="エンドユーザ名を入力"
                    />
                  </div>

                  {/* 営業拠点 */}
                  <div>
                    <label className={labelClass}>営業拠点</label>
                    <input
                      type="text"
                      value={formData.salesBranch}
                      onChange={(e) => set("salesBranch", e.target.value)}
                      className={inputClass}
                      placeholder="営業拠点を入力"
                    />
                  </div>

                  {/* 提出日限 */}
                  <div>
                    <label className={labelClass}>提出日限</label>
                    <input
                      type="date"
                      value={formData.submissionDeadline}
                      onChange={(e) => set("submissionDeadline", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ════════════════════════════════════════════ */}
          {/* 2. 設置環境セクション */}
          {/* ════════════════════════════════════════════ */}
          <div className="border-b border-[#DDDBDA]">
            <SectionHeader id="installEnv" title="設置環境" />
            {openSections.installEnv && (
              <div className="pb-4 space-y-4">
                <div className="max-w-xs">
                  <label className={labelClass}>設置環境</label>
                  <select
                    value={formData.installEnvType}
                    onChange={(e) => set("installEnvType", e.target.value)}
                    className={inputClass}
                  >
                    {INSTALL_ENV_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.installEnvType === "NON_GENERAL" && (
                  <div className="ml-4 pl-4 border-l-2 border-[#DDDBDA] space-y-3">
                    <p className="text-xs font-bold text-[#706E6B] mb-2">非一般 詳細</p>

                    {/* 温度帯特殊 */}
                    <div className="flex items-start gap-4">
                      <label className={checkboxLabelClass}>
                        <input
                          type="checkbox"
                          checked={formData.tempSpecial}
                          onChange={(e) => set("tempSpecial", e.target.checked)}
                          className="rounded border-[#DDDBDA]"
                        />
                        温度帯特殊
                      </label>
                      {formData.tempSpecial && (
                        <input
                          type="text"
                          value={formData.tempSpecialDetail}
                          onChange={(e) => set("tempSpecialDetail", e.target.value)}
                          className={`${inputClass} flex-1`}
                          placeholder="温度等の詳細を入力"
                        />
                      )}
                    </div>

                    {/* クリーン */}
                    <div className="flex items-start gap-4">
                      <label className={checkboxLabelClass}>
                        <input
                          type="checkbox"
                          checked={formData.cleanRoom}
                          onChange={(e) => set("cleanRoom", e.target.checked)}
                          className="rounded border-[#DDDBDA]"
                        />
                        クリーン
                      </label>
                      {formData.cleanRoom && (
                        <input
                          type="text"
                          value={formData.cleanRoomDetail}
                          onChange={(e) => set("cleanRoomDetail", e.target.value)}
                          className={`${inputClass} flex-1`}
                          placeholder="クリーン詳細を入力"
                        />
                      )}
                    </div>

                    {/* 危険物貯蔵 */}
                    <div className="flex items-start gap-4">
                      <label className={checkboxLabelClass}>
                        <input
                          type="checkbox"
                          checked={formData.hazardStorage}
                          onChange={(e) => set("hazardStorage", e.target.checked)}
                          className="rounded border-[#DDDBDA]"
                        />
                        危険物貯蔵
                      </label>
                      {formData.hazardStorage && (
                        <input
                          type="text"
                          value={formData.hazardStorageDetail}
                          onChange={(e) => set("hazardStorageDetail", e.target.value)}
                          className={`${inputClass} flex-1`}
                          placeholder="危険物貯蔵 詳細を入力"
                        />
                      )}
                    </div>

                    {/* その他 */}
                    <div className="flex items-start gap-4">
                      <label className={checkboxLabelClass}>
                        <input
                          type="checkbox"
                          checked={formData.envOther}
                          onChange={(e) => set("envOther", e.target.checked)}
                          className="rounded border-[#DDDBDA]"
                        />
                        その他
                      </label>
                      {formData.envOther && (
                        <input
                          type="text"
                          value={formData.envOtherDetail}
                          onChange={(e) => set("envOtherDetail", e.target.value)}
                          className={`${inputClass} flex-1`}
                          placeholder="その他 詳細を入力"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ════════════════════════════════════════════ */}
          {/* 3. 荷姿・荷重セクション */}
          {/* ════════════════════════════════════════════ */}
          <div className="border-b border-[#DDDBDA]">
            <SectionHeader id="loadType" title="荷姿・荷重" />
            {openSections.loadType && (
              <div className="pb-4 space-y-4">
                <div className="max-w-xs">
                  <label className={labelClass}>荷姿・荷重</label>
                  <select
                    value={formData.loadType}
                    onChange={(e) => set("loadType", e.target.value)}
                    className={inputClass}
                  >
                    {LOAD_TYPE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.loadType === "ONE_TYPE" && (
                  <div className="ml-4 pl-4 border-l-2 border-[#DDDBDA] space-y-3">
                    <p className="text-xs font-bold text-[#706E6B] mb-2">1種 詳細</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>荷サイズ</label>
                        <input
                          type="text"
                          value={formData.loadSize}
                          onChange={(e) => set("loadSize", e.target.value)}
                          className={inputClass}
                          placeholder="荷サイズを入力"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>荷重</label>
                        <input
                          type="text"
                          value={formData.loadWeight}
                          onChange={(e) => set("loadWeight", e.target.value)}
                          className={inputClass}
                          placeholder="荷重を入力"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>種別</label>
                        <input
                          type="text"
                          value={formData.packageCategory}
                          onChange={(e) => set("packageCategory", e.target.value)}
                          className={inputClass}
                          placeholder="種別を入力"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>バレット等サイズ</label>
                        <input
                          type="text"
                          value={formData.palletSize}
                          onChange={(e) => set("palletSize", e.target.value)}
                          className={inputClass}
                          placeholder="バレット等サイズを入力"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>手配区分</label>
                        <input
                          type="text"
                          value={formData.procurementType}
                          onChange={(e) => set("procurementType", e.target.value)}
                          className={inputClass}
                          placeholder="手配区分を入力"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ════════════════════════════════════════════ */}
          {/* 4. 設置場所セクション */}
          {/* ════════════════════════════════════════════ */}
          <div className="border-b border-[#DDDBDA]">
            <SectionHeader id="installPlace" title="設置場所" />
            {openSections.installPlace && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pb-4">
                <div>
                  <label className={labelClass}>建屋・西部設備 新築/既設</label>
                  <input
                    type="text"
                    value={formData.buildingType}
                    onChange={(e) => set("buildingType", e.target.value)}
                    className={inputClass}
                    placeholder="新築 / 既設を入力"
                  />
                </div>
                <div>
                  <label className={labelClass}>有効設置スペース</label>
                  <input
                    type="text"
                    value={formData.installSpace}
                    onChange={(e) => set("installSpace", e.target.value)}
                    className={inputClass}
                    placeholder="有効設置スペースを入力"
                  />
                </div>
                <div>
                  <label className={labelClass}>建築図有無</label>
                  <input
                    type="text"
                    value={formData.architectDrawing}
                    onChange={(e) => set("architectDrawing", e.target.value)}
                    className={inputClass}
                    placeholder="有 / 無"
                  />
                </div>
                <div>
                  <label className={labelClass}>外構図有無</label>
                  <input
                    type="text"
                    value={formData.exteriorDrawing}
                    onChange={(e) => set("exteriorDrawing", e.target.value)}
                    className={inputClass}
                    placeholder="有 / 無"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ════════════════════════════════════════════ */}
          {/* 5. 要求格納数セクション */}
          {/* ════════════════════════════════════════════ */}
          <div className="border-b border-[#DDDBDA]">
            <SectionHeader id="storage" title="要求格納数" />
            {openSections.storage && (
              <div className="pb-4">
                <div className="max-w-lg">
                  <label className={labelClass}>要求格納数</label>
                  <input
                    type="text"
                    value={formData.storageRequirement}
                    onChange={(e) => set("storageRequirement", e.target.value)}
                    className={inputClass}
                    placeholder="要求格納数を入力"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ════════════════════════════════════════════ */}
          {/* 6. 工事関連資料セクション */}
          {/* ════════════════════════════════════════════ */}
          <div className="border-b border-[#DDDBDA]">
            <SectionHeader id="construction" title="工事関連資料" />
            {openSections.construction && (
              <div className="pb-4">
                <div className="max-w-lg">
                  <label className={labelClass}>工事関連資料</label>
                  <input
                    type="text"
                    value={formData.constructionDoc}
                    onChange={(e) => set("constructionDoc", e.target.value)}
                    className={inputClass}
                    placeholder="工事関連資料を入力"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ════════════════════════════════════════════ */}
          {/* 7. SEへの依頼関連セクション */}
          {/* ════════════════════════════════════════════ */}
          <div className="border-b border-[#DDDBDA]">
            <SectionHeader id="seRequest" title="SEへの依頼関連" />
            {openSections.seRequest && (
              <div className="pb-4 space-y-4">
                <div className="max-w-lg">
                  <label className={labelClass}>関連ファイル・パス</label>
                  <input
                    type="text"
                    value={formData.relatedFilePath}
                    onChange={(e) => set("relatedFilePath", e.target.value)}
                    className={inputClass}
                    placeholder="関連ファイル・パスを入力"
                  />
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-3">
                  <label className={checkboxLabelClass}>
                    <input
                      type="checkbox"
                      checked={formData.reqLayout}
                      onChange={(e) => set("reqLayout", e.target.checked)}
                      className="rounded border-[#DDDBDA]"
                    />
                    レイアウト案
                  </label>
                  <label className={checkboxLabelClass}>
                    <input
                      type="checkbox"
                      checked={formData.reqLoadDetail}
                      onChange={(e) => set("reqLoadDetail", e.target.checked)}
                      className="rounded border-[#DDDBDA]"
                    />
                    荷姿詳細
                  </label>
                  <label className={checkboxLabelClass}>
                    <input
                      type="checkbox"
                      checked={formData.reqCapacity}
                      onChange={(e) => set("reqCapacity", e.target.checked)}
                      className="rounded border-[#DDDBDA]"
                    />
                    要求能力
                  </label>
                  <label className={checkboxLabelClass}>
                    <input
                      type="checkbox"
                      checked={formData.reqOperation}
                      onChange={(e) => set("reqOperation", e.target.checked)}
                      className="rounded border-[#DDDBDA]"
                    />
                    運用関連
                  </label>
                  <label className={checkboxLabelClass}>
                    <input
                      type="checkbox"
                      checked={formData.reqOtherDoc}
                      onChange={(e) => set("reqOtherDoc", e.target.checked)}
                      className="rounded border-[#DDDBDA]"
                    />
                    その他
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* ════════════════════════════════════════════ */}
          {/* 8. 営業への提出セクション */}
          {/* ════════════════════════════════════════════ */}
          <div className="border-b border-[#DDDBDA]">
            <SectionHeader id="salesSubmit" title="営業への提出" />
            {openSections.salesSubmit && (
              <div className="pb-4 space-y-4">
                <div className="flex flex-wrap gap-x-6 gap-y-3">
                  <label className={checkboxLabelClass}>
                    <input
                      type="checkbox"
                      checked={formData.submitLayout}
                      onChange={(e) => set("submitLayout", e.target.checked)}
                      className="rounded border-[#DDDBDA]"
                    />
                    レイアウト
                  </label>
                  <label className={checkboxLabelClass}>
                    <input
                      type="checkbox"
                      checked={formData.submitCostSheet}
                      onChange={(e) => set("submitCostSheet", e.target.checked)}
                      className="rounded border-[#DDDBDA]"
                    />
                    見積原価表
                  </label>
                  <label className={checkboxLabelClass}>
                    <input
                      type="checkbox"
                      checked={formData.submitAxialForce}
                      onChange={(e) => set("submitAxialForce", e.target.checked)}
                      className="rounded border-[#DDDBDA]"
                    />
                    軸力・輪圧
                  </label>
                  <label className={checkboxLabelClass}>
                    <input
                      type="checkbox"
                      checked={formData.submitPowerReq}
                      onChange={(e) => set("submitPowerReq", e.target.checked)}
                      className="rounded border-[#DDDBDA]"
                    />
                    所用電源容量
                  </label>
                  <label className={checkboxLabelClass}>
                    <input
                      type="checkbox"
                      checked={formData.submitSpecSheet}
                      onChange={(e) => set("submitSpecSheet", e.target.checked)}
                      className="rounded border-[#DDDBDA]"
                    />
                    見積仕様書
                  </label>
                  <label className={checkboxLabelClass}>
                    <input
                      type="checkbox"
                      checked={formData.submitOther}
                      onChange={(e) => set("submitOther", e.target.checked)}
                      className="rounded border-[#DDDBDA]"
                    />
                    その他
                  </label>
                </div>

                <div className="max-w-xs">
                  <label className={labelClass}>希望提出日限</label>
                  <input
                    type="date"
                    value={formData.desiredDeadline}
                    onChange={(e) => set("desiredDeadline", e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>担当営業コメント</label>
                  <textarea
                    value={formData.salesComment}
                    onChange={(e) => set("salesComment", e.target.value)}
                    rows={3}
                    className={inputClass}
                    placeholder="担当営業コメントを入力"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ════════════════════════════════════════════ */}
          {/* 9. 営業課長記入欄セクション */}
          {/* ════════════════════════════════════════════ */}
          <div className="border-b border-[#DDDBDA]">
            <SectionHeader id="managerNote" title="営業課長記入欄" />
            {openSections.managerNote && (
              <div className="pb-4">
                <label className={labelClass}>営業課長コメント</label>
                <textarea
                  value={formData.managerComment}
                  onChange={(e) => set("managerComment", e.target.value)}
                  rows={3}
                  className={inputClass}
                  placeholder="営業課長コメントを入力"
                />
              </div>
            )}
          </div>

          {/* ════════════════════════════════════════════ */}
          {/* 10. システム情報セクション */}
          {/* ════════════════════════════════════════════ */}
          <div className="border-b border-[#DDDBDA]">
            <SectionHeader id="systemInfo" title="システム情報" />
            {openSections.systemInfo && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pb-4">
                {/* 複製元SE見積依頼 (ルックアップ) */}
                <LookupField
                  label="複製元SE見積依頼"
                  selectedName={selectedQrName}
                  searchValue={qrSearch}
                  onSearchChange={setQrSearch}
                  isOpen={qrDropdownOpen}
                  onToggle={() => setQrDropdownOpen(true)}
                  onClear={() => {
                    set("sourceQuotationId", "");
                    setQrDropdownOpen(false);
                  }}
                  items={filteredQrs}
                  onSelect={(id) => {
                    set("sourceQuotationId", id);
                    setQrDropdownOpen(false);
                  }}
                  containerRef={qrRef}
                  placeholder="SE見積依頼を検索..."
                />

                {/* 見積状況 */}
                <div>
                  <label className={labelClass}>見積状況</label>
                  <select
                    value={formData.status}
                    onChange={(e) => set("status", e.target.value)}
                    className={inputClass}
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* アサイン状況 */}
                <div>
                  <label className={labelClass}>アサイン状況</label>
                  <input
                    type="text"
                    value={formData.assignStatus}
                    onChange={(e) => set("assignStatus", e.target.value)}
                    className={inputClass}
                    placeholder="アサイン状況を入力"
                  />
                </div>
              </div>
            )}
          </div>
        </form>

        {/* ── モーダルフッター ── */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#DDDBDA] bg-[#F3F3F3] rounded-b-lg">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded border border-[#DDDBDA] bg-white px-5 py-2 text-sm font-medium text-[#3E3E3C] hover:bg-[#F3F3F3] transition-colors"
          >
            キャンセル
          </button>
          {!isEdit && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={(e) => handleSubmit(e, true)}
              className="rounded border border-[#0070D2] bg-white px-5 py-2 text-sm font-medium text-[#0070D2] hover:bg-[#F3F3F3] disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? "保存中..." : "保存 & 新規"}
            </button>
          )}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={(e) => handleSubmit(e)}
            className="rounded bg-[#0070D2] px-5 py-2 text-sm font-medium text-white hover:bg-[#005FB2] disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? "保存中..." : "保存"}
          </button>
        </div>
      </div>
    </div>
  );
}
