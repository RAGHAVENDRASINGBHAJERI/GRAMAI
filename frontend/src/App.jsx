import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
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
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';

// Layout
import Layout from './components/layout/Layout';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/chat" /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/chat" /> : <Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected routes with layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/chat" element={<Chat />} />
            <Route path="/agriculture" element={<Agriculture />} />
            <Route path="/schemes" element={<Schemes />} />
            <Route path="/healthcare" element={<Healthcare />} />
            <Route path="/mandi-prices" element={<MandiPrices />} />
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
