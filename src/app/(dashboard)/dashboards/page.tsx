import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import SidebarNav from "@/components/SidebarNav";

const sampleDashboards = [
  {
    id: "sales",
    name: "営業ダッシュボード",
    description: "営業実績の概要",
    folder: "公開",
    creator: "管理者",
    createdAt: "2026/01/15",
  },
  {
    id: "se-workload",
    name: "SE負荷ダッシュボード",
    description: "SE担当者の負荷状況",
    folder: "公開",
    creator: "管理者",
    createdAt: "2026/02/01",
  },
  {
    id: "anomaly",
    name: "異常値ダッシュボード",
    description: "異常値の監視",
    folder: "公開",
    creator: "管理者",
    createdAt: "2026/03/01",
  },
];

const sidebarSections = [
  {
    items: [
      { label: "最近", href: "/dashboards", active: true },
      { label: "自分が作成", href: "/dashboards?view=my" },
      { label: "非公開", href: "/dashboards?view=private" },
      { label: "すべて", href: "/dashboards?view=all" },
    ],
  },
  {
    heading: "フォルダー",
    items: [
      { label: "すべて", href: "/dashboards?folder=all" },
      { label: "自分が作成", href: "/dashboards?folder=my" },
      { label: "自分と共有", href: "/dashboards?folder=shared" },
    ],
  },
  {
    heading: "お気に入り",
    items: [
      { label: "すべて", href: "/dashboards?fav=all" },
    ],
  },
];

export default async function DashboardsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex -m-6" style={{ minHeight: "calc(100vh - 104px)" }}>
      <SidebarNav title="ダッシュボード" sections={sidebarSections} />

      <div className="flex-1 p-6">
        {/* ページヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold" style={{ color: "#3E3E3C" }}>
            ダッシュボード &gt; 最近
          </h1>
          <button
            className="px-4 py-2 text-sm font-medium text-white rounded"
            style={{ backgroundColor: "#0070D2" }}
          >
            新規ダッシュボード
          </button>
        </div>

        {/* 検索バー */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="最近使ったダッシュボードを検索..."
            className="w-full max-w-md px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            style={{ borderColor: "#DDDBDA" }}
            readOnly
          />
        </div>

        {/* ダッシュボード一覧テーブル */}
        <div className="bg-white rounded-xl shadow-sm border" style={{ borderColor: "#DDDBDA" }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left" style={{ color: "#706E6B" }}>
                <th className="px-4 py-3 font-semibold">ダッシュボード名</th>
                <th className="px-4 py-3 font-semibold">説明</th>
                <th className="px-4 py-3 font-semibold">フォルダー</th>
                <th className="px-4 py-3 font-semibold">作成者</th>
                <th className="px-4 py-3 font-semibold">作成日</th>
              </tr>
            </thead>
            <tbody>
              {sampleDashboards.map((db) => (
                <tr
                  key={db.id}
                  className="border-t hover:bg-gray-50 transition-colors"
                  style={{ borderColor: "#DDDBDA" }}
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboards/${db.id}`}
                      className="font-medium hover:underline"
                      style={{ color: "#0070D2" }}
                    >
                      {db.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3" style={{ color: "#706E6B" }}>
                    {db.description}
                  </td>
                  <td className="px-4 py-3" style={{ color: "#3E3E3C" }}>
                    {db.folder}
                  </td>
                  <td className="px-4 py-3" style={{ color: "#3E3E3C" }}>
                    {db.creator}
                  </td>
                  <td className="px-4 py-3" style={{ color: "#706E6B" }}>
                    {db.createdAt}
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
