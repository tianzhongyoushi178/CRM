import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { OpportunityStage } from "@prisma/client";

const stageLabels: Record<OpportunityStage, string> = {
  PROSPECTING: "見込み",
  QUALIFICATION: "評価",
  NEEDS_ANALYSIS: "ニーズ分析",
  PROPOSAL: "提案",
  NEGOTIATION: "交渉",
  CLOSED_WON: "成約",
  CLOSED_LOST: "失注",
};

const stageColors: Record<OpportunityStage, string> = {
  PROSPECTING: "#1B96FF",
  QUALIFICATION: "#0176D3",
  NEEDS_ANALYSIS: "#032D60",
  PROPOSAL: "#6B21A8",
  NEGOTIATION: "#F59E0B",
  CLOSED_WON: "#16A34A",
  CLOSED_LOST: "#DC2626",
};

const stageOrder: OpportunityStage[] = [
  "PROSPECTING",
  "QUALIFICATION",
  "NEEDS_ANALYSIS",
  "PROPOSAL",
  "NEGOTIATION",
  "CLOSED_WON",
  "CLOSED_LOST",
];

interface ReportPageProps {
  params: Promise<{ id: string }>;
}

export default async function ReportDetailPage({ params }: ReportPageProps) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;

  if (id === "monthly-sales") {
    return <MonthlySalesReport />;
  }

  // デフォルト: 案件パイプラインレポート
  return <PipelineReport />;
}

