import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AccountForm from "@/components/AccountForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAccountPage({ params }: PageProps) {
  const { id } = await params;

  const account = await prisma.account.findUnique({
    where: { id },
  });

  if (!account) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          <Link href="/accounts" className="hover:text-[#0176D3]">
            取引先
          </Link>
          <span>/</span>
          <Link href={`/accounts/${account.id}`} className="hover:text-[#0176D3]">
            {account.name}
          </Link>
          <span>/</span>
          <span>編集</span>
        </div>
        <h1 className="text-2xl font-bold text-[#032D60]">取引先を編集</h1>
      </div>
      <AccountForm initialData={account} />
    </div>
  );
}
