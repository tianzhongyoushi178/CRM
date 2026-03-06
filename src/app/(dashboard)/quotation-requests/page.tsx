import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import type { QuotationStatus } from "@prisma/client";

interface QuotationRequestRow {
  id: string;
  name: string;
  status: QuotationStatus;
  assignStatus: string | null;
  submissionDeadline: Date | null;
  updatedAt: Date;
  sePerson: { id: string; name: string } | null;
  seGroupLeader: { id: string; name: string } | null;
  owner: { id: string; name: string };
}

const statusLabels: Record<string, string> = {
  DRAFT: "下書き",
  SALES_SUBMITTED: "営業提出済",
  SE_ASSIGNED: "SE担当者アサイン済",
  SE_WORKING: "SE担当者作業中",
  SE_COMPLETED: "SE作業完了",
  SUBMITTED_TO_SALES: "営業へ提出済",
  NOT_REQUIRED: "SE依頼不要",
  CANCELLED: "キャンセル",
};

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  SALES_SUBMITTED: "bg-blue-100 text-blue-700",
  SE_ASSIGNED: "bg-indigo-100 text-indigo-700",
  SE_WORKING: "bg-purple-100 text-purple-700",
  SE_COMPLETED: "bg-green-100 text-green-700",
  SUBMITTED_TO_SALES: "bg-teal-100 text-teal-700",
  NOT_REQUIRED: "bg-yellow-100 text-yellow-800",
  CANCELLED: "bg-red-100 text-red-700",
};

interface PageProps {
  searchParams: Promise<{ search?: string; page?: string }>;
}

export default async function QuotationRequestsPage({
  searchParams,
}: PageProps) {
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

  const [quotationRequests, total] = await Promise.all([
    prisma.quotationRequest.findMany({
      where,
      include: {
        sePerson: { select: { id: true, name: true } },
        seGroupLeader: { select: { id: true, name: true } },
        owner: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.quotationRequest.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#3E3E3C]">SE見積依頼</h1>
          <p className="text-sm text-[#706E6B] mt-1">
            {total}件のSE見積依頼
          </p>
        </div>
        <Link
          href="/quotation-requests/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[#0070D2] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#005FB2] transition-colors"
        >
          <Plus className="h-4 w-4" />
          新規
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
            placeholder="SE見積依頼名で検索..."
            className="w-full rounded-lg border border-[#DDDBDA] pl-10 pr-4 py-2 text-sm focus:border-[#0070D2] focus:outline-none focus:ring-1 focus:ring-[#0070D2]"
          />
        </form>
      </div>

      {/* テーブル */}
      <div className="rounded-xl bg-white shadow-sm border border-[#DDDBDA] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-[#706E6B]">
                  SE見積依頼名
                </th>
                <th className="text-left px-4 py-3 font-medium text-[#706E6B]">
                  SE担当
                </th>
                <th className="text-left px-4 py-3 font-medium text-[#706E6B]">
                  SE GL
                </th>
                <th className="text-left px-4 py-3 font-medium text-[#706E6B]">
                  見積状況
                </th>
                <th className="text-left px-4 py-3 font-medium text-[#706E6B]">
                  アサイン状況
                </th>
                <th className="text-left px-4 py-3 font-medium text-[#706E6B]">
                  提出日限
                </th>
                <th className="text-left px-4 py-3 font-medium text-[#706E6B]">
                  最終更新日
                </th>
              </tr>
            </thead>
            <tbody>
              {quotationRequests.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-[#706E6B]"
                  >
                    {search
                      ? "検索条件に一致するSE見積依頼がありません"
                      : "SE見積依頼がまだありません"}
                  </td>
                </tr>
              ) : (
                (quotationRequests as QuotationRequestRow[]).map((qr) => (
                  <tr
                    key={qr.id}
                    className="border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/quotation-requests/${qr.id}`}
                        className="font-medium text-[#0070D2] hover:underline"
                      >
                        {qr.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[#3E3E3C]">
                      {qr.sePerson?.name ?? (
                        <span className="text-gray-400">--</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#3E3E3C]">
                      {qr.seGroupLeader?.name ?? (
                        <span className="text-gray-400">--</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          statusColors[qr.status] ?? "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {statusLabels[qr.status] ?? qr.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#3E3E3C]">
                      {qr.assignStatus ?? (
                        <span className="text-gray-400">--</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#3E3E3C]">
                      {qr.submissionDeadline
                        ? new Date(qr.submissionDeadline).toLocaleDateString(
                            "ja-JP"
                          )
                        : "--"}
                    </td>
                    <td className="px-4 py-3 text-[#3E3E3C]">
                      {new Date(qr.updatedAt).toLocaleDateString("ja-JP")}
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
            <p className="text-sm text-[#706E6B]">
              {total}件中 {skip + 1}〜{Math.min(skip + limit, total)}
              件を表示
            </p>
            <div className="flex items-center gap-2">
              {page > 1 ? (
                <Link
                  href={`/quotation-requests?page=${page - 1}${search ? `&search=${search}` : ""}`}
                  className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm text-[#3E3E3C] hover:bg-gray-50"
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
              <span className="text-sm text-[#3E3E3C]">
                {page} / {totalPages}
              </span>
              {page < totalPages ? (
                <Link
                  href={`/quotation-requests?page=${page + 1}${search ? `&search=${search}` : ""}`}
                  className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm text-[#3E3E3C] hover:bg-gray-50"
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
