import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Pencil } from "lucide-react";
import DeleteOpportunityButton from "./DeleteButton";
import PhaseProgressBar from "@/components/PhaseProgressBar";
import DetailField from "@/components/DetailField";
import DetailTabs from "@/components/DetailTabs";
import ActivityTimeline from "@/components/ActivityTimeline";

const stageLabels: Record<string, string> = {
  PROSPECTING: "見込み",
  QUALIFICATION: "評価",
  NEEDS_ANALYSIS: "ニーズ分析",
  PROPOSAL: "提案",
  NEGOTIATION: "交渉",
  CLOSED_WON: "成約",
  CLOSED_LOST: "失注",
};

const stageColors: Record<string, string> = {
  PROSPECTING: "bg-gray-100 text-gray-700",
  QUALIFICATION: "bg-blue-100 text-blue-700",
  NEEDS_ANALYSIS: "bg-indigo-100 text-indigo-700",
  PROPOSAL: "bg-purple-100 text-purple-700",
  NEGOTIATION: "bg-yellow-100 text-yellow-800",
  CLOSED_WON: "bg-green-100 text-green-700",
  CLOSED_LOST: "bg-red-100 text-red-700",
};

const quotationStatusLabels: Record<string, string> = {
  DRAFT: "下書き",
  SALES_SUBMITTED: "営業提出済",
  SE_ASSIGNED: "SEアサイン済",
  SE_WORKING: "SE作業中",
  SE_COMPLETED: "SE完了",
  SUBMITTED_TO_SALES: "営業へ提出済",
  NOT_REQUIRED: "不要",
  CANCELLED: "キャンセル",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OpportunityDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;

  const opportunity = await prisma.opportunity.findUnique({
    where: { id },
    include: {
      owner: true,
      account: true,
      activities: {
        include: { owner: true },
        orderBy: { dueDate: "desc" },
        take: 20,
      },
      salesDetails: { orderBy: { lineNumber: "asc" } },
      quotationRequests: {
        include: { sePerson: true },
        orderBy: { updatedAt: "desc" },
      },
      analysisInfos: { orderBy: { updatedAt: "desc" } },
    },
  });

  if (!opportunity) notFound();

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return null;
    return `¥${amount.toLocaleString()}`;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("ja-JP");
  };

  // 詳細タブの内容
  const detailContent = (
    <div className="grid grid-cols-1 gap-x-8 gap-y-1 sm:grid-cols-2">
      <DetailField label="案件名" value={opportunity.name} />
      <DetailField label="所有者" value={opportunity.owner.name} />
      <DetailField
        label="取引先名"
        value={
          opportunity.account ? (
            <Link
              href={`/accounts/${opportunity.account.id}`}
              className="text-[#0070D2] hover:underline"
            >
              {opportunity.account.name}
            </Link>
          ) : null
        }
      />
      <DetailField label="金額" value={formatCurrency(opportunity.amount)} />
      <DetailField
        label="ステージ"
        value={
          <span
            className={`inline-block rounded-full px-3 py-0.5 text-xs font-medium ${
              stageColors[opportunity.stage] ?? "bg-gray-100 text-gray-700"
            }`}
          >
            {stageLabels[opportunity.stage] ?? opportunity.stage}
          </span>
        }
      />
      <DetailField
        label="確度(%)"
        value={
          opportunity.probability !== null
            ? `${opportunity.probability}%`
            : null
        }
      />
      <DetailField
        label="完了予定日"
        value={formatDate(opportunity.closeDate)}
      />
      <div className="sm:col-span-2">
        <DetailField label="説明" value={opportunity.description} />
      </div>
    </div>
  );

  // 売上タブの内容
  const salesContent = (
    <div>
      <div className="mb-3 flex justify-end">
        <button
          type="button"
          className="rounded border border-[#0070D2] bg-white px-3 py-1.5 text-xs font-medium text-[#0070D2] hover:bg-blue-50"
        >
          新規
        </button>
      </div>
      {opportunity.salesDetails.length === 0 ? (
        <p className="py-8 text-center text-sm text-[#706E6B]">
          売上データがありません
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#DDDBDA] text-xs font-medium uppercase text-[#706E6B]">
                <th className="px-3 py-2">No</th>
                <th className="px-3 py-2">納期</th>
                <th className="px-3 py-2">売上金額</th>
                <th className="px-3 py-2">製番</th>
                <th className="px-3 py-2">受注確度</th>
                <th className="px-3 py-2">備考</th>
                <th className="px-3 py-2">自動作成</th>
              </tr>
            </thead>
            <tbody>
              {opportunity.salesDetails.map((sd) => (
                <tr
                  key={sd.id}
                  className="border-b border-[#DDDBDA] hover:bg-[#F3F3F3]"
                >
                  <td className="px-3 py-2 text-[#3E3E3C]">
                    {sd.lineNumber}
                  </td>
                  <td className="px-3 py-2 text-[#3E3E3C]">
                    {formatDate(sd.deliveryDate) ?? "\u2014"}
                  </td>
                  <td className="px-3 py-2 text-[#3E3E3C]">
                    {sd.amount !== null
                      ? `¥${sd.amount.toLocaleString()}`
                      : "\u2014"}
                  </td>
                  <td className="px-3 py-2 text-[#3E3E3C]">
                    {sd.productNumber ?? "\u2014"}
                  </td>
                  <td className="px-3 py-2 text-[#3E3E3C]">
                    {sd.winProbability ?? "\u2014"}
                  </td>
                  <td className="px-3 py-2 text-[#3E3E3C]">
                    {sd.note ?? "\u2014"}
                  </td>
                  <td className="px-3 py-2 text-[#3E3E3C]">
                    {sd.isAutoCreated ? "Yes" : "No"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // SE見積依頼タブの内容
  const quotationContent = (
    <div>
      <div className="mb-3 flex justify-end">
        <button
          type="button"
          className="rounded border border-[#0070D2] bg-white px-3 py-1.5 text-xs font-medium text-[#0070D2] hover:bg-blue-50"
        >
          新規
        </button>
      </div>
      {opportunity.quotationRequests.length === 0 ? (
        <p className="py-8 text-center text-sm text-[#706E6B]">
          SE見積依頼データがありません
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#DDDBDA] text-xs font-medium uppercase text-[#706E6B]">
                <th className="px-3 py-2">SE見積依頼名</th>
                <th className="px-3 py-2">見積状況</th>
                <th className="px-3 py-2">SE担当</th>
                <th className="px-3 py-2">提出日限</th>
                <th className="px-3 py-2">最終更新日</th>
              </tr>
            </thead>
            <tbody>
              {opportunity.quotationRequests.map((qr) => (
                <tr
                  key={qr.id}
                  className="border-b border-[#DDDBDA] hover:bg-[#F3F3F3]"
                >
                  <td className="px-3 py-2">
                    <Link
                      href={`/quotation-requests/${qr.id}`}
                      className="text-[#0070D2] hover:underline"
                    >
                      {qr.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-[#3E3E3C]">
                    {quotationStatusLabels[qr.status] ?? qr.status}
                  </td>
                  <td className="px-3 py-2 text-[#3E3E3C]">
                    {qr.sePerson?.name ?? "\u2014"}
                  </td>
                  <td className="px-3 py-2 text-[#3E3E3C]">
                    {formatDate(qr.submissionDeadline) ?? "\u2014"}
                  </td>
                  <td className="px-3 py-2 text-[#3E3E3C]">
                    {formatDate(qr.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // 分析情報タブの内容
  const analysisContent = (
    <div>
      {opportunity.analysisInfos.length === 0 ? (
        <p className="py-8 text-center text-sm text-[#706E6B]">
          分析情報データがありません
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#DDDBDA] text-xs font-medium uppercase text-[#706E6B]">
                <th className="px-3 py-2">分析情報名</th>
                <th className="px-3 py-2">荷重</th>
                <th className="px-3 py-2">温度帯</th>
                <th className="px-3 py-2">クリーン度</th>
                <th className="px-3 py-2">防爆</th>
                <th className="px-3 py-2">荷姿</th>
              </tr>
            </thead>
            <tbody>
              {opportunity.analysisInfos.map((ai) => (
                <tr
                  key={ai.id}
                  className="border-b border-[#DDDBDA] hover:bg-[#F3F3F3]"
                >
                  <td className="px-3 py-2 text-[#3E3E3C]">{ai.name}</td>
                  <td className="px-3 py-2 text-[#3E3E3C]">
                    {ai.weight ?? "\u2014"}
                  </td>
                  <td className="px-3 py-2 text-[#3E3E3C]">
                    {ai.temperatureZone ?? "\u2014"}
                  </td>
                  <td className="px-3 py-2 text-[#3E3E3C]">
                    {ai.cleanLevel ?? "\u2014"}
                  </td>
                  <td className="px-3 py-2 text-[#3E3E3C]">
                    {ai.explosionProof ?? "\u2014"}
                  </td>
                  <td className="px-3 py-2 text-[#3E3E3C]">
                    {ai.packageType ?? "\u2014"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // ファイルタブの内容（プレースホルダー）
  const fileContent = (
    <p className="py-8 text-center text-sm text-[#706E6B]">
      ファイルはありません
    </p>
  );

  // ActivityTimeline用のデータ変換
  const timelineActivities = opportunity.activities.map((a) => ({
    id: a.id,
    type: a.type,
    subject: a.subject,
    description: a.description,
    dueDate: a.dueDate,
    status: a.status,
    owner: { name: a.owner.name },
  }));

  return (
    <div>
      {/* パンくずリスト */}
      <nav className="mb-4 flex items-center gap-1 text-sm text-[#706E6B]">
        <Link
          href="/opportunities"
          className="flex items-center gap-1 hover:text-[#0070D2]"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="text-orange-500"
          >
            <rect
              x="2"
              y="2"
              width="12"
              height="12"
              rx="2"
              fill="currentColor"
            />
            <text
              x="8"
              y="11"
              textAnchor="middle"
              fontSize="8"
              fill="white"
              fontWeight="bold"
            >
              ¥
            </text>
          </svg>
          案件
        </Link>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="text-[#706E6B]"
        >
          <path
            d="M6 4l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-[#3E3E3C]">{opportunity.name}</span>
      </nav>

      {/* ページヘッダー */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-[#3E3E3C]">
          {opportunity.name}
        </h1>

        {/* ハイライト項目 */}
        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-[#DDDBDA] bg-white px-5 py-3">
          <div>
            <p className="text-xs text-[#706E6B]">取引先名</p>
            {opportunity.account ? (
              <Link
                href={`/accounts/${opportunity.account.id}`}
                className="text-sm font-medium text-[#0070D2] hover:underline"
              >
                {opportunity.account.name}
              </Link>
            ) : (
              <p className="text-sm text-[#3E3E3C]">{"\u2014"}</p>
            )}
          </div>
          <div className="h-8 w-px bg-[#DDDBDA]" />
          <div>
            <p className="text-xs text-[#706E6B]">金額</p>
            <p className="text-sm font-medium text-[#3E3E3C]">
              {formatCurrency(opportunity.amount) ?? "\u2014"}
            </p>
          </div>
          <div className="h-8 w-px bg-[#DDDBDA]" />
          <div>
            <p className="text-xs text-[#706E6B]">ステージ</p>
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                stageColors[opportunity.stage] ?? "bg-gray-100 text-gray-700"
              }`}
            >
              {stageLabels[opportunity.stage] ?? opportunity.stage}
            </span>
          </div>
          <div className="h-8 w-px bg-[#DDDBDA]" />
          <div>
            <p className="text-xs text-[#706E6B]">完了予定日</p>
            <p className="text-sm font-medium text-[#3E3E3C]">
              {formatDate(opportunity.closeDate) ?? "\u2014"}
            </p>
          </div>
          <div className="h-8 w-px bg-[#DDDBDA]" />
          <div>
            <p className="text-xs text-[#706E6B]">所有者</p>
            <p className="text-sm font-medium text-[#3E3E3C]">
              {opportunity.owner.name}
            </p>
          </div>

          {/* アクションボタン（右端） */}
          <div className="ml-auto flex items-center gap-2">
            <Link
              href={`/opportunities/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded border border-[#DDDBDA] bg-white px-3 py-1.5 text-sm font-medium text-[#3E3E3C] hover:bg-[#F3F3F3] transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
              編集
            </Link>
            <DeleteOpportunityButton id={id} />
          </div>
        </div>
      </div>

      {/* フェーズ進捗バー */}
      <div className="mb-6 rounded-lg border border-[#DDDBDA] bg-white p-4">
        <PhaseProgressBar currentStage={opportunity.stage} />
      </div>

      {/* メインコンテンツ: 2/3 + 1/3 レイアウト */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 左ペイン: タブ付き詳細 */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-[#DDDBDA] bg-white p-5">
            <DetailTabs
              tabs={[
                { id: "detail", label: "詳細", content: detailContent },
                { id: "sales", label: "売上", content: salesContent },
                {
                  id: "quotation",
                  label: "SE見積依頼",
                  content: quotationContent,
                },
                {
                  id: "analysis",
                  label: "分析情報",
                  content: analysisContent,
                },
                { id: "files", label: "ファイル", content: fileContent },
              ]}
            />
          </div>
        </div>

        {/* 右ペイン: 活動タイムライン */}
        <div>
          <div className="rounded-lg border border-[#DDDBDA] bg-white p-5">
            <h3 className="mb-3 text-base font-semibold text-[#3E3E3C]">
              活動
            </h3>
            <ActivityTimeline activities={timelineActivities} />
          </div>
        </div>
      </div>
    </div>
  );
}
