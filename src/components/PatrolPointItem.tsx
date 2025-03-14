import React, { useState, useEffect } from 'react';
import { Edit, Trash, CheckCircle, MapPinned, Clock, AlertCircle } from 'lucide-react';
import { PatrolPoint } from '@/types/patrol-types';
import { usePatrol } from '@/context/PatrolContext';

type PatrolPointItemProps = {
  point: PatrolPoint;
  onEdit?: (point: PatrolPoint) => void;
  onDelete?: (id: string) => void;
  isVerifiable?: boolean;
  onVerify?: () => void;
  isCompleted?: boolean;
};

const PatrolPointItem: React.FC<PatrolPointItemProps> = ({
  point,
  onEdit,
  onDelete,
  isVerifiable = false,
  onVerify,
  isCompleted = false,
}) => {
  const { settings, testMode = false } = usePatrol();
  const [remainingTime, setRemainingTime] = useState<number | null>(null);

  // Оновлюємо час, що залишився
  useEffect(() => {
    if (!isVerifiable || isCompleted || !point.startTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const startTime = new Date(point.startTime!).getTime();
      const timeoutMs = (point.timeMinutes || settings.patrolTimeMinutes) * 60 * 1000 * (testMode ? 0.1 : 1);
      const remaining = timeoutMs - (now - startTime);
      
      setRemainingTime(Math.max(0, remaining));
      
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [point.startTime, isVerifiable, isCompleted, point.timeMinutes, settings.patrolTimeMinutes, testMode]);

  // Форматуємо час для відображення
  const formatRemainingTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`border rounded-lg p-4 sm:p-6 mb-4 ${
      isCompleted 
        ? 'bg-green-500/10 border-green-500/20 shadow-lg shadow-green-500/5' 
        : 'bg-[#1A1D24] border-[#2A2F38] hover:border-blue-500/20 transition-colors'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-xl sm:text-2xl text-zinc-100 truncate">{point.name}</h3>
          <p className="text-sm sm:text-base text-zinc-400 mt-1 sm:mt-2 line-clamp-2">{point.description}</p>
          
          <div className="flex flex-wrap gap-2 sm:gap-4 mt-3 sm:mt-4">
            <div className="flex items-center text-sm sm:text-base text-zinc-400 bg-[#12151A] px-3 sm:px-4 py-2 rounded-lg">
              <MapPinned className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-400 flex-shrink-0" />
              <span className="truncate">Радіус: {point.radiusMeters}м</span>
            </div>
            
            <div className="flex items-center text-sm sm:text-base text-zinc-400 bg-[#12151A] px-3 sm:px-4 py-2 rounded-lg">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-400 flex-shrink-0" />
              <span className="truncate">Час: {point.timeMinutes} хв</span>
            </div>
            
            {isVerifiable && !isCompleted && remainingTime !== null && (
              <div className={`flex items-center text-sm sm:text-base px-3 sm:px-4 py-2 rounded-lg flex-shrink-0 ${
                remainingTime < (point.timeMinutes || settings.patrolTimeMinutes) * 60000 * 0.2 * (testMode ? 0.1 : 1)
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                  : remainingTime < (point.timeMinutes || settings.patrolTimeMinutes) * 60000 * 0.5 * (testMode ? 0.1 : 1)
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-green-500/10 text-green-400 border border-green-500/20'
              }`}>
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                <span className="tabular-nums font-medium">{formatRemainingTime(remainingTime)}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col gap-2 ml-4">
          {isVerifiable && !isCompleted && (
            <button
              onClick={onVerify}
              className="btn-primary p-2 rounded-lg"
              title="Перевірити точку"
            >
              <CheckCircle className="h-6 w-6" />
            </button>
          )}
          
          {onEdit && !isVerifiable && (
            <button
              onClick={() => onEdit(point)}
              className="btn-outline p-2 rounded-lg"
              title="Редагувати точку"
            >
              <Edit className="h-6 w-6" />
            </button>
          )}
          
          {onDelete && !isVerifiable && (
            <button
              onClick={() => onDelete(point.id)}
              className="btn-outline p-2 rounded-lg text-red-400 hover:text-red-300"
              title="Видалити точку"
            >
              <Trash className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatrolPointItem;
