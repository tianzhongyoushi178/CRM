import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LeadForm from "@/components/LeadForm";

export default async function NewLeadPage() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/leads"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          リード一覧に戻る
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">新規リード作成</h1>
      </div>
      <LeadForm />
    </div>
  );
}
