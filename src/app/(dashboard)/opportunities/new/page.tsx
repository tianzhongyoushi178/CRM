import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import OpportunityForm from "@/components/OpportunityForm";

export default async function NewOpportunityPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div>
      {/* パンくずリスト */}
      <nav className="flex items-center gap-1 text-sm text-gray-500 mb-6">
        <Link href="/opportunities" className="hover:text-[#0176D3]">
          商談
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900">新規作成</span>
      </nav>

      <div className="rounded-xl bg-white shadow-sm border p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-6">商談を作成</h1>
        <OpportunityForm />
      </div>
    </div>
  );
}
