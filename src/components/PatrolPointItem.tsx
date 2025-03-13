import React, { useState, useEffect } from 'react';
import { Edit, Trash, CheckCircle, MapPin, Clock, AlertCircle } from 'lucide-react';
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
    <div className={`bg-card border rounded-lg p-4 mb-4 ${isCompleted ? 'border-green-500 bg-green-50' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-medium text-lg">{point.name}</h3>
          <p className="text-sm text-muted-foreground">{point.description}</p>
          
          <div className="flex flex-wrap gap-3 mt-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              <span>Радіус: {point.radiusMeters}м</span>
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              <span>Час: {point.timeMinutes} хв</span>
            </div>
            
            {isVerifiable && !isCompleted && remainingTime !== null && (
              <div className={`flex items-center text-sm px-2 py-0.5 rounded-full ${getTimeIndicatorColor()}`}>
                <AlertCircle className="h-3.5 w-3.5 mr-1" />
                <span>{formatRemainingTime(remainingTime)}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isVerifiable ? (
            <button
              onClick={onVerify}
              className={`p-2 rounded-full ${
                isCompleted
                  ? 'bg-green-100 text-green-600 cursor-default'
                  : 'bg-primary/10 text-primary hover:bg-primary/20'
              }`}
              disabled={isCompleted}
            >
              <CheckCircle className="h-5 w-5" />
            </button>
          ) : (
            <>
              {onEdit && (
                <button
                  onClick={() => onEdit(point)}
                  className="p-2 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100"
                >
                  <Edit className="h-5 w-5" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(point.id)}
                  className="p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100"
                >
                  <Trash className="h-5 w-5" />
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
