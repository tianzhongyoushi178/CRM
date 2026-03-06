import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import ActivityForm from "@/components/ActivityForm";

export default async function EditActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;

  const activity = await prisma.activity.findUnique({
    where: { id },
  });

  if (!activity) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">活動を編集</h1>
      <ActivityForm
        isEdit
        activityId={activity.id}
        initialData={{
          type: activity.type,
          subject: activity.subject,
          description: activity.description || "",
          dueDate: activity.dueDate
            ? new Date(activity.dueDate).toISOString().split("T")[0]
            : "",
          status: activity.status,
          priority: activity.priority,
          accountId: activity.accountId || "",
          contactId: activity.contactId || "",
          opportunityId: activity.opportunityId || "",
          leadId: activity.leadId || "",
        }}
      />
    </div>
  );
}
