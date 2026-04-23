import { useState, useEffect, useCallback } from 'react';

export const useOffline = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);
      // Reset the flag after a delay
      setTimeout(() => setWasOffline(false), 5000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getOfflineData = useCallback(async (dataType) => {
    try {
      const response = await fetch(`/offline-data/${dataType}.json`);
      if (!response.ok) throw new Error('Failed to load offline data');
      return await response.json();
    } catch (error) {
      console.error('Error loading offline data:', error);
      return [];
    }
  }, []);

  return {
    isOnline,
    wasOffline,
    getOfflineData,
  };
};
