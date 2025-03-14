import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { PatrolPoint } from '@/types/patrol-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Timer, Target } from 'lucide-react';

type CustomEditPointModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, data: Partial<PatrolPoint>) => void;
  point: PatrolPoint | null;
};

const CustomEditPointModal: React.FC<CustomEditPointModalProps> = ({
  isOpen,
  onClose,
  onSave,
  point,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [radiusMeters, setRadiusMeters] = useState('');
  const [timeMinutes, setTimeMinutes] = useState('');

  useEffect(() => {
    if (point) {
      setName(point.name);
      setDescription(point.description);
      setLatitude(point.latitude.toString());
      setLongitude(point.longitude.toString());
      setRadiusMeters(point.radiusMeters.toString());
      setTimeMinutes(point.timeMinutes.toString());
    }
  }, [point]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!point) return;

    const updatedData: Partial<PatrolPoint> = {
      name,
      description,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      radiusMeters: parseInt(radiusMeters),
      timeMinutes: parseInt(timeMinutes),
      radius: parseInt(radiusMeters), // Для сумісності
      time: parseInt(timeMinutes), // Для сумісності
    };

    onSave(point.id, updatedData);
    onClose();
  };

  const handleIncrement = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      setter((numValue + 1).toString());
    }
  };

  const handleDecrement = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 1) {
      setter((numValue - 1).toString());
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1A1D24] border-[#2A2F38] text-zinc-100 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-zinc-100">
            Редагування точки
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Назва точки</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[#12151A] border-[#2A2F38] text-zinc-100"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Опис</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-[#12151A] border-[#2A2F38] text-zinc-100 min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Широта</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-zinc-400" />
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="bg-[#12151A] border-[#2A2F38] text-zinc-100 pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitude">Довгота</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-zinc-400" />
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="bg-[#12151A] border-[#2A2F38] text-zinc-100 pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="radius">Радіус (метри)</Label>
              <div className="relative flex">
                <Target className="absolute left-3 top-2.5 h-5 w-5 text-zinc-400" />
                <Input
                  id="radius"
                  type="number"
                  min="1"
                  value={radiusMeters}
                  onChange={(e) => setRadiusMeters(e.target.value)}
                  className="bg-[#12151A] border-[#2A2F38] text-zinc-100 pl-10"
                  required
                />
                <div className="absolute right-0 top-0 h-full flex">
                  <button
                    type="button"
                    onClick={() => handleDecrement(setRadiusMeters, radiusMeters)}
                    className="px-3 border-l border-[#2A2F38] hover:bg-[#2A2F38] transition-colors"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => handleIncrement(setRadiusMeters, radiusMeters)}
                    className="px-3 border-l border-[#2A2F38] hover:bg-[#2A2F38] transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Час (хвилини)</Label>
              <div className="relative flex">
                <Timer className="absolute left-3 top-2.5 h-5 w-5 text-zinc-400" />
                <Input
                  id="time"
                  type="number"
                  min="1"
                  value={timeMinutes}
                  onChange={(e) => setTimeMinutes(e.target.value)}
                  className="bg-[#12151A] border-[#2A2F38] text-zinc-100 pl-10"
                  required
                />
                <div className="absolute right-0 top-0 h-full flex">
                  <button
                    type="button"
                    onClick={() => handleDecrement(setTimeMinutes, timeMinutes)}
                    className="px-3 border-l border-[#2A2F38] hover:bg-[#2A2F38] transition-colors"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => handleIncrement(setTimeMinutes, timeMinutes)}
                    className="px-3 border-l border-[#2A2F38] hover:bg-[#2A2F38] transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-transparent border-[#2A2F38] text-zinc-100 hover:bg-[#2A2F38] hover:text-zinc-100"
            >
              Скасувати
            </Button>
            <Button
              type="submit"
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              Зберегти
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomEditPointModal;
