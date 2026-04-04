import Link from 'next/link';
import FeatureCard from '@/components/FeatureCard';
import AppIcon from '@/components/AppIcon';

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Secure Your Payments with
              <span className="gradient-text"> Military-Grade Protection</span>
            </h1>
            <p className="hero-subtitle">
              PayShield combines advanced cryptography, AI-powered behavioral analytics, 
              and multi-layer deception technology to protect your financial transactions 
              from sophisticated cyber threats.
            </p>
            <div className="hero-buttons">
              <Link href="/register" className="btn btn-primary">
                Get Started Free
              </Link>
              <Link href="/features" className="btn btn-secondary">
                Explore Features
              </Link>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <div className="stat-value">99.9%</div>
                <div className="stat-label">Threat Detection</div>
              </div>
              <div className="stat">
                <div className="stat-value">7-Layer</div>
                <div className="stat-label">Security System</div>
              </div>
              <div className="stat">
                <div className="stat-value">24/7</div>
                <div className="stat-label">Real-time Monitoring</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Advanced Security Features</h2>
            <p className="section-subtitle">
              Seven layers of intelligent protection working in harmony to safeguard your assets
            </p>
          </div>

          <div className="features-grid">
            <FeatureCard
              icon={<AppIcon name="lock" size={22} />}
              title="The Spice Lock"
              description="Triple-layer password encryption with salt, pepper, and cryptographic hashing"
              features={[
                "Random 16-digit salt per user",
                "Master pepper key on server",
                "Automatic mixing on login"
              ]}
            />
            <FeatureCard
              icon={<AppIcon name="shield" size={22} />}
              title="The Mirror Maze"
              description="Decoy-ledger architecture that contains suspicious sessions and protects real funds"
              features={[
                "3 fake accounts with realistic balances",
                "Real account hidden from intruders",
                "Automatic redirection system"
              ]}
            />
            <FeatureCard
              icon={<AppIcon name="globe" size={22} />}
              title="The Digital Passport"
              description="Advanced location and device verification for every transaction"
              features={[
                "Geographic anomaly detection",
                "Device fingerprinting",
                "Time-based analysis"
              ]}
            />
            <FeatureCard
              icon={<AppIcon name="scan" size={22} />}
              title="The Childhood Whisper"
              description="Encrypted identity challenge layer for suspicious session recovery"
              features={[
                "Encrypted on blockchain",
                "Never stored on device",
                "Multi-question verification"
              ]}
            />
            <FeatureCard
              icon={<AppIcon name="timer" size={22} />}
              title="The Slow Motion Trap"
              description="Intelligent delay system during suspicious activities"
              features={[
                "30-second processing delay",
                "Real-time user alerts",
                "Evidence collection mode"
              ]}
            />
            <FeatureCard
              icon={<AppIcon name="dna" size={22} />}
              title="The Device DNA"
              description="20+ unique device identifiers for foolproof authentication"
              features={[
                "Screen resolution tracking",
                "Browser fingerprinting",
                "Timezone verification"
              ]}
            />
            <FeatureCard
              icon={<AppIcon name="camera" size={22} />}
              title="The Behavior Camera"
              description="AI-powered behavioral analytics monitoring user patterns"
              features={[
                "Mouse movement tracking",
                "Transaction pattern analysis",
                "Anomaly detection AI"
              ]}
            />
            <FeatureCard
              icon={<AppIcon name="alert" size={22} />}
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
            <Link href="/features" className="btn btn-primary">
              Learn More About Our Security
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How PayShield Protects You</h2>
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
            <Link href="/register" className="btn btn-large">
              Start Your Free Trial
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
