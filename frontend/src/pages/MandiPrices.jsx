import React, { useState } from 'react';
import { motion } from 'framer-motion';
import MarkdownRenderer from '../components/shared/MarkdownRenderer';
import { Loader2, MapPin, AlertCircle } from 'lucide-react';
import { useAppTranslation } from '../hooks/useTranslation';
import { useLocationContent } from '../hooks/useLocationContent';

const MandiPrices = () => {
  const { t } = useAppTranslation();
  const { content, locationName, isLoading, error, updateLocation } = useLocationContent('mandi');
  const [isEditingLoc, setIsEditingLoc] = useState(false);
  const [editLocValue, setEditLocValue] = useState('');

  const handleEditLocation = () => {
    setEditLocValue(locationName);
    setIsEditingLoc(true);
  };

  const handleSaveLocation = () => {
    updateLocation(editLocValue);
    setIsEditingLoc(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{t('mandi.title')}</h1>
        <div className="flex items-center gap-2 mt-2">
          <MapPin className="w-4 h-4 text-primary shrink-0" />
          {isEditingLoc ? (
            <div className="flex items-center gap-2 max-w-sm w-full">
              <input 
                type="text" 
                value={editLocValue} 
                onChange={(e) => setEditLocValue(e.target.value)} 
                className="input-field py-1.5 px-3 text-sm flex-1 min-h-[36px]"
                autoFocus
                placeholder="Enter village, district..."
                onKeyDown={(e) => e.key === 'Enter' && handleSaveLocation()}
              />
              <button onClick={handleSaveLocation} className="btn-primary py-1.5 px-3 min-h-[36px] text-sm whitespace-nowrap">Save</button>
              <button onClick={() => setIsEditingLoc(false)} className="btn-ghost py-1.5 px-3 min-h-[36px] text-sm whitespace-nowrap">Cancel</button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-text-secondary text-sm sm:text-base">
                {locationName ? `Showing intelligence for: ${locationName}` : 'Detecting location...'}
              </span>
              {!isLoading && (
                <button onClick={handleEditLocation} className="text-primary hover:text-primary-700 hover:underline text-sm font-semibold transition-colors">
                  Change
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card min-h-[400px]"
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-text-secondary">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p>Fetching latest mandi prices and MSP data for your area...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-error">
            <AlertCircle className="w-8 h-8 mb-4" />
            <p>{error}</p>
          </div>
        ) : (
          <div className="w-full">
            <MarkdownRenderer content={content} colorTheme="orange" />
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MandiPrices;
