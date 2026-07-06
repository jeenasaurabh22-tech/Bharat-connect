import React from 'react';
import { motion } from 'framer-motion';
const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6 }}
    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    style={{ width: '100%' }}
  >
    {children}
  </motion.div>
);
export default PageTransition;