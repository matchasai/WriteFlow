import { motion } from 'motion/react';

const RouteTransition = ({ children }) => {
  const MotionDiv = motion.div;
  return (
    <MotionDiv initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35, ease: 'easeOut' }}>
      {children}
    </MotionDiv>
  );
};

export default RouteTransition;