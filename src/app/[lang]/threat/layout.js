import ThreatLayoutClient from "./ThreatLayoutClient";
import { getDictionary } from "@/i18n/getDictionary";

export const metadata = {
  title: "Threat Dashboard | PayShield",
  description: "Advanced Threat Intelligence and Neural Engine Monitoring",
};

export default async function ThreatDashboardLayout(props) {
  const params = await props.params;
  const lang = params?.lang || 'en';
  const dict = await getDictionary(lang);

  return (
    <ThreatLayoutClient lang={lang} dict={dict}>
      {props.children}
    </ThreatLayoutClient>
  );
}
