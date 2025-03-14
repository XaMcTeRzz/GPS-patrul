import { useState, useEffect } from 'react';

interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

interface UseLocationResult {
  location: Location | null;
  error: string | null;
}

export const useLocation = (): UseLocationResult => {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Геолокація не підтримується вашим браузером');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setError(null);
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Користувач відмовив у доступі до геолокації');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Інформація про місцезнаходження недоступна');
            break;
          case error.TIMEOUT:
            setError('Час очікування запиту геолокації вичерпано');
            break;
          default:
            setError('Сталася невідома помилка');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return { location, error };
}; 