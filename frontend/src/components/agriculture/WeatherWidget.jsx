import React from 'react';
import { motion } from 'framer-motion';
import { Thermometer, Droplets, Wind, CloudRain, AlertCircle, Loader2 } from 'lucide-react';
import { useWeather } from '../../hooks/useWeather';

const WeatherWidget = () => {
  const { weather, isLoading, error } = useWeather();

  if (isLoading) {
    return (
      <div className="w-full bg-primary-50 rounded-2xl p-4 flex items-center justify-center min-h-[100px] border border-primary-100 shadow-sm mb-6">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-3 text-sm text-text-secondary">Syncing local weather for crops...</span>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="w-full bg-red-50 rounded-2xl p-4 flex items-center justify-center min-h-[100px] border border-red-100 shadow-sm mb-6">
        <AlertCircle className="w-6 h-6 text-error" />
        <span className="ml-3 text-sm text-text-secondary">{error || "Weather data unavailable"}</span>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-6 grid grid-cols-2 md:grid-cols-4 gap-4"
    >
      <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-orange-50 border border-orange-100">
        <Thermometer className="w-6 h-6 text-orange-500 mb-2" />
        <span className="text-sm text-text-secondary font-medium">Temperature</span>
        <span className="text-xl font-bold text-text-primary mt-1">{weather.temperature}°C</span>
      </div>
      
      <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-50 border border-blue-100">
        <Droplets className="w-6 h-6 text-blue-500 mb-2" />
        <span className="text-sm text-text-secondary font-medium">Humidity</span>
        <span className="text-xl font-bold text-text-primary mt-1">{weather.humidity}%</span>
      </div>

      <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-indigo-50 border border-indigo-100">
        <CloudRain className="w-6 h-6 text-indigo-500 mb-2" />
        <span className="text-sm text-text-secondary font-medium">Rainfall</span>
        <span className="text-xl font-bold text-text-primary mt-1">{weather.precipitation} mm</span>
      </div>

      <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-teal-50 border border-teal-100">
        <Wind className="w-6 h-6 text-teal-500 mb-2" />
        <span className="text-sm text-text-secondary font-medium">Wind Speed</span>
        <span className="text-xl font-bold text-text-primary mt-1">{weather.windSpeed} km/h</span>
      </div>
    </motion.div>
  );
};

export default WeatherWidget;
