import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';
import {
  Users,
  MessageSquare,
  Globe,
  Activity,
  Shield,
  Search,
  Box,
  Trash2,
  ShieldAlert,
  Loader2,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useAppTranslation } from '../../hooks/useTranslation';

const TABS = {
  OVERVIEW: 'overview',
  USERS: 'users',
  MARKETPLACE: 'marketplace',
};

const AdminDashboard = () => {
  const { t } = useAppTranslation();
  const [activeTab, setActiveTab] = useState(TABS.OVERVIEW);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    stats,
    users,
    posts,
    isLoading,
    error,
    fetchStats,
    fetchUsers,
    updateUserRole,
    deleteUser,
    fetchPosts,
    updatePostStatus,
    deletePost,
  } = useAdminStore();

  useEffect(() => {
    if (activeTab === TABS.OVERVIEW) fetchStats();
    if (activeTab === TABS.USERS) fetchUsers();
    if (activeTab === TABS.MARKETPLACE) fetchPosts();
  }, [activeTab]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{t('nav.admin')} Dashboard</h1>
          <p className="text-text-secondary mt-1">Platform management and moderation</p>
        </div>
        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl overflow-x-auto">
          {Object.entries(TABS).map(([key, value]) => (
            <button
              key={key}
              onClick={() => setActiveTab(value)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                activeTab === value
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {key.charAt(0) + key.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-error rounded-xl border border-red-100 flex items-center gap-2">
          <XCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === TABS.OVERVIEW && <OverviewTab stats={stats} isLoading={isLoading} />}
          {activeTab === TABS.USERS && (
            <UsersTab
              users={users}
              isLoading={isLoading}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onUpdateRole={updateUserRole}
              onDelete={deleteUser}
            />
          )}
          {activeTab === TABS.MARKETPLACE && (
            <MarketplaceTab
              posts={posts}
              isLoading={isLoading}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onUpdateStatus={updatePostStatus}
              onDelete={deletePost}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// --- TABS COMPONENTS ---

const OverviewTab = ({ stats, isLoading }) => {
  if (isLoading || !stats) {
    return <LoadingState />;
  }

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers || 0, icon: Users, color: 'bg-blue-500' },
    { label: 'Total Queries', value: stats.totalQueries || 0, icon: MessageSquare, color: 'bg-green-500' },
    { label: 'Queries Today', value: stats.queriesToday || 0, icon: Activity, color: 'bg-orange-500' },
    { label: 'Top Language', value: (stats.topLanguage || 'en').toUpperCase(), icon: Globe, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="card">
            <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
            <p className="text-xs text-text-secondary mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-text-primary mb-4">Category Breakdown</h3>
          <div className="space-y-3">
            {stats.categoryStats?.map((cat) => (
              <div key={cat._id} className="flex items-center justify-between">
                <span className="text-sm text-text-secondary capitalize">{cat._id}</span>
                <span className="text-sm font-medium">{cat.count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 className="font-semibold text-text-primary mb-4">Language Distribution</h3>
          <div className="space-y-3">
            {stats.languageStats?.map((lang) => (
              <div key={lang._id} className="flex items-center justify-between">
                <span className="text-sm text-text-secondary uppercase">{lang._id}</span>
                <span className="text-sm font-medium">{lang.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const UsersTab = ({ users, isLoading, searchTerm, setSearchTerm, onUpdateRole, onDelete }) => {
  const filteredUsers = users.filter((u) =>
    (u.name + u.email + u.phone).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="card p-0 overflow-hidden flex flex-col min-h-[500px]">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
        <h3 className="font-semibold text-text-primary">User Management</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users..."
            className="input-field pl-9 py-2 text-sm w-48 sm:w-64 bg-gray-50 border-transparent focus:bg-white"
          />
        </div>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Contact</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Joined</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-text-primary">{user.name}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-text-primary">{user.phone}</div>
                    <div className="text-xs text-text-secondary">{user.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(e) => {
                        if (confirm('Change user role?')) onUpdateRole(user._id, e.target.value);
                      }}
                      className={`text-xs font-semibold px-2 py-1 rounded-md border-0 outline-none cursor-pointer ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <option value="user">USER</option>
                      <option value="admin">ADMIN</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`Permanently delete user ${user.name}? This action cannot be undone.`)) {
                          onDelete(user._id);
                        }
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-text-secondary text-sm">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const MarketplaceTab = ({ posts, isLoading, searchTerm, setSearchTerm, onUpdateStatus, onDelete }) => {
  const filteredPosts = posts.filter((p) =>
    (p.cropType + p.location + p.description).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="card p-0 overflow-hidden flex flex-col min-h-[500px]">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
        <h3 className="font-semibold text-text-primary">Marketplace Moderation</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search posts..."
            className="input-field pl-9 py-2 text-sm w-48 sm:w-64 bg-gray-50 border-transparent focus:bg-white"
          />
        </div>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Item</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Seller</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Price</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPosts.map((post) => (
                <tr key={post._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-text-primary capitalize flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${post.transactionType === 'SELL' ? 'bg-green-500' : 'bg-blue-500'}`} />
                      {post.cropType}
                    </div>
                    <div className="text-xs text-text-secondary truncate max-w-[200px]">{post.description}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-text-primary">{post.userId?.name || 'Unknown'}</div>
                    <div className="text-xs text-text-secondary">{post.location}</div>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-text-primary">
                    ₹{post.price} <span className="text-xs font-normal text-text-secondary">({post.quantity})</span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={post.status}
                      onChange={(e) => {
                        if (confirm('Change post status?')) onUpdateStatus(post._id, e.target.value);
                      }}
                      className={`text-xs font-semibold px-2 py-1 rounded-md border-0 outline-none cursor-pointer ${
                        post.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700'
                          : post.status === 'SOLD'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="SOLD">SOLD</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`Permanently delete post? This action cannot be undone.`)) {
                          onDelete(post._id);
                        }
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Post"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredPosts.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-text-secondary text-sm">
                    No posts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center p-12 text-text-secondary flex-1">
    <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
    <p>Loading data...</p>
  </div>
);

export default AdminDashboard;
