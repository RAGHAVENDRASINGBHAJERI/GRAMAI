import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useAppTranslation } from '../hooks/useTranslation';
import { useToast } from '../components/shared/Toast';
import { User, Mail, Phone, Globe, History, Bookmark, Download, LogOut, Edit2, Check, X } from 'lucide-react';

const Profile = () => {
  const { user, logout, updateProfile } = useAuthStore();
  const { t, currentLanguage, changeLanguage, languages } = useAppTranslation();
  const { addToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  const handleSave = async () => {
    try {
      await updateProfile(editData);
      setIsEditing(false);
      addToast('Profile updated!', 'success');
    } catch (error) {
      addToast('Failed to update profile', 'error');
    }
  };

  const handleExport = () => {
    const data = {
      user,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gramaai-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Data exported!', 'success');
  };

  const getInitials = (name) => {
    return name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{t('profile.title')}</h1>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card text-center"
      >
        <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl font-bold text-white">{getInitials(user?.name)}</span>
        </div>
        {isEditing ? (
          <div className="space-y-3 max-w-sm mx-auto">
            <input
              type="text"
              value={editData.name}
              onChange={(e) => setEditData((prev) => ({ ...prev, name: e.target.value }))}
              className="input-field text-center"
              placeholder="Your name"
            />
            <input
              type="tel"
              value={editData.phone}
              onChange={(e) => setEditData((prev) => ({ ...prev, phone: e.target.value }))}
              className="input-field text-center"
              placeholder="Phone number"
            />
            <div className="flex gap-2 justify-center">
              <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                <Check className="w-4 h-4" />
                {t('common.save')}
              </button>
              <button onClick={() => setIsEditing(false)} className="btn-ghost flex items-center gap-2">
                <X className="w-4 h-4" />
                {t('common.cancel')}
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-text-primary">{user?.name}</h2>
            <p className="text-text-secondary text-sm mt-1 capitalize">{user?.role}</p>
            <div className="flex items-center justify-center gap-4 mt-4 text-sm text-text-secondary">
              {user?.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </span>
              )}
              {user?.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {user.phone}
                </span>
              )}
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="btn-ghost mt-4 flex items-center gap-2 mx-auto"
            >
              <Edit2 className="w-4 h-4" />
              {t('profile.edit')}
            </button>
          </>
        )}
      </motion.div>

      {/* Language Preference */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-text-primary">{t('profile.language')}</h3>
        </div>
        <div className="flex gap-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                currentLanguage === lang.code
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-4"
      >
        <button className="card flex items-center gap-3 hover:shadow-md transition-all">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <History className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-text-primary">{t('profile.history')}</p>
            <p className="text-xs text-text-secondary">View past queries</p>
          </div>
        </button>
        <button className="card flex items-center gap-3 hover:shadow-md transition-all">
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
            <Bookmark className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-text-primary">{t('profile.saved')}</p>
            <p className="text-xs text-text-secondary">Bookmarked items</p>
          </div>
        </button>
        <button
          onClick={handleExport}
          className="card flex items-center gap-3 hover:shadow-md transition-all"
        >
          <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
            <Download className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-text-primary">{t('profile.export')}</p>
            <p className="text-xs text-text-secondary">Download JSON</p>
          </div>
        </button>
        <button
          onClick={logout}
          className="card flex items-center gap-3 hover:shadow-md transition-all hover:border-red-200"
        >
          <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
            <LogOut className="w-5 h-5 text-red-500" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-text-primary">{t('nav.logout')}</p>
            <p className="text-xs text-text-secondary">Sign out</p>
          </div>
        </button>
      </motion.div>
    </div>
  );
};

export default Profile;
