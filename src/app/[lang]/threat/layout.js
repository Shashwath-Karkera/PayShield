import ThreatLayoutClient from "./ThreatLayoutClient";

export const metadata = {
  title: "Threat Dashboard | PayShield",
  description: "Advanced Threat Intelligence and Neural Engine Monitoring",
};

export default function ThreatDashboardLayout({ children }) {
  return <ThreatLayoutClient>{children}</ThreatLayoutClient>;
}