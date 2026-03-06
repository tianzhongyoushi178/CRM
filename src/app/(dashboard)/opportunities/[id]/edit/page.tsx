import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import OpportunityForm from "@/components/OpportunityForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditOpportunityPage({ params }: PageProps) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;

  const opportunity = await prisma.opportunity.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      amount: true,
      stage: true,
      probability: true,
      closeDate: true,
      description: true,
      accountId: true,
    },
  });

  if (!opportunity) notFound();

  const initialData = {
    id: opportunity.id,
    name: opportunity.name,
    amount: opportunity.amount,
    stage: opportunity.stage,
    probability: opportunity.probability,
    closeDate: opportunity.closeDate
      ? opportunity.closeDate.toISOString()
      : null,
    description: opportunity.description,
    accountId: opportunity.accountId,
  };

  return (
    <div>
      {/* パンくずリスト */}
      <nav className="flex items-center gap-1 text-sm text-gray-500 mb-6">
        <Link href="/opportunities" className="hover:text-[#0176D3]">
          商談
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link
          href={`/opportunities/${id}`}
          className="hover:text-[#0176D3]"
        >
          {opportunity.name}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900">編集</span>
      </nav>

      <div className="rounded-xl bg-white shadow-sm border p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-6">商談を編集</h1>
        <OpportunityForm initialData={initialData} isEdit />
      </div>
    </div>
  );
}
