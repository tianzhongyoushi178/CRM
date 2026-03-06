import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardWidget from "@/components/DashboardWidget";
import { OpportunityStage } from "@/generated/prisma";

const stageLabels: Record<OpportunityStage, string> = {
  PROSPECTING: "見込み",
  QUALIFICATION: "評価",
  NEEDS_ANALYSIS: "ニーズ分析",
  PROPOSAL: "提案",
  NEGOTIATION: "交渉",
  CLOSED_WON: "成約",
  CLOSED_LOST: "失注",
};

const stageBarColors: Record<OpportunityStage, string> = {
  PROSPECTING: "#1B96FF",
  QUALIFICATION: "#0176D3",
  NEEDS_ANALYSIS: "#032D60",
  PROPOSAL: "#6B21A8",
  NEGOTIATION: "#F59E0B",
  CLOSED_WON: "#16A34A",
  CLOSED_LOST: "#DC2626",
};

interface DashboardDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DashboardDetailPage({ params }: DashboardDetailPageProps) {
  const session = await auth();
  if (!session) redirect("/login");

  // paramsを待機（Next.js App Router）
  await params;

  // データ取得を並列実行
  const [
    activeOpportunityCount,
    wonAmountResult,
    unconvertedLeadCount,
    stageGroupData,
    recentOpportunities,
    wonOpportunities,
  ] = await Promise.all([
    // ウィジェット1: 進行中案件数
    prisma.opportunity.count({
      where: {
        stage: { notIn: ["CLOSED_WON", "CLOSED_LOST"] },
      },
    }),

    // ウィジェット2: 成約金額合計
    prisma.opportunity.aggregate({
      where: { stage: "CLOSED_WON" },
      _sum: { amount: true },
    }),

    // ウィジェット3: 未対応リード数
    prisma.lead.count({
      where: { isConverted: false },
    }),

    // ウィジェット4: ステージ別案件数
    prisma.opportunity.groupBy({
      by: ["stage"],
      _count: true,
    }),

    // ウィジェット5: 直近の案件
    prisma.opportunity.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: { account: { select: { name: true } } },
    }),

