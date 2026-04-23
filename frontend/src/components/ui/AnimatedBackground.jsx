import { motion } from 'framer-motion';
import { useSettingsStore } from '../../store/settingsStore';

const AnimatedBackground = () => {
  const { theme } = useSettingsStore();

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none w-full h-full">
      <motion.div
        animate={{
          backgroundColor: theme === 'dark' ? '#151521' : '#F4F6F8',
        }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="absolute inset-0 w-full h-full"
      />

      {/* Decorative gradient blobs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: theme === 'dark' ? [0.1, 0.2, 0.1] : [0.3, 0.5, 0.3],
          x: [0, 50, 0],
          y: [0, -30, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full mix-blend-multiply filter blur-[100px]"
        style={{ backgroundColor: theme === 'dark' ? '#2D7A3A' : '#C8E6C9' }}
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: theme === 'dark' ? [0.1, 0.15, 0.1] : [0.2, 0.4, 0.2],
          x: [0, -40, 0],
          y: [0, 50, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear', delay: 2 }}
        className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full mix-blend-multiply filter blur-[120px]"
        style={{ backgroundColor: theme === 'dark' ? '#1A6B9A' : '#BBDEFB' }}
      />
    </div>
  );
};

export default AnimatedBackground;
