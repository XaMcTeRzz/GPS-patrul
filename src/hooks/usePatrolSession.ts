
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { PatrolSession, PatrolPoint, LogEntry } from '@/types/patrol-types';
import { sendMissedPointNotification } from '@/utils/notificationService';

type UsePatrolSessionProps = {
  patrolPoints: PatrolPoint[];
  addLogEntry: (entry: Omit<LogEntry, 'id'>) => void;
  settings: {
    patrolTimeMinutes: number;
    telegramBotToken?: string;
    telegramChatId?: string;
    notificationEmail?: string;
  };
};

export const usePatrolSession = ({ patrolPoints, addLogEntry, settings }: UsePatrolSessionProps) => {
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

  // Monitor for missed points and send notifications
  useEffect(() => {
    if (!activePatrol || activePatrol.status !== 'active') return;
    
    const patrolStartTime = new Date(activePatrol.startTime).getTime();
    const timeoutMinutes = settings.patrolTimeMinutes;
    
    // Create a timeout for each patrol point
    const timeouts = activePatrol.patrolPoints
      .filter(point => !activePatrol.completedPoints.includes(point.id))
      .map(point => {
        return setTimeout(async () => {
          // Check if the point has been completed since the timeout was set
          const currentPatrol = JSON.parse(localStorage.getItem('activePatrol') || 'null');
          if (!currentPatrol || 
              currentPatrol.status !== 'active' || 
              currentPatrol.completedPoints.includes(point.id)) {
            return;
          }
          
          // Send notification for missed point
          await sendMissedPointNotification(
            settings.telegramBotToken,
            settings.telegramChatId,
            settings.notificationEmail,
            point.name
          );
          
          // Add a 'delayed' log entry
          addLogEntry({
            patrolId: activePatrol.id,
            pointId: point.id,
            pointName: point.name,
            timestamp: new Date().toISOString(),
            status: 'delayed',
            notes: `Не пройдена точка протягом ${timeoutMinutes} хвилин`
          });
          
          toast.error(`Точка "${point.name}" не перевірена вчасно!`);
        }, timeoutMinutes * 60 * 1000); // Convert minutes to milliseconds
      });
    
    // Clean up timeouts when component unmounts or patrol status changes
    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [activePatrol, settings.patrolTimeMinutes, settings.telegramBotToken, 
      settings.telegramChatId, settings.notificationEmail, addLogEntry]);

  return {
    activePatrol,
    setActivePatrol,
    startPatrol,
    completePatrolPoint,
    endPatrol,
  };
};
