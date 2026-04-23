import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppTranslation } from '../hooks/useTranslation';
import { Sprout, Sun, Cloud, Droplets, Thermometer, ChevronRight, Calendar, Lightbulb } from 'lucide-react';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const cropCalendar = {
  'January': { crops: 'Wheat, Mustard, Gram', activity: 'Harvesting' },
  'February': { crops: 'Wheat, Mustard', activity: 'Harvesting' },
  'March': { crops: 'Summer Vegetables', activity: 'Land preparation' },
  'April': { crops: 'Rice, Maize, Cotton', activity: 'Sowing' },
  'May': { crops: 'Rice, Maize, Cotton', activity: 'Transplanting' },
  'June': { crops: 'Rice, Sugarcane', activity: 'Kharif sowing' },
  'July': { crops: 'Rice, Sugarcane, Pulses', activity: 'Transplanting' },
  'August': { crops: 'Rice, Sugarcane', activity: 'Weeding & Fertilizer' },
  'September': { crops: 'Rice, Cotton', activity: 'Pest control' },
  'October': { crops: 'Wheat, Mustard, Gram', activity: 'Rabi sowing' },
  'November': { crops: 'Wheat, Mustard', activity: 'Irrigation' },
  'December': { crops: 'Wheat, Mustard', activity: 'Irrigation & Weeding' },
};

const tips = [
  { icon: Droplets, title: 'Water Management', desc: 'Use drip irrigation to save 40% water and increase yield by 30%.' },
  { icon: Sun, title: 'Solar Pumps', desc: 'Apply for PM-KUSUM scheme for subsidized solar pumps.' },
  { icon: Cloud, title: 'Weather Alert', desc: 'Check local weather before spraying pesticides.' },
  { icon: Lightbulb, title: 'Soil Health', desc: 'Test soil every 2 years. Use fertilizers based on soil test.' },
];

const Agriculture = () => {
  const { t } = useAppTranslation();
  const currentMonth = new Date().getMonth();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{t('agriculture.title')}</h1>
        <p className="text-text-secondary mt-1">Smart farming insights and tips</p>
      </div>

      {/* Weather Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">{t('agriculture.weather')}</h3>
          <Sun className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-6">
          <div className="text-4xl font-bold">32°C</div>
          <div className="space-y-1 text-sm text-blue-100">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4" />
              <span>Humidity: 65%</span>
            </div>
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4" />
              <span>Partly Cloudy</span>
            </div>
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4" />
              <span>Rainfall: 12mm</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Crop Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-text-primary">{t('agriculture.cropCalendar')}</h3>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {months.map((month, i) => (
            <button
              key={month}
              onClick={() => setSelectedMonth(i)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedMonth === i
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
              }`}
            >
              {month.slice(0, 3)}
            </button>
          ))}
        </div>
        <div className="bg-primary-50 rounded-xl p-4">
          <p className="text-sm text-text-primary">
            <span className="font-semibold">Crops:</span> {cropCalendar[months[selectedMonth]].crops}
          </p>
          <p className="text-sm text-text-primary mt-1">
            <span className="font-semibold">Activity:</span> {cropCalendar[months[selectedMonth]].activity}
          </p>
        </div>
      </motion.div>

      {/* Quick Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="font-semibold text-text-primary mb-4">{t('agriculture.tips')}</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {tips.map((tip, i) => (
            <div key={i} className="card flex items-start gap-3">
              <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <tip.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-text-primary text-sm">{tip.title}</h4>
                <p className="text-xs text-text-secondary mt-1">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Ask AI CTA */}
      <Link
        to="/chat"
        className="block card bg-gradient-to-r from-primary to-primary-700 text-white hover:shadow-lg transition-all"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{t('agriculture.askAI')}</h3>
            <p className="text-sm text-white/80 mt-1">Get personalized farming advice</p>
          </div>
          <ChevronRight className="w-6 h-6" />
        </div>
      </Link>
    </div>
  );
};

export default Agriculture;
