import AppIcon from '@/components/AppIcon';

export default function Features() {
  return (
    <>
      <div className="page-container">
        <div className="container">
          <div className="page-header">
            <h1 className="page-title">Security Features</h1>
            <p className="page-subtitle">
              Discover the seven layers of protection that make PayShield the most secure payment platform
            </p>
          </div>

          {/* Feature 1: Spice Lock */}
          <div className="feature-detail">
            <div className="feature-detail-header">
              <span className="feature-icon-large"><AppIcon name="lock" size={22} /></span>
              <h2>The Spice Lock - 3 Layer Protection</h2>
            </div>
            <p className="feature-intro">
              Your password receives two secret ingredients before being stored, making it virtually impossible to crack.
            </p>
            
            <div className="feature-explanation">
              <div className="explanation-card">
                <h3>Salt: User-specific random entropy</h3>
                <p>
                  Every user gets a unique 16-digit random number generated when creating their account. 
                  This salt is mixed with your password before encryption, ensuring that even if two users 
                  have the same password, their encrypted versions are completely different.
                </p>
              </div>

              <div className="explanation-card">
                <h3>Pepper: Server-held secret keying material</h3>
                <p>
                  The server adds its own secret ingredient that exists only on our secure servers. 
                  This master pepper is never transmitted to your browser, adding an extra layer of 
                  protection against client-side attacks.
                </p>
              </div>

              <div className="explanation-card">
                <h3>How It Works</h3>
                <ul>
                  <li><strong>Registration:</strong> System generates random 16-digit salt → Mixes with your password → Browser generates pepper code → Combined for encryption</li>
                  <li><strong>Login:</strong> You enter your password → System sprinkles salt → Browser sprinkles pepper → Verification complete</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Feature 2: Mirror Maze */}
          <div className="feature-detail">
            <div className="feature-detail-header">
              <span className="feature-icon-large"><AppIcon name="shield" size={22} /></span>
              <h2>The Mirror Maze - 3 Fake Reflections</h2>
            </div>
            <p className="feature-intro">
              Instead of one account, we create four identical rooms. Hackers always enter the fake ones!
            </p>
            
            <div className="feature-accounts-grid">
              <div className="account-card real">
                <div className="account-badge">Real Account</div>
                <div className="account-balance">Your Actual Money</div>
                <p>Hidden and protected - only accessible with proper authentication</p>
              </div>

              <div className="account-card fake">
                <div className="account-badge">Decoy Account #1</div>
                <div className="account-balance">₹50,000</div>
                <p>Realistic fake account to mislead intruders</p>
              </div>

              <div className="account-card fake">
                <div className="account-badge">Decoy Account #2</div>
                <div className="account-balance">₹75,000</div>
                <p>Another convincing decoy with transaction history</p>
              </div>

              <div className="account-card fake">
                <div className="account-badge">Decoy Account #3</div>
                <div className="account-balance">₹25,000</div>
                <p>Lower balance decoy to appear authentic</p>
              </div>
            </div>

            <div className="explanation-card">
              <h3>Why This Works</h3>
              <p>
                Hackers believe they've succeeded when they access a decoy account. They see realistic 
                balances and transaction histories, so they stop trying to break in further. Meanwhile, 
                our system has already detected the intrusion and alerted you.
              </p>
            </div>
          </div>

          {/* Feature 3: Digital Passport */}
          <div className="feature-detail">
            <div className="feature-detail-header">
              <span className="feature-icon-large"><AppIcon name="globe" size={22} /></span>
              <h2>The Digital Passport</h2>
            </div>
            <p className="feature-intro">
              Every login checks your travel documents - location, device, and timing.
            </p>
            
            <div className="comparison-grid">
              <div className="comparison-card normal">
                <h3>Verified Session Profile</h3>
                <ul>
                  <li><strong>Location:</strong> Bangalore, India</li>
                  <li><strong>Device:</strong> Your registered laptop</li>
                  <li><strong>Time:</strong> 10:00 AM (Daytime)</li>
                  <li><strong>Pattern:</strong> Consistent with history</li>
                </ul>
                <div className="status-badge success">Access Granted</div>
              </div>

              <div className="comparison-card suspicious">
                <h3>High-Risk Session Profile</h3>
                <ul>
                  <li><strong>Location:</strong> Moscow, Russia</li>
                  <li><strong>Device:</strong> Unknown smartphone</li>
                  <li><strong>Time:</strong> 3:00 AM (unusual activity window)</li>
                  <li><strong>Pattern:</strong> Unusual behavior</li>
                </ul>
                <div className="status-badge danger">Instant Block!</div>
              </div>
            </div>

            <div className="explanation-card">
              <h3>Geographic Intelligence</h3>
              <p>
                Since UPI transactions only work in India, Nepal, Bhutan, and France, the system automatically 
                flags any payment attempt from other countries. If your last transaction was in India and 
                suddenly there's an attempt from China, the account is immediately frozen.
              </p>
            </div>
          </div>

          {/* Feature 4: Childhood Whisper */}
          <div className="feature-detail">
            <div className="feature-detail-header">
              <span className="feature-icon-large"><AppIcon name="scan" size={22} /></span>
              <h2>The Childhood Whisper</h2>
            </div>
            <p className="feature-intro">
              Only you know these secrets from your past - cryptographically encrypted on blockchain.
            </p>
            
            <div className="feature-flow">
              <div className="flow-step">
                <h3>Step 1: Setup</h3>
                <div className="flow-content">
                  <p>During registration, you provide two secret answers:</p>
                  <ul>
                    <li>What did your mother call you?</li>
                    <li>What was your first pet's name?</li>
                  </ul>
                  <p className="highlight">Example: "Chintu" and "Tommy"</p>
                </div>
              </div>

              <div className="flow-step">
                <h3>Step 2: Encryption</h3>
                <div className="flow-content">
                  <p>Answers are cryptographically encrypted and stored on blockchain</p>
                  <ul>
                    <li>Never stored in your browser</li>
                    <li>Never stored on your device</li>
                    <li>Impossible for hackers to access</li>
                  </ul>
                </div>
              </div>

              <div className="flow-step">
                <h3>Step 3: Verification</h3>
                <div className="flow-content">
                  <p>During suspicious activity:</p>
                  <ul>
                    <li>System asks: "What was mom's name for you + first pet?"</li>
                    <li>Real user: "ChintuTommy" → <span className="success">Access to real account</span></li>
                    <li>Hacker: Wrong answer → <span className="danger">Stuck in fake account</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 5: Slow Motion Trap */}
          <div className="feature-detail">
            <div className="feature-detail-header">
              <span className="feature-icon-large"><AppIcon name="timer" size={22} /></span>
              <h2>The Slow Motion Trap</h2>
            </div>
            <p className="feature-intro">
              When unusual activity is detected, time slows down while we protect you.
            </p>
            
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-marker">0s</div>
                <div className="timeline-content">
                  <h4>Suspicious Transaction Initiated</h4>
                  <p>Hacker attempts to transfer ₹50,000</p>
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-marker">1s</div>
                <div className="timeline-content">
                  <h4>System Detection</h4>
                  <p>Anomaly detected - activating slow motion protocol</p>
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-marker">2s</div>
                <div className="timeline-content">
                  <h4>User Alert Sent</h4>
                  <p>GSM call triggered to your registered mobile</p>
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-marker">5s</div>
                <div className="timeline-content">
                  <h4>Evidence Collection</h4>
                  <p>IP address, browser fingerprint, behavior patterns logged</p>
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-marker">10s</div>
                <div className="timeline-content">
                  <h4>Law Enforcement Notified</h4>
                  <p>Automated alert to cybercrime authorities</p>
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-marker">30s</div>
                <div className="timeline-content">
                  <h4>Fake Success Message</h4>
                  <p>Hacker sees: "Transaction Successful" (but it never happened)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 6: Device DNA */}
          <div className="feature-detail">
            <div className="feature-detail-header">
              <span className="feature-icon-large"><AppIcon name="dna" size={22} /></span>
              <h2>The Device DNA</h2>
            </div>
            <p className="feature-intro">
              Your device has unique DNA - 20+ identifiers that can't be faked.
            </p>
            
            <div className="dna-grid">
              <div className="dna-card">
                <h4>Screen Characteristics</h4>
                <ul>
                  <li>Resolution: 1920x1080</li>
                  <li>Color depth: 24-bit</li>
                  <li>Pixel ratio: 1.0</li>
                </ul>
              </div>

              <div className="dna-card">
                <h4>Browser Fingerprint</h4>
                <ul>
                  <li>User agent string</li>
                  <li>Installed plugins</li>
                  <li>Language settings</li>
                </ul>
              </div>

              <div className="dna-card">
                <h4>Time Signature</h4>
                <ul>
                  <li>Timezone: IST (UTC+5:30)</li>
                  <li>System time</li>
                  <li>Time drift</li>
                </ul>
              </div>

              <div className="dna-card">
                <h4>Hardware Markers</h4>
                <ul>
                  <li>CPU cores: 8</li>
                  <li>Memory: 16GB</li>
                  <li>Platform: Windows</li>
                </ul>
              </div>

              <div className="dna-card">
                <h4>Canvas Fingerprint</h4>
                <ul>
                  <li>Rendering signature</li>
                  <li>Font rendering</li>
                  <li>WebGL signature</li>
                </ul>
              </div>

              <div className="dna-card">
                <h4>Network Identity</h4>
                <ul>
                  <li>IP address</li>
                  <li>Connection type</li>
                  <li>ISP information</li>
                </ul>
              </div>
            </div>

            <div className="explanation-card">
              <h3>Machine Learning Detection</h3>
              <p>
                Our AI model learns your device's unique signature. If someone tries to login from 
                a device with different DNA - even if they have your password - the security questions 
                are triggered to verify your identity.
              </p>
            </div>
          </div>

          {/* Feature 7: Behavior Camera */}
          <div className="feature-detail">
            <div className="feature-detail-header">
              <span className="feature-icon-large"><AppIcon name="camera" size={22} /></span>
              <h2>The Behavior Camera</h2>
            </div>
            <p className="feature-intro">
              AI watches how you interact - everyone has unique digital behavior patterns.
            </p>
            
            <div className="behavior-comparison">
              <div className="behavior-card normal-user">
                <h3>Normal User Behavior</h3>
                <div className="behavior-pattern">
                  <div className="pattern-item">
                    <strong>Mouse Movement:</strong>
                    <div className="pattern-visual smooth"></div>
                    <p>Calm, smooth scrolling</p>
                  </div>
                  <div className="pattern-item">
                    <strong>Transaction Pattern:</strong>
                    <p>Checks balance → Reviews history → Initiates transfer</p>
                  </div>
                  <div className="pattern-item">
                    <strong>Timing:</strong>
                    <p>Usually logs in at 10 AM, 2 PM, 8 PM</p>
                  </div>
                  <div className="pattern-item">
                    <strong>Amount Pattern:</strong>
                    <p>Typical transfers: ₹500-₹5,000</p>
                  </div>
                </div>
              </div>

              <div className="behavior-card hacker">
                <h3>Suspicious User Behavior</h3>
                <div className="behavior-pattern">
                  <div className="pattern-item">
                    <strong>Mouse Movement:</strong>
                    <div className="pattern-visual erratic"></div>
                    <p>Nervous, erratic, shaking</p>
                  </div>
                  <div className="pattern-item">
                    <strong>Transaction Pattern:</strong>
                    <p>Immediately clicks "Transfer all money"</p>
                  </div>
                  <div className="pattern-item">
                    <strong>Timing:</strong>
                    <p>3:00 AM login during unusual operating hours</p>
                  </div>
                  <div className="pattern-item">
                    <strong>Amount Pattern:</strong>
                    <p>Tries to transfer entire balance at once</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="explanation-card">
              <h3>AI Model Training</h3>
              <p>
                Our machine learning model tracks each user's unique patterns:
              </p>
              <ul>
                <li><strong>Payment Time:</strong> When you typically make transactions</li>
                <li><strong>Payment Amount:</strong> Your usual transaction ranges</li>
                <li><strong>Payment Frequency:</strong> How often you transfer money</li>
                <li><strong>Mouse Scrolling:</strong> Your unique way of navigating</li>
                <li><strong>Click Patterns:</strong> Speed and sequence of actions</li>
              </ul>
              <p className="highlight">
                Any deviation triggers additional verification to ensure it's really you.
              </p>
            </div>
          </div>

          {/* Feature 8: Alert System */}
          <div className="feature-detail">
            <div className="feature-detail-header">
              <span className="feature-icon-large"><AppIcon name="alert" size={22} /></span>
              <h2>Alert System</h2>
            </div>
            <p className="feature-intro">
              Instant multi-channel notifications the moment suspicious activity is confirmed.
            </p>
            
            <div className="alert-flow">
              <div className="alert-step critical">
                <h3>Security Incident Confirmed</h3>
                <p>System detects unauthorized access attempt</p>
              </div>

              <div className="alert-actions">
                <div className="alert-action">
                  <div className="action-icon"><AppIcon name="phone" size={16} /></div>
                  <h4>GSM Call Alert</h4>
                  <p>Automated call to your registered mobile using GSM IoT module</p>
                </div>

                <div className="alert-action">
                  <div className="action-icon"><AppIcon name="mobile" size={16} /></div>
                  <h4>SMS Notification</h4>
                  <p>Instant text message with intrusion details</p>
                </div>

                <div className="alert-action">
                  <div className="action-icon"><AppIcon name="mail" size={16} /></div>
                  <h4>Email Alert</h4>
                  <p>Detailed security report sent to your email</p>
                </div>

                <div className="alert-action">
                  <div className="action-icon"><AppIcon name="lock" size={16} /></div>
                  <h4>Account Freeze</h4>
                  <p>Payment interface immediately locked until further notice</p>
                </div>

                <div className="alert-action">
                  <div className="action-icon"><AppIcon name="shieldCheck" size={16} /></div>
                  <h4>Law Enforcement</h4>
                  <p>Evidence package sent to cybercrime authorities</p>
                </div>

                <div className="alert-action">
                  <div className="action-icon"><AppIcon name="check" size={16} /></div>
                  <h4>Evidence Collection</h4>
                  <p>IP address, device info, behavior patterns logged</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>

  );
}