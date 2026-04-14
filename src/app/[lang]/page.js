import Link from 'next/link';
import FeatureCard from '@/components/FeatureCard';
import { getDictionary } from '@/i18n/getDictionary';
import AppIcon from '@/components/AppIcon';

export default async function Home(props) {
  const params = await props.params;
  const lang = params?.lang || 'en';
  const dict = await getDictionary(lang);
  const featureCards = dict.home?.featureCards || {};
  const steps = dict.home?.steps || {};

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              {dict.home?.heroTitle1 || "Secure Your Payments with"}
              <span className="gradient-text"> {dict.home?.heroTitle2 || "Military-Grade Protection"}</span>
            </h1>
            <p className="hero-subtitle">
              {dict.home?.heroSubtitle || "PayShield combines advanced cryptography..."}
            </p>
            <div className="hero-buttons">
              <Link href={`/${lang}/register`} className="btn btn-primary">
                {dict.home?.getStartedFree || "Get Started Free"}
              </Link>
              <Link href={`/${lang}/features`} className="btn btn-secondary">
                {dict.home?.exploreFeatures || "Explore Features"}
              </Link>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <div className="stat-value">99.9%</div>
                <div className="stat-label">{dict.home?.stats?.threatDetection || "Threat Detection"}</div>
              </div>
              <div className="stat">
                <div className="stat-value">7-Layer</div>
                <div className="stat-label">{dict.home?.stats?.securitySystem || "Security System"}</div>
              </div>
              <div className="stat">
                <div className="stat-value">24/7</div>
                <div className="stat-label">{dict.home?.stats?.realtimeMonitoring || "Real-time Monitoring"}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{dict.home?.features?.title || "Advanced Security Features"}</h2>
            <p className="section-subtitle">
              {dict.home?.features?.subtitle || "Seven layers of intelligent protection"}
            </p>
          </div>

          <div className="features-grid">
            <FeatureCard
              icon={<AppIcon name="lock" size={22} />}
              title={featureCards.spiceLock?.title || "The Spice Lock"}
              description={featureCards.spiceLock?.description || "Triple-layer password encryption with salt, pepper, and cryptographic hashing"}
              features={[
                featureCards.spiceLock?.feature1 || "Random 16-digit salt per user",
                featureCards.spiceLock?.feature2 || "Master pepper key on server",
                featureCards.spiceLock?.feature3 || "Automatic mixing on login"
              ]}
            />
            <FeatureCard
              icon={<AppIcon name="shield" size={22} />}
              title={featureCards.mirrorMaze?.title || "The Mirror Maze"}
              description={featureCards.mirrorMaze?.description || "Decoy-ledger architecture that contains suspicious sessions and protects real funds"}
              features={[
                featureCards.mirrorMaze?.feature1 || "3 fake accounts with realistic balances",
                featureCards.mirrorMaze?.feature2 || "Real account hidden from intruders",
                featureCards.mirrorMaze?.feature3 || "Automatic redirection system"
              ]}
            />
            <FeatureCard
              icon={<AppIcon name="globe" size={22} />}
              title={featureCards.digitalPassport?.title || "The Digital Passport"}
              description={featureCards.digitalPassport?.description || "Advanced location and device verification for every transaction"}
              features={[
                featureCards.digitalPassport?.feature1 || "Geographic anomaly detection",
                featureCards.digitalPassport?.feature2 || "Device fingerprinting",
                featureCards.digitalPassport?.feature3 || "Time-based analysis"
              ]}
            />
            <FeatureCard
              icon={<AppIcon name="scan" size={22} />}
              title={featureCards.childhoodWhisper?.title || "The Childhood Whisper"}
              description={featureCards.childhoodWhisper?.description || "Encrypted identity challenge layer for suspicious session recovery"}
              features={[
                featureCards.childhoodWhisper?.feature1 || "Encrypted on blockchain",
                featureCards.childhoodWhisper?.feature2 || "Never stored on device",
                featureCards.childhoodWhisper?.feature3 || "Multi-question verification"
              ]}
            />
            <FeatureCard
              icon={<AppIcon name="timer" size={22} />}
              title={featureCards.slowMotionTrap?.title || "The Slow Motion Trap"}
              description={featureCards.slowMotionTrap?.description || "Intelligent delay system during suspicious activities"}
              features={[
                featureCards.slowMotionTrap?.feature1 || "30-second processing delay",
                featureCards.slowMotionTrap?.feature2 || "Real-time user alerts",
                featureCards.slowMotionTrap?.feature3 || "Evidence collection mode"
              ]}
            />
            <FeatureCard
              icon={<AppIcon name="dna" size={22} />}
              title={featureCards.deviceDNA?.title || "The Device DNA"}
              description={featureCards.deviceDNA?.description || "20+ unique device identifiers for foolproof authentication"}
              features={[
                featureCards.deviceDNA?.feature1 || "Screen resolution tracking",
                featureCards.deviceDNA?.feature2 || "Browser fingerprinting",
                featureCards.deviceDNA?.feature3 || "Timezone verification"
              ]}
            />
            <FeatureCard
              icon={<AppIcon name="camera" size={22} />}
              title={featureCards.behaviorCamera?.title || "The Behavior Camera"}
              description={featureCards.behaviorCamera?.description || "AI-powered behavioral analytics monitoring user patterns"}
              features={[
                featureCards.behaviorCamera?.feature1 || "Mouse movement tracking",
                featureCards.behaviorCamera?.feature2 || "Transaction pattern analysis",
                featureCards.behaviorCamera?.feature3 || "Anomaly detection AI"
              ]}
            />
            <FeatureCard
              icon={<AppIcon name="alert" size={22} />}
              title={featureCards.alertSystem?.title || "Alert System"}
              description={featureCards.alertSystem?.description || "Multi-channel instant notifications when threats are detected"}
              features={[
                featureCards.alertSystem?.feature1 || "GSM/SMS alerts",
                featureCards.alertSystem?.feature2 || "Account freeze capability",
                featureCards.alertSystem?.feature3 || "Law enforcement integration"
              ]}
            />
          </div>

          <div className="cta-center">
            <Link href={`/${lang}/features`} className="btn btn-primary">
              {dict.home?.exploreFeatures || "Learn More About Our Security"}
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">{dict.home?.howItWorksTitle || "How PayShield Protects You"}</h2>
          <div className="steps-grid">
            <div className="step">
              <div className="step-number">1</div>
              <h3>{steps.step1Title || "Create Your Account"}</h3>
              <p>{steps.step1Desc || "Register with enhanced security questions and device fingerprinting"}</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>{steps.step2Title || "Multi-Layer Protection"}</h3>
              <p>{steps.step2Desc || "Your credentials are encrypted with salt, pepper, and stored across decoy accounts"}</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>{steps.step3Title || "Continuous Monitoring"}</h3>
              <p>{steps.step3Desc || "AI analyzes every transaction, device, and behavior pattern in real-time"}</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>{steps.step4Title || "Instant Response"}</h3>
              <p>{steps.step4Desc || "Threats are neutralized, alerts sent, and your account protected automatically"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-box">
            <h2>{dict.home?.ctaReady || "Ready to Experience Unbreakable Security?"}</h2>
            <p>{dict.home?.ctaSubtext || "Join thousands of users who trust PayShield to protect their financial future"}</p>
            <Link href={`/${lang}/register`} className="btn btn-large">
              {dict.home?.ctaButton || "Start Your Free Trial"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
