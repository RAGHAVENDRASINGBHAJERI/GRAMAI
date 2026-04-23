import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAppTranslation } from './useTranslation';

export const useLocationContent = (category) => {
  const [content, setContent] = useState('');
  const [locationName, setLocationName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentLanguage } = useAppTranslation();

  useEffect(() => {
    let isMounted = true;

    const fetchContent = async (loc = 'India') => {
      try {
        setIsLoading(true);
        setError(null);
        
        const res = await api.get('/content/generate', {
          params: {
            category,
            location: loc,
            language: currentLanguage,
          }
        });
        
        if (isMounted) {
          setContent(res.data.data.content);
          setLocationName(res.data.data.location);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Failed to generate content');
          setIsLoading(false);
        }
      }
    };

    const getGeoLocation = () => {
      if (!navigator.geolocation) {
        fetchContent('India');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Free reverse geocoding API without API key
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
          fetchContent('India'); // Fallback if denied
        },
        { timeout: 10000 }
      );
    };

    getGeoLocation();

    return () => {
      isMounted = false;
    };
  }, [category, currentLanguage]);

  return { content, locationName, isLoading, error };
};
