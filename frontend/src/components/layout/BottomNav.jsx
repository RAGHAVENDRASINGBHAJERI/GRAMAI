import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useAppTranslation } from '../../hooks/useTranslation';
import {
  MessageCircle,
  Sprout,
  FileText,
  Heart,
  TrendingUp,
  User,
  Shield,
} from 'lucide-react';

const BottomNav = () => {
  const { user } = useAuthStore();
  const { t } = useAppTranslation();
  const location = useLocation();

  const navItems = [
    { path: '/chat', label: t('nav.chat'), icon: MessageCircle },
    { path: '/agriculture', label: t('nav.agriculture'), icon: Sprout },
    { path: '/schemes', label: t('nav.schemes'), icon: FileText },
    { path: '/healthcare', label: t('nav.healthcare'), icon: Heart },
    { path: '/mandi-prices', label: t('nav.mandi'), icon: TrendingUp },
  ];

  if (user?.role === 'admin') {
    navItems.push({ path: '/admin', label: t('nav.admin'), icon: Shield });
  }

  navItems.push({ path: '/profile', label: t('nav.profile'), icon: User });

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-200 z-40 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all duration-200 min-w-0 ${
              isActive(item.path)
                ? 'text-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium truncate max-w-full">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
