import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Mail,
  Phone,
  Smartphone,
  Building2,
  MapPin,
  Briefcase,
} from "lucide-react";
import ContactDeleteButton from "./ContactDeleteButton";

interface PageProps {
  params: Promise<{ id: string }>;
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

const activityTypeLabels: Record<string, string> = {
  CALL: "電話",
  EMAIL: "メール",
  MEETING: "ミーティング",
  VISIT: "訪問",
  TASK: "タスク",
  OTHER: "その他",
};

const activityStatusLabels: Record<string, string> = {
  OPEN: "未着手",
  IN_PROGRESS: "進行中",
  COMPLETED: "完了",
  CANCELLED: "キャンセル",
};

export default async function ContactDetailPage({ params }: PageProps) {
  const { id } = await params;

  const contact = await prisma.contact.findUnique({
    where: { id },
    include: {
      account: { select: { id: true, name: true } },
      owner: { select: { id: true, name: true } },
      opportunityContacts: {
        include: {
          opportunity: {
            select: {
              id: true,
              name: true,
              amount: true,
              stage: true,
              closeDate: true,
            },
          },
        },
      },
      activities: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          owner: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!contact) {
    notFound();
  }

  return (
    <div>
      {/* ヘッダー */}
      <div className="mb-6">
        <Link
          href="/contacts"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          取引先責任者一覧に戻る
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            {contact.lastName} {contact.firstName}
          </h1>
          <div className="flex items-center gap-2">
            <Link
              href={`/contacts/${contact.id}/edit`}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0176D3] px-4 py-2 text-sm font-medium text-white hover:bg-[#032D60] transition-colors"
            >
              <Pencil className="h-4 w-4" />
              編集
            </Link>
            <ContactDeleteButton contactId={contact.id} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 基本情報 */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              基本情報
            </h2>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">姓</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {contact.lastName}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">名</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {contact.firstName || "-"}
                </dd>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <dt className="text-sm font-medium text-gray-500">メール</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {contact.email ? (
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-[#0176D3] hover:underline"
                      >
                        {contact.email}
                      </a>
                    ) : (
                      "-"
                    )}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <dt className="text-sm font-medium text-gray-500">電話</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {contact.phone || "-"}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Smartphone className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    携帯電話
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {contact.mobile || "-"}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Building2 className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <dt className="text-sm font-medium text-gray-500">取引先</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {contact.account ? (
                      <Link
                        href={`/accounts/${contact.account.id}`}
                        className="text-[#0176D3] hover:underline"
                      >
                        {contact.account.name}
                      </Link>
                    ) : (
                      "-"
                    )}
                  </dd>
                </div>
              </div>
            </dl>
          </div>

          {/* 職務情報 */}
          <div className="rounded-xl bg-white p-6 shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              職務情報
            </h2>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-2">
                <Briefcase className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <dt className="text-sm font-medium text-gray-500">役職</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {contact.title || "-"}
                  </dd>
                </div>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">部署</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {contact.department || "-"}
                </dd>
              </div>
            </dl>
          </div>

          {/* 住所情報 */}
          <div className="rounded-xl bg-white p-6 shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              住所情報
            </h2>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  郵便番号
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {contact.postalCode || "-"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  都道府県
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {contact.prefecture || "-"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  市区町村
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {contact.city || "-"}
                </dd>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <dt className="text-sm font-medium text-gray-500">住所</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {contact.address || "-"}
                  </dd>
                </div>
              </div>
            </dl>
          </div>

          {/* 説明 */}
          {contact.description && (
            <div className="rounded-xl bg-white p-6 shadow-sm border">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                説明
              </h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {contact.description}
              </p>
            </div>
          )}
        </div>

        {/* サイドバー：関連情報 */}
        <div className="space-y-6">
          {/* 所有者情報 */}
          <div className="rounded-xl bg-white p-6 shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              レコード情報
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">所有者</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {contact.owner.name}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">作成日</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(contact.createdAt).toLocaleDateString("ja-JP")}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">更新日</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(contact.updatedAt).toLocaleDateString("ja-JP")}
                </dd>
              </div>
            </dl>
          </div>

          {/* 関連商談 */}
          <div className="rounded-xl bg-white p-6 shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              関連商談 ({contact.opportunityContacts.length})
            </h2>
            {contact.opportunityContacts.length === 0 ? (
              <p className="text-sm text-gray-500">関連する商談はありません</p>
            ) : (
              <div className="space-y-3">
                {contact.opportunityContacts.map((oc) => (
                  <Link
                    key={oc.id}
                    href={`/opportunities/${oc.opportunity.id}`}
                    className="block rounded-lg p-3 hover:bg-gray-50 transition-colors"
                  >
                    <p className="font-medium text-sm text-gray-900">
                      {oc.opportunity.name}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                        {stageLabels[oc.opportunity.stage] ??
                          oc.opportunity.stage}
                      </span>
                      <span className="text-xs text-gray-500">
                        ¥
                        {(oc.opportunity.amount ?? 0).toLocaleString()}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 関連活動 */}
          <div className="rounded-xl bg-white p-6 shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              最近の活動 ({contact.activities.length})
            </h2>
            {contact.activities.length === 0 ? (
              <p className="text-sm text-gray-500">活動はありません</p>
            ) : (
              <div className="space-y-3">
                {contact.activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="rounded-lg p-3 border border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                        {activityTypeLabels[activity.type] ?? activity.type}
                      </span>
                      <span className="text-xs text-gray-500">
                        {activityStatusLabels[activity.status] ??
                          activity.status}
                      </span>
                    </div>
                    <p className="font-medium text-sm text-gray-900 mt-1">
                      {activity.subject}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.owner.name} ·{" "}
                      {new Date(activity.createdAt).toLocaleDateString("ja-JP")}
                    </p>
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
