
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { toast } from 'sonner';

interface AddPointModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (point: {
    name: string;
    description: string;
    latitude: number;
    longitude: number;
    radiusMeters: number;
  }) => void;
}

const AddPointModal = ({ isOpen, onClose, onAdd }: AddPointModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [radiusMeters, setRadiusMeters] = useState('50');
  
  const { position, getCurrentPosition, error } = useGeolocation();

  // Функция для преобразования координат из строки в число
  const parseCoordinate = (coordStr: string): number => {
    // Заменяем запятую на точку для правильного парсинга
    return parseFloat(coordStr.replace(',', '.'));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Будь ласка, введіть назву точки');
      return;
    }
    
    if (!latitude || !longitude) {
      toast.error('Будь ласка, вкажіть координати місцезнаходження');
      return;
    }
    
    // Проверка координат
    const lat = parseCoordinate(latitude);
    const lng = parseCoordinate(longitude);
    
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toast.error('Неправильний формат координат. Перевірте введені дані.');
      return;
    }
    
    const radius = parseInt(radiusMeters);
    if (isNaN(radius) || radius <= 0) {
      toast.error('Будь ласка, введіть дійсний радіус (більше 0)');
      return;
    }
    
    onAdd({
      name: name.trim(),
      description: description.trim(),
      latitude: lat,
      longitude: lng,
      radiusMeters: radius,
    });
    
    // Reset form
    setName('');
    setDescription('');
    setLatitude('');
    setLongitude('');
    setRadiusMeters('50');
    
    onClose();
  };
  
  const handleGetCurrentLocation = () => {
    getCurrentPosition();
    if (position) {
      setLatitude(position.latitude.toString());
      setLongitude(position.longitude.toString());
      toast.success('Поточне місцезнаходження встановлено');
    }
  };
  
  // Update coordinates when position changes
  React.useEffect(() => {
    if (position) {
      setLatitude(position.latitude.toString());
      setLongitude(position.longitude.toString());
    }
  }, [position]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card border shadow-lg rounded-lg w-full max-w-md animate-slide-up">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-medium">Додати точку</h2>
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label htmlFor="name" className="label block mb-1">
              Назва
            </label>
            <input
              id="name"
              type="text"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Назва точки"
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="label block mb-1">
              Опис (необов'язково)
            </label>
            <input
              id="description"
              type="text"
              className="input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Додатковий опис"
            />
          </div>
          
          <div className="flex space-x-4">
            <div className="flex-1">
              <label htmlFor="latitude" className="label block mb-1">
                Широта
              </label>
              <input
                id="latitude"
                type="text"
                className="input"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="Широта"
                required
              />
            </div>
            <div className="flex-1">
              <label htmlFor="longitude" className="label block mb-1">
                Довгота
              </label>
              <input
                id="longitude"
                type="text"
                className="input"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="Довгота"
                required
              />
            </div>
          </div>
          
          <div>
            <button 
              type="button"
              onClick={handleGetCurrentLocation}
              className="btn-secondary text-sm mb-4 w-full"
            >
              Використати поточне місцезнаходження
            </button>
          </div>
          
          <div>
            <label htmlFor="radiusMeters" className="label block mb-1">
              Радіус перевірки (метри)
            </label>
            <input
              id="radiusMeters"
              type="number"
              min="1"
              className="input"
              value={radiusMeters}
              onChange={(e) => setRadiusMeters(e.target.value)}
              required
            />
          </div>
          
          <div className="flex space-x-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline flex-1">
              Скасувати
            </button>
            <button type="submit" className="btn-primary flex-1">
              Додати точку
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPointModal;
