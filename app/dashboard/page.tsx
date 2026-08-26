export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

import DashboardClient from "./DashboardClient";

import { auth } from "@/auth";
import { getDashboardData } from "@/lib/dashboard";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const data = await getDashboardData();

  return <DashboardClient data={data} />;
}