async function PipelineReport() {
  const opportunities = await prisma.opportunity.findMany({
    include: {
      account: { select: { name: true } },
      owner: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // ステージ別にグループ化
  const grouped = new Map<OpportunityStage, typeof opportunities>();
  for (const opp of opportunities) {
    const list = grouped.get(opp.stage) || [];
    list.push(opp);
    grouped.set(opp.stage, list);
  }

  return (
    <div>
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="flex items-center gap-2 text-sm mb-1" style={{ color: "#706E6B" }}>
            <Link href="/reports" className="hover:underline" style={{ color: "#0070D2" }}>
              レポート
            </Link>
            <span>&gt;</span>
            <span>案件パイプライン</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "#3E3E3C" }}>
            案件パイプライン
          </h1>
          <p className="text-sm mt-1" style={{ color: "#706E6B" }}>
            ステージ別案件一覧
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 text-sm font-medium rounded border hover:bg-gray-50"
            style={{ borderColor: "#DDDBDA", color: "#3E3E3C" }}
          >
            編集
          </button>
          <button
            className="px-4 py-2 text-sm font-medium text-white rounded"
            style={{ backgroundColor: "#0070D2" }}
          >
            更新
          </button>
        </div>
      </div>

      {/* 集計行 */}
      <div
        className="mb-6 px-4 py-2 rounded-lg text-sm font-medium"
        style={{ backgroundColor: "#EAF5FE", color: "#0070D2" }}
      >
        合計レコード数 {opportunities.length}
      </div>

      {/* テーブル */}
      <div className="bg-white rounded-xl shadow-sm border" style={{ borderColor: "#DDDBDA" }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left" style={{ color: "#706E6B" }}>
              <th className="px-4 py-3 font-semibold">案件名</th>
              <th className="px-4 py-3 font-semibold">取引先</th>
              <th className="px-4 py-3 font-semibold">ステージ</th>
              <th className="px-4 py-3 font-semibold text-right">金額</th>
              <th className="px-4 py-3 font-semibold">完了予定日</th>
              <th className="px-4 py-3 font-semibold">所有者</th>
            </tr>
          </thead>
          <tbody>
            {stageOrder.map((stage) => {
              const items = grouped.get(stage);
              if (!items || items.length === 0) return null;

              const stageTotal = items.reduce(
                (sum, o) => sum + (o.amount || 0),
                0
              );

              return (
                <GroupRows
                  key={stage}
                  stage={stage}
                  items={items}
                  stageTotal={stageTotal}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GroupRows({
  stage,
  items,
  stageTotal,
}: {
  stage: OpportunityStage;
  items: Array<{
    id: string;
    name: string;
    amount: number | null;
    stage: OpportunityStage;
    closeDate: Date | null;
    account: { name: string } | null;
    owner: { name: string };
  }>;
  stageTotal: number;
}) {
  return (
    <>
      {/* グループヘッダー */}
      <tr style={{ backgroundColor: "#F0F8FF" }}>
        <td
          colSpan={6}
          className="px-4 py-2 font-bold text-sm"
          style={{ color: "#0070D2" }}
        >
          <span
            className="inline-block w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: stageColors[stage] }}
          />
          {stageLabels[stage]} ({items.length}件 / 小計: ¥
          {stageTotal.toLocaleString()})
        </td>
      </tr>
      {items.map((opp) => (
        <tr
          key={opp.id}
          className="border-t hover:bg-gray-50 transition-colors"
          style={{ borderColor: "#DDDBDA" }}
        >
          <td className="px-4 py-3">
            <Link
              href={`/opportunities/${opp.id}`}
              className="font-medium hover:underline"
              style={{ color: "#0070D2" }}
            >
              {opp.name}
            </Link>
          </td>
          <td className="px-4 py-3" style={{ color: "#3E3E3C" }}>
            {opp.account?.name || "-"}
          </td>
          <td className="px-4 py-3">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full text-white"
              style={{ backgroundColor: stageColors[opp.stage] }}
            >
              {stageLabels[opp.stage]}
            </span>
          </td>
          <td className="px-4 py-3 text-right" style={{ color: "#3E3E3C" }}>
            {opp.amount != null ? `¥${opp.amount.toLocaleString()}` : "-"}
          </td>
          <td className="px-4 py-3" style={{ color: "#706E6B" }}>
            {opp.closeDate
              ? new Date(opp.closeDate).toLocaleDateString("ja-JP")
              : "-"}
          </td>
          <td className="px-4 py-3" style={{ color: "#3E3E3C" }}>
            {opp.owner.name}
          </td>
        </tr>
      ))}
    </>
  );
}

async function MonthlySalesReport() {
  const stageData = await prisma.opportunity.groupBy({
    by: ["stage"],
    _count: true,
    _sum: { amount: true },
  });

  const maxAmount = Math.max(
    ...stageData.map((d) => d._sum.amount || 0),
    1
  );

  return (
    <div>
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="flex items-center gap-2 text-sm mb-1" style={{ color: "#706E6B" }}>
            <Link href="/reports" className="hover:underline" style={{ color: "#0070D2" }}>
              レポート
            </Link>
            <span>&gt;</span>
            <span>月別売上レポート</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "#3E3E3C" }}>
            月別売上レポート
          </h1>
          <p className="text-sm mt-1" style={{ color: "#706E6B" }}>
            月ごとの売上推移
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 text-sm font-medium rounded border hover:bg-gray-50"
            style={{ borderColor: "#DDDBDA", color: "#3E3E3C" }}
          >
            編集
          </button>
          <button
            className="px-4 py-2 text-sm font-medium text-white rounded"
            style={{ backgroundColor: "#0070D2" }}
          >
            更新
          </button>
        </div>
      </div>

      {/* 集計行 */}
      <div
        className="mb-6 px-4 py-2 rounded-lg text-sm font-medium"
        style={{ backgroundColor: "#EAF5FE", color: "#0070D2" }}
      >
        合計レコード数 {stageData.reduce((sum, d) => sum + d._count, 0)}
      </div>

      {/* 棒グラフ */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6" style={{ borderColor: "#DDDBDA" }}>
        <h2 className="text-base font-bold mb-4" style={{ color: "#3E3E3C" }}>
          ステージ別集計
        </h2>
        <div className="space-y-4">
          {stageOrder.map((stage) => {
            const data = stageData.find((d) => d.stage === stage);
            if (!data) return null;
            const amount = data._sum.amount || 0;
            const widthPercent = (amount / maxAmount) * 100;
            return (
              <div key={stage}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span style={{ color: "#3E3E3C" }}>
                    {stageLabels[stage]} ({data._count}件)
                  </span>
                  <span className="font-medium" style={{ color: "#3E3E3C" }}>
                    ¥{amount.toLocaleString()}
                  </span>
                </div>
                <div className="h-7 w-full rounded bg-gray-100">
                  <div
                    className="h-7 rounded"
                    style={{
                      width: `${Math.max(widthPercent, 2)}%`,
                      backgroundColor: stageColors[stage],
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* テーブル */}
      <div className="bg-white rounded-xl shadow-sm border" style={{ borderColor: "#DDDBDA" }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left" style={{ color: "#706E6B" }}>
              <th className="px-4 py-3 font-semibold">ステージ</th>
              <th className="px-4 py-3 font-semibold text-right">件数</th>
              <th className="px-4 py-3 font-semibold text-right">合計金額</th>
            </tr>
          </thead>
          <tbody>
            {stageOrder.map((stage) => {
              const data = stageData.find((d) => d.stage === stage);
              if (!data) return null;
              return (
                <tr
                  key={stage}
                  className="border-t hover:bg-gray-50 transition-colors"
                  style={{ borderColor: "#DDDBDA" }}
                >
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-block w-3 h-3 rounded-full"
                        style={{ backgroundColor: stageColors[stage] }}
                      />
                      <span style={{ color: "#3E3E3C" }}>{stageLabels[stage]}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right" style={{ color: "#3E3E3C" }}>
                    {data._count}
                  </td>
                  <td className="px-4 py-3 text-right font-medium" style={{ color: "#3E3E3C" }}>
                    ¥{(data._sum.amount || 0).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
