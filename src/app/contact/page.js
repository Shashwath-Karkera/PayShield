'use client';

import { useState } from 'react';
import AppIcon from '@/components/AppIcon';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Contact form submitted:', formData);
    // Handle form submission
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
      <div className="page-container">
        <div className="container-narrow">
          <div className="page-header">
            <h1 className="page-title">Contact Us</h1>
            <p className="page-subtitle">
              Have questions? We're here to help. Reach out to our team anytime.
            </p>
          </div>

          <div className="contact-grid">
            {/* Contact Form */}
            <div className="contact-form-section">
              <h2>Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="security">Security Question</option>
                    <option value="technical">Technical Support</option>
                    <option value="billing">Billing & Payments</option>
                    <option value="feature">Feature Request</option>
                    <option value="partnership">Business Partnership</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help you..."
                    rows="6"
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary btn-full">
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="contact-info-section">
              <h2>Get In Touch</h2>
              
              <div className="contact-method">
                <div className="method-icon"><AppIcon name="mail" size={18} /></div>
                <div className="method-content">
                  <h3>Email</h3>
                  <p>support@payshield.com</p>
                  <small>We'll respond within 24 hours</small>
                </div>
              </div>

              <div className="contact-method">
                <div className="method-icon"><AppIcon name="phone" size={18} /></div>
                <div className="method-content">
                  <h3>Phone</h3>
                  <p>+91 1800-123-4567</p>
                  <small>Mon-Fri, 9 AM - 6 PM IST</small>
                </div>
              </div>

              <div className="contact-method">
                <div className="method-icon"><AppIcon name="users" size={18} /></div>
                <div className="method-content">
                  <h3>Live Chat</h3>
                  <p>Available 24/7</p>
                  <button className="btn btn-secondary btn-small">Start Chat</button>
                </div>
              </div>

              <div className="contact-method">
                <div className="method-icon"><AppIcon name="location" size={18} /></div>
                <div className="method-content">
                  <h3>Office</h3>
                  <p>
                    PayShield Headquarters<br />
                    Koramangala, Bangalore<br />
                    Karnataka 560034, India
                  </p>
                </div>
              </div>

              {/* Social Media */}
              <div className="social-links">
                <h3>Follow Us</h3>
                <div className="social-icons">
                  <a href="#" className="social-icon"><AppIcon name="building" size={14} /> LinkedIn</a>
                  <a href="#" className="social-icon"><AppIcon name="globe" size={14} /> X</a>
                  <a href="#" className="social-icon"><AppIcon name="users" size={14} /> Facebook</a>
                  <a href="#" className="social-icon"><AppIcon name="camera" size={14} /> Instagram</a>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="section">
            <h2 className="section-title-small">Frequently Asked Questions</h2>
            <div className="faq-list">
              <div className="faq-item">
                <h3>How secure is PayShield?</h3>
                <p>
                  PayShield employs 7 layers of advanced security including military-grade encryption, 
                  AI-powered behavioral analytics, blockchain storage, and real-time threat detection. 
                  We maintain a 99.9% threat detection rate.
                </p>
              </div>

              <div className="faq-item">
                <h3>What happens if my account is compromised?</h3>
                <p>
                  Our system immediately detects suspicious activity and activates multiple protection 
                  mechanisms: redirecting attackers to decoy accounts, freezing your real account, 
                  sending you instant alerts via GSM/SMS, and collecting evidence for law enforcement.
                </p>
              </div>

              <div className="faq-item">
                <h3>How does the Mirror Maze work?</h3>
                <p>
                  We create 3 fake accounts with realistic balances alongside your real account. 
                  Unauthorized access attempts are automatically redirected to these decoy accounts, 
                  making attackers believe they've succeeded while your actual funds remain protected.
                </p>
              </div>

              <div className="faq-item">
                <h3>Can I use PayShield internationally?</h3>
                <p>
                  PayShield is optimized for UPI transactions, which work in India, Nepal, Bhutan, 
                  and France. Our Digital Passport feature automatically blocks suspicious transactions 
                  from other countries to protect your account.
                </p>
              </div>

              <div className="faq-item">
                <h3>What is Device DNA?</h3>
                <p>
                  Device DNA is our unique fingerprinting technology that identifies your device using 
                  20+ characteristics like screen resolution, browser signature, timezone, hardware 
                  markers, and more. This ensures only your trusted devices can access your account.
                </p>
              </div>

              <div className="faq-item">
                <h3>How do I add a new trusted device?</h3>
                <p>
                  When you login from a new device, our system will ask you to answer your security 
                  questions (The Childhood Whisper) to verify your identity. Once verified, the device 
                  is automatically added to your trusted devices list.
                </p>
              </div>

              <div className="faq-item">
                <h3>What is the Slow Motion Trap?</h3>
                <p>
                  When suspicious activity is detected, we deliberately slow down the transaction by 
                  30 seconds. During this time, we alert you, collect evidence, notify authorities, 
                  and show the attacker a fake success message - all while preventing any actual 
                  transfer of funds.
                </p>
              </div>

              <div className="faq-item">
                <h3>Is my personal data safe?</h3>
                <p>
                  Absolutely. Your security questions are encrypted and stored on blockchain, never 
                  on your device or browser. Your passwords go through salt & pepper encryption. We 
                  use AES-256 encryption for all sensitive data and comply with international data 
                  protection regulations.
                </p>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="emergency-section">
            <div className="emergency-icon"><AppIcon name="alert" size={22} /></div>
            <h2>Security Incident Hotline</h2>
            <p>
              If you suspect unauthorized access to your account or notice suspicious activity, 
              contact our 24/7 security hotline immediately:
            </p>
            <div className="emergency-number">+91 1800-SECURE-NOW</div>
            <small>Available 24/7 for urgent security matters</small>
          </div>
        </div>
      </div>
    </>
  );
}
