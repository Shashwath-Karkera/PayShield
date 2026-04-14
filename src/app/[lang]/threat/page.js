import ThreatDashboardClient from "./ThreatDashboardClient";
import { getDictionary } from "@/i18n/getDictionary";

export default async function ThreatDashboardPage(props) {
  const params = await props.params;
  const lang = params?.lang || "en";
  
  return <ThreatDashboardClient lang={lang} />;
}

