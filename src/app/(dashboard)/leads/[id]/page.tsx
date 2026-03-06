import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Trash2, ArrowRightLeft } from "lucide-react";
import LeadConvertButton from "./LeadConvertButton";
import LeadDeleteButton from "./LeadDeleteButton";

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
  params: Promise<{ id: string }>;
}

export default async function LeadDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  const { id } = await params;

  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true } },
      activities: {
        select: {
          id: true,
          type: true,
          subject: true,
          status: true,
          dueDate: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!lead) {
    notFound();
  }

  return (
    <div>
      {/* ヘッダー */}
      <div className="mb-6">
        <Link
          href="/leads"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          リード一覧に戻る
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {lead.lastName} {lead.firstName}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {lead.company && `${lead.company} · `}{lead.title || ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!lead.isConverted && (
              <>
                <LeadConvertButton leadId={lead.id} />
                <Link
                  href={`/leads/${lead.id}/edit`}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                  編集
                </Link>
              </>
            )}
            <LeadDeleteButton leadId={lead.id} />
          </div>
        </div>
      </div>

      {/* 変換済みバナー */}
      {lead.isConverted && (
        <div className="mb-6 rounded-xl bg-green-50 border border-green-200 p-4">
          <p className="text-sm font-medium text-green-800">
            このリードは変換済みです
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            {lead.convertedAccountId && (
              <Link
                href={`/accounts/${lead.convertedAccountId}`}
                className="text-sm text-green-700 hover:underline"
              >
                取引先を表示
              </Link>
            )}
            {lead.convertedContactId && (
              <Link
                href={`/contacts/${lead.convertedContactId}`}
                className="text-sm text-green-700 hover:underline"
              >
                取引先責任者を表示
              </Link>
            )}
            {lead.convertedOpportunityId && (
              <Link
                href={`/opportunities/${lead.convertedOpportunityId}`}
                className="text-sm text-green-700 hover:underline"
              >
                商談を表示
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 基本情報 */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h2>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailItem label="姓" value={lead.lastName} />
              <DetailItem label="名" value={lead.firstName} />
              <DetailItem label="メール" value={lead.email} />
              <DetailItem label="電話" value={lead.phone} />
              <DetailItem label="会社" value={lead.company} />
              <DetailItem label="役職" value={lead.title} />
              <DetailItem
                label="ステータス"
                value={
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      statusColors[lead.status] ?? "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {statusLabels[lead.status] ?? lead.status}
                  </span>
                }
              />
              <DetailItem
                label="ソース"
                value={lead.source ? (sourceLabels[lead.source] ?? lead.source) : null}
              />
              <DetailItem label="業種" value={lead.industry} />
              <DetailItem label="所有者" value={lead.owner.name} />
              <div className="sm:col-span-2">
                <DetailItem label="説明" value={lead.description} />
              </div>
            </dl>
          </div>

          {/* 住所情報 */}
          <div className="rounded-xl bg-white p-6 shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">住所情報</h2>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailItem label="郵便番号" value={lead.postalCode} />
              <DetailItem label="都道府県" value={lead.prefecture} />
              <DetailItem label="市区町村" value={lead.city} />
              <DetailItem label="住所" value={lead.address} />
            </dl>
          </div>
        </div>

        {/* サイドバー */}
        <div className="space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">システム情報</h2>
            <dl className="space-y-3">
              <DetailItem
                label="作成日"
                value={new Date(lead.createdAt).toLocaleDateString("ja-JP")}
              />
              <DetailItem
                label="更新日"
                value={new Date(lead.updatedAt).toLocaleDateString("ja-JP")}
              />
            </dl>
          </div>

          {/* 最近の活動 */}
          <div className="rounded-xl bg-white p-6 shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">最近の活動</h2>
            {lead.activities.length === 0 ? (
              <p className="text-sm text-gray-500">活動がありません</p>
            ) : (
              <div className="space-y-3">
                {lead.activities.map((activity: { id: string; type: string; subject: string; status: string; dueDate: Date | null }) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between rounded-lg p-2 hover:bg-gray-50"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {activity.subject}
                      </p>
                      <p className="text-xs text-gray-500">{activity.type}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {activity.dueDate
                        ? new Date(activity.dueDate).toLocaleDateString("ja-JP")
                        : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode | string | null | undefined;
}) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-gray-900">{value || "-"}</dd>
    </div>
  );
}
