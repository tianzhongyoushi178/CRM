import Link from "next/link";
import { prisma } from "@/lib/prisma";

const ITEMS_PER_PAGE = 20;

interface PageProps {
  searchParams: Promise<{ search?: string; page?: string }>;
}

export default async function IdeasPage({ searchParams }: PageProps) {
  const { search = "", page: pageStr = "1" } = await searchParams;
  const page = Math.max(1, parseInt(pageStr, 10) || 1);

  const where = search
    ? { name: { contains: search, mode: "insensitive" as const } }
    : {};

  const [ideas, total] = await Promise.all([
    prisma.idea.findMany({
      where,
      include: { owner: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    }),
    prisma.idea.count({ where }),
  ]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const buildUrl = (params: Record<string, string>) => {
    const sp = new URLSearchParams();
    if (search) sp.set("search", search);
    for (const [key, value] of Object.entries(params)) {
      sp.set(key, value);
    }
    return `/ideas?${sp.toString()}`;
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#032D60]">アイディア</h1>
          <p className="mt-1 text-sm text-gray-500">{total}件のアイディア</p>
        </div>
        <Link
          href="/ideas/new"
          className="rounded-lg bg-[#0070D2] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#005FB2]"
        >
          新規
        </Link>
      </div>

      <div className="mb-4">
        <form method="get" action="/ideas">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="アイディア名で検索..."
            className="w-full max-w-md rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-[#0176D3] focus:outline-none focus:ring-1 focus:ring-[#0176D3]"
          />
        </form>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#DDDBDA] bg-white shadow-sm">
        {ideas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <svg
              className="h-24 w-24 text-[#0070D2] opacity-30"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5.002 5.002 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <p className="mt-4 text-sm font-medium text-[#3E3E3C]">
              ここには何もありません
            </p>
            <p className="mt-1 text-sm text-[#706E6B] text-center">
              {search
                ? "検索結果が見つかりません"
                : "リストにはまだ何もありません。新しいレコードを追加してください。"}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-sm font-medium text-gray-500">
                <th className="px-6 py-3">アイディア名</th>
                <th className="px-6 py-3">カテゴリ</th>
                <th className="px-6 py-3">ステータス</th>
                <th className="px-6 py-3">所有者</th>
                <th className="px-6 py-3">作成日</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ideas.map((idea) => (
                <tr key={idea.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link
                      href={`/ideas/${idea.id}`}
                      className="text-sm font-medium text-[#0176D3] hover:underline"
                    >
                      {idea.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {idea.category || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {idea.status || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {idea.owner.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {new Date(idea.createdAt).toLocaleDateString("ja-JP")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
