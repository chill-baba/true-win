'use client';

import { useState } from 'react';
import LoginModal from '../login';

export default function LoginPage() {
  const [modalOpen, setModalOpen] = useState(true);

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
        initialMode="login"
      />
    </div>
  );
}
