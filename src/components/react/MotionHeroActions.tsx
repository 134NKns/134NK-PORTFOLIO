import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  resumeSrc: string;
}

export default function MotionHeroActions({ resumeSrc }: Props) {
  return (
    <motion.div
      className="hero-actions"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.a
        className="hero-resume-btn"
        href={resumeSrc}
        data-title="Nachthaphong-Resume.webp"
        aria-haspopup="dialog"
        aria-controls="attachment-dialog"
        aria-label="View Nachthaphong Saengbut Resume"
        whileHover={{
          scale: 1.04,
          y: -2,
          backgroundColor: '#203c68',
          borderColor: '#8dbfff',
          boxShadow: '0 4px 16px rgba(141, 191, 255, 0.25)',
        }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z" />
        </svg>
        VIEW RESUME / CV <span aria-hidden="true">↗</span>
      </motion.a>
      <motion.a
        className="scroll-cue"
        href="#about"
        whileHover={{ y: 3 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
      >
        EXPLORE PROFILE <span aria-hidden="true">↓</span>
      </motion.a>
    </motion.div>
  );
}
