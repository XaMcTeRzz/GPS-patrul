import { type PatrolPoint } from '@/types/patrol-types';

export const formatCoordinate = (value: number): string => {
  return value.toString().replace(/^0+/, '');
};

export const formatTime = (minutes: number): string => {
  return minutes.toString().replace(/^0+/, '');
};

export const formatReport = (patrolPoints: PatrolPoint[], startTime: string) => {
  const completedPoints = patrolPoints.filter(point => point.isCompleted);
  const missedPoints = patrolPoints.filter(point => !point.isCompleted);
  
  const startDate = new Date(startTime);
  const endDate = new Date();
  const duration = Math.floor((endDate.getTime() - startDate.getTime()) / 60000); // в минутах
  
  let report = '📊 Звіт про патрулювання:\n\n';
  report += `🕒 Початок: ${startDate.toLocaleTimeString()}\n`;
  report += `🏁 Кінець: ${endDate.toLocaleTimeString()}\n`;
  report += `⏱ Тривалість: ${duration} хв\n\n`;
  
  if (completedPoints.length > 0) {
    report += '✅ Перевірені точки:\n';
    completedPoints.forEach(point => {
      report += `• ${point.name}\n`;
      report += `  📍 Координати: ${formatCoordinate(point.latitude)}, ${formatCoordinate(point.longitude)}\n`;
      report += `  ⭕️ Радіус: ${formatTime(point.radiusMeters)}м\n`;
      report += `  ⏱ Час: ${formatTime(point.timeMinutes)} хв\n\n`;
    });
  }
  
  if (missedPoints.length > 0) {
    report += '❌ Не перевірені точки:\n';
    missedPoints.forEach(point => {
      report += `• ${point.name}\n`;
      report += `  📍 Координати: ${formatCoordinate(point.latitude)}, ${formatCoordinate(point.longitude)}\n`;
      report += `  ⭕️ Радіус: ${formatTime(point.radiusMeters)}м\n`;
      report += `  ⏱ Час: ${formatTime(point.timeMinutes)} хв\n\n`;
    });
  }
  
  report += `📈 Підсумок:\n`;
  report += `• Всього точок: ${patrolPoints.length}\n`;
  report += `• Перевірено: ${completedPoints.length}\n`;
  report += `• Не перевірено: ${missedPoints.length}\n`;
  report += `• Ефективність: ${Math.round((completedPoints.length / patrolPoints.length) * 100)}%\n`;
  
  return report;
}; 