import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useAppTranslation } from '../../hooks/useTranslation';
import {
  Menu,
  X,
  MessageCircle,
  Sprout,
  FileText,
  Heart,
  TrendingUp,
  User,
  Shield,
  LogOut,
  Globe,
  Moon,
  Store,
  Sun,
} from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useSettingsStore();
  const { t, currentLanguage, changeLanguage, languages } = useAppTranslation();
  const location = useLocation();

  const navItems = [
    { path: '/chat', label: t('nav.chat'), icon: MessageCircle },
    { path: '/agriculture', label: t('nav.agriculture'), icon: Sprout },
    { path: '/schemes', label: t('nav.schemes'), icon: FileText },
    { path: '/healthcare', label: t('nav.healthcare'), icon: Heart },
    { path: '/mandi-prices', label: t('nav.mandi'), icon: TrendingUp },
    { path: '/community', label: 'Marketplace', icon: Store },
    { path: '/profile', label: t('nav.profile'), icon: User },
  ];

  if (user?.role === 'admin') {
    navItems.push({ path: '/admin', label: t('nav.admin'), icon: Shield });
  }

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-surface shadow-sm sticky top-0 z-40" style={{ backgroundColor: 'var(--color-surface)' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-text-primary hidden sm:block">
              {t('app.name')}
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-primary-50 text-primary'
                    : 'text-text-secondary hover:bg-gray-100 hover:text-text-primary'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200 text-text-secondary"
              whileTap={{ scale: 0.9 }}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              <motion.div
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5 text-yellow-400" />
                )}
              </motion.div>
            </motion.button>

            {/* Language Switcher */}
            <div className="relative group">
              <button className="flex items-center gap-1 px-3 py-2 rounded-full text-sm text-text-secondary hover:bg-gray-100 transition-all duration-200">
                <Globe className="w-4 h-4" />
                <span className="hidden sm:block">
                  {languages.find((l) => l.code === currentLanguage)?.name || 'English'}
                </span>
              </button>
              <div className="absolute right-0 mt-1 w-36 bg-surface rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50"
                style={{ backgroundColor: 'var(--color-surface)' }}>
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      changeLanguage(lang.code);
                      // Sync with chat store
                      import('../../store/chatStore').then(({ useChatStore }) => {
                        useChatStore.getState().setLanguage(lang.code);
                      });
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl transition-colors ${
                      currentLanguage === lang.code ? 'text-primary font-medium' : 'text-text-secondary'
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-full text-sm text-text-secondary hover:bg-red-50 hover:text-error transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              {t('nav.logout')}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-100 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-primary-50 text-primary'
                      : 'text-text-secondary hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              ))}
              {/* Theme toggle in mobile menu */}
              <button
                onClick={() => {
                  toggleTheme();
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-text-secondary hover:bg-gray-50 w-full transition-all duration-200"
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5 text-yellow-400" />
                )}
                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  logout();
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-error hover:bg-red-50 w-full transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
                {t('nav.logout')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
