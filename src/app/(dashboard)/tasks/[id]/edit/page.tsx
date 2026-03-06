import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import TaskForm from "@/components/TaskForm";

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;

  const task = await prisma.task.findUnique({
    where: { id },
  });

  if (!task) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">タスクを編集</h1>
      <TaskForm
        isEdit
        taskId={task.id}
        initialData={{
          subject: task.subject,
          description: task.description || "",
          dueDate: task.dueDate
            ? new Date(task.dueDate).toISOString().split("T")[0]
            : "",
          status: task.status,
          priority: task.priority,
        }}
      />
    </div>
  );
}
