import {
  AlertTriangle,
  Bell,
  Building2,
  Camera,
  CheckCircle2,
  CreditCard,
  Fingerprint,
  Globe,
  HandCoins,
  Landmark,
  Lock,
  Mail,
  MapPin,
  Monitor,
  Phone,
  ScanFace,
  Settings,
  Shield,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Timer,
  User,
  UserCheck,
  Users,
  Wallet
} from 'lucide-react';

const ICONS = {
  alert: AlertTriangle,
  bell: Bell,
  bank: Landmark,
  building: Building2,
  camera: Camera,
  check: CheckCircle2,
  card: CreditCard,
  device: Monitor,
  dna: Fingerprint,
  globe: Globe,
  lock: Lock,
  mail: Mail,
  location: MapPin,
  payment: HandCoins,
  phone: Phone,
  profile: User,
  scan: ScanFace,
  settings: Settings,
  shield: Shield,
  shieldCheck: ShieldCheck,
  spark: Sparkles,
  timer: Timer,
  trustedUser: UserCheck,
  users: Users,
  wallet: Wallet,
  mobile: Smartphone
};

export default function AppIcon({ name, size = 18, className = '' }) {
  const Icon = ICONS[name] || Shield;
  return <Icon size={size} strokeWidth={2} className={className} aria-hidden="true" />;
}
