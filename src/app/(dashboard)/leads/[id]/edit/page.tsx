import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LeadForm from "@/components/LeadForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditLeadPage({ params }: PageProps) {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  const { id } = await params;

  const lead = await prisma.lead.findUnique({
    where: { id },
  });

  if (!lead) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/leads/${lead.id}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          リード詳細に戻る
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">リード編集</h1>
        <p className="text-sm text-gray-500 mt-1">
          {lead.lastName} {lead.firstName}
        </p>
      </div>
      <LeadForm
        leadId={lead.id}
        initialData={{
          firstName: lead.firstName,
          lastName: lead.lastName,
          email: lead.email || "",
          phone: lead.phone || "",
          company: lead.company || "",
          title: lead.title || "",
          status: lead.status,
          source: lead.source || "",
          industry: lead.industry || "",
          description: lead.description || "",
          address: lead.address || "",
          city: lead.city || "",
          prefecture: lead.prefecture || "",
          postalCode: lead.postalCode || "",
        }}
      />
    </div>
  );
}
