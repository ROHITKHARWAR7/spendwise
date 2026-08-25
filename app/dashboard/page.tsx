export const dynamic = "force-dynamic";

import DashboardClient from "./DashboardClient";
import { getDashboardData } from "@/lib/dashboard";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return <DashboardClient data={data} />;
}

