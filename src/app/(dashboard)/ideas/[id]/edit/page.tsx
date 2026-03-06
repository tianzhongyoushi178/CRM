import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import IdeaForm from "@/components/IdeaForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditIdeaPage({ params }: PageProps) {
  const { id } = await params;

  const idea = await prisma.idea.findUnique({
    where: { id },
  });

  if (!idea) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          <Link href="/ideas" className="hover:text-[#0176D3]">
            アイディア
          </Link>
          <span>/</span>
          <Link href={`/ideas/${idea.id}`} className="hover:text-[#0176D3]">
            {idea.name}
          </Link>
          <span>/</span>
          <span>編集</span>
        </div>
        <h1 className="text-2xl font-bold text-[#032D60]">アイディアを編集</h1>
      </div>
      <IdeaForm initialData={idea} />
    </div>
  );
}
