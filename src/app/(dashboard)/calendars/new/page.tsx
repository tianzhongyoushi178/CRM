import SharedCalendarForm from "@/components/SharedCalendarForm";

export default function NewCalendarPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#032D60]">共有カレンダーを作成</h1>
        <p className="mt-1 text-sm text-gray-500">新しい共有カレンダーを登録します</p>
      </div>
      <SharedCalendarForm />
    </div>
  );
}
