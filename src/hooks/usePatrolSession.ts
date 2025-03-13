import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { PatrolSession, PatrolPoint, LogEntry, Settings } from '@/types/patrol-types';
import { sendMissedPointNotification } from '@/utils/notificationService';

type UsePatrolSessionProps = {
  patrolPoints: PatrolPoint[];
  addLogEntry: (entry: Omit<LogEntry, 'id'>) => void;
  settings: Settings;
};

// Тип для задачи мониторинга точки
type PointMonitorTask = {
  pointId: string;
  pointName: string;
  expiryTime: number; // Время истечения в миллисекундах
  timeoutMinutes: number;
};

export const usePatrolSession = ({ patrolPoints, addLogEntry, settings }: UsePatrolSessionProps) => {
  const [activePatrol, setActivePatrol] = useState<PatrolSession | null>(() => {
    const saved = localStorage.getItem('activePatrol');
    return saved ? JSON.parse(saved) : null;
  });
  
  // Используем useRef для хранения задач мониторинга
  const monitorTasksRef = useRef<PointMonitorTask[]>([]);
  const monitorIntervalRef = useRef<number | null>(null);
  
  // Флаг для тестового режима с ускоренным временем
  const [testMode, setTestMode] = useState(false);
  const timeMultiplier = testMode ? 0.1 : 1; // В тестовом режиме время ускоряется в 10 раз

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
  
  // Функция для проверки и обработки просроченных точек
  const checkExpiredPoints = useCallback(async () => {
    if (!activePatrol || activePatrol.status !== 'active') return;
    
    const now = Date.now();
    const expiredTasks: PointMonitorTask[] = [];
    
    // Находим просроченные задачи
    monitorTasksRef.current = monitorTasksRef.current.filter(task => {
      if (now >= task.expiryTime && 
          !activePatrol.completedPoints.includes(task.pointId)) {
        expiredTasks.push(task);
        return false;
      }
      return true;
    });
    
    // Обрабатываем просроченные задачи
    for (const task of expiredTasks) {
      console.log(`Точка "${task.pointName}" не перевірена вчасно! Відправка сповіщення...`);
      
      // Проверяем актуальное состояние патруля
      const currentPatrol = JSON.parse(localStorage.getItem('activePatrol') || 'null');
      if (!currentPatrol || 
          currentPatrol.status !== 'active' || 
          currentPatrol.completedPoints.includes(task.pointId)) {
        console.log(`Точка "${task.pointName}" вже перевірена або патруль завершено`);
        continue;
      }
      
      // Отправляем уведомление
      if (settings.notificationsEnabled) {
        await sendMissedPointNotification(
          settings.telegramBotToken,
          settings.telegramChatId,
          settings.notificationEmail,
          task.pointName,
          settings.smtpSettings
        );
      }
      
      // Добавляем запись в журнал
      addLogEntry({
        patrolId: activePatrol.id,
        pointId: task.pointId,
        pointName: task.pointName,
        timestamp: new Date().toISOString(),
        status: 'delayed',
        notes: `Не пройдена точка протягом ${task.timeoutMinutes} хвилин`
      });
      
      toast.error(`Точка "${task.pointName}" не перевірена вчасно!`);
    }
    
    // Если задач больше нет, останавливаем интервал
    if (monitorTasksRef.current.length === 0 && monitorIntervalRef.current !== null) {
      clearInterval(monitorIntervalRef.current);
      monitorIntervalRef.current = null;
    }
  }, [activePatrol, settings, addLogEntry]);
  
  // Функция для настройки мониторинга точек
  const setupPointsMonitoring = useCallback(() => {
    if (!activePatrol || activePatrol.status !== 'active') return;
    
    const defaultTimeoutMinutes = settings.patrolTimeMinutes;
    console.log('Моніторинг пропущених точок налаштований', { 
      defaultTimeoutMinutes,
      notificationsEnabled: settings.notificationsEnabled,
      hasTelegramConfig: Boolean(settings.telegramBotToken && settings.telegramChatId),
      hasEmail: Boolean(settings.notificationEmail),
      hasSmtpSettings: Boolean(settings.smtpSettings?.host),
      testMode,
      timeMultiplier
    });
    
    // Очищаем предыдущие задачи
    monitorTasksRef.current = [];
    
    // Создаем задачи для каждой непроверенной точки
    activePatrol.patrolPoints
      .filter(point => !activePatrol.completedPoints.includes(point.id))
      .forEach(point => {
        // Используем время для конкретной точки или время по умолчанию
        const timeoutMinutes = point.timeMinutes || defaultTimeoutMinutes;
        const timeoutMs = timeoutMinutes * 60 * 1000 * timeMultiplier;
        
        console.log(`Налаштування моніторингу для точки "${point.name}": ${timeoutMinutes} хвилин (${testMode ? 'тестовий режим' : 'звичайний режим'})`);
        
        // Добавляем задачу в список
        monitorTasksRef.current.push({
          pointId: point.id,
          pointName: point.name,
          expiryTime: Date.now() + timeoutMs,
          timeoutMinutes
        });
      });
    
    // Запускаем интервал для проверки задач, если есть задачи
    if (monitorTasksRef.current.length > 0 && monitorIntervalRef.current === null) {
      // Проверяем каждые 10 секунд (или чаще в тестовом режиме)
      const checkInterval = testMode ? 1000 : 10000;
      monitorIntervalRef.current = window.setInterval(checkExpiredPoints, checkInterval);
    }
  }, [activePatrol, settings, checkExpiredPoints, testMode, timeMultiplier]);
  
  // Включение/выключение тестового режима
  const toggleTestMode = useCallback(() => {
    setTestMode(prev => !prev);
    toast.info(`Тестовий режим ${!testMode ? 'увімкнено' : 'вимкнено'}`);
  }, [testMode]);

  // Настраиваем мониторинг при изменении активного патруля или настроек
  useEffect(() => {
    setupPointsMonitoring();
    
    // Очищаем интервал при размонтировании
    return () => {
      if (monitorIntervalRef.current !== null) {
        clearInterval(monitorIntervalRef.current);
        monitorIntervalRef.current = null;
      }
    };
  }, [activePatrol, settings, setupPointsMonitoring, testMode]);

  return {
    activePatrol,
    setActivePatrol,
    startPatrol,
    completePatrolPoint,
    endPatrol,
    toggleTestMode,
    testMode
  };
};
