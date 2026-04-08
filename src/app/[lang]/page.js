import Link from 'next/link';
import FeatureCard from '@/components/FeatureCard';
import { getDictionary } from '@/i18n/getDictionary';

export default async function Home(props) {
  const params = await props.params;
  const lang = params?.lang || 'en';
  const dict = await getDictionary(lang);

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
              icon="???"
              title="The Slow Motion Trap"
              description="Intelligent delay system during suspicious activities"
              features={[
                "30-second processing delay",
                "Real-time user alerts",
                "Evidence collection mode"
              ]}
            />
            <FeatureCard
              icon="??"
              title="The Device DNA"
              description="20+ unique device identifiers for foolproof authentication"
              features={[
                "Screen resolution tracking",
                "Browser fingerprinting",
                "Timezone verification"
              ]}
            />
            <FeatureCard
              icon="??"
              title="The Behavior Camera"
              description="AI-powered behavioral analytics monitoring user patterns"
              features={[
                "Mouse movement tracking",
                "Transaction pattern analysis",
                "Anomaly detection AI"
              ]}
            />
            <FeatureCard
              icon="??"
              title="Alert System"
              description="Multi-channel instant notifications when threats are detected"
              features={[
                "GSM/SMS alerts",
                "Account freeze capability",
                "Law enforcement integration"
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
              <h3>Create Your Account</h3>
              <p>Register with enhanced security questions and device fingerprinting</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Multi-Layer Protection</h3>
              <p>Your credentials are encrypted with salt, pepper, and stored across decoy accounts</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Continuous Monitoring</h3>
              <p>AI analyzes every transaction, device, and behavior pattern in real-time</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Instant Response</h3>
              <p>Threats are neutralized, alerts sent, and your account protected automatically</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-box">
            <h2>Ready to Experience Unbreakable Security?</h2>
            <p>Join thousands of users who trust PayShield to protect their financial future</p>
            <Link href={`/${lang}/register`} className="btn btn-large">
              {dict.home?.getStartedFree || "Start Your Free Trial"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
