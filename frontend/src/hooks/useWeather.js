import { useState, useEffect } from 'react';

export const useWeather = (locationName) => {
  const [weather, setWeather] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchWeather = async (lat, lon) => {
      try {
        setIsLoading(true);
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

    const fetchCoordinatesForLocation = async (locName) => {
      try {
        setIsLoading(true);
        const searchQuery = locName.split(',')[0].trim();
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=1`;
        const res = await fetch(geoUrl);
        const data = await res.json();
        
        if (data.results && data.results.length > 0) {
          const { latitude, longitude } = data.results[0];
          await fetchWeather(latitude, longitude);
        } else {
          throw new Error("Location not found");
        }
      } catch (err) {
        if (mounted) setError("Could not find weather for this location.");
        setIsLoading(false);
      }
    };

    if (locationName) {
      // If a specific location name is provided (e.g. user manually changed it), fetch by name
      fetchCoordinatesForLocation(locationName);
    } else {
      // Otherwise fallback to geolocator
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
    }

    return () => {
      mounted = false;
    };
  }, [locationName]);

  return { weather, isLoading, error };
};
