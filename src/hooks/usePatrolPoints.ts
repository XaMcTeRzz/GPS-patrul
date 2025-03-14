import { useState } from 'react';
import { toast } from 'sonner';
import { PatrolPoint } from '@/types/patrol-types';

export const usePatrolPoints = () => {
  const [patrolPoints, setPatrolPoints] = useState<PatrolPoint[]>(() => {
    const saved = localStorage.getItem('patrolPoints');
    return saved ? JSON.parse(saved) : [];
  });

  const [loading, setLoading] = useState(false);

  // Add a new patrol point
  const addPatrolPoint = (point: Omit<PatrolPoint, 'id'>) => {
    setLoading(true);
    const newPoint = {
      ...point,
      id: Date.now().toString(),
      timeMinutes: point.timeMinutes || 5, // Default to 5 minutes if not specified
    };
    
    setPatrolPoints((prev) => {
      const updated = [...prev, newPoint];
      localStorage.setItem('patrolPoints', JSON.stringify(updated));
      return updated;
    });
    
    toast.success('Точку додано успішно');
    setLoading(false);
  };

  // Update an existing patrol point
  const updatePatrolPoint = (id: string, updatedData: Partial<PatrolPoint>) => {
    setLoading(true);
    setPatrolPoints((prev) => {
      const updated = prev.map((point) =>
        point.id === id ? { ...point, ...updatedData } : point
      );
      localStorage.setItem('patrolPoints', JSON.stringify(updated));
      return updated;
    });
    toast.success('Точку оновлено успішно');
    setLoading(false);
  };

  // Delete a patrol point
  const deletePatrolPoint = (id: string) => {
    setLoading(true);
    setPatrolPoints((prev) => {
      const updated = prev.filter((point) => point.id !== id);
      localStorage.setItem('patrolPoints', JSON.stringify(updated));
      return updated;
    });
    toast.success('Точку видалено успішно');
    setLoading(false);
  };

  return {
    patrolPoints,
    setPatrolPoints,
    addPatrolPoint,
    updatePatrolPoint,
    deletePatrolPoint,
    loading,
  };
};

