import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { PatrolSession, PatrolPoint, LogEntry, Settings } from '@/types/patrol-types';
import { sendMissedPointNotification } from '@/utils/notificationService';
import { v4 as uuidv4 } from 'uuid';
import { formatReport } from '@/utils/format';

type UsePatrolSessionProps = {
  patrolPoints: PatrolPoint[];
  addLogEntry: (entry: Omit<LogEntry, 'id'>) => void;
  settings: Settings;
  sendNotification: (notification: any) => Promise<void>;
};

// Тип для задачи мониторинга точки
type PointMonitorTask = {
  pointId: string;
  pointName: string;
  expiryTime: number; // Время истечения в миллисекундах
  timeoutMinutes: number;
};

export const usePatrolSession = ({ patrolPoints, addLogEntry, settings, sendNotification }: UsePatrolSessionProps) => {
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

  // Load active patrol from localStorage on mount
  useEffect(() => {
    const savedPatrol = localStorage.getItem('activePatrol');
    if (savedPatrol) {
      setActivePatrol(JSON.parse(savedPatrol));
    }
  }, []);

  // Start a new patrol session
  const startPatrol = () => {
    if (patrolPoints.length === 0) {
      toast.error('Додайте хоча б одну точку перед початком обходу');
      return;
    }

    const startTime = new Date().toISOString();
    const newPatrol: PatrolSession = {
      id: uuidv4(),
      startTime,
      status: 'active',
      patrolPoints: patrolPoints.map((point, index) => ({
        ...point,
        isCompleted: false,
        startTime: new Date(Date.parse(startTime) + index * 1000).toISOString() // Додаємо 1 секунду між точками
      })),
      completedPoints: []
    };

    setActivePatrol(newPatrol);
    toast.success('Обхід розпочато');
    
    // Отправляем уведомление о начале патруля
    sendNotification({
      type: 'patrol_started',
      message: '🚀 Патрулювання розпочато'
    });
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
        patrolPoints: prev.patrolPoints.map(p =>
          p.id === pointId ? { ...p, isCompleted: true } : p
        ),
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
  const endPatrol = async () => {
    if (!activePatrol) return;

    const updatedPatrol = {
      ...activePatrol,
      status: 'completed' as const,
      endTime: new Date().toISOString(),
    };

    // Create log entries for missed points
    const missedPoints = updatedPatrol.patrolPoints
      .filter((point) => !updatedPatrol.completedPoints.includes(point.id));
    
    if (missedPoints.length > 0) {
      missedPoints.forEach(point => {
        addLogEntry({
          patrolId: updatedPatrol.id,
          pointId: point.id,
          pointName: point.name,
          timestamp: new Date().toISOString(),
          status: 'missed',
        });
      });
    }

    // Update in localStorage
    localStorage.setItem('activePatrol', JSON.stringify(updatedPatrol));
    setActivePatrol(updatedPatrol);

    try {
      // Создаем отчет
      const report = formatReport(updatedPatrol.patrolPoints, updatedPatrol.startTime);

      // Отправляем отчет
      await sendNotification({
        type: 'patrol_completed',
        message: report
      });

      // Очищаем активный патруль
      setActivePatrol(null);
      localStorage.removeItem('activePatrol');
      toast.success('Обхід завершено');
    } catch (error) {
      console.error('Error ending patrol:', error);
      toast.error('Помилка при завершенні обходу');
    }
  };
  
  // Функция для проверки и обработки просроченных точек
  const checkExpiredPoints = useCallback(async () => {
    if (!activePatrol || activePatrol.status !== 'active') return;
    
    const now = Date.now();
    let hasExpiredPoints = false;
    
    // Проверяем каждую точку патруля
    for (const point of activePatrol.patrolPoints) {
      // Пропускаем уже завершенные точки
      if (activePatrol.completedPoints.includes(point.id)) {
        continue;
      }

      // Вычисляем время истечения для точки
      const startTime = new Date(point.startTime!).getTime();
      const timeoutMs = (point.timeMinutes || settings.patrolTimeMinutes) * 60 * 1000 * (testMode ? 0.1 : 1);
      const isExpired = now >= startTime + timeoutMs;

      if (isExpired) {
        hasExpiredPoints = true;
        console.log(`Точка "${point.name}" не перевірена вчасно! Відправка сповіщення...`);

        // Отправляем уведомление
        if (settings.notificationsEnabled) {
          await sendMissedPointNotification(point, {
            telegramBotToken: settings.telegramBotToken,
            telegramChatId: settings.telegramChatId,
            ...settings.smtpSettings
          });
        }

        // Добавляем запись в журнал
        addLogEntry({
          patrolId: activePatrol.id,
          pointId: point.id,
          pointName: point.name,
          timestamp: new Date().toISOString(),
          status: 'delayed',
          notes: `Не пройдена точка протягом ${point.timeMinutes || settings.patrolTimeMinutes} хвилин`
        });

        toast.error(`Точка "${point.name}" не перевірена вчасно!`);
      }
    }

    // Проверяем, все ли точки или просрочены, или завершены
    const allPointsProcessed = activePatrol.patrolPoints.every(point => {
      if (activePatrol.completedPoints.includes(point.id)) {
        return true; // Точка завершена
      }

      const startTime = new Date(point.startTime!).getTime();
      const timeoutMs = (point.timeMinutes || settings.patrolTimeMinutes) * 60 * 1000 * (testMode ? 0.1 : 1);
      return now >= startTime + timeoutMs; // Точка просрочена
    });

    // Если все точки обработаны, завершаем патруль
    if (allPointsProcessed) {
      console.log('Всі точки оброблені (завершені або просрочені). Автоматичне завершення патруля...');
      toast.info('Обхід автоматично завершено - час для всіх точок вийшов');
      
      // Очищаем интервал мониторинга
      if (monitorIntervalRef.current !== null) {
        clearInterval(monitorIntervalRef.current);
        monitorIntervalRef.current = null;
      }
      
      // Завершаем патруль
      await endPatrol();
    }
  }, [activePatrol, settings, addLogEntry, patrolPoints, endPatrol, testMode]);
  
  // Функция для настройки мониторинга точек
  const setupPointsMonitoring = useCallback(() => {
    if (!activePatrol || activePatrol.status !== 'active') return;
    
    console.log('Налаштування моніторингу точок...', {
      pointsCount: activePatrol.patrolPoints.length,
      completedCount: activePatrol.completedPoints.length,
      testMode,
      timeMultiplier: testMode ? 0.1 : 1
    });

    // Запускаем интервал для проверки точек
    if (monitorIntervalRef.current === null) {
      const checkInterval = testMode ? 1000 : 10000; // Каждую секунду в тестовом режиме, каждые 10 секунд в обычном
      monitorIntervalRef.current = window.setInterval(checkExpiredPoints, checkInterval);
      console.log(`Моніторинг запущено з інтервалом ${checkInterval}ms`);
    }
  }, [activePatrol, checkExpiredPoints, testMode]);
  
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
