import React from 'react';
import { motion } from 'framer-motion';
import MarkdownRenderer from '../components/shared/MarkdownRenderer';
import { Loader2, MapPin, AlertCircle } from 'lucide-react';
import { useAppTranslation } from '../hooks/useTranslation';
import { useLocationContent } from '../hooks/useLocationContent';

const Agriculture = () => {
  const { t } = useAppTranslation();
  const { content, locationName, isLoading, error } = useLocationContent('agriculture');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{t('agriculture.title')}</h1>
        <p className="text-text-secondary mt-1 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          {locationName ? `Showing intelligence for: ${locationName}` : 'Detecting location...'}
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card min-h-[400px]"
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-text-secondary">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p>Gathering latest local agricultural intelligence...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-error">
            <AlertCircle className="w-8 h-8 mb-4" />
            <p>{error}</p>
          </div>
        ) : (
          <div className="w-full">
            <MarkdownRenderer content={content} colorTheme="primary" />
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Agriculture;
