import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArrowLeft } from "lucide-react";
import ContactForm from "@/components/ContactForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditContactPage({ params }: PageProps) {
  const { id } = await params;

  const contact = await prisma.contact.findUnique({
    where: { id },
  });

  if (!contact) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/contacts/${contact.id}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          詳細に戻る
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          取引先責任者の編集: {contact.lastName} {contact.firstName}
        </h1>
      </div>
      <ContactForm
        mode="edit"
        contactId={contact.id}
        initialData={{
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email || "",
          phone: contact.phone || "",
          mobile: contact.mobile || "",
          title: contact.title || "",
          department: contact.department || "",
          accountId: contact.accountId || "",
          address: contact.address || "",
          city: contact.city || "",
          prefecture: contact.prefecture || "",
          postalCode: contact.postalCode || "",
          description: contact.description || "",
        }}
      />
    </div>
  );
}
