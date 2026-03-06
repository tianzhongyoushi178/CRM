import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ search?: string; page?: string }>;
}

export default async function ContactsPage({ searchParams }: PageProps) {
  const { search = "", page: pageStr = "1" } = await searchParams;
  const page = parseInt(pageStr, 10) || 1;
  const limit = 20;
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { firstName: { contains: search, mode: "insensitive" as const } },
          { lastName: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [contacts, total] = await Promise.all([
    prisma.contact.findMany({
      where,
      include: {
        account: { select: { id: true, name: true } },
        owner: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.contact.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">取引先責任者</h1>
        <Link
          href="/contacts/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[#0176D3] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#032D60] transition-colors"
        >
          <Plus className="h-4 w-4" />
          新規作成
        </Link>
      </div>

      {/* 検索 */}
      <div className="mb-4">
        <form method="GET" className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="名前で検索..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-[#1B96FF] focus:outline-none focus:ring-1 focus:ring-[#1B96FF]"
          />
        </form>
      </div>

      {/* テーブル */}
      <div className="rounded-xl bg-white shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  姓名
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  メール
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  電話
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  取引先
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  役職
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  所有者
                </th>
              </tr>
            </thead>
            <tbody>
              {contacts.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    取引先責任者がありません
                  </td>
                </tr>
              ) : (
                contacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className="border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/contacts/${contact.id}`}
                        className="font-medium text-[#0176D3] hover:underline"
                      >
                        {contact.lastName} {contact.firstName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {contact.email || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {contact.phone || "-"}
                    </td>
                    <td className="px-4 py-3">
                      {contact.account ? (
                        <Link
                          href={`/accounts/${contact.account.id}`}
                          className="text-[#0176D3] hover:underline"
                        >
                          {contact.account.name}
                        </Link>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {contact.title || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {contact.owner.name}
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
            <p className="text-sm text-gray-600">
              {total}件中 {skip + 1}-{Math.min(skip + limit, total)}件を表示
            </p>
            <div className="flex items-center gap-2">
              {page > 1 ? (
                <Link
                  href={`/contacts?search=${encodeURIComponent(search)}&page=${page - 1}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
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
              <span className="text-sm text-gray-600">
                {page} / {totalPages}
              </span>
              {page < totalPages ? (
                <Link
                  href={`/contacts?search=${encodeURIComponent(search)}&page=${page + 1}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
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
