import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/app/components/dashboard/Sidebar";
import { TabBar } from "@/app/components/dashboard/TabBar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-[#020202] flex">
      {/* Sidebar — visível apenas no desktop */}
      <Sidebar user={session.user!} />

      {/* Conteúdo principal */}
      <main className="flex-1 md:ml-64 pb-24 md:pb-0">
        {children}
      </main>

      {/* Tab bar — visível apenas no mobile */}
      <TabBar />
    </div>
  );
}
