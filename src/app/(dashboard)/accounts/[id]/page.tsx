import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { AccountRating, OpportunityStage } from "@prisma/client";
import DeleteAccountButton from "./DeleteAccountButton";
import DetailField from "@/components/DetailField";
import DetailTabs from "@/components/DetailTabs";
import ActivityTimeline from "@/components/ActivityTimeline";

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

const stageLabel: Record<OpportunityStage, string> = {
  PROSPECTING: "見込み",
  QUALIFICATION: "選定",
  NEEDS_ANALYSIS: "ニーズ分析",
  PROPOSAL: "提案",
  NEGOTIATION: "交渉",
  CLOSED_WON: "成立",
  CLOSED_LOST: "失注",
};

const stageBadgeClass: Record<OpportunityStage, string> = {
  PROSPECTING: "bg-gray-100 text-gray-700",
  QUALIFICATION: "bg-blue-100 text-blue-700",
  NEEDS_ANALYSIS: "bg-indigo-100 text-indigo-700",
  PROPOSAL: "bg-purple-100 text-purple-700",
  NEGOTIATION: "bg-orange-100 text-orange-700",
  CLOSED_WON: "bg-green-100 text-green-700",
  CLOSED_LOST: "bg-red-100 text-red-700",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AccountDetailPage({ params }: PageProps) {
  const { id } = await params;

  const account = await prisma.account.findUnique({
    where: { id },
    include: {
      owner: true,
      contacts: {
        include: { owner: true },
        orderBy: { updatedAt: "desc" },
      },
      opportunities: {
        include: { owner: true },
        orderBy: { updatedAt: "desc" },
      },
      activities: {
        include: { owner: true, opportunity: true },
        orderBy: { dueDate: "desc" },
        take: 20,
      },
    },
  });

  if (!account) {
    notFound();
  }

  const formatCurrency = (value: number | null) => {
    if (value === null) return null;
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // --- Detail tab content ---
  const detailContent = (
    <div className="space-y-6">
      {/* 基本情報 */}
      <div>
        <h3 className="text-sm font-semibold text-[#3E3E3C] border-b border-[#DDDBDA] pb-2 mb-3">
          基本情報
        </h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
          <DetailField label="取引先名" value={account.name} />
          <DetailField label="所有者" value={account.owner.name} />
          <DetailField label="業種" value={account.industry} />
          <DetailField label="電話番号" value={account.phone} />
          <DetailField
            label="Webサイト"
            value={
              account.website ? (
                <a
                  href={account.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0070D2] hover:underline"
                >
                  {account.website}
                </a>
              ) : null
            }
          />
          <DetailField
            label="従業員数"
            value={account.employees?.toLocaleString("ja-JP")}
          />
          <DetailField label="年間売上" value={formatCurrency(account.annualRevenue)} />
          <DetailField
            label="評価"
            value={
              account.rating ? (
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ratingBadgeClass[account.rating]}`}
                >
                  {ratingLabel[account.rating]}
                </span>
              ) : null
            }
          />
        </dl>
      </div>

      {/* 住所情報 */}
      <div>
        <h3 className="text-sm font-semibold text-[#3E3E3C] border-b border-[#DDDBDA] pb-2 mb-3">
          住所情報
        </h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
          <DetailField label="郵便番号" value={account.postalCode} />
          <DetailField label="都道府県" value={account.prefecture} />
          <DetailField label="市区町村" value={account.city} />
          <DetailField label="住所" value={account.address} />
        </dl>
      </div>

      {/* その他 */}
      <div>
        <h3 className="text-sm font-semibold text-[#3E3E3C] border-b border-[#DDDBDA] pb-2 mb-3">
          その他
        </h3>
        <dl>
          <DetailField label="説明" value={account.description} />
        </dl>
      </div>
    </div>
  );

  // --- Contacts tab content ---
  const contactsContent = (
    <div>
      {account.contacts.length === 0 ? (
        <p className="text-sm text-[#706E6B] py-4">
          関連する取引先責任者はありません
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-[#DDDBDA]">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F3F3F3] text-left text-xs font-medium text-[#706E6B] uppercase">
                <th className="px-4 py-3">氏名</th>
                <th className="px-4 py-3">メール</th>
                <th className="px-4 py-3">電話番号</th>
                <th className="px-4 py-3">役職</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDDBDA]">
              {account.contacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-[#F3F3F3]">
                  <td className="px-4 py-3">
                    <Link
                      href={`/contacts/${contact.id}`}
                      className="text-sm font-medium text-[#0070D2] hover:underline"
                    >
                      {contact.lastName} {contact.firstName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#3E3E3C]">
                    {contact.email || "\u2014"}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#3E3E3C]">
                    {contact.phone || "\u2014"}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#3E3E3C]">
                    {contact.title || "\u2014"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // --- Opportunities tab content ---
  const opportunitiesContent = (
    <div>
      {account.opportunities.length === 0 ? (
        <p className="text-sm text-[#706E6B] py-4">関連する案件はありません</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-[#DDDBDA]">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F3F3F3] text-left text-xs font-medium text-[#706E6B] uppercase">
                <th className="px-4 py-3">案件名</th>
                <th className="px-4 py-3">金額</th>
                <th className="px-4 py-3">ステージ</th>
                <th className="px-4 py-3">完了予定日</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDDBDA]">
              {account.opportunities.map((opp) => (
                <tr key={opp.id} className="hover:bg-[#F3F3F3]">
                  <td className="px-4 py-3">
                    <Link
                      href={`/opportunities/${opp.id}`}
                      className="text-sm font-medium text-[#0070D2] hover:underline"
                    >
                      {opp.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#3E3E3C]">
                    {formatCurrency(opp.amount) ?? "\u2014"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${stageBadgeClass[opp.stage]}`}
                    >
                      {stageLabel[opp.stage]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#3E3E3C]">
                    {opp.closeDate
                      ? new Date(opp.closeDate).toLocaleDateString("ja-JP")
                      : "\u2014"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // --- Files tab content (placeholder) ---
  const filesContent = (
    <div>
      <p className="text-sm text-[#706E6B] py-4">ファイルはありません</p>
    </div>
  );

  // Serialize activities for client component
  const serializedActivities = account.activities.map((a) => ({
    id: a.id,
    type: a.type,
    subject: a.subject,
    description: a.description,
    dueDate: a.dueDate,
    status: a.status,
    owner: { name: a.owner.name },
    opportunity: a.opportunity
      ? { id: a.opportunity.id, name: a.opportunity.name }
      : null,
  }));

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-sm text-[#706E6B] mb-2">
          <Link href="/accounts" className="hover:text-[#0070D2]">
            取引先
          </Link>
          <span className="mx-1">/</span>
          <span className="text-[#3E3E3C]">{account.name}</span>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#3E3E3C]">{account.name}</h1>
            {/* Highlight fields */}
            <div className="flex items-center gap-4 mt-2">
              {account.rating && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-[#706E6B]">評価</span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ratingBadgeClass[account.rating]}`}
                  >
                    {ratingLabel[account.rating]}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[#706E6B]">所有者</span>
                <span className="text-sm text-[#3E3E3C] font-medium">
                  {account.owner.name}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Link
              href={`/accounts/${account.id}/edit`}
              className="rounded-md bg-[#0070D2] px-4 py-2 text-sm font-medium text-white hover:bg-[#005FB2] transition-colors"
            >
              編集
            </Link>
            <DeleteAccountButton
              accountId={account.id}
              accountName={account.name}
            />
          </div>
        </div>
      </div>

      {/* Main content: 2/3 + 1/3 layout */}
      <div className="flex gap-6">
        {/* Left pane - Detail tabs */}
        <div className="w-2/3 min-w-0">
          <div className="bg-white rounded-lg border border-[#DDDBDA] shadow-sm p-6">
            <DetailTabs
              tabs={[
                { id: "detail", label: "詳細", content: detailContent },
                {
                  id: "contacts",
                  label: `取引先責任者 (${account.contacts.length})`,
                  content: contactsContent,
                },
                {
                  id: "opportunities",
                  label: `案件 (${account.opportunities.length})`,
                  content: opportunitiesContent,
                },
                { id: "files", label: "ファイル", content: filesContent },
              ]}
            />
          </div>
        </div>

        {/* Right pane - Activity timeline */}
        <div className="w-1/3 min-w-0">
          <div className="bg-white rounded-lg border border-[#DDDBDA] shadow-sm p-6">
            <h3 className="text-base font-semibold text-[#3E3E3C] mb-3">
              活動
            </h3>
            <div className="flex gap-2 mb-4">
              <Link
                href={`/activities/new?accountId=${account.id}&type=MEETING`}
                className="rounded-md border border-[#DDDBDA] bg-white px-3 py-1.5 text-xs font-medium text-[#3E3E3C] hover:bg-[#F3F3F3] transition-colors"
              >
                新規行動
              </Link>
              <Link
                href={`/activities/new?accountId=${account.id}&type=TASK`}
                className="rounded-md border border-[#DDDBDA] bg-white px-3 py-1.5 text-xs font-medium text-[#3E3E3C] hover:bg-[#F3F3F3] transition-colors"
              >
                新規ToDo
              </Link>
            </div>
            <ActivityTimeline activities={serializedActivities} />
          </div>
        </div>
      </div>
    </div>
  );
}