    // ウィジェット6: 月別成約推移（過去6ヶ月分）
    (() => {
      const now = new Date();
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      return prisma.opportunity.findMany({
        where: {
          stage: "CLOSED_WON",
          closeDate: { gte: sixMonthsAgo },
        },
        select: {
          amount: true,
          closeDate: true,
        },
      });
    })(),
  ]);

  const wonAmount = wonAmountResult._sum.amount || 0;

  // ステージ別データ整理
  const totalStageCount = stageGroupData.reduce((sum, d) => sum + d._count, 0);
  const maxStageCount = Math.max(...stageGroupData.map((d) => d._count), 1);

  // 月別成約推移データ整理
  const now = new Date();
  const monthlyData: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyData[key] = 0;
  }
  for (const opp of wonOpportunities) {
    if (opp.closeDate && opp.amount) {
      const d = new Date(opp.closeDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (key in monthlyData) {
        monthlyData[key] += opp.amount;
      }
    }
  }
  const maxMonthlyAmount = Math.max(...Object.values(monthlyData), 1);

  return (
    <div>
      {/* ページヘッダー */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="flex items-center gap-2 text-sm mb-1" style={{ color: "#706E6B" }}>
            <Link href="/dashboards" className="hover:underline" style={{ color: "#0070D2" }}>
              ダッシュボード
            </Link>
            <span>&gt;</span>
            <span>営業ダッシュボード</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "#3E3E3C" }}>
            営業ダッシュボード
          </h1>
          <p className="text-sm mt-1" style={{ color: "#706E6B" }}>
            最終更新日: {new Date().toLocaleDateString("ja-JP")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* フィルター (UIのみ) */}
          <select
            className="px-3 py-2 text-sm border rounded"
            style={{ borderColor: "#DDDBDA", color: "#3E3E3C" }}
            defaultValue="all"
          >
            <option value="all">部署：すべて</option>
          </select>
          <select
            className="px-3 py-2 text-sm border rounded"
            style={{ borderColor: "#DDDBDA", color: "#3E3E3C" }}
            defaultValue="all"
          >
            <option value="all">担当者：すべて</option>
          </select>
          <button
            className="px-4 py-2 text-sm font-medium text-white rounded"
            style={{ backgroundColor: "#0070D2" }}
          >
            更新
          </button>
        </div>
      </div>

      {/* ウィジェットグリッド */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        {/* ウィジェット1: 進行中案件数 */}
        <DashboardWidget title="進行中案件数" reportLink="/reports/pipeline">
          <div className="text-center py-4">
            <p className="text-4xl font-bold" style={{ color: "#0070D2" }}>
              {activeOpportunityCount}
            </p>
            <p className="text-sm mt-2" style={{ color: "#706E6B" }}>
              件
            </p>
          </div>
        </DashboardWidget>

        {/* ウィジェット2: 成約金額合計 */}
        <DashboardWidget title="成約金額合計" reportLink="/reports/monthly-sales">
          <div className="text-center py-4">
            <p className="text-4xl font-bold" style={{ color: "#04844B" }}>
              ¥{wonAmount.toLocaleString()}
            </p>
            <p className="text-sm mt-2" style={{ color: "#706E6B" }}>
              成約済み案件の合計
            </p>
          </div>
        </DashboardWidget>

        {/* ウィジェット3: 未対応リード数 */}
        <DashboardWidget title="未対応リード数" reportLink="/reports/leads">
          <div className="text-center py-4">
            <p className="text-4xl font-bold" style={{ color: "#0070D2" }}>
              {unconvertedLeadCount}
            </p>
            <p className="text-sm mt-2" style={{ color: "#706E6B" }}>
              未変換リード
            </p>
          </div>
        </DashboardWidget>

        {/* ウィジェット4: ステージ別案件数 */}
        <DashboardWidget
          title="ステージ別案件数"
          reportLink="/reports/pipeline"
          className="col-span-2"
        >
          <div className="space-y-3">
            {stageGroupData.length === 0 ? (
              <p className="text-sm" style={{ color: "#706E6B" }}>
                データがありません
              </p>
            ) : (
              stageGroupData
                .sort((a, b) => {
                  const order: OpportunityStage[] = [
                    "PROSPECTING",
                    "QUALIFICATION",
                    "NEEDS_ANALYSIS",
                    "PROPOSAL",
                    "NEGOTIATION",
                    "CLOSED_WON",
                    "CLOSED_LOST",
                  ];
                  return order.indexOf(a.stage) - order.indexOf(b.stage);
                })
                .map((d) => {
                  const widthPercent = (d._count / maxStageCount) * 100;
                  return (
                    <div key={d.stage}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span style={{ color: "#3E3E3C" }}>
                          {stageLabels[d.stage]}
                        </span>
                        <span className="font-medium" style={{ color: "#3E3E3C" }}>
                          {d._count}件
                        </span>
                      </div>
                      <div className="h-6 w-full rounded bg-gray-100">
                        <div
                          className="h-6 rounded"
                          style={{
                            width: `${Math.max(widthPercent, 3)}%`,
                            backgroundColor:
                              stageBarColors[d.stage] || "#0070D2",
                          }}
                        />
                      </div>
                    </div>
                  );
                })
            )}
            {stageGroupData.length > 0 && (
              <div className="text-xs text-right" style={{ color: "#706E6B" }}>
                合計: {totalStageCount}件
              </div>
            )}
          </div>
        </DashboardWidget>

        {/* ウィジェット6: 月別成約推移 */}
        <DashboardWidget title="月別成約推移" reportLink="/reports/monthly-sales">
          <div className="flex items-end gap-2 h-40">
            {Object.entries(monthlyData).map(([month, amount]) => {
              const heightPercent = (amount / maxMonthlyAmount) * 100;
              const label = month.split("-")[1] + "月";
              return (
                <div
                  key={month}
                  className="flex-1 flex flex-col items-center justify-end h-full"
                >
                  <div
                    className="w-full rounded-t"
                    style={{
                      height: `${Math.max(heightPercent, 2)}%`,
                      backgroundColor: "#0070D2",
                    }}
                    title={`¥${amount.toLocaleString()}`}
                  />
                  <span
                    className="text-xs mt-1 whitespace-nowrap"
                    style={{ color: "#706E6B" }}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </DashboardWidget>

        {/* ウィジェット5: 直近の案件 */}
        <DashboardWidget
          title="直近の案件"
          reportLink="/reports/pipeline"
          className="col-span-3"
        >
          {recentOpportunities.length === 0 ? (
            <p className="text-sm" style={{ color: "#706E6B" }}>
              データがありません
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left" style={{ color: "#706E6B" }}>
                  <th className="px-3 py-2 font-semibold">案件名</th>
                  <th className="px-3 py-2 font-semibold">取引先</th>
                  <th className="px-3 py-2 font-semibold text-right">金額</th>
                  <th className="px-3 py-2 font-semibold">ステージ</th>
                </tr>
              </thead>
              <tbody>
                {recentOpportunities.map((opp) => (
                  <tr
                    key={opp.id}
                    className="border-t hover:bg-gray-50 transition-colors"
                    style={{ borderColor: "#DDDBDA" }}
                  >
                    <td className="px-3 py-2">
                      <Link
                        href={`/opportunities/${opp.id}`}
                        className="font-medium hover:underline"
                        style={{ color: "#0070D2" }}
                      >
                        {opp.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2" style={{ color: "#3E3E3C" }}>
                      {opp.account?.name || "-"}
                    </td>
                    <td className="px-3 py-2 text-right" style={{ color: "#3E3E3C" }}>
                      {opp.amount != null
                        ? `¥${opp.amount.toLocaleString()}`
                        : "-"}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className="inline-flex items-center text-xs font-medium px-2 py-1 rounded-full text-white"
                        style={{
                          backgroundColor:
                            stageBarColors[opp.stage] || "#0070D2",
                        }}
                      >
                        {stageLabels[opp.stage]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </DashboardWidget>
      </div>
    </div>
  );
}
