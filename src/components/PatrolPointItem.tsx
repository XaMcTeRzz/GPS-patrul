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
  const { activePatrol, settings, testMode = false } = usePatrol();
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  
  // Расчет оставшегося времени для точки
  useEffect(() => {
    if (!isVerifiable || isCompleted || !activePatrol) return;
    
    // Получаем время для точки (в минутах)
    const timeoutMinutes = point.timeMinutes || settings.patrolTimeMinutes;
    const timeoutMs = timeoutMinutes * 60 * 1000;
    
    // Применяем множитель времени для тестового режима
    const timeMultiplier = testMode ? 0.1 : 1;
    
    // Вычисляем время начала патруля
    const patrolStartTime = new Date(activePatrol.startTime).getTime();
    
    // Вычисляем время истечения для точки
    const expiryTime = patrolStartTime + (timeoutMs * timeMultiplier);
    
    // Обновляем оставшееся время каждую секунду
    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, expiryTime - now);
      
      if (remaining <= 0) {
        clearInterval(interval);
        setRemainingTime(0);
      } else {
        setRemainingTime(remaining);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [point, isVerifiable, isCompleted, activePatrol, settings, testMode]);
  
  // Форматирование оставшегося времени
  const formatRemainingTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Определение цвета индикатора времени
  const getTimeIndicatorColor = () => {
    if (remainingTime === null) return '';
    
    // Если осталось меньше 20% времени - красный
    if (remainingTime < (point.timeMinutes || settings.patrolTimeMinutes) * 60000 * 0.2 * (testMode ? 0.1 : 1)) {
      return 'text-red-500 bg-red-50';
    }
    // Если осталось меньше 50% времени - желтый
    if (remainingTime < (point.timeMinutes || settings.patrolTimeMinutes) * 60000 * 0.5 * (testMode ? 0.1 : 1)) {
      return 'text-amber-500 bg-amber-50';
    }
    // Иначе зеленый
    return 'text-green-500 bg-green-50';
  };

  return (
    <div className={`border rounded-lg p-4 sm:p-6 mb-4 ${
      isCompleted 
        ? 'bg-green-500/10 border-green-500/20 shadow-lg shadow-green-500/5' 
        : 'bg-[#1A1D24] border-[#2A2F38] hover:border-blue-500/20 transition-colors'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
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
        
        <div className="flex items-center gap-2 sm:gap-3">
          {isVerifiable ? (
            <button
              onClick={onVerify}
              className={`p-3 rounded-lg transition-all flex-1 sm:flex-none ${
                isCompleted
                  ? 'bg-green-500/10 text-green-400 cursor-default'
                  : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:scale-105 active:scale-100'
              }`}
              disabled={isCompleted}
            >
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 mx-auto" />
            </button>
          ) : (
            <>
              {onEdit && (
                <button
                  onClick={() => onEdit(point)}
                  className="p-3 rounded-lg bg-[#12151A] text-blue-400 hover:bg-blue-500/10 hover:scale-105 active:scale-100 transition-all flex-1 sm:flex-none"
                >
                  <Edit className="h-5 w-5 sm:h-6 sm:w-6 mx-auto" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(point.id)}
                  className="p-3 rounded-lg bg-[#12151A] text-red-400 hover:bg-red-500/10 hover:scale-105 active:scale-100 transition-all flex-1 sm:flex-none"
                >
                  <Trash className="h-5 w-5 sm:h-6 sm:w-6 mx-auto" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatrolPointItem;
