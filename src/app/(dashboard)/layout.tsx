import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import GlobalHeader from "@/components/GlobalHeader";
import NavigationBar from "@/components/NavigationBar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F3F3F3" }}>
      <GlobalHeader />
      <NavigationBar />
      <main className="pt-[104px]">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
