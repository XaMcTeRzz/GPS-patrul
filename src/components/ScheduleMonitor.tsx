import React from 'react';
import { useScheduledPatrol } from '@/hooks/useScheduledPatrol';

/**
 * Компонент для мониторинга расписания патрулирования.
 * Не отображает никакой UI, только запускает мониторинг.
 */
const ScheduleMonitor: React.FC = () => {
  // Используем хук для мониторинга расписания
  useScheduledPatrol();
  
  // Компонент не отображает никакой UI
  return null;
};

export default ScheduleMonitor; 