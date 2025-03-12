
import { useState } from 'react';
import { toast } from 'sonner';
import { PatrolSession, PatrolPoint, LogEntry } from '@/types/patrol-types';

type UsePatrolSessionProps = {
  patrolPoints: PatrolPoint[];
  addLogEntry: (entry: Omit<LogEntry, 'id'>) => void;
};

export const usePatrolSession = ({ patrolPoints, addLogEntry }: UsePatrolSessionProps) => {
  const [activePatrol, setActivePatrol] = useState<PatrolSession | null>(() => {
    const saved = localStorage.getItem('activePatrol');
    return saved ? JSON.parse(saved) : null;
  });

  // Start a new patrol session
  const startPatrol = () => {
    if (patrolPoints.length === 0) {
      toast.error('Додайте хоча б одну точку перед початком обходу');
      return;
    }

    const newPatrol: PatrolSession = {
      id: Date.now().toString(),
      startTime: new Date().toISOString(),
      status: 'active',
      patrolPoints: [...patrolPoints],
      completedPoints: [],
    };

    setActivePatrol(newPatrol);
    toast.success('Обхід розпочато');
  };

  // Mark a patrol point as completed
  const completePatrolPoint = (pointId: string) => {
    if (!activePatrol) return;

    const point = patrolPoints.find(p => p.id === pointId);
    if (!point) return;

    // Add to completed points
    setActivePatrol((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        completedPoints: [...prev.completedPoints, pointId],
      };
    });

    // Create a log entry
    addLogEntry({
      patrolId: activePatrol.id,
      pointId,
      pointName: point.name,
      timestamp: new Date().toISOString(),
      status: 'completed',
    });
    
    toast.success(`Точку "${point.name}" перевірено`);
  };

  // End the current patrol
  const endPatrol = () => {
    if (!activePatrol) return;

    setActivePatrol((prev) => {
      if (!prev) return null;
      
      // Create log entries for missed points
      const missedPoints = prev.patrolPoints
        .filter((point) => !prev.completedPoints.includes(point.id));
      
      if (missedPoints.length > 0) {
        missedPoints.forEach(point => {
          addLogEntry({
            patrolId: prev.id,
            pointId: point.id,
            pointName: point.name,
            timestamp: new Date().toISOString(),
            status: 'missed',
          });
        });
      }
      
      return {
        ...prev,
        status: 'completed',
        endTime: new Date().toISOString(),
      };
    });

    // Create a final completed patrol in log
    setTimeout(() => {
      setActivePatrol(null);
      toast.success('Обхід завершено');
    }, 500);
  };

  return {
    activePatrol,
    setActivePatrol,
    startPatrol,
    completePatrolPoint,
    endPatrol,
  };
};
