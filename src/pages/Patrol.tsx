import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Check, AlertTriangle, Timer, Clock, Zap, MapPinned } from 'lucide-react';
import { usePatrol } from '@/context/PatrolContext';
import Navbar from '@/components/Navbar';
import PatrolPointItem from '@/components/PatrolPointItem';
import { useGeolocation } from '@/hooks/useGeolocation';
import { toast } from 'sonner';
import { playButtonSound, playCheckpointSound } from '@/utils/sound';

const Patrol = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    activePatrol, 
    completePatrolPoint, 
    endPatrol,
    settings,
    toggleTestMode = () => {},
    testMode = false,
    startPatrol,
    patrolPoints
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

  // Перевіряємо параметр autostart при завантаженні
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const autostart = searchParams.get('autostart');
    
    if (autostart === 'true' && !activePatrol && patrolPoints.length > 0) {
      startPatrol();
      // Очищаємо параметр autostart з URL
      navigate('/patrol', { replace: true });
    }
  }, [location, activePatrol, startPatrol, patrolPoints, navigate]);

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
        <h1 className="text-2xl font-bold text-zinc-100">Активний обхід</h1>
        <div className="flex justify-between items-center mt-4 bg-[#1A1D24] p-4 rounded-lg border border-[#2A2F38]">
          <div className="flex items-center">
            <Timer className="h-6 w-6 mr-3 text-blue-400" />
            <span className="text-lg font-medium text-zinc-100 tabular-nums">{formatTime(elapsedTime)}</span>
          </div>
          <div className="flex items-center">
            <span className="text-base text-zinc-400 mr-3 tabular-nums">
              {activePatrol.completedPoints.length}/{activePatrol.patrolPoints.length} перевірено
            </span>
            <button 
              onClick={toggleTestMode}
              className={`p-2 rounded-lg transition-all ${
                testMode 
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                  : 'bg-[#12151A] text-zinc-400 hover:bg-blue-500/10 hover:text-blue-400'
              }`}
              title={testMode ? 'Вимкнути тестовий режим' : 'Увімкнути тестовий режим'}
            >
              <Zap className="h-6 w-6" />
            </button>
          </div>
        </div>
        {testMode && (
          <div className="mt-3 p-4 bg-amber-500/10 text-amber-400 text-sm rounded-lg border border-amber-500/20">
            Тестовий режим активний: час очікування скорочено в 10 разів для швидкого тестування
          </div>
        )}
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center bg-[#1A1D24] p-5 rounded-lg mb-4 border border-[#2A2F38]">
          <div className="flex items-center">
            <MapPinned className="h-8 w-8 mr-3 text-blue-400" />
            <span className="font-medium text-xl text-zinc-100">Точки</span>
          </div>
          <div>
            <span className="text-base bg-[#12151A] text-zinc-100 px-4 py-2 rounded-lg tabular-nums font-medium">
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
          className="w-full py-4 px-6 text-lg font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
        >
          Завершити обхід
        </button>
      </div>

      <Navbar />
    </div>
  );
};

export default Patrol;

