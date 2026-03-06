import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { AccountRating } from "@prisma/client";

const ITEMS_PER_PAGE = 20;

const ratingLabel: Record<AccountRating, string> = {
  HOT: "ホット",
  WARM: "ウォーム",
  COLD: "コールド",
};

const ratingBadgeClass: Record<AccountRating, string> = {
  HOT: "bg-red-100 text-red-700",
  WARM: "bg-orange-100 text-orange-700",
  COLD: "bg-blue-100 text-blue-700",
};

interface PageProps {
  searchParams: Promise<{ search?: string; page?: string }>;
}

export default async function AccountsPage({ searchParams }: PageProps) {
  const { search = "", page: pageStr = "1" } = await searchParams;
  const page = Math.max(1, parseInt(pageStr, 10) || 1);

  const where = search
    ? { name: { contains: search, mode: "insensitive" as const } }
    : {};

  const [accounts, total] = await Promise.all([
    prisma.account.findMany({
      where,
      include: { owner: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    }),
    prisma.account.count({ where }),
  ]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const buildUrl = (params: Record<string, string>) => {
    const sp = new URLSearchParams();
    if (search) sp.set("search", search);
    for (const [key, value] of Object.entries(params)) {
      sp.set(key, value);
    }
    return `/accounts?${sp.toString()}`;
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#032D60]">取引先</h1>
          <p className="mt-1 text-sm text-gray-500">{total}件の取引先</p>
        </div>
        <Link
          href="/accounts/new"
          className="rounded-lg bg-[#0176D3] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#014486]"
        >
          新規作成
        </Link>
      </div>

      <div className="mb-4">
        <form method="get" action="/accounts">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="取引先名で検索..."
            className="w-full max-w-md rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-[#0176D3] focus:outline-none focus:ring-1 focus:ring-[#0176D3]"
          />
        </form>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left text-sm font-medium text-gray-500">
              <th className="px-6 py-3">取引先名</th>
              <th className="px-6 py-3">業種</th>
              <th className="px-6 py-3">電話番号</th>
              <th className="px-6 py-3">所有者</th>
              <th className="px-6 py-3">評価</th>
              <th className="px-6 py-3">作成日</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {accounts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                  {search ? "検索結果が見つかりません" : "取引先がまだありません"}
                </td>
              </tr>
            ) : (
              accounts.map((account) => (
                <tr key={account.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link
                      href={`/accounts/${account.id}`}
                      className="text-sm font-medium text-[#0176D3] hover:underline"
                    >
                      {account.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {account.industry || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {account.phone || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {account.owner.name}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {account.rating ? (
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ratingBadgeClass[account.rating]}`}
                      >
                        {ratingLabel[account.rating]}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {new Date(account.createdAt).toLocaleDateString("ja-JP")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {(page - 1) * ITEMS_PER_PAGE + 1} - {Math.min(page * ITEMS_PER_PAGE, total)} / {total}件
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={buildUrl({ page: String(page - 1) })}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                前へ
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={buildUrl({ page: String(page + 1) })}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                次へ
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
