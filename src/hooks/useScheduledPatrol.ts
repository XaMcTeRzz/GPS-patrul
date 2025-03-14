import { useEffect, useRef, useCallback } from 'react';
import { usePatrol } from '@/context/PatrolContext';
import { toast } from 'sonner';
import { ScheduleTime } from '@/types/patrol-types';

/**
 * Хук для управления автоматическим запуском патрулирования по расписанию
 */
export const useScheduledPatrol = () => {
  const { 
    settings, 
    startPatrol, 
    activePatrol, 
    patrolPoints 
  } = usePatrol();
  
  const checkIntervalRef = useRef<number | null>(null);
  
  // Функція для відкриття браузера на сторінці патрулювання
  const openPatrolPage = useCallback(() => {
    // Створюємо URL з параметром autostart
    const patrolUrl = `${window.location.origin}/patrol?autostart=true`;
    
    // Перевіряємо, чи підтримується PWA
    if ('serviceWorker' in navigator && window.matchMedia('(display-mode: standalone)').matches) {
      // Якщо додаток вже встановлено як PWA, просто відкриваємо URL
      window.open(patrolUrl, '_blank');
    } else {
      // Якщо це звичайний браузер, відкриваємо URL в новому вікні
      const newWindow = window.open(patrolUrl, '_blank');
      if (newWindow) {
        newWindow.focus();
      }
    }
  }, []);
  
  // Функция для проверки, нужно ли запустить патрулирование
  const checkSchedule = useCallback(() => {
    if (!settings.scheduleEnabled || activePatrol || patrolPoints.length === 0) {
      return;
    }
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Проверяем каждое расписание
    settings.scheduledPatrols.forEach(schedule => {
      if (!schedule.enabled) return;
      
      if (currentHour === schedule.hour && currentMinute === schedule.minute) {
        console.log(`Запуск автоматического патрулирования по расписанию: ${schedule.hour}:${schedule.minute}`);
        toast.info(`Запуск автоматического патрулирования по расписанию: ${schedule.hour}:${schedule.minute.toString().padStart(2, '0')}`);
        
        // Відкриваємо браузер перед запуском патрулювання
        openPatrolPage();
        
        // Запускаємо патрулювання
        startPatrol();
      }
    });
  }, [settings.scheduleEnabled, settings.scheduledPatrols, activePatrol, patrolPoints, startPatrol, openPatrolPage]);
  
  // Запускаем проверку расписания каждую минуту
  useEffect(() => {
    // Очищаем предыдущий интервал
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
    
    // Если расписание включено, запускаем проверку
    if (settings.scheduleEnabled) {
      console.log('Мониторинг расписания патрулирования активирован');
      
      // Запускаем проверку сразу
      checkSchedule();
      
      // Устанавливаем интервал проверки каждую минуту
      checkIntervalRef.current = window.setInterval(() => {
        checkSchedule();
      }, 60000); // 60 секунд
    } else {
      console.log('Мониторинг расписания патрулирования деактивирован');
    }
    
    // Очищаем интервал при размонтировании
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, [settings.scheduleEnabled, checkSchedule]);
  
  // Функция для форматирования времени
  const formatScheduleTime = (schedule: ScheduleTime): string => {
    return `${schedule.hour.toString().padStart(2, '0')}:${schedule.minute.toString().padStart(2, '0')}`;
  };
  
  return {
    formatScheduleTime
  };
}; 