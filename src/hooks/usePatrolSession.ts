
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { PatrolSession, PatrolPoint, LogEntry, Settings } from '@/types/patrol-types';
import { sendMissedPointNotification } from '@/utils/notificationService';

type UsePatrolSessionProps = {
  patrolPoints: PatrolPoint[];
  addLogEntry: (entry: Omit<LogEntry, 'id'>) => void;
  settings: Settings;
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
      
      const updated = {
        ...prev,
        completedPoints: [...prev.completedPoints, pointId],
      };
      
      // Update in localStorage
      localStorage.setItem('activePatrol', JSON.stringify(updated));
      
      return updated;
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
          
          // Send notifications for missed points if enabled
          if (settings.notificationsEnabled) {
            sendMissedPointNotification(
              settings.telegramBotToken,
              settings.telegramChatId,
              settings.notificationEmail,
              point.name,
              settings.smtpSettings
            );
          }
        });
      }
      
      const updated: PatrolSession = {
        ...prev,
        status: 'completed' as const,
        endTime: new Date().toISOString(),
      };
      
      // Update in localStorage
      localStorage.setItem('activePatrol', JSON.stringify(updated));
      
      return updated;
    });

    // Create a final completed patrol in log
    setTimeout(() => {
      setActivePatrol(null);
      // Remove from localStorage
      localStorage.removeItem('activePatrol');
      toast.success('Обхід завершено');
    }, 500);
  };

  // Monitor for missed points and send notifications
  useEffect(() => {
    if (!activePatrol || activePatrol.status !== 'active' || !settings.notificationsEnabled) return;
    
    const timeoutMinutes = settings.patrolTimeMinutes;
    console.log('Моніторинг пропущених точок налаштований', { 
      timeoutMinutes,
      notificationsEnabled: settings.notificationsEnabled,
      hasTelegramConfig: Boolean(settings.telegramBotToken && settings.telegramChatId),
      hasEmail: Boolean(settings.notificationEmail),
      hasSmtpSettings: Boolean(settings.smtpSettings?.host)
    });
    
    // Create a timeout for each patrol point
    const timeouts = activePatrol.patrolPoints
      .filter(point => !activePatrol.completedPoints.includes(point.id))
      .map(point => {
        return setTimeout(async () => {
          console.log(`Перевірка точки "${point.name}" через ${timeoutMinutes} хвилин...`);
          
          // Check if the point has been completed since the timeout was set
          const currentPatrol = JSON.parse(localStorage.getItem('activePatrol') || 'null');
          if (!currentPatrol || 
              currentPatrol.status !== 'active' || 
              currentPatrol.completedPoints.includes(point.id)) {
            console.log(`Точка "${point.name}" вже перевірена або патруль завершено`);
            return;
          }
          
          console.log(`Точка "${point.name}" не перевірена вчасно! Відправка сповіщення...`);
          
          // Send notification for missed point
          await sendMissedPointNotification(
            settings.telegramBotToken,
            settings.telegramChatId,
            settings.notificationEmail,
            point.name,
            settings.smtpSettings
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
      console.log('Очищення таймерів моніторингу точок');
      timeouts.forEach(clearTimeout);
    };
  }, [activePatrol, settings, addLogEntry]);

  return {
    activePatrol,
    setActivePatrol,
    startPatrol,
    completePatrolPoint,
    endPatrol,
  };
};
