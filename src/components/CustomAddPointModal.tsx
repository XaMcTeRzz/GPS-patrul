
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useGeolocation } from '@/hooks/useGeolocation';
import { PatrolPoint } from '@/types/patrol-types';
import { MapPin } from 'lucide-react';

type CustomAddPointModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (point: Omit<PatrolPoint, 'id'>) => void;
};

const CustomAddPointModal: React.FC<CustomAddPointModalProps> = ({
  isOpen,
  onClose,
  onAdd
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);
  const [radiusMeters, setRadiusMeters] = useState<number>(50);
  const [timeMinutes, setTimeMinutes] = useState<number>(5);
  const [isUsingCurrentLocation, setIsUsingCurrentLocation] = useState(false);

  const { position } = useGeolocation({
    enableHighAccuracy: true,
    maximumAge: 10000,
    timeout: 15000
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setLatitude(0);
      setLongitude(0);
      setRadiusMeters(50);
      setTimeMinutes(5);
      setIsUsingCurrentLocation(false);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      name,
      description,
      latitude,
      longitude,
      radiusMeters,
      timeMinutes
    });
    onClose();
  };

  const useCurrentLocation = () => {
    if (position) {
      setLatitude(position.latitude);
      setLongitude(position.longitude);
      setIsUsingCurrentLocation(true);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Додати нову точку</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid w-full items-center gap-1.5">
            <label htmlFor="name" className="text-sm font-medium">
              Назва
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              required
            />
          </div>

          <div className="grid w-full items-center gap-1.5">
            <label htmlFor="description" className="text-sm font-medium">
              Опис
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea"
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2 mb-2">
            <button
              type="button"
              onClick={useCurrentLocation}
              className="btn-outline text-primary border-primary flex items-center text-sm"
              disabled={isUsingCurrentLocation}
            >
              <MapPin className="h-4 w-4 mr-1" />
              {isUsingCurrentLocation ? 'Використано поточне місцезнаходження' : 'Використати поточне місцезнаходження'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid w-full items-center gap-1.5">
              <label htmlFor="latitude" className="text-sm font-medium">
                Широта
              </label>
              <input
                id="latitude"
                type="number"
                step="0.000001"
                value={latitude}
                onChange={(e) => {
                  setLatitude(Number(e.target.value));
                  setIsUsingCurrentLocation(false);
                }}
                className="input"
                required
              />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <label htmlFor="longitude" className="text-sm font-medium">
                Довгота
              </label>
              <input
                id="longitude"
                type="number"
                step="0.000001"
                value={longitude}
                onChange={(e) => {
                  setLongitude(Number(e.target.value));
                  setIsUsingCurrentLocation(false);
                }}
                className="input"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid w-full items-center gap-1.5">
              <label htmlFor="radius" className="text-sm font-medium">
                Радіус (м)
              </label>
              <input
                id="radius"
                type="number"
                min="1"
                value={radiusMeters}
                onChange={(e) => setRadiusMeters(Number(e.target.value))}
                className="input"
                required
              />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <label htmlFor="timeMinutes" className="text-sm font-medium">
                Час перевірки (хв)
              </label>
              <input
                id="timeMinutes"
                type="number"
                min="1"
                value={timeMinutes}
                onChange={(e) => setTimeMinutes(Number(e.target.value))}
                className="input"
                required
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline"
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              Додати
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomAddPointModal;
