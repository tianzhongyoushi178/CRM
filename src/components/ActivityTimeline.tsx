"use client";

import Link from "next/link";
import {
  Phone,
  Mail,
  Calendar,
  MapPin,
  CheckSquare,
  Circle,
} from "lucide-react";

interface ActivityTimelineProps {
  activities: Array<{
    id: string;
    type: string;
    subject: string;
    description: string | null;
    dueDate: Date | null;
    status: string;
    owner: { name: string };
    opportunity?: { id: string; name: string } | null;
  }>;
}

const typeConfig: Record<
  string,
  { icon: typeof Phone; color: string; bgColor: string; lineColor: string }
> = {
  CALL: {
    icon: Phone,
    color: "text-green-600",
    bgColor: "bg-green-100",
    lineColor: "bg-green-400",
  },
  EMAIL: {
    icon: Mail,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    lineColor: "bg-blue-400",
  },
  MEETING: {
    icon: Calendar,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    lineColor: "bg-purple-400",
  },
  VISIT: {
    icon: MapPin,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    lineColor: "bg-purple-400",
  },
  TASK: {
    icon: CheckSquare,
    color: "text-green-600",
    bgColor: "bg-green-100",
    lineColor: "bg-green-400",
  },
  OTHER: {
    icon: Circle,
    color: "text-gray-500",
    bgColor: "bg-gray-100",
    lineColor: "bg-gray-400",
  },
};

const typeLabel: Record<string, string> = {
  CALL: "電話",
  EMAIL: "メール",
  MEETING: "ミーティング",
  VISIT: "訪問",
  TASK: "ToDo",
  OTHER: "その他",
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("ja-JP", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
  });
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getMonthKey(date: Date): string {
  const d = new Date(date);
  return `${d.getMonth() + 1}月・${d.getFullYear()}`;
}

interface ActivityItemProps {
  activity: ActivityTimelineProps["activities"][number];
}

function ActivityItem({ activity }: ActivityItemProps) {
  const config = typeConfig[activity.type] ?? typeConfig.OTHER;
  const Icon = config.icon;

  return (
    <div className="flex gap-3 py-2">
      <div className="flex flex-col items-center">
        <div className={`w-1 flex-1 ${config.lineColor} rounded-full min-h-[8px]`} />
        <div
          className={`w-8 h-8 rounded-full ${config.bgColor} flex items-center justify-center flex-shrink-0`}
        >
          <Icon size={14} className={config.color} />
        </div>
        <div className={`w-1 flex-1 ${config.lineColor} rounded-full min-h-[8px]`} />
      </div>
      <div className="flex-1 min-w-0 py-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#706E6B]">
            {typeLabel[activity.type] ?? activity.type}
          </span>
          <span
            className={`text-xs px-1.5 py-0.5 rounded ${
              activity.status === "COMPLETED"
                ? "bg-green-100 text-green-700"
                : activity.status === "CANCELLED"
                ? "bg-gray-100 text-gray-500"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {activity.status === "COMPLETED"
              ? "完了"
              : activity.status === "CANCELLED"
              ? "キャンセル"
              : activity.status === "IN_PROGRESS"
              ? "進行中"
              : "未着手"}
          </span>
        </div>
        <p className="text-sm font-semibold text-[#3E3E3C] truncate">
          {activity.subject}
        </p>
        {activity.dueDate && (
          <p className="text-xs text-[#706E6B]">
            {formatDate(activity.dueDate)} {formatTime(activity.dueDate)}
          </p>
        )}
        <p className="text-xs text-[#706E6B]">{activity.owner.name}</p>
        {activity.opportunity && (
          <Link
            href={`/opportunities/${activity.opportunity.id}`}
            className="text-xs text-[#0070D2] hover:underline"
          >
            {activity.opportunity.name}
          </Link>
        )}
      </div>
    </div>
  );
}

export default function ActivityTimeline({ activities }: ActivityTimelineProps) {
  const now = new Date();

  const upcoming = activities.filter(
    (a) =>
      a.status !== "COMPLETED" &&
      a.status !== "CANCELLED" &&
      (!a.dueDate || new Date(a.dueDate) >= now)
  );

  const overdue = activities.filter(
    (a) =>
      a.status !== "COMPLETED" &&
      a.status !== "CANCELLED" &&
      a.dueDate &&
      new Date(a.dueDate) < now
  );

  const upcomingAndOverdue = [...overdue, ...upcoming];

  const past = activities.filter(
    (a) => a.status === "COMPLETED" || a.status === "CANCELLED"
  );

  // Group past activities by month
  const pastByMonth = new Map<string, typeof past>();
  for (const activity of past) {
    const key = activity.dueDate
      ? getMonthKey(activity.dueDate)
      : getMonthKey(new Date());
    const group = pastByMonth.get(key) ?? [];
    group.push(activity);
    pastByMonth.set(key, group);
  }

  if (activities.length === 0) {
    return (
      <p className="text-sm text-[#706E6B] py-4 text-center">
        活動はありません
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {upcomingAndOverdue.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-[#3E3E3C] uppercase tracking-wide mb-2">
            今後＆期限切れ
          </h4>
          <div className="space-y-0">
            {upcomingAndOverdue.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      )}

      {pastByMonth.size > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-[#3E3E3C] uppercase tracking-wide mb-2">
            過去の活動
          </h4>
          {Array.from(pastByMonth.entries()).map(([month, items]) => (
            <div key={month} className="mb-3">
              <p className="text-xs text-[#706E6B] font-medium mb-1 pl-1">
                {month}
              </p>
              <div className="space-y-0">
                {items.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
