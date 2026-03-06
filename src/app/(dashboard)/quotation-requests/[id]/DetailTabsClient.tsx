"use client";

import { useState } from "react";
import Link from "next/link";

interface DetailTabsClientProps {
  qr: {
    opportunityId: string | null;
    opportunity: { id: string; name: string } | null;
    salesBranch: string | null;
    salesPerson: { id: string; name: string } | null;
    quotationNumber: string | null;
    accountName: string | null;
    endUserName: string | null;
    installLocation: string | null;
    installEnvironment: string | null;
    seWorkStartDate: Date | null;
    seWorkEndDate: Date | null;
    seWorkEndActual: Date | null;
    assignDate: Date | null;
  };
}

function formatDate(date: Date | null | undefined): string {
  if (!date) return "--";
  return new Date(date).toLocaleDateString("ja-JP");
}

type TabKey = "detail" | "work" | "history";

export default function DetailTabsClient({ qr }: DetailTabsClientProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("detail");

  const tabs: { key: TabKey; label: string }[] = [
    { key: "detail", label: "詳細" },
    { key: "work", label: "作業期間" },
    { key: "history", label: "履歴" },
  ];

  return (
    <div className="rounded-xl bg-white shadow-sm border border-[#DDDBDA]">
      {/* タブヘッダー */}
      <div className="flex border-b border-[#DDDBDA]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "text-[#0070D2] border-b-2 border-[#0070D2]"
                : "text-[#706E6B] hover:text-[#3E3E3C]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* タブコンテンツ */}
      <div className="p-6">
        {activeTab === "detail" && (
          <div className="space-y-6">
            {/* 基本情報セクション */}
            <div>
              <h3 className="text-sm font-semibold text-[#3E3E3C] border-b border-[#DDDBDA] pb-2 mb-4">
                基本情報
              </h3>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-[#706E6B]">案件</dt>
                  <dd className="mt-1 text-sm text-[#3E3E3C]">
                    {qr.opportunity ? (
                      <Link
                        href={`/opportunities/${qr.opportunity.id}`}
                        className="text-[#0070D2] hover:underline"
                      >
                        {qr.opportunity.name}
                      </Link>
                    ) : (
                      "--"
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#706E6B]">営業拠点</dt>
                  <dd className="mt-1 text-sm text-[#3E3E3C]">
                    {qr.salesBranch || "--"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#706E6B]">営業担当</dt>
                  <dd className="mt-1 text-sm text-[#3E3E3C]">
                    {qr.salesPerson?.name || "--"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#706E6B]">見積番号</dt>
                  <dd className="mt-1 text-sm text-[#3E3E3C]">
                    {qr.quotationNumber || "--"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#706E6B]">取引先名</dt>
                  <dd className="mt-1 text-sm text-[#3E3E3C]">
                    {qr.accountName || "--"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#706E6B]">エンドユーザ名</dt>
                  <dd className="mt-1 text-sm text-[#3E3E3C]">
                    {qr.endUserName || "--"}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs text-[#706E6B]">設置場所</dt>
                  <dd className="mt-1 text-sm text-[#3E3E3C]">
                    {qr.installLocation || "--"}
                  </dd>
                </div>
              </dl>
            </div>

            {/* 設置環境セクション */}
            <div>
              <h3 className="text-sm font-semibold text-[#3E3E3C] border-b border-[#DDDBDA] pb-2 mb-4">
                設置環境
              </h3>
              <div className="text-sm text-[#3E3E3C] whitespace-pre-wrap">
                {qr.installEnvironment || "--"}
              </div>
            </div>
          </div>
        )}

        {activeTab === "work" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-[#DDDBDA] p-4">
              <dt className="text-xs text-[#706E6B]">SE作業開始日</dt>
              <dd className="mt-1 text-sm font-medium text-[#3E3E3C]">
                {formatDate(qr.seWorkStartDate)}
              </dd>
            </div>
            <div className="rounded-lg border border-[#DDDBDA] p-4">
              <dt className="text-xs text-[#706E6B]">SE作業終了日</dt>
              <dd className="mt-1 text-sm font-medium text-[#3E3E3C]">
                {formatDate(qr.seWorkEndDate)}
              </dd>
            </div>
            <div className="rounded-lg border border-[#DDDBDA] p-4">
              <dt className="text-xs text-[#706E6B]">SE作業終了日(実績)</dt>
              <dd className="mt-1 text-sm font-medium text-[#3E3E3C]">
                {formatDate(qr.seWorkEndActual)}
              </dd>
            </div>
            <div className="rounded-lg border border-[#DDDBDA] p-4">
              <dt className="text-xs text-[#706E6B]">担当者設定日</dt>
              <dd className="mt-1 text-sm font-medium text-[#3E3E3C]">
                {formatDate(qr.assignDate)}
              </dd>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="text-sm text-[#706E6B] py-8 text-center">
            変更履歴は現在準備中です
          </div>
        )}
      </div>
    </div>
  );
}
