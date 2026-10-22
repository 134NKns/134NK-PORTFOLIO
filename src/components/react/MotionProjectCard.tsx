import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  ariaLabelledBy: string;
  children: React.ReactNode;
}

export default function MotionProjectCard({ ariaLabelledBy, children }: Props) {
  return (
    <motion.article
      className="project-sample"
      aria-labelledby={ariaLabelledBy}
      initial={false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      whileHover={{
        y: -4,
        borderColor: '#4d72a4',
        boxShadow: '0 8px 24px rgba(13, 22, 38, 0.6), 0 0 16px rgba(141, 191, 255, 0.1)',
        transition: { duration: 0.2 },
      }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.article>
  );
}
