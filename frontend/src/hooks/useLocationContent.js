import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAppTranslation } from './useTranslation';

export const useLocationContent = (category) => {
  const [content, setContent] = useState('');
  const [locationName, setLocationName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentLanguage } = useAppTranslation();
  
  // Track the current active location to refetch when language changes
  const activeLocationRef = useRef('');

  const fetchContent = async (loc = 'India') => {
    try {
      setIsLoading(true);
      setError(null);
      activeLocationRef.current = loc; // save for language changes
      
      const res = await api.get('/content/generate', {
        params: {
          category,
          location: loc,
          language: currentLanguage,
        }
      });
      
      setContent(res.data.data.content);
      setLocationName(res.data.data.location);
      setIsLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate content');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // If we already have an active location, just refetch it (language changed)
    if (activeLocationRef.current) {
      fetchContent(activeLocationRef.current);
      return;
    }

    // Otherwise, auto-detect location
    const getGeoLocation = () => {
      if (!navigator.geolocation) {
        fetchContent('India');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
            const geoData = await geoRes.json();
            const locString = [geoData.city, geoData.principalSubdivision, geoData.countryName].filter(Boolean).join(', ');
            fetchContent(locString);
          } catch (e) {
            fetchContent('India');
          }
        },
        (err) => {
          console.warn('Geolocation error:', err);
          fetchContent('India');
        },
        { timeout: 10000 }
      );
    };

    getGeoLocation();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, currentLanguage]);

  const updateLocation = (newLocation) => {
    if (!newLocation.trim()) return;
    fetchContent(newLocation);
  };

  return { content, locationName, isLoading, error, updateLocation };
};
