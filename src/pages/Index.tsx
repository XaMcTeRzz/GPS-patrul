
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, List, Clock, Settings, Play } from 'lucide-react';
import { usePatrol } from '@/context/PatrolContext';

const Index = () => {
  const navigate = useNavigate();
  const { patrolPoints, activePatrol, startPatrol } = usePatrol();

  const handleStartPatrol = () => {
    if (patrolPoints.length === 0) {
      navigate('/routes');
      return;
    }
    startPatrol();
    navigate('/patrol');
  };

  // If there's already an active patrol, redirect to patrol screen
  useEffect(() => {
    if (activePatrol) {
      navigate('/patrol');
    }
  }, [activePatrol, navigate]);

  return (
    <div className="patrol-container pb-20">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Patrol Manager</h1>
        <p className="text-muted-foreground">Monitor and control security patrols</p>
      </div>

      <div className="grid grid-cols-1 gap-6 max-w-md mx-auto">
        <button 
          onClick={handleStartPatrol}
          className="flex flex-col items-center justify-center p-8 bg-primary text-primary-foreground rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          <Play className="h-12 w-12 mb-4" />
          <span className="text-xl font-medium">Start Patrol</span>
          {patrolPoints.length === 0 && (
            <span className="text-sm mt-2 opacity-80">Add checkpoints first</span>
          )}
        </button>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/routes')}
            className="bg-card border hover:border-primary/50 p-6 rounded-xl card-hover"
          >
            <List className="h-8 w-8 mb-3 mx-auto text-primary" />
            <h2 className="text-lg font-medium">Routes</h2>
            <p className="text-xs text-muted-foreground mt-1">
              {patrolPoints.length} checkpoints
            </p>
          </button>

          <button
            onClick={() => navigate('/log')}
            className="bg-card border hover:border-primary/50 p-6 rounded-xl card-hover"
          >
            <Clock className="h-8 w-8 mb-3 mx-auto text-primary" />
            <h2 className="text-lg font-medium">Log</h2>
            <p className="text-xs text-muted-foreground mt-1">
              View patrol history
            </p>
          </button>

          <button
            onClick={() => navigate('/settings')}
            className="bg-card border hover:border-primary/50 p-6 rounded-xl card-hover col-span-2"
          >
            <Settings className="h-8 w-8 mb-3 mx-auto text-primary" />
            <h2 className="text-lg font-medium">Settings</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Configure patrol parameters
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;
