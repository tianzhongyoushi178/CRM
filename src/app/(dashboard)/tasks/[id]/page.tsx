import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import TaskDeleteButton from "./TaskDeleteButton";
import { TaskStatus, Priority } from "@prisma/client";

const taskStatusLabels: Record<TaskStatus, string> = {
  NOT_STARTED: "未着手",
  IN_PROGRESS: "進行中",
  COMPLETED: "完了",
  DEFERRED: "保留",
};

const priorityLabels: Record<Priority, string> = {
  HIGH: "高",
  NORMAL: "中",
  LOW: "低",
};

const statusColors: Record<TaskStatus, string> = {
  NOT_STARTED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-green-100 text-green-700",
  DEFERRED: "bg-gray-100 text-gray-700",
};

const priorityColors: Record<Priority, string> = {
  HIGH: "bg-red-100 text-red-700",
  NORMAL: "bg-blue-100 text-blue-700",
  LOW: "bg-gray-100 text-gray-700",
};

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true } },
    },
  });

  if (!task) notFound();

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/tasks"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          タスク一覧に戻る
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{task.subject}</h1>
          <div className="flex items-center gap-2">
            <Link
              href={`/tasks/${task.id}/edit`}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-4 w-4" />
              編集
            </Link>
            <TaskDeleteButton taskId={task.id} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">タスク情報</h2>
          <dl className="space-y-3">
            <DetailRow label="件名" value={task.subject} />
            <DetailRow
              label="ステータス"
              value={
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[task.status]}`}
                >
                  {taskStatusLabels[task.status]}
                </span>
              }
            />
            <DetailRow
              label="優先度"
              value={
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${priorityColors[task.priority]}`}
                >
                  {priorityLabels[task.priority]}
                </span>
              }
            />
            <DetailRow
              label="期日"
              value={
                task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString("ja-JP")
                  : "-"
              }
            />
            <DetailRow label="所有者" value={task.owner.name} />
            <DetailRow
              label="作成日"
              value={new Date(task.createdAt).toLocaleDateString("ja-JP")}
            />
            <DetailRow
              label="更新日"
              value={new Date(task.updatedAt).toLocaleDateString("ja-JP")}
            />
          </dl>
        </div>

        {task.description && (
          <div className="rounded-xl bg-white p-6 shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">説明</h2>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {task.description}
            </p>
          </div>
        )}
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

