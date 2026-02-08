'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Dashboard() {
  const [activeAccount, setActiveAccount] = useState('real');

  return (
    <>
      <div className="dashboard-container">
        <div className="dashboard-sidebar">
          <div className="user-profile">
            <div className="user-avatar">👤</div>
            <h3>John Doe</h3>
            <p>john.doe@example.com</p>
          </div>

          <nav className="dashboard-nav">
            <a href="#overview" className="nav-item active">
              <span className="nav-icon">📊</span>
              Overview
            </a>
            <a href="#transactions" className="nav-item">
              <span className="nav-icon">💳</span>
              Transactions
            </a>
            <Link href="/security" className="nav-item">
              <span className="nav-icon">🔒</span>
              Security
            </Link>
            <a href="#alerts" className="nav-item">
              <span className="nav-icon">🚨</span>
              Alerts
            </a>
            <a href="#devices" className="nav-item">
              <span className="nav-icon">📱</span>
              Devices
            </a>
            <a href="#settings" className="nav-item">
              <span className="nav-icon">⚙️</span>
              Settings
            </a>
          </nav>
        </div>

        <div className="dashboard-content">
          <div className="dashboard-header">
            <h1>Dashboard</h1>
            <div className="header-actions">
              <button className="btn btn-secondary btn-small">
                💸 Make Payment
              </button>
              <button className="btn btn-primary btn-small">
                ➕ Add Money
              </button>
            </div>
          </div>

          {/* Account Balance Section */}
          <div className="dashboard-grid">
            <div className="balance-card primary">
              <div className="balance-header">
                <h3>Main Balance</h3>
                <span className="balance-badge real">🔐 Protected</span>
              </div>
              <div className="balance-amount">₹1,25,430.00</div>
              <div className="balance-footer">
                <span className="balance-info">Last updated: 2 mins ago</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📈</div>
              <div className="stat-content">
                <h4>This Month</h4>
                <div className="stat-value">₹25,600</div>
                <div className="stat-label">Total Spent</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <h4>Security Score</h4>
                <div className="stat-value">98%</div>
                <div className="stat-label stat-success">Excellent</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🚨</div>
              <div className="stat-content">
                <h4>Threats Blocked</h4>
                <div className="stat-value">3</div>
                <div className="stat-label">This week</div>
              </div>
            </div>
          </div>

          {/* Active Protection Features */}
          <div className="section">
            <h2 className="section-title-small">Active Protection</h2>
            <div className="protection-grid">
              <div className="protection-card active">
                <div className="protection-icon">🔐</div>
                <h4>Spice Lock</h4>
                <span className="status-badge success">Active</span>
                <p>Your password is protected with salt & pepper encryption</p>
              </div>

              <div className="protection-card active">
                <div className="protection-icon">🪞</div>
                <h4>Mirror Maze</h4>
                <span className="status-badge success">Active</span>
                <p>3 decoy accounts are protecting your real balance</p>
              </div>

              <div className="protection-card active">
                <div className="protection-icon">🛂</div>
                <h4>Digital Passport</h4>
                <span className="status-badge success">Active</span>
                <p>Location: Bangalore, India | Device: Trusted</p>
              </div>

              <div className="protection-card active">
                <div className="protection-icon">🧬</div>
                <h4>Device DNA</h4>
                <span className="status-badge success">Active</span>
                <p>Your device signature is verified and trusted</p>
              </div>

              <div className="protection-card active">
                <div className="protection-icon">📹</div>
                <h4>Behavior Camera</h4>
                <span className="status-badge success">Learning</span>
                <p>AI is monitoring your usage patterns</p>
              </div>

              <div className="protection-card active">
                <div className="protection-icon">🚨</div>
                <h4>Alert System</h4>
                <span className="status-badge success">Ready</span>
                <p>GSM alerts configured for +91-XXXXX-XXXXX</p>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="section">
            <h2 className="section-title-small">Recent Transactions</h2>
            <div className="transactions-table">
              <div className="transaction-row">
                <div className="transaction-icon credit">↓</div>
                <div className="transaction-details">
                  <h4>Salary Credit</h4>
                  <p>ABC Corporation</p>
                </div>
                <div className="transaction-meta">
                  <span className="transaction-date">Feb 5, 2026</span>
                  <span className="transaction-location">Bangalore, IN</span>
                </div>
                <div className="transaction-amount credit">+₹50,000.00</div>
              </div>

              <div className="transaction-row">
                <div className="transaction-icon debit">↑</div>
                <div className="transaction-details">
                  <h4>Online Shopping</h4>
                  <p>Amazon India</p>
                </div>
                <div className="transaction-meta">
                  <span className="transaction-date">Feb 4, 2026</span>
                  <span className="transaction-location">Bangalore, IN</span>
                </div>
                <div className="transaction-amount debit">-₹2,499.00</div>
              </div>

              <div className="transaction-row">
                <div className="transaction-icon debit">↑</div>
                <div className="transaction-details">
                  <h4>UPI Payment</h4>
                  <p>To: Friend Name</p>
                </div>
                <div className="transaction-meta">
                  <span className="transaction-date">Feb 3, 2026</span>
                  <span className="transaction-location">Bangalore, IN</span>
                </div>
                <div className="transaction-amount debit">-₹1,500.00</div>
              </div>

              <div className="transaction-row">
                <div className="transaction-icon debit">↑</div>
                <div className="transaction-details">
                  <h4>Restaurant Bill</h4>
                  <p>Barbeque Nation</p>
                </div>
                <div className="transaction-meta">
                  <span className="transaction-date">Feb 2, 2026</span>
                  <span className="transaction-location">Bangalore, IN</span>
                </div>
                <div className="transaction-amount debit">-₹3,200.00</div>
              </div>
            </div>
          </div>

          {/* Security Alerts */}
          <div className="section">
            <h2 className="section-title-small">Recent Security Alerts</h2>
            <div className="alerts-list">
              <div className="alert-card blocked">
                <div className="alert-header">
                  <span className="alert-icon">🚫</span>
                  <div className="alert-title">
                    <h4>Suspicious Login Blocked</h4>
                    <span className="alert-time">2 hours ago</span>
                  </div>
                </div>
                <div className="alert-body">
                  <p>Login attempt from Moscow, Russia was blocked</p>
                  <div className="alert-details">
                    <span>IP: 185.220.101.45</span>
                    <span>Device: Unknown Android</span>
                    <span>Time: 3:24 AM</span>
                  </div>
                </div>
              </div>

              <div className="alert-card info">
                <div className="alert-header">
                  <span className="alert-icon">ℹ️</span>
                  <div className="alert-title">
                    <h4>New Device Detected</h4>
                    <span className="alert-time">1 day ago</span>
                  </div>
                </div>
                <div className="alert-body">
                  <p>Login from new device verified successfully</p>
                  <div className="alert-details">
                    <span>Device: iPhone 14</span>
                    <span>Location: Bangalore, IN</span>
                    <span>Verified with security questions</span>
                  </div>
                </div>
              </div>

              <div className="alert-card blocked">
                <div className="alert-header">
                  <span className="alert-icon">⚠️</span>
                  <div className="alert-title">
                    <h4>Unusual Transaction Pattern</h4>
                    <span className="alert-time">3 days ago</span>
                  </div>
                </div>
                <div className="alert-body">
                  <p>Attempt to transfer entire balance detected and stopped</p>
                  <div className="alert-details">
                    <span>Amount: ₹1,25,000</span>
                    <span>Triggered: Slow Motion Trap</span>
                    <span>Status: Transaction Prevented</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trusted Devices */}
          <div className="section">
            <h2 className="section-title-small">Trusted Devices</h2>
            <div className="devices-grid">
              <div className="device-card current">
                <div className="device-icon">💻</div>
                <h4>Windows Laptop</h4>
                <p className="device-name">Dell XPS 15</p>
                <div className="device-meta">
                  <span className="device-badge">Current Device</span>
                  <span>Last used: Now</span>
                  <span>Location: Bangalore, IN</span>
                </div>
              </div>

              <div className="device-card">
                <div className="device-icon">📱</div>
                <h4>iPhone 14</h4>
                <p className="device-name">iOS 17.2</p>
                <div className="device-meta">
                  <span>Last used: 2 days ago</span>
                  <span>Location: Bangalore, IN</span>
                  <button className="btn-link">Remove</button>
                </div>
              </div>

              <div className="device-card">
                <div className="device-icon">🖥️</div>
                <h4>MacBook Pro</h4>
                <p className="device-name">macOS Sonoma</p>
                <div className="device-meta">
                  <span>Last used: 5 days ago</span>
                  <span>Location: Mumbai, IN</span>
                  <button className="btn-link">Remove</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
