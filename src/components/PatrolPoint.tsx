import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, MapPinned, MapPin, Clock, AlertCircle } from 'lucide-react';
import { type PatrolPoint as PatrolPointType, type PatrolNotification } from '@/types/patrol-types';
import { usePatrol } from '@/context/PatrolContext';
import { formatTime, formatCoordinate } from '@/utils/format';

interface PatrolPointProps {
  point: PatrolPointType;
  onEdit: (point: PatrolPointType) => void;
  onDelete: (id: string) => void;
  isVerifiable?: boolean;
  onVerify?: () => void;
  isCompleted?: boolean;
  startTime?: number;
}

const PatrolPoint = ({
  point,
  onEdit,
  onDelete,
  isVerifiable = false,
  onVerify,
  isCompleted = false,
  startTime,
}: PatrolPointProps) => {
  const { settings, sendNotification } = usePatrol();
  const [isExtraTime, setIsExtraTime] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const EXTRA_TIME = 30; // 30 seconds

  useEffect(() => {
    if (!isVerifiable || isCompleted || !startTime) return;

    const totalTime = point.timeMinutes * 60; // Convert to seconds
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      const remaining = totalTime - elapsed;

      if (remaining <= 0 && !isExtraTime) {
        // Start extra time
        setIsExtraTime(true);
        setTimeLeft(EXTRA_TIME);
      } else if (isExtraTime && remaining <= -EXTRA_TIME) {
        // Extra time expired
        clearInterval(interval);
        setTimeLeft(0);
        if (!isCompleted) {
          sendNotification({
            type: 'point_expired',
            pointName: point.name,
            message: `Точка "${point.name}" не була перевірена вчасно. Минуло ${point.timeMinutes} хвилин основного часу та ${EXTRA_TIME} секунд додаткового часу.`
          });
        }
      } else if (isExtraTime) {
        setTimeLeft(EXTRA_TIME + remaining);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, isVerifiable, isCompleted, isExtraTime, point.timeMinutes, point.name]);

  return (
    <div className={`p-4 sm:p-6 mb-3 sm:mb-4 rounded-lg border 
      ${isCompleted 
        ? 'bg-green-900/20 border-green-400/20' 
        : isExtraTime 
          ? 'bg-red-900/20 border-red-400/20' 
          : 'bg-zinc-800 border-zinc-700'
      }`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex-shrink-0">
          <MapPinned className={`h-10 w-10 sm:h-12 sm:w-12 ${
            isExtraTime ? 'text-red-400' : 'text-blue-400'
          }`} />
        </div>
        <div className="flex-grow min-w-0">
          <h3 className="text-lg sm:text-xl font-medium text-zinc-100 mb-1">{point.name}</h3>
          <p className="text-sm sm:text-base text-zinc-400 mb-3">{point.description}</p>
          <div className="flex flex-wrap gap-2 sm:gap-3 text-sm sm:text-base text-zinc-400">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Координати: {formatCoordinate(point.latitude)}, {formatCoordinate(point.longitude)}</span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Радіус: {formatTime(point.radiusMeters)}м</span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Clock className={`h-4 w-4 sm:h-5 sm:w-5 ${
                isExtraTime ? 'text-red-400' : ''
              }`} />
              <span className={isExtraTime ? 'text-red-400' : ''}>
                {timeLeft !== null ? (
                  isExtraTime ? 
                    `Додатковий час: ${timeLeft}с` : 
                    `Час: ${formatTime(Math.floor(timeLeft / 60))}:${String(timeLeft % 60).padStart(2, '0')}`
                ) : (
                  `Час: ${formatTime(point.timeMinutes)} хв`
                )}
              </span>
            </div>
            {isExtraTime && !isCompleted && (
              <div className="flex items-center space-x-1 sm:space-x-2 text-red-400">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Додатковий час!</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-shrink-0 gap-2">
          {!isVerifiable && (
            <>
              <button
                onClick={() => onEdit(point)}
                className="p-2 sm:p-2.5 rounded-lg hover:bg-zinc-700/50"
              >
                <Edit2 className="h-5 w-5 sm:h-6 sm:w-6 text-zinc-400" />
              </button>
              <button
                onClick={() => onDelete(point.id)}
                className="p-2 sm:p-2.5 rounded-lg hover:bg-zinc-700/50"
              >
                <Trash2 className="h-5 w-5 sm:h-6 sm:w-6 text-red-400" />
              </button>
            </>
          )}
          {isVerifiable && !isCompleted && onVerify && (
            <button
              onClick={onVerify}
              className={`btn-primary text-base sm:text-lg py-2 px-4 ${
                isExtraTime ? 'bg-red-500 hover:bg-red-600' : ''
              }`}
            >
              На точці
            </button>
          )}
          {isVerifiable && isCompleted && (
            <span className="text-base sm:text-lg text-green-400 font-medium bg-green-900/40 px-4 py-2 rounded-full">
              Перевірено
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatrolPoint;
