import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RetroToast() {
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ message: string }>;
      clearTimeout(timer);
      setToast({ id: Date.now(), message: customEvent.detail.message });
      timer = setTimeout(() => {
        setToast(null);
      }, 3000);
    };

    window.addEventListener('retro-toast', handler);
    return () => {
      window.removeEventListener('retro-toast', handler);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div style={{ position: 'fixed', bottom: '60px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999, pointerEvents: 'none' }}>
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{
              background: '#0d1626',
              border: '1px solid #8dbfff',
              boxShadow: '0 0 16px rgba(141, 191, 255, 0.25), inset 0 0 8px rgba(141, 191, 255, 0.15)',
              color: '#edf3ff',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              padding: '10px 18px',
              borderRadius: '3px',
              letterSpacing: '0.06em',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              pointerEvents: 'auto',
            }}
          >
            <span style={{ color: '#8dbfff' }}>[!]</span>
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
