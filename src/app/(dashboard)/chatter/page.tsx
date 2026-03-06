import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ChatterFeed from "@/components/ChatterFeed";

export default async function ChatterPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const recommendedUsers = await prisma.user.findMany({
    where: {
      id: { not: session.user.id },
      isActive: true,
    },
    select: { id: true, name: true },
    take: 3,
  });

  const menuItems = [
    { label: "自分がフォローするもの", active: true },
    { label: "自分宛て", active: false },
    { label: "ブックマーク済み", active: false },
    { label: "会社の注目", active: false },
  ];

  return (
    <div className="flex gap-6 max-w-[1400px] mx-auto">
      {/* 左サイドバー */}
      <div className="w-[20%] flex-shrink-0">
        <div className="bg-white rounded-xl shadow-sm border border-[#DDDBDA] p-4">
          <h2 className="text-lg font-bold text-[#3E3E3C] mb-4">Chatter</h2>
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href="#"
                className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                  item.active
                    ? "text-[#0070D2] font-medium border-l-[3px] border-[#0070D2] bg-blue-50"
                    : "text-[#3E3E3C] hover:bg-gray-50 border-l-[3px] border-transparent"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="mt-6 pt-4 border-t border-[#DDDBDA]">
            <h3 className="text-xs font-bold text-[#706E6B] uppercase tracking-wider mb-2">
              最近参照したグループ
            </h3>
            <p className="text-xs text-[#706E6B]">グループはありません</p>
          </div>
        </div>
      </div>

      {/* 中央フィード */}
      <div className="w-[55%]">
        <ChatterFeed currentUserId={session.user.id} />
      </div>

      {/* 右パネル */}
      <div className="w-[25%] flex-shrink-0">
        <div className="bg-white rounded-xl shadow-sm border border-[#DDDBDA] p-4">
          <h2 className="text-base font-bold text-[#3E3E3C] mb-4">
            おすすめ
          </h2>
          {recommendedUsers.length === 0 ? (
            <p className="text-xs text-[#706E6B]">
              おすすめユーザーはいません
            </p>
          ) : (
            <div className="space-y-3">
              {recommendedUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#0070D2] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#3E3E3C] truncate">
                      {user.name}
                    </p>
                  </div>
                  <button className="text-xs text-[#0070D2] hover:text-[#005FB2] font-medium whitespace-nowrap">
                    フォローする
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
