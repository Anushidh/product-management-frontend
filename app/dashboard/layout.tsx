import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DashboardHeader } from "@/components/ui/dashboard-header";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <DashboardHeader />
      <main className="px-12 py-6">{children}</main>
    </div>
  );
}
