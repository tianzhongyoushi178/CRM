import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DetailField from "@/components/DetailField";
import DeleteCalendarButton from "./DeleteCalendarButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CalendarDetailPage({ params }: PageProps) {
  const { id } = await params;

  const calendar = await prisma.sharedCalendar.findUnique({
    where: { id },
    include: {
      owner: true,
    },
  });

  if (!calendar) {
    notFound();
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-sm text-[#706E6B] mb-2">
          <Link href="/calendars" className="hover:text-[#0070D2]">
            共有カレンダー
          </Link>
          <span className="mx-1">/</span>
          <span className="text-[#3E3E3C]">{calendar.name}</span>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#3E3E3C]">{calendar.name}</h1>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[#706E6B]">所有者</span>
                <span className="text-sm text-[#3E3E3C] font-medium">
                  {calendar.owner.name}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Link
              href={`/calendars/${calendar.id}/edit`}
              className="rounded-md bg-[#0070D2] px-4 py-2 text-sm font-medium text-white hover:bg-[#005FB2] transition-colors"
            >
              編集
            </Link>
            <DeleteCalendarButton
              calendarId={calendar.id}
              calendarName={calendar.name}
            />
          </div>
        </div>
      </div>

      {/* Main content: 2/3 + 1/3 layout */}
      <div className="flex gap-6">
        {/* Left pane - Detail */}
        <div className="w-2/3 min-w-0">
          <div className="bg-white rounded-lg border border-[#DDDBDA] shadow-sm p-6">
            <h3 className="text-sm font-semibold text-[#3E3E3C] border-b border-[#DDDBDA] pb-2 mb-3">
              詳細
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
              <DetailField label="共有カレンダー名" value={calendar.name} />
              <DetailField label="所有者" value={calendar.owner.name} />
              <DetailField label="作成者" value={calendar.owner.name} />
              <DetailField
                label="最終更新者"
                value={calendar.owner.name}
              />
              <DetailField
                label="作成日"
                value={new Date(calendar.createdAt).toLocaleDateString("ja-JP")}
              />
              <DetailField
                label="最終更新日"
                value={new Date(calendar.updatedAt).toLocaleDateString("ja-JP")}
              />
            </dl>
          </div>
        </div>

        {/* Right pane - Activity timeline */}
        <div className="w-1/3 min-w-0">
          <div className="bg-white rounded-lg border border-[#DDDBDA] shadow-sm p-6">
            <h3 className="text-base font-semibold text-[#3E3E3C] mb-3">
              活動
            </h3>
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                className="rounded-md border border-[#DDDBDA] bg-white px-3 py-1.5 text-xs font-medium text-[#3E3E3C] hover:bg-[#F3F3F3] transition-colors"
              >
                行動
              </button>
              <button
                type="button"
                className="rounded-md border border-[#DDDBDA] bg-white px-3 py-1.5 text-xs font-medium text-[#3E3E3C] hover:bg-[#F3F3F3] transition-colors"
              >
                ToDo
              </button>
            </div>
            <p className="text-sm text-[#706E6B] py-4">
              活動はありません
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
