'use client';

import { useState, useEffect } from 'react';
import LoginModal from '../login';

export default function LoginPage() {
  const [modalOpen, setModalOpen] = useState(true);
  const [initialMode, setInitialMode] = useState<'login' | 'register' | 'recovery'>('login');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('auth') || params.get('mode') || params.get('open');
    if (mode === 'recovery' || mode === 'forgot' || mode === 'forgot-password') {
      setInitialMode('recovery');
    } else if (mode === 'register' || mode === 'registration') {
      setInitialMode('register');
    } else {
      setInitialMode('login');
    }
  }, []);

  const handleClose = () => {
    // If closed, redirect to home or keep open
    window.location.href = '/';
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#121820',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '16px 0 0',
      }}
    >
      <LoginModal
        isOpen={modalOpen}
        onClose={handleClose}
        initialMode={initialMode}
      />
    </div>
  );
}
