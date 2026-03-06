import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";

const statusColors: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-700",
  CONTACTED: "bg-yellow-100 text-yellow-700",
  WORKING: "bg-purple-100 text-purple-700",
  QUALIFIED: "bg-green-100 text-green-700",
  UNQUALIFIED: "bg-gray-100 text-gray-700",
};

const statusLabels: Record<string, string> = {
  NEW: "新規",
  CONTACTED: "連絡済み",
  WORKING: "対応中",
  QUALIFIED: "適格",
  UNQUALIFIED: "不適格",
};

const sourceLabels: Record<string, string> = {
  WEB: "Web",
  PHONE: "電話",
  REFERRAL: "紹介",
  PARTNER: "パートナー",
  ADVERTISEMENT: "広告",
  TRADE_SHOW: "展示会",
  OTHER: "その他",
};

interface PageProps {
  searchParams: Promise<{ search?: string; page?: string }>;
}

export default async function LeadsPage({ searchParams }: PageProps) {
  await auth();

  const { search = "", page: pageStr = "1" } = await searchParams;
  const page = parseInt(pageStr, 10);
  const limit = 20;
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { firstName: { contains: search, mode: "insensitive" as const } },
          { lastName: { contains: search, mode: "insensitive" as const } },
          { company: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      include: { owner: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.lead.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">リード</h1>
          <p className="text-sm text-gray-500 mt-1">{total}件のリード</p>
        </div>
        <Link
          href="/leads/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[#0176D3] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#014486] transition-colors"
        >
          <Plus className="h-4 w-4" />
          新規作成
        </Link>
      </div>

      {/* 検索 */}
      <div className="mb-4">
        <form method="GET" className="relative w-96">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="リードを検索..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-[#1B96FF] focus:outline-none focus:ring-1 focus:ring-[#1B96FF]"
          />
        </form>
      </div>

      {/* テーブル */}
      <div className="rounded-xl bg-white shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  氏名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  会社
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  メール
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  電話
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ソース
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  所有者
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    {search ? "検索結果が見つかりません" : "リードがありません"}
                  </td>
                </tr>
              ) : (
                leads.map((lead: { id: string; firstName: string; lastName: string; company: string | null; email: string | null; phone: string | null; status: string; source: string | null; owner: { id: string; name: string } }) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="text-sm font-medium text-[#0176D3] hover:text-[#014486] hover:underline"
                      >
                        {lead.lastName} {lead.firstName}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lead.company || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {lead.email || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {lead.phone || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          statusColors[lead.status] ?? "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {statusLabels[lead.status] ?? lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {lead.source ? (sourceLabels[lead.source] ?? lead.source) : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {lead.owner.name}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ページネーション */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-3">
            <p className="text-sm text-gray-500">
              {total}件中 {skip + 1}-{Math.min(skip + limit, total)}件を表示
            </p>
            <div className="flex items-center gap-2">
              {page > 1 ? (
                <Link
                  href={`/leads?page=${page - 1}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  前へ
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-400 cursor-not-allowed">
                  <ChevronLeft className="h-4 w-4" />
                  前へ
                </span>
              )}
              <span className="text-sm text-gray-700">
                {page} / {totalPages}
              </span>
              {page < totalPages ? (
                <Link
                  href={`/leads?page=${page + 1}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  次へ
                  <ChevronRight className="h-4 w-4" />
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-400 cursor-not-allowed">
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
