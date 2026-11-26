'use client';

import { useState, useEffect } from 'react';
import LoginModal from '../login';

export default function ProxyPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setModalOpen(true);
  };

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
    <div style={{ position: 'fixed', inset: 0, margin: 0, padding: 0 }}>
      <iframe
        src="/api/proxy?url=https://1win.in"
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="1win"
      />
      {/* Unified Login & Registration Overlay Modal */}
      <LoginModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
}
