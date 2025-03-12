
import React from 'react';
import { Edit, Trash, MapPin } from 'lucide-react';
import { type PatrolPoint as PatrolPointType } from '@/context/PatrolContext';

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
        bg-card border rounded-lg p-4 mb-3 shadow-sm 
        ${isVerifiable && !isCompleted ? 'card-hover' : ''}
        ${isCompleted ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''}
      `}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-3">
          <div className={`
            mt-1 p-2 rounded-full 
            ${isCompleted 
              ? 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400' 
              : 'bg-primary/10 text-primary'}
          `}>
            <MapPin className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-medium text-card-foreground">{point.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{point.description}</p>
            <div className="flex items-center mt-2 text-xs text-muted-foreground">
              <span>Lat: {point.latitude.toFixed(6)}</span>
              <span className="mx-2">•</span>
              <span>Lng: {point.longitude.toFixed(6)}</span>
              <span className="mx-2">•</span>
              <span>Radius: {point.radiusMeters}m</span>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          {!isVerifiable && (
            <>
              <button
                onClick={() => onEdit(point)}
                className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                aria-label="Edit"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(point.id)}
                className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                aria-label="Delete"
              >
                <Trash className="h-4 w-4" />
              </button>
            </>
          )}
          
          {isVerifiable && !isCompleted && onVerify && (
            <button
              onClick={onVerify}
              className="btn-primary text-xs py-1.5"
            >
              Verify
            </button>
          )}
          
          {isVerifiable && isCompleted && (
            <span className="text-xs text-green-600 dark:text-green-400 font-medium bg-green-100 dark:bg-green-900/40 px-2.5 py-1 rounded-full">
              Verified
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatrolPoint;
