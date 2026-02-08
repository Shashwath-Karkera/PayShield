'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Security() {
  const [securityQuestions, setSecurityQuestions] = useState({
    motherNickname: '',
    firstPetName: ''
  });

  const handleQuestionChange = (e) => {
    setSecurityQuestions({
      ...securityQuestions,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveQuestions = (e) => {
    e.preventDefault();
    console.log('Updating security questions:', securityQuestions);
  };

  return (
    <>
      <div className="page-container">
        <div className="container-narrow">
          <div className="page-header">
            <h1 className="page-title">Security Settings</h1>
            <p className="page-subtitle">
              Manage your security features and protection settings
            </p>
          </div>

          {/* Security Score */}
          <div className="security-score-card">
            <div className="score-content">
              <h2>Your Security Score</h2>
              <div className="score-circle">
                <div className="score-value">98%</div>
              </div>
              <p className="score-status excellent">Excellent Protection</p>
            </div>
            <div className="score-breakdown">
              <h3>Score Breakdown</h3>
              <div className="score-item">
                <span>Password Strength</span>
                <div className="score-bar">
                  <div className="score-fill" style={{width: '100%'}}></div>
                </div>
                <span>100%</span>
              </div>
              <div className="score-item">
                <span>Device Trust</span>
                <div className="score-bar">
                  <div className="score-fill" style={{width: '95%'}}></div>
                </div>
                <span>95%</span>
              </div>
              <div className="score-item">
                <span>Behavioral Pattern</span>
                <div className="score-bar">
                  <div className="score-fill" style={{width: '98%'}}></div>
                </div>
                <span>98%</span>
              </div>
            </div>
          </div>

          {/* Security Layers Status */}
          <div className="section">
            <h2 className="section-title-small">Security Layers Status</h2>
            
            <div className="security-layer">
              <div className="layer-header">
                <div className="layer-info">
                  <span className="layer-icon">🔐</span>
                  <div>
                    <h3>The Spice Lock</h3>
                    <p>Triple-layer password encryption</p>
                  </div>
                </div>
                <span className="status-badge success">Active</span>
              </div>
              <div className="layer-details">
                <div className="detail-item">
                  <strong>Salt:</strong> Unique 16-digit random key
                </div>
                <div className="detail-item">
                  <strong>Pepper:</strong> Master server key applied
                </div>
                <div className="detail-item">
                  <strong>Last Updated:</strong> Feb 1, 2026
                </div>
                <button className="btn btn-secondary btn-small">Change Password</button>
              </div>
            </div>

            <div className="security-layer">
              <div className="layer-header">
                <div className="layer-info">
                  <span className="layer-icon">🪞</span>
                  <div>
                    <h3>The Mirror Maze</h3>
                    <p>Decoy accounts protection</p>
                  </div>
                </div>
                <span className="status-badge success">Active</span>
              </div>
              <div className="layer-details">
                <div className="detail-item">
                  <strong>Decoy Accounts:</strong> 3 active fake accounts
                </div>
                <div className="detail-item">
                  <strong>Success Rate:</strong> 100% of attacks redirected
                </div>
                <div className="detail-item">
                  <strong>Last Triggered:</strong> 3 days ago
                </div>
              </div>
            </div>

            <div className="security-layer">
              <div className="layer-header">
                <div className="layer-info">
                  <span className="layer-icon">🛂</span>
                  <div>
                    <h3>The Digital Passport</h3>
                    <p>Location and device verification</p>
                  </div>
                </div>
                <span className="status-badge success">Active</span>
              </div>
              <div className="layer-details">
                <div className="detail-item">
                  <strong>Current Location:</strong> Bangalore, India
                </div>
                <div className="detail-item">
                  <strong>Allowed Regions:</strong> India, Nepal, Bhutan, France
                </div>
                <div className="detail-item">
                  <strong>Blocked Attempts:</strong> 2 this month
                </div>
              </div>
            </div>

            <div className="security-layer">
              <div className="layer-header">
                <div className="layer-info">
                  <span className="layer-icon">🤫</span>
                  <div>
                    <h3>The Childhood Whisper</h3>
                    <p>Blockchain-secured personal verification</p>
                  </div>
                </div>
                <span className="status-badge success">Active</span>
              </div>
              <div className="layer-details">
                <div className="detail-item">
                  <strong>Storage:</strong> Encrypted on blockchain
                </div>
                <div className="detail-item">
                  <strong>Questions Set:</strong> 2 security questions configured
                </div>
                <div className="detail-item">
                  <strong>Last Verified:</strong> 1 day ago
                </div>
                <button className="btn btn-secondary btn-small" onClick={() => document.getElementById('questions-form').scrollIntoView({behavior: 'smooth'})}>
                  Update Questions
                </button>
              </div>
            </div>

            <div className="security-layer">
              <div className="layer-header">
                <div className="layer-info">
                  <span className="layer-icon">⏱️</span>
                  <div>
                    <h3>The Slow Motion Trap</h3>
                    <p>Intelligent delay during threats</p>
                  </div>
                </div>
                <span className="status-badge success">Ready</span>
              </div>
              <div className="layer-details">
                <div className="detail-item">
                  <strong>Delay Duration:</strong> 30 seconds
                </div>
                <div className="detail-item">
                  <strong>Times Activated:</strong> 1 this month
                </div>
                <div className="detail-item">
                  <strong>Success Rate:</strong> 100% threats neutralized
                </div>
              </div>
            </div>

            <div className="security-layer">
              <div className="layer-header">
                <div className="layer-info">
                  <span className="layer-icon">🧬</span>
                  <div>
                    <h3>The Device DNA</h3>
                    <p>20+ unique device identifiers</p>
                  </div>
                </div>
                <span className="status-badge success">Active</span>
              </div>
              <div className="layer-details">
                <div className="detail-item">
                  <strong>Trusted Devices:</strong> 3 devices registered
                </div>
                <div className="detail-item">
                  <strong>Current Device:</strong> Dell XPS 15 (Trusted)
                </div>
                <div className="detail-item">
                  <strong>Unknown Devices Blocked:</strong> 5 this month
                </div>
                <Link href="/dashboard#devices" className="btn btn-secondary btn-small">
                  Manage Devices
                </Link>
              </div>
            </div>

            <div className="security-layer">
              <div className="layer-header">
                <div className="layer-info">
                  <span className="layer-icon">📹</span>
                  <div>
                    <h3>The Behavior Camera</h3>
                    <p>AI-powered behavioral analytics</p>
                  </div>
                </div>
                <span className="status-badge success">Learning</span>
              </div>
              <div className="layer-details">
                <div className="detail-item">
                  <strong>AI Learning Status:</strong> 87% pattern recognition accuracy
                </div>
                <div className="detail-item">
                  <strong>Patterns Tracked:</strong> Mouse movement, transaction timing, amounts
                </div>
                <div className="detail-item">
                  <strong>Anomalies Detected:</strong> 2 this week
                </div>
              </div>
            </div>

            <div className="security-layer">
              <div className="layer-header">
                <div className="layer-info">
                  <span className="layer-icon">🚨</span>
                  <div>
                    <h3>Alert System</h3>
                    <p>Multi-channel threat notifications</p>
                  </div>
                </div>
                <span className="status-badge success">Active</span>
              </div>
              <div className="layer-details">
                <div className="detail-item">
                  <strong>GSM Alert:</strong> +91-XXXXX-XXXXX
                </div>
                <div className="detail-item">
                  <strong>Email Alert:</strong> john.doe@example.com
                </div>
                <div className="detail-item">
                  <strong>Alerts Sent:</strong> 3 this month
                </div>
                <button className="btn btn-secondary btn-small">Update Contact Info</button>
              </div>
            </div>
          </div>

          {/* Update Security Questions */}
          <div className="section" id="questions-form">
            <h2 className="section-title-small">Update Security Questions</h2>
            <div className="info-box">
              <p>
                <strong>🔒 Blockchain Protection:</strong> These answers are encrypted and stored on blockchain. 
                They will never be accessible from your browser or device.
              </p>
            </div>

            <form onSubmit={handleSaveQuestions} className="security-form">
              <div className="form-group">
                <label htmlFor="motherNickname">What did your mother call you?</label>
                <input
                  type="text"
                  id="motherNickname"
                  name="motherNickname"
                  value={securityQuestions.motherNickname}
                  onChange={handleQuestionChange}
                  placeholder="Enter new answer"
                />
              </div>

              <div className="form-group">
                <label htmlFor="firstPetName">What was your first pet's name?</label>
                <input
                  type="text"
                  id="firstPetName"
                  name="firstPetName"
                  value={securityQuestions.firstPetName}
                  onChange={handleQuestionChange}
                  placeholder="Enter new answer"
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Save Security Questions
              </button>
            </form>
          </div>

          {/* Two-Factor Authentication */}
          <div className="section">
            <h2 className="section-title-small">Additional Security Options</h2>
            
            <div className="option-card">
              <div className="option-info">
                <h3>📱 Two-Factor Authentication (2FA)</h3>
                <p>Add an extra layer of security with SMS or authenticator app</p>
              </div>
              <button className="btn btn-secondary">Enable 2FA</button>
            </div>

            <div className="option-card">
              <div className="option-info">
                <h3>🔔 Transaction Notifications</h3>
                <p>Receive instant alerts for every transaction</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="option-card">
              <div className="option-info">
                <h3>🌍 Geographic Restrictions</h3>
                <p>Automatically block transactions from unauthorized countries</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="option-card">
              <div className="option-info">
                <h3>⏰ Time-Based Restrictions</h3>
                <p>Block transactions during unusual hours (e.g., 12 AM - 6 AM)</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="section danger-zone">
            <h2 className="section-title-small">Danger Zone</h2>
            <div className="danger-card">
              <div className="danger-info">
                <h3>🔄 Reset All Security Settings</h3>
                <p>This will reset all security features to default settings</p>
              </div>
              <button className="btn btn-danger">Reset Settings</button>
            </div>

            <div className="danger-card">
              <div className="danger-info">
                <h3>🗑️ Delete Account</h3>
                <p>Permanently delete your PayShield account and all data</p>
              </div>
              <button className="btn btn-danger">Delete Account</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
