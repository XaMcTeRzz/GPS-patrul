
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { PatrolPoint } from '@/context/PatrolContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import { toast } from 'sonner';

interface EditPointModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, point: Partial<PatrolPoint>) => void;
  point: PatrolPoint | null;
}

const EditPointModal = ({ isOpen, onClose, onSave, point }: EditPointModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [radiusMeters, setRadiusMeters] = useState('');
  
  const { position, getCurrentPosition } = useGeolocation();

  // Load point data when the modal opens
  useEffect(() => {
    if (point) {
      setName(point.name);
      setDescription(point.description);
      setLatitude(point.latitude.toString());
      setLongitude(point.longitude.toString());
      setRadiusMeters(point.radiusMeters.toString());
    }
  }, [point]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!point) return;
    
    if (!name.trim()) {
      toast.error('Please enter a checkpoint name');
      return;
    }
    
    if (!latitude || !longitude) {
      toast.error('Please set the location coordinates');
      return;
    }
    
    const radius = parseInt(radiusMeters);
    if (isNaN(radius) || radius <= 0) {
      toast.error('Please enter a valid radius (greater than 0)');
      return;
    }
    
    onSave(point.id, {
      name: name.trim(),
      description: description.trim(),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      radiusMeters: radius,
    });
    
    onClose();
  };
  
  const handleGetCurrentLocation = () => {
    getCurrentPosition();
    if (position) {
      setLatitude(position.latitude.toString());
      setLongitude(position.longitude.toString());
      toast.success('Current location set');
    }
  };
  
  // Update coordinates when position changes
  React.useEffect(() => {
    if (position) {
      setLatitude(position.latitude.toString());
      setLongitude(position.longitude.toString());
    }
  }, [position]);
  
  if (!isOpen || !point) return null;
  
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card border shadow-lg rounded-lg w-full max-w-md animate-slide-up">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-medium">Edit Checkpoint</h2>
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
              Name
            </label>
            <input
              id="name"
              type="text"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Checkpoint name"
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="label block mb-1">
              Description (optional)
            </label>
            <input
              id="description"
              type="text"
              className="input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
            />
          </div>
          
          <div className="flex space-x-4">
            <div className="flex-1">
              <label htmlFor="latitude" className="label block mb-1">
                Latitude
              </label>
              <input
                id="latitude"
                type="text"
                className="input"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="Latitude"
                required
              />
            </div>
            <div className="flex-1">
              <label htmlFor="longitude" className="label block mb-1">
                Longitude
              </label>
              <input
                id="longitude"
                type="text"
                className="input"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="Longitude"
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
              Use Current Location
            </button>
          </div>
          
          <div>
            <label htmlFor="radiusMeters" className="label block mb-1">
              Verification Radius (meters)
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
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPointModal;
