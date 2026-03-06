import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import QuotationRequestForm from "@/components/QuotationRequestForm";

export default async function NewQuotationRequestPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div>
      {/* パンくずリスト */}
      <nav className="flex items-center gap-1 text-sm text-[#706E6B] mb-6">
        <Link
          href="/quotation-requests"
          className="hover:text-[#0070D2]"
        >
          SE見積依頼
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-[#3E3E3C]">新規作成</span>
      </nav>

      <div className="rounded-xl bg-white shadow-sm border border-[#DDDBDA] p-6">
        <h1 className="text-xl font-bold text-[#3E3E3C] mb-6">
          SE見積依頼を作成
        </h1>
        <QuotationRequestForm />
      </div>
    </div>
  );
}
