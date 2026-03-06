import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import SidebarNav from "@/components/SidebarNav";

const sampleReports = [
  {
    id: "monthly-sales",
    name: "月別売上レポート",
    description: "月ごとの売上推移",
    folder: "公開レポート",
    creator: "管理者",
    createdAt: "2026/01/15",
  },
  {
    id: "pipeline",
    name: "案件パイプライン",
    description: "ステージ別案件一覧",
    folder: "公開レポート",
    creator: "管理者",
    createdAt: "2026/01/20",
  },
  {
    id: "se-workload",
    name: "SE負荷積表",
    description: "SE担当者別負荷状況",
    folder: "公開レポート",
    creator: "管理者",
    createdAt: "2026/02/01",
  },
  {
    id: "account-sales",
    name: "取引先別売上",
    description: "取引先ごとの売上集計",
    folder: "公開レポート",
    creator: "管理者",
    createdAt: "2026/02/10",
  },
  {
    id: "anomaly",
    name: "異常値レポート",
    description: "異常値の検出結果",
    folder: "公開レポート",
    creator: "管理者",
    createdAt: "2026/03/01",
  },
];

const sidebarSections = [
  {
    items: [
      { label: "最近", href: "/reports", active: true },
      { label: "自分が作成", href: "/reports?view=my" },
      { label: "非公開レポート", href: "/reports?view=private" },
      { label: "公開レポート", href: "/reports?view=public" },
      { label: "すべてのレポート", href: "/reports?view=all" },
    ],
  },
  {
    heading: "フォルダー",
    items: [
      { label: "すべてのフォルダー", href: "/reports?folder=all" },
      { label: "自分が作成", href: "/reports?folder=my" },
      { label: "自分と共有", href: "/reports?folder=shared" },
    ],
  },
  {
    heading: "お気に入り",
    items: [
      { label: "すべてのお気に入り", href: "/reports?fav=all" },
    ],
  },
];

export default async function ReportsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex -m-6" style={{ minHeight: "calc(100vh - 104px)" }}>
      <SidebarNav title="レポート" sections={sidebarSections} />

      <div className="flex-1 p-6">
        {/* ページヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold" style={{ color: "#3E3E3C" }}>
            レポート &gt; 最近
          </h1>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 text-sm font-medium rounded border hover:bg-gray-50"
              style={{ borderColor: "#DDDBDA", color: "#3E3E3C" }}
            >
              新規フォルダー
            </button>
            <button
              className="px-4 py-2 text-sm font-medium text-white rounded"
              style={{ backgroundColor: "#0070D2" }}
            >
              新規レポート
            </button>
          </div>
        </div>

        {/* 検索バー */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="最近使ったレポートを検索..."
            className="w-full max-w-md px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            style={{ borderColor: "#DDDBDA" }}
            readOnly
          />
        </div>

        {/* レポート一覧テーブル */}
        <div className="bg-white rounded-xl shadow-sm border" style={{ borderColor: "#DDDBDA" }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left" style={{ color: "#706E6B" }}>
                <th className="px-4 py-3 font-semibold">レポート名</th>
                <th className="px-4 py-3 font-semibold">説明</th>
                <th className="px-4 py-3 font-semibold">フォルダー</th>
                <th className="px-4 py-3 font-semibold">作成者</th>
                <th className="px-4 py-3 font-semibold">作成日</th>
              </tr>
            </thead>
            <tbody>
              {sampleReports.map((report) => (
                <tr
                  key={report.id}
                  className="border-t hover:bg-gray-50 transition-colors"
                  style={{ borderColor: "#DDDBDA" }}
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/reports/${report.id}`}
                      className="font-medium hover:underline"
                      style={{ color: "#0070D2" }}
                    >
                      {report.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3" style={{ color: "#706E6B" }}>
                    {report.description}
                  </td>
                  <td className="px-4 py-3" style={{ color: "#3E3E3C" }}>
                    {report.folder}
                  </td>
                  <td className="px-4 py-3" style={{ color: "#3E3E3C" }}>
                    {report.creator}
                  </td>
                  <td className="px-4 py-3" style={{ color: "#706E6B" }}>
                    {report.createdAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
