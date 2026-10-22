import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  children: React.ReactNode;
}

export default function MotionStackChip({ children }: Props) {
  return (
    <motion.li
      className="stack-chip"
      whileHover={{
        scale: 1.06,
        y: -3,
        borderColor: '#8dbfff',
        backgroundColor: '#192b45',
        boxShadow: '0 4px 12px rgba(141, 191, 255, 0.15)',
      }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      {children}
    </motion.li>
  );
}
