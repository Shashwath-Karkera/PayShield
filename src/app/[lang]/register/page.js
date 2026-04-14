'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AppIcon from '@/components/AppIcon';

export default function Register() {
  const params = useParams();
  const currentLang = params?.lang || 'en';
  const [dict, setDict] = useState({});
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
  const registerDict = dict.auth?.register || {};
  const commonDict = dict.common || {};

  useEffect(() => {
    import(`@/i18n/dictionaries/${currentLang}.json`)
      .then((module) => setDict(module.default || {}))
      .catch(() => import('@/i18n/dictionaries/en.json').then((m) => setDict(m.default || {})));
  }, [currentLang]);

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
            <h1>{registerDict.title || 'Create Your Account'}</h1>
            <p>{registerDict.subtitle || 'Set up your account with enterprise-grade protection controls.'}</p>
          </div>

          <div className="step-indicator">
            <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
            <div className="step-line"></div>
            <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {step === 1 && (
              <>
                <h3 className="form-section-title">{registerDict.step1Title || 'Basic Information'}</h3>
                
                <div className="form-group">
                  <label htmlFor="fullName">{registerDict.fullNameLabel || 'Full Name'}</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder={registerDict.fullNamePlaceholder || 'Enter your full name'}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">{registerDict.emailLabel || 'Email Address'}</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={registerDict.emailPlaceholder || 'Enter your email'}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">{registerDict.phoneLabel || 'Phone Number'}</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={registerDict.phonePlaceholder || '+91 XXXXX XXXXX'}
                    required
                  />
                  <small className="form-hint">{registerDict.phoneHint || 'Required for GSM security alerts'}</small>
                </div>

                <div className="form-group">
                  <label htmlFor="password">{registerDict.passwordLabel || 'Password'}</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={registerDict.passwordPlaceholder || 'Create a strong password'}
                    required
                  />
                  <small className="form-hint">{registerDict.passwordHint || 'Will be encrypted with salt & pepper'}</small>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">{registerDict.confirmPasswordLabel || 'Confirm Password'}</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder={registerDict.confirmPasswordPlaceholder || 'Re-enter your password'}
                    required
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h3 className="form-section-title">{registerDict.step2Title || 'Security Questions'}</h3>
                <p className="security-note">
                  <span className="note-icon"><AppIcon name="lock" size={16} /></span>
                  {registerDict.securityInfo || 'These answers will be encrypted and stored on blockchain. They will never be stored on your device or browser.'}
                </p>

                <div className="form-group">
                  <label htmlFor="motherNickname">{registerDict.question1Label || 'What did your mother call you?'}</label>
                  <input
                    type="text"
                    id="motherNickname"
                    name="motherNickname"
                    value={formData.motherNickname}
                    onChange={handleChange}
                    placeholder={registerDict.question1Placeholder || 'Enter the nickname'}
                    required
                  />
                  <small className="form-hint">{registerDict.question1Example || 'Example: "Chintu", "Sweetheart", etc.'}</small>
                </div>

                <div className="form-group">
                  <label htmlFor="firstPetName">{registerDict.question2Label || "What was your first pet's name?"}</label>
                  <input
                    type="text"
                    id="firstPetName"
                    name="firstPetName"
                    value={formData.firstPetName}
                    onChange={handleChange}
                    placeholder={registerDict.question2Placeholder || 'Enter pet name'}
                    required
                  />
                  <small className="form-hint">{registerDict.question2Example || 'Example: "Tommy", "Bella", etc.'}</small>
                </div>

                <div className="info-box">
                  <h4><AppIcon name="scan" size={16} className="inline-icon" /> {registerDict.whisperTitle || 'The Childhood Whisper'}</h4>
                  <p>
                    {registerDict.whisperText || "During suspicious login attempts, you'll be asked to combine these answers to prove your identity. Only you know these personal details!"}
                  </p>
                </div>

                <button 
                  type="button" 
                  onClick={() => setStep(1)} 
                  className="btn btn-secondary btn-full"
                >
                  {commonDict.back || 'Back'}
                </button>
              </>
            )}

            <button type="submit" className="btn btn-primary btn-full">
              {step === 1
                ? (registerDict.continueButton || 'Continue to Security Questions')
                : (registerDict.createAccountButton || 'Create Account')}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              {registerDict.haveAccount || 'Already have an account?'}{' '}
              <Link href={`/${currentLang}/login`} className="text-link-bold">
                {registerDict.loginHere || 'Login here'}
              </Link>
            </p>
          </div>

          {step === 1 && (
            <div className="security-features-list">
              <h4>{registerDict.protectionTitle || 'Your account will be protected with:'}</h4>
              <div className="mini-features">
                <span className="mini-feature"><AppIcon name="lock" size={14} /> {registerDict.spiceLock || 'Spice Lock'}</span>
                <span className="mini-feature"><AppIcon name="shield" size={14} /> {registerDict.mirrorMaze || 'Mirror Maze'}</span>
                <span className="mini-feature"><AppIcon name="globe" size={14} /> {registerDict.digitalPassport || 'Digital Passport'}</span>
                <span className="mini-feature"><AppIcon name="dna" size={14} /> {registerDict.deviceDNA || 'Device DNA'}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
