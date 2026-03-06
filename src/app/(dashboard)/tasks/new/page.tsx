import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import TaskForm from "@/components/TaskForm";

export default async function NewTaskPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">新規タスク</h1>
      <TaskForm />
    </div>
  );
}
