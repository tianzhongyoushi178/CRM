import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DetailField from "@/components/DetailField";
import DeleteIdeaButton from "./DeleteIdeaButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function IdeaDetailPage({ params }: PageProps) {
  const { id } = await params;

  const idea = await prisma.idea.findUnique({
    where: { id },
    include: {
      owner: true,
    },
  });

  if (!idea) {
    notFound();
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-sm text-[#706E6B] mb-2">
          <Link href="/ideas" className="hover:text-[#0070D2]">
            アイディア
          </Link>
          <span className="mx-1">/</span>
          <span className="text-[#3E3E3C]">{idea.name}</span>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#3E3E3C]">{idea.name}</h1>
            <div className="flex items-center gap-4 mt-2">
              {idea.status && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-[#706E6B]">ステータス</span>
                  <span className="text-sm text-[#3E3E3C] font-medium">
                    {idea.status}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[#706E6B]">所有者</span>
                <span className="text-sm text-[#3E3E3C] font-medium">
                  {idea.owner.name}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Link
              href={`/ideas/${idea.id}/edit`}
              className="rounded-md bg-[#0070D2] px-4 py-2 text-sm font-medium text-white hover:bg-[#005FB2] transition-colors"
            >
              編集
            </Link>
            <DeleteIdeaButton
              ideaId={idea.id}
              ideaName={idea.name}
            />
          </div>
        </div>
      </div>

      {/* Detail content */}
      <div className="bg-white rounded-lg border border-[#DDDBDA] shadow-sm p-6">
        <h3 className="text-sm font-semibold text-[#3E3E3C] border-b border-[#DDDBDA] pb-2 mb-3">
          詳細
        </h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
          <DetailField label="アイディア名" value={idea.name} />
          <DetailField label="所有者" value={idea.owner.name} />
          <DetailField label="カテゴリ" value={idea.category} />
          <DetailField label="ステータス" value={idea.status} />
          <DetailField
            label="作成日"
            value={new Date(idea.createdAt).toLocaleDateString("ja-JP")}
          />
          <DetailField
            label="最終更新日"
            value={new Date(idea.updatedAt).toLocaleDateString("ja-JP")}
          />
        </dl>
        {idea.description && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-[#3E3E3C] border-b border-[#DDDBDA] pb-2 mb-3">
              説明
            </h3>
            <p className="text-sm text-[#3E3E3C] whitespace-pre-wrap">
              {idea.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
