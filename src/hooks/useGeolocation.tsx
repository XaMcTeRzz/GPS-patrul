
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

type GeolocationPosition = {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
};

type UseGeolocationOptions = {
  enableHighAccuracy?: boolean;
  maximumAge?: number;
  timeout?: number;
  onError?: (error: GeolocationPositionError) => void;
};

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<GeolocationPositionError | null>(null);
  const [isWatching, setIsWatching] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  const {
    enableHighAccuracy = true,
    maximumAge = 0,
    timeout = 30000,
    onError,
  } = options;

  // Get current position once
  const getCurrentPosition = () => {
    if (!navigator.geolocation) {
      const customError = new Error('Geolocation is not supported by this browser.') as any;
      customError.code = 0;
      setError(customError);
      if (onError) onError(customError);
      toast.error('Geolocation is not supported by this browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPosition({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
        setError(null);
      },
      (error) => {
        setError(error);
        if (onError) onError(error);
        let errorMessage = 'Unknown error';
        if (error.code === 1) {
          errorMessage = 'Permission denied. Please enable location access.';
        } else if (error.code === 2) {
          errorMessage = 'Position unavailable. Please try again.';
        } else if (error.code === 3) {
          errorMessage = 'Location request timed out. Please try again.';
        }
        toast.error(errorMessage);
      },
      { enableHighAccuracy, maximumAge, timeout }
    );
  };

  // Start watching position
  const startWatching = () => {
    if (!navigator.geolocation) {
      const customError = new Error('Geolocation is not supported by this browser.') as any;
      customError.code = 0;
      setError(customError);
      if (onError) onError(customError);
      toast.error('Geolocation is not supported by this browser');
      return;
    }

    setIsWatching(true);
    const id = navigator.geolocation.watchPosition(
      (position) => {
        setPosition({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
        setError(null);
      },
      (error) => {
        setError(error);
        if (onError) onError(error);
        let errorMessage = 'Unknown error';
        if (error.code === 1) {
          errorMessage = 'Permission denied. Please enable location access.';
        } else if (error.code === 2) {
          errorMessage = 'Position unavailable. Please try again.';
        } else if (error.code === 3) {
          errorMessage = 'Location request timed out. Please try again.';
        }
        toast.error(errorMessage);
      },
      { enableHighAccuracy, maximumAge, timeout }
    );

    setWatchId(id);
    return id;
  };

  // Stop watching position
  const stopWatching = () => {
    if (watchId !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
      setIsWatching(false);
      setWatchId(null);
    }
  };

  // Distance calculation function (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance; // Distance in meters
  };

  // Check if current position is within a specific radius from target
  const isWithinRadius = (targetLat: number, targetLng: number, radiusMeters: number): boolean => {
    if (!position) return false;
    
    const distance = calculateDistance(
      position.latitude,
      position.longitude,
      targetLat,
      targetLng
    );
    
    return distance <= radiusMeters;
  };

  // Clean up
  useEffect(() => {
    return () => {
      if (watchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return {
    position,
    error,
    getCurrentPosition,
    isWatching,
    startWatching,
    stopWatching,
    calculateDistance,
    isWithinRadius,
  };
}
