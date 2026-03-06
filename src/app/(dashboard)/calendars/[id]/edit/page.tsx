import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import SharedCalendarForm from "@/components/SharedCalendarForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCalendarPage({ params }: PageProps) {
  const { id } = await params;

  const calendar = await prisma.sharedCalendar.findUnique({
    where: { id },
  });

  if (!calendar) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          <Link href="/calendars" className="hover:text-[#0176D3]">
            共有カレンダー
          </Link>
          <span>/</span>
          <Link href={`/calendars/${calendar.id}`} className="hover:text-[#0176D3]">
            {calendar.name}
          </Link>
          <span>/</span>
          <span>編集</span>
        </div>
        <h1 className="text-2xl font-bold text-[#032D60]">共有カレンダーを編集</h1>
      </div>
      <SharedCalendarForm initialData={calendar} />
    </div>
  );
}
