'use client';

import Link from 'next/link';
import { useState } from 'react';
import AppIcon from '@/components/AppIcon';

export default function Register() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    motherNickname: '',
    firstPetName: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else {
      // Handle registration logic here
      console.log('Registration data:', formData);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
      <div className="auth-container">
        <div className="auth-box register-box">
          <div className="auth-header">
            <div className="auth-icon"><AppIcon name="shieldCheck" size={24} /></div>
            <h1>Create Your Account</h1>
            <p>Set up your account with enterprise-grade protection controls.</p>
          </div>

          <div className="step-indicator">
            <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
            <div className="step-line"></div>
            <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {step === 1 && (
              <>
                <h3 className="form-section-title">Basic Information</h3>
                
                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
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
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 XXXXX XXXXX"
                    required
                  />
                  <small className="form-hint">Required for GSM security alerts</small>
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    required
                  />
                  <small className="form-hint">Will be encrypted with salt & pepper</small>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    required
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h3 className="form-section-title">Security Questions</h3>
                <p className="security-note">
                  <span className="note-icon"><AppIcon name="lock" size={16} /></span>
                  These answers will be encrypted and stored on blockchain. They will never 
                  be stored on your device or browser.
                </p>

                <div className="form-group">
                  <label htmlFor="motherNickname">What did your mother call you?</label>
                  <input
                    type="text"
                    id="motherNickname"
                    name="motherNickname"
                    value={formData.motherNickname}
                    onChange={handleChange}
                    placeholder="Enter the nickname"
                    required
                  />
                  <small className="form-hint">Example: "Chintu", "Sweetheart", etc.</small>
                </div>

                <div className="form-group">
                  <label htmlFor="firstPetName">What was your first pet's name?</label>
                  <input
                    type="text"
                    id="firstPetName"
                    name="firstPetName"
                    value={formData.firstPetName}
                    onChange={handleChange}
                    placeholder="Enter pet name"
                    required
                  />
                  <small className="form-hint">Example: "Tommy", "Bella", etc.</small>
                </div>

                <div className="info-box">
                  <h4><AppIcon name="scan" size={16} className="inline-icon" /> The Childhood Whisper</h4>
                  <p>
                    During suspicious login attempts, you'll be asked to combine these answers 
                    to prove your identity. Only you know these personal details!
                  </p>
                </div>

                <button 
                  type="button" 
                  onClick={() => setStep(1)} 
                  className="btn btn-secondary btn-full"
                >
                  Back
                </button>
              </>
            )}

            <button type="submit" className="btn btn-primary btn-full">
              {step === 1 ? 'Continue to Security Questions' : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link href="/login" className="text-link-bold">
                Login here
              </Link>
            </p>
          </div>

          {step === 1 && (
            <div className="security-features-list">
              <h4>Your account will be protected with:</h4>
              <div className="mini-features">
                <span className="mini-feature"><AppIcon name="lock" size={14} /> Spice Lock</span>
                <span className="mini-feature"><AppIcon name="shield" size={14} /> Mirror Maze</span>
                <span className="mini-feature"><AppIcon name="globe" size={14} /> Digital Passport</span>
                <span className="mini-feature"><AppIcon name="dna" size={14} /> Device DNA</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
