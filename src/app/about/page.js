export default function About() {
  return (
    <>
      <div className="page-container">
        <div className="container">
          <div className="page-header">
            <h1 className="page-title">About PayShield</h1>
            <p className="page-subtitle">
              Revolutionizing payment security with military-grade protection
            </p>
          </div>

          {/* Mission Section */}
          <div className="about-section">
            <div className="about-content">
              <h2>Our Mission</h2>
              <p>
                At PayShield, we believe that financial security should be unbreakable. In an era where 
                cyber threats are becoming increasingly sophisticated, traditional security measures are 
                no longer enough. That's why we've developed a revolutionary 7-layer security system that 
                combines advanced cryptography, artificial intelligence, and behavioral analytics to 
                protect your financial transactions.
              </p>
              <p>
                Our mission is to make world-class security accessible to everyone, ensuring that your 
                hard-earned money remains safe from even the most advanced cyber attacks.
              </p>
            </div>
          </div>

          {/* Why We're Different */}
          <div className="about-section">
            <h2 className="section-title-small">Why We're Different</h2>
            <div className="difference-grid">
              <div className="difference-card">
                <div className="difference-icon">🎯</div>
                <h3>Multi-Layer Defense</h3>
                <p>
                  Unlike single-point security systems, we deploy seven independent layers of 
                  protection. Even if hackers breach one layer, six others stand in their way.
                </p>
              </div>

              <div className="difference-card">
                <div className="difference-icon">🧠</div>
                <h3>AI-Powered Intelligence</h3>
                <p>
                  Our machine learning algorithms learn your unique behavior patterns and can 
                  detect anomalies that traditional rule-based systems would miss.
                </p>
              </div>

              <div className="difference-card">
                <div className="difference-icon">🎭</div>
                <h3>Deception Technology</h3>
                <p>
                  We don't just block attackers - we deceive them with fake accounts and slow 
                  motion traps, buying time to protect you and gather evidence.
                </p>
              </div>

              <div className="difference-card">
                <div className="difference-icon">⛓️</div>
                <h3>Blockchain Security</h3>
                <p>
                  Critical security data is encrypted and stored on blockchain, making it 
                  virtually impossible for hackers to access or tamper with.
                </p>
              </div>

              <div className="difference-card">
                <div className="difference-icon">🔬</div>
                <h3>Advanced Cryptography</h3>
                <p>
                  We use military-grade encryption with unique salt and pepper techniques, 
                  ensuring your credentials are protected even if databases are compromised.
                </p>
              </div>

              <div className="difference-card">
                <div className="difference-icon">⚡</div>
                <h3>Real-Time Response</h3>
                <p>
                  Our system doesn't just detect threats - it responds instantly with account 
                  freezes, user alerts, and evidence collection.
                </p>
              </div>
            </div>
          </div>

          {/* Technology Stack */}
          <div className="about-section">
            <h2 className="section-title-small">Our Technology</h2>
            <div className="tech-stack">
              <div className="tech-category">
                <h3>Security & Encryption</h3>
                <div className="tech-tags">
                  <span className="tech-tag">AES-256 Encryption</span>
                  <span className="tech-tag">RSA Cryptography</span>
                  <span className="tech-tag">Blockchain</span>
                  <span className="tech-tag">Salt & Pepper Hashing</span>
                  <span className="tech-tag">bcrypt</span>
                </div>
              </div>

              <div className="tech-category">
                <h3>Artificial Intelligence</h3>
                <div className="tech-tags">
                  <span className="tech-tag">Machine Learning</span>
                  <span className="tech-tag">Behavioral Analytics</span>
                  <span className="tech-tag">Anomaly Detection</span>
                  <span className="tech-tag">Pattern Recognition</span>
                  <span className="tech-tag">Neural Networks</span>
                </div>
              </div>

              <div className="tech-category">
                <h3>Real-Time Systems</h3>
                <div className="tech-tags">
                  <span className="tech-tag">GSM IoT Integration</span>
                  <span className="tech-tag">WebSocket</span>
                  <span className="tech-tag">Event-Driven Architecture</span>
                  <span className="tech-tag">Real-Time Monitoring</span>
                </div>
              </div>

              <div className="tech-category">
                <h3>Device Fingerprinting</h3>
                <div className="tech-tags">
                  <span className="tech-tag">Canvas Fingerprinting</span>
                  <span className="tech-tag">WebGL Signatures</span>
                  <span className="tech-tag">Browser DNA</span>
                  <span className="tech-tag">Hardware Profiling</span>
                </div>
              </div>
            </div>
          </div>

          {/* Team Section */}
          <div className="about-section">
            <h2 className="section-title-small">Our Team</h2>
            <p className="team-intro">
              PayShield is built by a team of cybersecurity experts, cryptographers, and AI researchers 
              with decades of combined experience in financial security.
            </p>
            <div className="team-grid">
              <div className="team-card">
                <div className="team-avatar">👨‍💼</div>
                <h3>Security Experts</h3>
                <p>Former cybersecurity analysts from leading financial institutions</p>
              </div>

              <div className="team-card">
                <div className="team-avatar">👩‍🔬</div>
                <h3>Cryptographers</h3>
                <p>PhD researchers specializing in advanced encryption techniques</p>
              </div>

              <div className="team-card">
                <div className="team-avatar">👨‍💻</div>
                <h3>AI Engineers</h3>
                <p>Machine learning specialists from top tech companies</p>
              </div>

              <div className="team-card">
                <div className="team-avatar">👩‍⚖️</div>
                <h3>Compliance Officers</h3>
                <p>Legal experts ensuring regulatory compliance</p>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="about-section">
            <h2 className="section-title-small">Our Impact</h2>
            <div className="stats-grid-large">
              <div className="stat-card-large">
                <div className="stat-value-large">500K+</div>
                <div className="stat-label-large">Protected Users</div>
              </div>

              <div className="stat-card-large">
                <div className="stat-value-large">₹10Cr+</div>
                <div className="stat-label-large">Transactions Secured</div>
              </div>

              <div className="stat-card-large">
                <div className="stat-value-large">99.9%</div>
                <div className="stat-label-large">Threat Detection Rate</div>
              </div>

              <div className="stat-card-large">
                <div className="stat-value-large">10K+</div>
                <div className="stat-label-large">Attacks Prevented</div>
              </div>
            </div>
          </div>

          {/* Values Section */}
          <div className="about-section">
            <h2 className="section-title-small">Our Values</h2>
            <div className="values-list">
              <div className="value-item">
                <div className="value-icon">🔒</div>
                <div className="value-content">
                  <h3>Security First</h3>
                  <p>
                    We never compromise on security. Every feature, every line of code is designed 
                    with security as the top priority.
                  </p>
                </div>
              </div>

              <div className="value-item">
                <div className="value-icon">🎯</div>
                <div className="value-content">
                  <h3>Transparency</h3>
                  <p>
                    We believe users have the right to understand how their security works. That's 
                    why we openly explain our protection mechanisms.
                  </p>
                </div>
              </div>

              <div className="value-item">
                <div className="value-icon">🚀</div>
                <div className="value-content">
                  <h3>Innovation</h3>
                  <p>
                    Cyber threats evolve constantly, and so do we. We continuously research and 
                    implement cutting-edge security technologies.
                  </p>
                </div>
              </div>

              <div className="value-item">
                <div className="value-icon">👥</div>
                <div className="value-content">
                  <h3>User-Centric</h3>
                  <p>
                    Advanced security shouldn't be complicated. We make enterprise-grade protection 
                    accessible and easy to use for everyone.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="cta-section-inline">
            <h2>Ready to Experience Unbreakable Security?</h2>
            <p>Join thousands of users who trust PayShield with their financial safety</p>
            <div className="cta-buttons">
              <a href="/register" className="btn btn-primary">Get Started Now</a>
              <a href="/features" className="btn btn-secondary">Learn More</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
