import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import OfflineBanner from '../shared/OfflineBanner';
import { ToastProvider } from '../shared/Toast';

const Layout = () => {
  const location = useLocation();

  return (
    <ToastProvider>
      <div className="min-h-screen bg-transparent">
        <OfflineBanner />
        <Navbar />
        
        <main className="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-6 relative origin-top">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-full h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        <BottomNav />
      </div>
    </ToastProvider>
  );
};

export default Layout;
