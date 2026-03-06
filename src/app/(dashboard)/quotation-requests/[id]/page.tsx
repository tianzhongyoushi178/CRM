import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Pencil, FileText } from "lucide-react";
import ProcessBar from "@/components/ProcessBar";
import DeleteQuotationRequestButton from "./DeleteButton";
import SubmitToSalesButton from "./SubmitToSalesButton";
import DetailTabsClient from "./DetailTabsClient";

const PROCESS_STATUSES = [
  { key: "DRAFT", label: "下書き" },
  { key: "SALES_SUBMITTED", label: "営業提出済" },
  { key: "SE_ASSIGNED", label: "SE担当者アサイン済" },
  { key: "SE_WORKING", label: "SE担当者作業中" },
  { key: "SUBMITTED_TO_SALES", label: "営業へ提出済" },
];

function formatDate(date: Date | null | undefined): string {
  if (!date) return "--";
  return new Date(date).toLocaleDateString("ja-JP");
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function QuotationRequestDetailPage({
  params,
}: PageProps) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;

  const qr = await prisma.quotationRequest.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true } },
      opportunity: { select: { id: true, name: true } },
      salesPerson: { select: { id: true, name: true } },
      sePerson: { select: { id: true, name: true } },
      seGroupLeader: { select: { id: true, name: true } },
      seManager: { select: { id: true, name: true } },
    },
  });

  if (!qr) notFound();

  return (
    <div>
      {/* パンくずリスト */}
      <nav className="flex items-center gap-1 text-sm text-[#706E6B] mb-4">
        <FileText className="h-4 w-4 text-[#0070D2]" />
        <Link
          href="/quotation-requests"
          className="hover:text-[#0070D2]"
        >
          SE見積依頼
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-[#3E3E3C]">{qr.name}</span>
      </nav>

      {/* ページヘッダー */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#3E3E3C]">{qr.name}</h1>
          {qr.title && (
            <p className="text-sm text-[#706E6B] mt-1">{qr.title}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/quotation-requests/${id}/edit`}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Pencil className="h-4 w-4" />
            編集
          </Link>
          <SubmitToSalesButton id={id} currentStatus={qr.status} />
          <DeleteQuotationRequestButton id={id} />
        </div>
      </div>

      {/* ハイライト項目 */}
      <div className="rounded-xl bg-white shadow-sm border border-[#DDDBDA] p-4 mb-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <div>
            <dt className="text-xs text-[#706E6B]">取引先名</dt>
            <dd className="mt-0.5 text-sm text-[#3E3E3C] font-medium">
              {qr.accountName || "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[#706E6B]">案件</dt>
            <dd className="mt-0.5 text-sm">
              {qr.opportunity ? (
                <Link
                  href={`/opportunities/${qr.opportunity.id}`}
                  className="text-[#0070D2] hover:underline font-medium"
                >
                  {qr.opportunity.name}
                </Link>
              ) : (
                <span className="text-[#3E3E3C]">--</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[#706E6B]">提出日限</dt>
            <dd className="mt-0.5 text-sm text-[#3E3E3C] font-medium">
              {formatDate(qr.submissionDeadline)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[#706E6B]">営業担当</dt>
            <dd className="mt-0.5 text-sm text-[#3E3E3C] font-medium">
              {qr.salesPerson?.name || "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[#706E6B]">SE担当</dt>
            <dd className="mt-0.5 text-sm text-[#3E3E3C] font-medium">
              {qr.sePerson?.name || "--"}
            </dd>
          </div>
        </div>
      </div>

      {/* プロセスバー */}
      <div className="rounded-xl bg-white shadow-sm border border-[#DDDBDA] p-6 mb-6">
        <h2 className="text-sm font-medium text-[#706E6B] mb-4">
          見積進捗
        </h2>
        <ProcessBar
          currentStatus={qr.status}
          statuses={PROCESS_STATUSES}
        />
      </div>

      {/* メインコンテンツ: 左2/3 + 右1/3 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 左ペイン */}
        <div className="lg:col-span-2">
          <DetailTabsClient qr={qr} />
        </div>

        {/* 右ペイン: SE情報サイドパネル */}
        <div className="space-y-6">
          <div className="rounded-xl bg-white shadow-sm border border-[#DDDBDA] p-6">
            <h2 className="text-lg font-semibold text-[#3E3E3C] mb-4">
              SE入力情報
            </h2>
            <div className="rounded-lg border border-[#DDDBDA] bg-white p-4 space-y-4">
              <h3 className="text-sm font-semibold text-[#3E3E3C] border-b border-[#DDDBDA] pb-2">
                SE情報
              </h3>
              <div>
                <dt className="text-xs text-[#706E6B]">SE担当</dt>
                <dd className="mt-0.5 text-sm text-[#3E3E3C]">
                  {qr.sePerson?.name || "--"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#706E6B]">SE所属</dt>
                <dd className="mt-0.5 text-sm text-[#3E3E3C]">
                  {qr.seDepartment || "--"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#706E6B]">SE課長</dt>
                <dd className="mt-0.5 text-sm text-[#3E3E3C]">
                  {qr.seManager?.name || "--"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#706E6B]">SE GL</dt>
                <dd className="mt-0.5 text-sm text-[#3E3E3C]">
                  {qr.seGroupLeader?.name || "--"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#706E6B]">SE課長コメント</dt>
                <dd className="mt-0.5 text-sm text-[#3E3E3C] whitespace-pre-wrap bg-[#F3F3F3] rounded p-2 min-h-[60px]">
                  {qr.seManagerComment || "--"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#706E6B]">SE備考</dt>
                <dd className="mt-0.5 text-sm text-[#3E3E3C] whitespace-pre-wrap">
                  {qr.seNote || "--"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#706E6B]">アサイン状況</dt>
                <dd className="mt-0.5 text-sm text-[#3E3E3C]">
                  {qr.assignStatus || "--"}
                </dd>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-xs text-[#706E6B]">SE作業開始日</dt>
                  <dd className="mt-0.5 text-sm text-[#3E3E3C]">
                    {formatDate(qr.seWorkStartDate)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#706E6B]">SE作業終了日</dt>
                  <dd className="mt-0.5 text-sm text-[#3E3E3C]">
                    {formatDate(qr.seWorkEndDate)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#706E6B]">担当者設定日</dt>
                  <dd className="mt-0.5 text-sm text-[#3E3E3C]">
                    {formatDate(qr.assignDate)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#706E6B]">
                    SE作業終了日(実績)
                  </dt>
                  <dd className="mt-0.5 text-sm text-[#3E3E3C]">
                    {formatDate(qr.seWorkEndActual)}
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

