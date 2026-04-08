import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ThreatDashboardClient from "./ThreatDashboardClient";

export default async function ThreatDashboardPage({ params }) {
  const token = cookies().get('threat_token');
  
  if (token?.value !== 'granted-neo-level-access') {
    redirect(`/${params.lang || 'en'}/threat/login`);
  }

  return <ThreatDashboardClient />;
}
