import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { MountainSnow, TreePine, Tent, ChevronDown, Check } from "lucide-react";
import Link from "next/link";
import { HomeWidget } from "@/components/HomeWidget";

function getTodayRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return { start, end };
}

async function getHomeData(userId: string) {
  const { start, end } = getTodayRange();

  const [todayTasks, overdueTasks, todayActivities] = await Promise.all([
    // 今日のToDo
    prisma.task.findMany({
      where: {
        ownerId: userId,
        dueDate: { gte: start, lte: end },
        status: { not: "COMPLETED" },
      },
      take: 5,
      orderBy: { dueDate: "asc" },
    }),
    // アシスタント: 期限切れの未完了タスク
    prisma.task.findMany({
      where: {
        ownerId: userId,
        dueDate: { lt: start },
        status: { not: "COMPLETED" },
      },
      take: 3,
      orderBy: { dueDate: "asc" },
    }),
    // 今日の行動
    prisma.activity.findMany({
      where: {
        ownerId: userId,
        dueDate: { gte: start, lte: end },
        type: { in: ["MEETING", "VISIT", "CALL"] },
      },
      take: 5,
      orderBy: { dueDate: "asc" },
      include: { account: true },
    }),
  ]);

  return { todayTasks, overdueTasks, todayActivities };
}

function formatDate(date: Date | null): string {
  if (!date) return "";
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function formatTime(date: Date | null): string {
  if (!date) return "";
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="text-[#0070D2] opacity-30">
        {icon}
      </div>
      <p className="text-sm text-[#706E6B] text-center mt-4">{message}</p>
    </div>
  );
}

function WidgetFooterButton({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block w-full text-center px-4 py-2.5 text-[#0070D2] text-sm font-medium border border-transparent hover:bg-gray-50 transition-colors rounded-b-xl"
    >
      {label}
    </Link>
  );
}

export default async function HomePage() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const { todayTasks, overdueTasks, todayActivities } = await getHomeData(session.user.id);

  return (
    <div className="min-h-screen bg-[#F3F3F3] -m-6 p-6">
      {/* バナーエリア */}
      <div className="mb-6">
        <Link
          href="#"
          className="block w-full bg-[#0070D2] text-white px-6 py-3 rounded-t-lg font-medium text-sm hover:bg-[#005FB2] transition-colors"
        >
          SE負荷積表はこちら
        </Link>
        <div className="bg-white px-6 py-2 rounded-b-lg border border-t-0 border-[#DDDBDA] flex justify-end">
          <Link href="#" className="text-[#0070D2] text-sm hover:underline">
            分析情報が登録されていない案件一覧はこちら &rarr;
          </Link>
        </div>
      </div>

      {/* 2カラムレイアウト */}
      <div className="flex gap-6">
        {/* 左カラム（約32%） */}
        <div className="w-[32%] flex flex-col gap-6">
          {/* ウィジェット1: 今日のToDo */}
          <HomeWidget
            title="今日のToDo"
            headerAction={
              <button
                type="button"
                className="flex items-center gap-1 text-sm text-[#706E6B] border border-[#DDDBDA] rounded px-2 py-1 hover:bg-gray-50"
              >
                ビュー選択
                <ChevronDown className="h-3 w-3" />
              </button>
            }
            footer={<WidgetFooterButton href="/tasks" label="すべて表示" />}
          >
            {todayTasks.length === 0 ? (
              <EmptyState
                icon={<MountainSnow className="w-24 h-24" />}
                message="今日が期限のものはありません。しばらくしてから再度確認してください。"
              />
            ) : (
              <div className="space-y-3">
                {todayTasks.map((task) => (
                  <div key={task.id} className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <Check className="h-4 w-4 text-[#706E6B]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#3E3E3C] truncate">{task.subject}</p>
                      <p className="text-xs text-[#706E6B]">
                        期限: {task.dueDate ? formatDate(task.dueDate) : "なし"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </HomeWidget>

          {/* ウィジェット2: アシスタント */}
          <HomeWidget title="アシスタント">
            {overdueTasks.length === 0 ? (
              <EmptyState
                icon={<TreePine className="w-24 h-24" />}
                message="現在、注意事項はありません。しばらくしてからもう一度確認してください。"
              />
            ) : (
              <div className="space-y-3">
                {overdueTasks.map((task) => (
                  <div key={task.id} className="p-3 bg-[#FFF8E1] rounded-lg">
                    <p className="text-sm font-medium text-[#3E3E3C]">{task.subject}</p>
                    <p className="text-xs text-[#706E6B] mt-1">
                      期限超過: {task.dueDate ? formatDate(task.dueDate) : "不明"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </HomeWidget>

          {/* ウィジェット3: 今日の行動 */}
          <HomeWidget
            title="今日の行動"
            footer={<WidgetFooterButton href="/activities" label="カレンダーを表示" />}
          >
            {todayActivities.length === 0 ? (
              <EmptyState
                icon={<Tent className="w-24 h-24" />}
                message="本日この後の予定はありません。"
              />
            ) : (
              <div className="space-y-3">
                {todayActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <span className="text-sm font-medium text-[#0070D2] whitespace-nowrap">
                      {activity.dueDate ? formatTime(activity.dueDate) : "--:--"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#3E3E3C] truncate">{activity.subject}</p>
                      {activity.account && (
                        <Link
                          href={`/accounts/${activity.account.id}`}
                          className="text-xs text-[#0070D2] hover:underline"
                        >
                          {activity.account.name}
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </HomeWidget>
        </div>

        {/* 右カラム（約68%） */}
        <div className="w-[68%]">
          <div className="rounded-xl bg-white shadow-sm border border-[#DDDBDA] p-6">
            <h2 className="text-lg font-bold text-[#3E3E3C] mb-4">&#9632;各種設定マニュアル&#9632;</h2>
            <div className="text-sm text-[#3E3E3C] space-y-4">
              <div>
                <p className="font-bold mb-2">ユーザー登録</p>
                <p className="pl-6">
                  Salesforceユーザ登録方法20231121 | Salesforce{" "}
                  <Link href="#" className="text-[#0070D2] hover:underline">[リンク]</Link>
                </p>
              </div>
              <div>
                <p className="font-bold mb-2">MFA多要素認証設定関連</p>
                <div className="pl-2">
                  <p className="mb-1">・スマホ認証用</p>
                  <p className="pl-6 mb-3">
                    Salesforce Authenticator設定マニュアル | Salesforce{" "}
                    <Link href="#" className="text-[#0070D2] hover:underline">[リンク]</Link>
                  </p>
                  <p className="mb-1">・PC認証用</p>
                  <p className="pl-6">
                    WinAuth設定マニュアル | Salesforce{" "}
                    <Link href="#" className="text-[#0070D2] hover:underline">[リンク]</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
