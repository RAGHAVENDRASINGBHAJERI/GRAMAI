import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppTranslation } from '../hooks/useTranslation';
import { useOffline } from '../hooks/useOffline';
import { TrendingUp, Search, Filter, Clock, WifiOff } from 'lucide-react';

const mandiData = [
  { crop: 'Wheat', state: 'Punjab', min: 2100, max: 2350, modal: 2275, unit: 'quintal' },
  { crop: 'Rice', state: 'Punjab', min: 1900, max: 2200, modal: 2068, unit: 'quintal' },
  { crop: 'Maize', state: 'Karnataka', min: 1800, max: 2100, modal: 1950, unit: 'quintal' },
  { crop: 'Cotton', state: 'Gujarat', min: 5500, max: 6500, modal: 6025, unit: 'quintal' },
  { crop: 'Sugarcane', state: 'Uttar Pradesh', min: 285, max: 350, modal: 315, unit: 'quintal' },
  { crop: 'Groundnut', state: 'Gujarat', min: 4500, max: 5500, modal: 5150, unit: 'quintal' },
  { crop: 'Mustard', state: 'Rajasthan', min: 4200, max: 5100, modal: 4700, unit: 'quintal' },
  { crop: 'Paddy', state: 'Telangana', min: 1800, max: 2100, modal: 1960, unit: 'quintal' },
  { crop: 'Jowar', state: 'Maharashtra', min: 2500, max: 3200, modal: 2850, unit: 'quintal' },
  { crop: 'Bajra', state: 'Rajasthan', min: 1900, max: 2300, modal: 2150, unit: 'quintal' },
  { crop: 'Ragi', state: 'Karnataka', min: 2800, max: 3500, modal: 3200, unit: 'quintal' },
  { crop: 'Tur', state: 'Maharashtra', min: 5500, max: 6800, modal: 6200, unit: 'quintal' },
];

const MandiPrices = () => {
  const { t } = useAppTranslation();
  const { isOnline } = useOffline();
  const [search, setSearch] = useState('');
  const [filterCrop, setFilterCrop] = useState('all');

  const crops = [...new Set(mandiData.map((m) => m.crop))];

  const filteredData = mandiData.filter((item) => {
    const matchesSearch = item.crop.toLowerCase().includes(search.toLowerCase()) ||
      item.state.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterCrop === 'all' || item.crop === filterCrop;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{t('mandi.title')}</h1>
        <p className="text-text-secondary mt-1">Market prices for major crops</p>
      </div>

      {/* Offline Banner */}
      {!isOnline && (
        <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm text-yellow-800">
          <WifiOff className="w-4 h-4" />
          <span>{t('mandi.offlineBanner')}</span>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`${t('mandi.crop')} / ${t('mandi.state')}`}
            className="input-field pl-10"
          />
        </div>
        <select
          value={filterCrop}
          onChange={(e) => setFilterCrop(e.target.value)}
          className="input-field w-36"
        >
          <option value="all">{t('mandi.crop')}</option>
          {crops.map((crop) => (
            <option key={crop} value={crop}>{crop}</option>
          ))}
        </select>
      </div>

      {/* Last Updated */}
      <div className="flex items-center gap-2 text-xs text-text-secondary">
        <Clock className="w-3.5 h-3.5" />
        <span>{t('mandi.lastUpdated')}: Today, 10:30 AM</span>
      </div>

      {/* Price Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-4 py-3 text-sm font-semibold text-text-primary">{t('mandi.crop')}</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-text-primary">{t('mandi.state')}</th>
              <th className="text-right px-4 py-3 text-sm font-semibold text-text-primary">{t('mandi.minPrice')}</th>
              <th className="text-right px-4 py-3 text-sm font-semibold text-text-primary">{t('mandi.maxPrice')}</th>
              <th className="text-right px-4 py-3 text-sm font-semibold text-primary">{t('mandi.modalPrice')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, i) => (
              <motion.tr
                key={`${item.crop}-${item.state}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3 text-sm font-medium text-text-primary">{item.crop}</td>
                <td className="px-4 py-3 text-sm text-text-secondary">{item.state}</td>
                <td className="px-4 py-3 text-sm text-text-secondary text-right">₹{item.min.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-text-secondary text-right">₹{item.max.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm font-semibold text-primary text-right">₹{item.modal.toLocaleString()}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-12">
          <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-text-secondary">No prices found for your search.</p>
        </div>
      )}
    </div>
  );
};

export default MandiPrices;
