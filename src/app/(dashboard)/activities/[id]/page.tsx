import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import ActivityDeleteButton from "./ActivityDeleteButton";
import { ActivityType, ActivityStatus, Priority } from "@/generated/prisma";

const activityTypeLabels: Record<ActivityType, string> = {
  CALL: "電話",
  EMAIL: "メール",
  MEETING: "会議",
  VISIT: "訪問",
  TASK: "タスク",
  OTHER: "その他",
};

const activityStatusLabels: Record<ActivityStatus, string> = {
  OPEN: "未着手",
  IN_PROGRESS: "進行中",
  COMPLETED: "完了",
  CANCELLED: "キャンセル",
};

const priorityLabels: Record<Priority, string> = {
  HIGH: "高",
  NORMAL: "中",
  LOW: "低",
};

const statusColors: Record<ActivityStatus, string> = {
  OPEN: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-gray-100 text-gray-700",
};

const priorityColors: Record<Priority, string> = {
  HIGH: "bg-red-100 text-red-700",
  NORMAL: "bg-blue-100 text-blue-700",
  LOW: "bg-gray-100 text-gray-700",
};

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;

  const activity = await prisma.activity.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true } },
      account: { select: { id: true, name: true } },
      contact: { select: { id: true, firstName: true, lastName: true } },
      opportunity: { select: { id: true, name: true } },
      lead: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  if (!activity) notFound();

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/activities"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          活動一覧に戻る
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            {activity.subject}
          </h1>
          <div className="flex items-center gap-2">
            <Link
              href={`/activities/${activity.id}/edit`}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-4 w-4" />
              編集
            </Link>
            <ActivityDeleteButton activityId={activity.id} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h2>
          <dl className="space-y-3">
            <DetailRow label="種類" value={activityTypeLabels[activity.type]} />
            <DetailRow
              label="ステータス"
              value={
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[activity.status]}`}
                >
                  {activityStatusLabels[activity.status]}
                </span>
              }
            />
            <DetailRow
              label="優先度"
              value={
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${priorityColors[activity.priority]}`}
                >
                  {priorityLabels[activity.priority]}
                </span>
              }
            />
            <DetailRow
              label="期日"
              value={
                activity.dueDate
                  ? new Date(activity.dueDate).toLocaleDateString("ja-JP")
                  : "-"
              }
            />
            <DetailRow
              label="完了日"
              value={
                activity.completedDate
                  ? new Date(activity.completedDate).toLocaleDateString("ja-JP")
                  : "-"
              }
            />
            <DetailRow label="所有者" value={activity.owner.name} />
            <DetailRow
              label="作成日"
              value={new Date(activity.createdAt).toLocaleDateString("ja-JP")}
            />
          </dl>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">関連先</h2>
            <dl className="space-y-3">
              <DetailRow
                label="取引先"
                value={
                  activity.account ? (
                    <Link
                      href={`/accounts/${activity.account.id}`}
                      className="text-[#0176D3] hover:underline"
                    >
                      {activity.account.name}
                    </Link>
                  ) : (
                    "-"
                  )
                }
              />
              <DetailRow
                label="取引先責任者"
                value={
                  activity.contact ? (
                    <Link
                      href={`/contacts/${activity.contact.id}`}
                      className="text-[#0176D3] hover:underline"
                    >
                      {activity.contact.lastName} {activity.contact.firstName}
                    </Link>
                  ) : (
                    "-"
                  )
                }
              />
              <DetailRow
                label="商談"
                value={
                  activity.opportunity ? (
                    <Link
                      href={`/opportunities/${activity.opportunity.id}`}
                      className="text-[#0176D3] hover:underline"
                    >
                      {activity.opportunity.name}
                    </Link>
                  ) : (
                    "-"
                  )
                }
              />
              <DetailRow
                label="リード"
                value={
                  activity.lead ? (
                    <Link
                      href={`/leads/${activity.lead.id}`}
                      className="text-[#0176D3] hover:underline"
                    >
                      {activity.lead.lastName} {activity.lead.firstName}
                    </Link>
                  ) : (
                    "-"
                  )
                }
              />
            </dl>
          </div>

          {activity.description && (
            <div className="rounded-xl bg-white p-6 shadow-sm border">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">説明</h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {activity.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start">
      <dt className="w-32 flex-shrink-0 text-sm text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900">{value}</dd>
    </div>
  );
}

