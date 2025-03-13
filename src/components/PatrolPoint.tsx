import React from 'react';
import { Edit, Trash, MapPinned, Edit2, Trash2 } from 'lucide-react';
import { type PatrolPoint as PatrolPointType } from '@/types/patrol-types';
import { MapPin, Clock } from 'lucide-react';

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
    <div className={`p-4 sm:p-6 mb-3 sm:mb-4 rounded-lg border ${isCompleted ? 'bg-green-900/20 border-green-400/20' : 'bg-zinc-800 border-zinc-700'}`}>
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex-shrink-0">
          <MapPinned className="h-10 w-10 sm:h-12 sm:w-12 text-blue-400" />
        </div>
        <div className="flex-grow min-w-0">
          <h3 className="text-lg sm:text-xl font-medium text-zinc-100 mb-1">{point.name}</h3>
          <p className="text-sm sm:text-base text-zinc-400 mb-3">{point.description}</p>
          <div className="flex flex-wrap gap-2 sm:gap-3 text-sm sm:text-base text-zinc-400">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Радіус: {point.radiusMeters}м</span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Час: {point.timeMinutes} хв</span>
            </div>
          </div>
        </div>
        <div className="flex flex-shrink-0 gap-2">
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
        </div>
      </div>
    </div>
  );
};

export default PatrolPoint;
