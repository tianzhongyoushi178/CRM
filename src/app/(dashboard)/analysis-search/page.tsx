import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AnalysisSearchForm from "@/components/AnalysisSearchForm";

export default async function AnalysisSearchPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* ページタイトル */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-[#0070D2] flex items-center justify-center">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-[#3E3E3C]">分析情報検索</h1>
      </div>

      {/* 案内テキスト */}
      <div className="mb-6 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-[#0070D2]">
          テキスト値であいまい検索する場合は「*」（半角）を前、後、前後など、適宜付けて検索してください。
        </p>
      </div>

      {/* 検索フォーム + 結果 */}
      <AnalysisSearchForm />
    </div>
  );
}
