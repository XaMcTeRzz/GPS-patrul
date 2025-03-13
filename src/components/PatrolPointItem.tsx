
import React from 'react';
import { Edit, Trash, CheckCircle, MapPin, Clock } from 'lucide-react';
import { PatrolPoint } from '@/types/patrol-types';

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
