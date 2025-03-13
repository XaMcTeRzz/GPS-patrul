import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Check, AlertTriangle, Timer, Clock, Zap, MapPinned } from 'lucide-react';
import { usePatrol } from '@/context/PatrolContext';
import Navbar from '@/components/Navbar';
import PatrolPointItem from '@/components/PatrolPointItem';
import { useGeolocation } from '@/hooks/useGeolocation';
import { toast } from 'sonner';
import { playButtonSound, playCheckpointSound } from '@/utils/sound';

const Patrol = () => {
  const navigate = useNavigate();
  const { 
    activePatrol, 
    completePatrolPoint, 
    endPatrol,
    settings,
    toggleTestMode = () => {},
    testMode = false
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
      playCheckpointSound();
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
      playButtonSound();
      endPatrol();
      navigate('/');
    }
  };

  if (!activePatrol) return null;

  return (
    <div className="patrol-container pb-20">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Активний обхід</h1>
        <div className="flex justify-between items-center mt-3">
          <div className="flex items-center text-muted-foreground">
            <Timer className="h-7 w-7 mr-2" />
            <span className="text-lg">{formatTime(elapsedTime)}</span>
          </div>
          <div className="flex items-center">
            <span className="text-base text-muted-foreground mr-2">
              {activePatrol.completedPoints.length}/{activePatrol.patrolPoints.length} перевірено
            </span>
            <button 
              onClick={toggleTestMode}
              className={`ml-3 p-2 rounded-full ${testMode ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500'}`}
              title={testMode ? 'Вимкнути тестовий режим' : 'Увімкнути тестовий режим'}
            >
              <Zap className="h-7 w-7" />
            </button>
          </div>
        </div>
        {testMode && (
          <div className="mt-3 p-4 bg-amber-50 text-amber-700 text-base rounded-md border border-amber-200">
            Тестовий режим активний: час очікування скорочено в 10 разів для швидкого тестування
          </div>
        )}
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center bg-secondary p-5 rounded-lg mb-4">
          <div className="flex items-center">
            <MapPinned className="h-10 w-10 mr-3 text-primary" />
            <span className="font-medium text-xl">Точки</span>
          </div>
          <div>
            <span className="text-lg bg-primary/20 text-primary px-4 py-2 rounded-full">
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
          className="btn-outline text-destructive border-destructive w-full text-lg py-4"
        >
          Завершити обхід
        </button>
      </div>

      <Navbar />
    </div>
  );
};

export default Patrol;

