import React from 'react';
import { Edit, Trash, MapPinned } from 'lucide-react';
import { type PatrolPoint as PatrolPointType } from '@/types/patrol-types';

interface PatrolPointProps {
  point: PatrolPointType;
  onEdit: (point: PatrolPointType) => void;
  onDelete: (id: string) => void;
  isVerifiable?: boolean;
  onVerify?: () => void;
  isCompleted?: boolean;
}

const PatrolPoint = ({
  point,
  onEdit,
  onDelete,
  isVerifiable = false,
  onVerify,
  isCompleted = false,
}: PatrolPointProps) => {
  return (
    <div 
      className={`
        bg-card border rounded-lg p-8 mb-6 shadow-sm 
        ${isVerifiable && !isCompleted ? 'card-hover' : ''}
        ${isCompleted ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''}
      `}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-4">
          <div className={`
            mt-1 p-3 rounded-full 
            ${isCompleted 
              ? 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400' 
              : 'bg-primary/10 text-primary'}
          `}>
            <MapPinned className="h-10 w-10" />
          </div>
          <div>
            <h3 className="font-medium text-2xl">{point.name}</h3>
            <p className="text-base text-muted-foreground mt-2">{point.description}</p>
            <div className="flex items-center mt-3 text-base">
              <span>Шир.: {point.latitude.toFixed(6)}</span>
              <span className="mx-3">•</span>
              <span>Дов.: {point.longitude.toFixed(6)}</span>
              <span className="mx-3">•</span>
              <span>Радіус: {point.radiusMeters}м</span>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          {!isVerifiable && (
            <>
              <button
                onClick={() => onEdit(point)}
                className="p-3 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                aria-label="Редагувати"
              >
                <Edit className="h-7 w-7" />
              </button>
              <button
                onClick={() => onDelete(point.id)}
                className="p-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                aria-label="Видалити"
              >
                <Trash className="h-7 w-7" />
              </button>
            </>
          )}
          
          {isVerifiable && !isCompleted && onVerify && (
            <button
              onClick={onVerify}
              className="btn-primary text-lg py-2 px-4"
            >
              На точці
            </button>
          )}
          
          {isVerifiable && isCompleted && (
            <span className="text-lg text-green-600 dark:text-green-400 font-medium bg-green-100 dark:bg-green-900/40 px-4 py-2 rounded-full">
              Перевірено
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatrolPoint;
