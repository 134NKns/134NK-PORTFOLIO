import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playClick, playBeep } from '../../lib/retrosound';

interface Props {
  id: string;
  title: string;
  ariaLabelledBy: string;
  children: React.ReactNode;
}

export default function RetroWindow({ id, title, ariaLabelledBy, children }: Props) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  const handleMinimize = () => {
    setIsMinimized(prev => !prev);
    playClick();
  };

  const handleMaximize = () => {
    setIsMaximized(prev => !prev);
    playClick();
  };

  const handleClose = () => {
    playBeep(240, 'square', 0.12, 0.08);
    // Dispatch a custom event for the retro toast
    window.dispatchEvent(
      new CustomEvent('retro-toast', {
        detail: { message: 'SYSTEM WARNING: CORE RECORD CANNOT BE TERMINATED.' },
      })
    );
  };

  return (
    <motion.section
      id={id}
      layout
      aria-labelledby={ariaLabelledBy}
      className={`profile-window ${isMaximized ? 'maximized' : ''}`}
      initial={false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
        layout: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
      }}
    >
      <div className="window-title">
        <span>{title}</span>
        <div className="window-controls">
          <motion.button
            type="button"
            className="win-btn win-min"
            aria-label={`Minimize ${title}`}
            onClick={handleMinimize}
            whileHover={{ scale: 1.15, backgroundColor: '#2f4460' }}
            whileTap={{ scale: 0.9 }}
          >
            _
          </motion.button>
          <motion.button
            type="button"
            className="win-btn win-max"
            aria-label={`Maximize ${title}`}
            onClick={handleMaximize}
            whileHover={{ scale: 1.15, backgroundColor: '#2f4460' }}
            whileTap={{ scale: 0.9 }}
          >
            □
          </motion.button>
          <motion.button
            type="button"
            className="win-btn win-close"
            aria-label={`Close ${title}`}
            onClick={handleClose}
            whileHover={{ scale: 1.15, backgroundColor: '#c53030' }}
            whileTap={{ scale: 0.9 }}
          >
            ×
          </motion.button>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {!isMinimized && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
