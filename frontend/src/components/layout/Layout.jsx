import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import OfflineBanner from '../shared/OfflineBanner';
import { ToastProvider } from '../shared/Toast';

const Layout = () => {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-surface-alt">
        <OfflineBanner />
        <Navbar />
        
        <main className="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </main>

        <BottomNav />
      </div>
    </ToastProvider>
  );
};

export default Layout;
