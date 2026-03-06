import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import type { OpportunityStage } from "@/generated/prisma";

interface OpportunityRow {
  id: string;
  name: string;
  amount: number | null;
  stage: OpportunityStage;
  probability: number | null;
  closeDate: Date | null;
  account: { id: string; name: string } | null;
  owner: { id: string; name: string };
}

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

interface PageProps {
  searchParams: Promise<{ search?: string; page?: string }>;
}

export default async function OpportunitiesPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session) redirect("/login");

  const resolvedParams = await searchParams;
  const search = resolvedParams.search || "";
  const page = parseInt(resolvedParams.page || "1", 10);
  const limit = 20;
  const skip = (page - 1) * limit;

  const where = search
    ? { name: { contains: search, mode: "insensitive" as const } }
    : {};

  const [opportunities, total] = await Promise.all([
    prisma.opportunity.findMany({
      where,
      include: {
        account: { select: { id: true, name: true } },
        owner: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.opportunity.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">商談</h1>
          <p className="text-sm text-gray-500 mt-1">{total}件の商談</p>
        </div>
        <Link
          href="/opportunities/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[#0176D3] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#032D60] transition-colors"
        >
          <Plus className="h-4 w-4" />
          新規作成
        </Link>
      </div>

      {/* 検索 */}
      <div className="mb-6">
        <form method="GET" className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="商談名で検索..."
            className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-[#0176D3] focus:outline-none focus:ring-1 focus:ring-[#0176D3]"
          />
        </form>
      </div>

      {/* テーブル */}
      <div className="rounded-xl bg-white shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  商談名
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  取引先
                </th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">
                  金額
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  ステージ
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  完了予定日
                </th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">
                  確度
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  所有者
                </th>
              </tr>
            </thead>
            <tbody>
              {opportunities.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    {search
                      ? "検索条件に一致する商談がありません"
                      : "商談がまだありません"}
                  </td>
                </tr>
              ) : (
                (opportunities as OpportunityRow[]).map((opp) => (
                  <tr
                    key={opp.id}
                    className="border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/opportunities/${opp.id}`}
                        className="font-medium text-[#0176D3] hover:underline"
                      >
                        {opp.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {opp.account ? (
                        <Link
                          href={`/accounts/${opp.account.id}`}
                          className="hover:text-[#0176D3] hover:underline"
                        >
                          {opp.account.name}
                        </Link>
                      ) : (
                        <span className="text-gray-400">--</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900 font-medium">
                      {opp.amount != null
                        ? `¥${opp.amount.toLocaleString()}`
                        : "--"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          stageColors[opp.stage] ?? "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {stageLabels[opp.stage] ?? opp.stage}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {opp.closeDate
                        ? new Date(opp.closeDate).toLocaleDateString("ja-JP")
                        : "--"}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {opp.probability != null ? `${opp.probability}%` : "--"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {opp.owner.name}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ページネーション */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-gray-500">
              {total}件中 {skip + 1}〜{Math.min(skip + limit, total)}件を表示
            </p>
            <div className="flex items-center gap-2">
              {page > 1 ? (
                <Link
                  href={`/opportunities?page=${page - 1}${search ? `&search=${search}` : ""}`}
                  className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  前へ
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm text-gray-300 cursor-not-allowed">
                  <ChevronLeft className="h-4 w-4" />
                  前へ
                </span>
              )}
              <span className="text-sm text-gray-600">
                {page} / {totalPages}
              </span>
              {page < totalPages ? (
                <Link
                  href={`/opportunities?page=${page + 1}${search ? `&search=${search}` : ""}`}
                  className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
                >
                  次へ
                  <ChevronRight className="h-4 w-4" />
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm text-gray-300 cursor-not-allowed">
                  次へ
                  <ChevronRight className="h-4 w-4" />
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
