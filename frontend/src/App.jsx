import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from './store/authStore';
import ProtectedRoute from './router/ProtectedRoute';
import AdminRoute from './router/AdminRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import Chat from './pages/Chat';
import Agriculture from './pages/Agriculture';
import Schemes from './pages/Schemes';
import Healthcare from './pages/Healthcare';
import MandiPrices from './pages/MandiPrices';
import Community from './pages/Community';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';

// Layout & UI
import Layout from './components/layout/Layout';
import AnimatedBackground from './components/ui/AnimatedBackground';

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -20, scale: 0.98 }}
    transition={{ duration: 0.35, ease: 'easeOut' }}
    className="min-h-screen"
  >
    {children}
  </motion.div>
);

function App() {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  return (
    <>
      <AnimatedBackground />
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          {/* Public routes */}
          <Route path="/" element={<PageWrapper><Landing /></PageWrapper>} />
          <Route path="/login" element={<PageWrapper>{isAuthenticated ? <Navigate to="/chat" /> : <Login />}</PageWrapper>} />
          <Route path="/register" element={<PageWrapper>{isAuthenticated ? <Navigate to="/chat" /> : <Register />}</PageWrapper>} />
          <Route path="/forgot-password" element={<PageWrapper><ForgotPassword /></PageWrapper>} />

          {/* Protected routes with layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/chat" element={<Chat />} />
              <Route path="/agriculture" element={<Agriculture />} />
              <Route path="/schemes" element={<Schemes />} />
              <Route path="/healthcare" element={<Healthcare />} />
              <Route path="/mandi-prices" element={<MandiPrices />} />
              <Route path="/community" element={<Community />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Admin routes */}
          <Route element={<AdminRoute />}>
            <Route element={<Layout />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<PageWrapper><Navigate to="/" replace /></PageWrapper>} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default App;
