import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ActivityForm from "@/components/ActivityForm";

export default async function NewActivityPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">新規活動</h1>
      <ActivityForm />
    </div>
  );
}
