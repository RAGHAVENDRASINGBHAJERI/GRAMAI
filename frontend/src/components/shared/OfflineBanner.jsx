import { motion, AnimatePresence } from 'framer-motion';
import { useOffline } from '../../hooks/useOffline';
import { Wifi, WifiOff } from 'lucide-react';

const OfflineBanner = () => {
  const { isOnline, wasOffline } = useOffline();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -60 }}
          animate={{ y: 0 }}
          exit={{ y: -60 }}
          className="offline-banner flex items-center justify-center gap-2"
        >
          <WifiOff className="w-4 h-4" />
          <span>You are offline. Using cached data.</span>
        </motion.div>
      )}
      {wasOffline && isOnline && (
        <motion.div
          initial={{ y: -60 }}
          animate={{ y: 0 }}
          exit={{ y: -60 }}
          className="fixed top-0 left-0 right-0 z-50 bg-success text-white text-center py-2 px-4 text-sm font-medium flex items-center justify-center gap-2"
        >
          <Wifi className="w-4 h-4" />
          <span>Back online! Data is syncing.</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineBanner;
