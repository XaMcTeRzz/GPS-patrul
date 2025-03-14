import { type PatrolPoint } from '@/types/patrol-types';

export const formatCoordinate = (value: number): string => {
  return value.toString().replace(/^0+/, '');
};

export const formatTime = (minutes: number): string => {
  return minutes.toString().replace(/^0+/, '');
};

export const formatReport = (patrolPoints: PatrolPoint[]) => {
  const completedPoints = patrolPoints.filter(point => point.isCompleted);
  const missedPoints = patrolPoints.filter(point => !point.isCompleted);
  
  let report = '📊 Звіт про патрулювання:\n\n';
  
  if (completedPoints.length > 0) {
    report += '✅ Перевірені точки:\n';
    completedPoints.forEach(point => {
      report += `• ${point.name} (${formatTime(point.timeMinutes)} хв)\n`;
    });
    report += '\n';
  }
  
  if (missedPoints.length > 0) {
    report += '❌ Не перевірені точки:\n';
    missedPoints.forEach(point => {
      report += `• ${point.name} (${formatTime(point.timeMinutes)} хв)\n`;
    });
  }
  
  report += `\n📈 Статистика:\n`;
  report += `• Всього точок: ${patrolPoints.length}\n`;
  report += `• Перевірено: ${completedPoints.length}\n`;
  report += `• Не перевірено: ${missedPoints.length}\n`;
  
  return report;
}; 