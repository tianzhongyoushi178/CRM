import IdeaForm from "@/components/IdeaForm";

export default function NewIdeaPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#032D60]">アイディアを作成</h1>
        <p className="mt-1 text-sm text-gray-500">新しいアイディアを登録します</p>
      </div>
      <IdeaForm />
    </div>
  );
}
