import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ActivityType, ActivityStatus, Priority } from "@prisma/client";

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

export default async function ActivitiesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const activities = await prisma.activity.findMany({
    include: {
      owner: { select: { id: true, name: true } },
      account: { select: { id: true, name: true } },
      contact: { select: { id: true, firstName: true, lastName: true } },
      opportunity: { select: { id: true, name: true } },
      lead: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const getRelatedName = (activity: typeof activities[number]): string => {
    if (activity.account) return activity.account.name;
    if (activity.contact) return `${activity.contact.lastName} ${activity.contact.firstName}`;
    if (activity.opportunity) return activity.opportunity.name;
    if (activity.lead) return `${activity.lead.lastName} ${activity.lead.firstName}`;
    return "-";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">活動</h1>
        <Link
          href="/activities/new"
          className="flex items-center gap-2 rounded-lg bg-[#0176D3] px-4 py-2 text-sm font-medium text-white hover:bg-[#032D60]"
        >
          <Plus className="h-4 w-4" />
          新規活動
        </Link>
      </div>

      <div className="rounded-xl bg-white shadow-sm border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                件名
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                種類
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ステータス
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                優先度
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                期日
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                関連先
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                所有者
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {activities.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  活動がありません
                </td>
              </tr>
            ) : (
              activities.map((activity) => (
                <tr key={activity.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/activities/${activity.id}`}
                      className="text-sm font-medium text-[#0176D3] hover:underline"
                    >
                      {activity.subject}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {activityTypeLabels[activity.type]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[activity.status]}`}
                    >
                      {activityStatusLabels[activity.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${priorityColors[activity.priority]}`}
                    >
                      {priorityLabels[activity.priority]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {activity.dueDate
                      ? new Date(activity.dueDate).toLocaleDateString("ja-JP")
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {getRelatedName(activity)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {activity.owner.name}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
