import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppTranslation } from '../../hooks/useTranslation';
import {
  Users,
  MessageSquare,
  Globe,
  Activity,
  TrendingUp,
  Shield,
  Search,
  ChevronDown,
  MoreVertical,
} from 'lucide-react';

const stats = [
  { label: 'Total Users', value: '1,247', change: '+12%', icon: Users, color: 'bg-blue-500' },
  { label: 'Queries Today', value: '342', change: '+8%', icon: MessageSquare, color: 'bg-green-500' },
  { label: 'Top Language', value: 'Kannada', change: '45%', icon: Globe, color: 'bg-purple-500' },
  { label: 'Cache Hit Rate', value: '87%', change: '+3%', icon: Activity, color: 'bg-orange-500' },
];

const recentQueries = [
  { id: 1, user: 'Ramesh K.', question: 'What is PM-KISAN scheme?', language: 'kn', time: '2 min ago', status: 'ai-engine' },
  { id: 2, user: 'Sita D.', question: 'How to control pests in paddy?', language: 'hi', time: '5 min ago', status: 'cache' },
  { id: 3, user: 'Anil P.', question: 'Dengue symptoms treatment?', language: 'en', time: '8 min ago', status: 'ai-engine' },
  { id: 4, user: 'Geeta M.', question: 'MSP for wheat 2024?', language: 'kn', time: '12 min ago', status: 'offline-fallback' },
  { id: 5, user: 'Rajesh S.', question: 'Ayushman Bharat eligibility?', language: 'hi', time: '15 min ago', status: 'ai-engine' },
];

const AdminDashboard = () => {
  const { t } = useAppTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{t('nav.admin')} Dashboard</h1>
          <p className="text-text-secondary mt-1">Monitor platform activity and manage data</p>
        </div>
        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
            <p className="text-xs text-text-secondary mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Queries */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-text-primary">Recent Queries</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search queries..."
              className="input-field pl-9 py-2 text-sm w-48"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Question</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Lang</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Time</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Source</th>
              </tr>
            </thead>
            <tbody>
              {recentQueries.map((query, i) => (
                <motion.tr
                  key={query.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-medium text-text-primary">{query.user}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary max-w-xs truncate">{query.question}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-text-secondary uppercase">
                      {query.language}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{query.time}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      query.status === 'ai-engine'
                        ? 'bg-green-100 text-green-700'
                        : query.status === 'cache'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {query.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid md:grid-cols-3 gap-4"
      >
        <button className="card text-left hover:shadow-md transition-all">
          <h4 className="font-semibold text-text-primary mb-1">Manage Schemes</h4>
          <p className="text-xs text-text-secondary">Add, edit, or remove government schemes</p>
        </button>
        <button className="card text-left hover:shadow-md transition-all">
          <h4 className="font-semibold text-text-primary mb-1">View All Users</h4>
          <p className="text-xs text-text-secondary">Manage user accounts and roles</p>
        </button>
        <button className="card text-left hover:shadow-md transition-all">
          <h4 className="font-semibold text-text-primary mb-1">System Health</h4>
          <p className="text-xs text-text-secondary">Check AI engine and API status</p>
        </button>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
