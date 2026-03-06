import ContactForm from "@/components/ContactForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewContactPage() {
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/contacts"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          取引先責任者一覧に戻る
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          取引先責任者の新規作成
        </h1>
      </div>
      <ContactForm mode="create" />
    </div>
  );
}
