
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Check, AlertTriangle, Timer, Clock } from 'lucide-react';
import { usePatrol } from '@/context/PatrolContext';
import Navbar from '@/components/Navbar';
import PatrolPointItem from '@/components/PatrolPointItem';
import { useGeolocation } from '@/hooks/useGeolocation';
import { toast } from 'sonner';

const Patrol = () => {
  const navigate = useNavigate();
  const { 
    activePatrol, 
    completePatrolPoint, 
    endPatrol,
    settings
  } = usePatrol();
  
  const [remainingPoints, setRemainingPoints] = useState<string[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const {
    position,
    startWatching,
    stopWatching,
    isWithinRadius
  } = useGeolocation({
    enableHighAccuracy: true,
    maximumAge: 10000,
    timeout: 15000
  });

  // Redirect if no active patrol
  useEffect(() => {
    if (!activePatrol) {
      navigate('/');
    } else {
      // Start location tracking
      startWatching();
      
      // Set initial remaining points
      setRemainingPoints(
        activePatrol.patrolPoints
          .filter(point => !activePatrol.completedPoints.includes(point.id))
          .map(point => point.id)
      );
    }
    
    return () => {
      stopWatching();
    };
  }, [activePatrol, navigate, startWatching, stopWatching]);

  // Update elapsed time
  useEffect(() => {
    if (!activePatrol) return;
    
    const start = new Date(activePatrol.startTime).getTime();
    
    const interval = setInterval(() => {
      const now = Date.now();
      setElapsedTime(Math.floor((now - start) / 1000));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [activePatrol]);

  // Format elapsed time
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerifyPoint = (pointId: string) => {
    if (!activePatrol) return;
    
    const point = activePatrol.patrolPoints.find(p => p.id === pointId);
    if (!point) return;
    
    if (!position) {
      toast.error('Очікуємо на ваше місцезнаходження...');
      return;
    }
    
    if (isWithinRadius(point.latitude, point.longitude, point.radiusMeters)) {
      completePatrolPoint(pointId);
      setRemainingPoints(prev => prev.filter(id => id !== pointId));
      
      if (remainingPoints.length <= 1) {
        toast.success('Всі точки перевірено!');
        setTimeout(() => {
          endPatrol();
          navigate('/');
        }, 1500);
      }
    } else {
      toast.error('Ви не знаходитесь у радіусі цієї точки');
    }
  };

  const handleEndPatrol = () => {
    if (window.confirm('Ви впевнені, що хочете завершити обхід? Неперевірені точки будуть позначені як пропущені.')) {
      endPatrol();
      navigate('/');
    }
  };

  if (!activePatrol) return null;

  return (
    <div className="patrol-container pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Активний обхід</h1>
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center text-muted-foreground">
            <Timer className="h-4 w-4 mr-1.5" />
            <span>{formatTime(elapsedTime)}</span>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-muted-foreground mr-1">
              {activePatrol.completedPoints.length}/{activePatrol.patrolPoints.length} перевірено
            </span>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center bg-secondary p-3 rounded-lg mb-3">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-primary" />
            <span className="font-medium">Точки</span>
          </div>
          <div>
            <span className="text-sm bg-primary/20 text-primary px-2 py-1 rounded-full">
              {remainingPoints.length} залишилось
            </span>
          </div>
        </div>

        {activePatrol.patrolPoints.map((point) => (
          <PatrolPointItem
            key={point.id}
            point={point}
            isVerifiable
            onVerify={() => handleVerifyPoint(point.id)}
            isCompleted={activePatrol.completedPoints.includes(point.id)}
          />
        ))}
      </div>

      <div className="mt-8">
        <button
          onClick={handleEndPatrol}
          className="btn-outline text-destructive border-destructive w-full"
        >
          Завершити обхід
        </button>
      </div>

      <Navbar />
    </div>
  );
};

export default Patrol;
