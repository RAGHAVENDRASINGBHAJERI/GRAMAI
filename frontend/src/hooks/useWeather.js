import { useState, useEffect } from 'react';

export const useWeather = () => {
  const [weather, setWeather] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchWeather = async (lat, lon) => {
      try {
        setIsLoading(true);
        // Using Open-Meteo free API
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Weather data fetch failed');
        
        const data = await response.json();
        
        if (mounted && data?.current) {
          setWeather({
            temperature: data.current.temperature_2m,
            humidity: data.current.relative_humidity_2m,
            precipitation: data.current.precipitation,
            windSpeed: data.current.wind_speed_10m,
          });
        }
      } catch (err) {
        if (mounted) setError("Could not load local weather.");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        () => {
          // Fallback coordinate (New Delhi) if denied
          fetchWeather(28.6139, 77.2090);
        },
        { timeout: 10000 }
      );
    } else {
      // Fallback
      fetchWeather(28.6139, 77.2090);
    }

    return () => {
      mounted = false;
    };
  }, []);

  return { weather, isLoading, error };
};
