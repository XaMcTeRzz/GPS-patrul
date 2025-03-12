
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

export type PatrolPoint = {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
};

export type LogEntry = {
  id: string;
  patrolId: string;
  pointId: string;
  pointName: string;
  timestamp: string;
  status: 'completed' | 'missed' | 'delayed';
  notes?: string;
};

export type PatrolSession = {
  id: string;
  startTime: string;
  endTime?: string;
  status: 'active' | 'completed' | 'cancelled';
  patrolPoints: PatrolPoint[];
  completedPoints: string[];
};

type PatrolContextType = {
  patrolPoints: PatrolPoint[];
  addPatrolPoint: (point: Omit<PatrolPoint, 'id'>) => void;
  updatePatrolPoint: (id: string, point: Partial<PatrolPoint>) => void;
  deletePatrolPoint: (id: string) => void;
  activePatrol: PatrolSession | null;
  startPatrol: () => void;
  completePatrolPoint: (pointId: string) => void;
  endPatrol: () => void;
  logEntries: LogEntry[];
  settings: {
    verificationMethod: 'gps' | 'qrcode' | 'manual';
    notificationsEnabled: boolean;
    proximityThreshold: number;
  };
  updateSettings: (newSettings: Partial<typeof settings>) => void;
  loading: boolean;
};

const defaultSettings = {
  verificationMethod: 'gps' as const,
  notificationsEnabled: true,
  proximityThreshold: 50, // meters
};

const PatrolContext = createContext<PatrolContextType | undefined>(undefined);

export const PatrolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patrolPoints, setPatrolPoints] = useState<PatrolPoint[]>(() => {
    const saved = localStorage.getItem('patrolPoints');
    return saved ? JSON.parse(saved) : [];
  });

  const [activePatrol, setActivePatrol] = useState<PatrolSession | null>(() => {
    const saved = localStorage.getItem('activePatrol');
    return saved ? JSON.parse(saved) : null;
  });

  const [logEntries, setLogEntries] = useState<LogEntry[]>(() => {
    const saved = localStorage.getItem('logEntries');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('patrolSettings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  const [loading, setLoading] = useState(false);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('patrolPoints', JSON.stringify(patrolPoints));
  }, [patrolPoints]);

  useEffect(() => {
    localStorage.setItem('activePatrol', JSON.stringify(activePatrol));
  }, [activePatrol]);

  useEffect(() => {
    localStorage.setItem('logEntries', JSON.stringify(logEntries));
  }, [logEntries]);

  useEffect(() => {
    localStorage.setItem('patrolSettings', JSON.stringify(settings));
  }, [settings]);

  // Add a new patrol point
  const addPatrolPoint = (point: Omit<PatrolPoint, 'id'>) => {
    setLoading(true);
    const newPoint = {
      ...point,
      id: Date.now().toString(),
    };
    
    setPatrolPoints((prev) => [...prev, newPoint]);
    toast.success('Checkpoint added successfully');
    setLoading(false);
  };

  // Update an existing patrol point
  const updatePatrolPoint = (id: string, updatedData: Partial<PatrolPoint>) => {
    setLoading(true);
    setPatrolPoints((prev) =>
      prev.map((point) =>
        point.id === id ? { ...point, ...updatedData } : point
      )
    );
    toast.success('Checkpoint updated successfully');
    setLoading(false);
  };

  // Delete a patrol point
  const deletePatrolPoint = (id: string) => {
    setLoading(true);
    setPatrolPoints((prev) => prev.filter((point) => point.id !== id));
    toast.success('Checkpoint deleted successfully');
    setLoading(false);
  };

  // Start a new patrol session
  const startPatrol = () => {
    if (patrolPoints.length === 0) {
      toast.error('Please add at least one checkpoint before starting a patrol');
      return;
    }

    const newPatrol: PatrolSession = {
      id: Date.now().toString(),
      startTime: new Date().toISOString(),
      status: 'active',
      patrolPoints: [...patrolPoints],
      completedPoints: [],
    };

    setActivePatrol(newPatrol);
    toast.success('Patrol started');
  };

  // Mark a patrol point as completed
  const completePatrolPoint = (pointId: string) => {
    if (!activePatrol) return;

    const point = patrolPoints.find(p => p.id === pointId);
    if (!point) return;

    // Add to completed points
    setActivePatrol((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        completedPoints: [...prev.completedPoints, pointId],
      };
    });

    // Create a log entry
    const newLogEntry: LogEntry = {
      id: Date.now().toString(),
      patrolId: activePatrol.id,
      pointId,
      pointName: point.name,
      timestamp: new Date().toISOString(),
      status: 'completed',
    };

    setLogEntries((prev) => [newLogEntry, ...prev]);
    toast.success(`Checkpoint "${point.name}" verified`);
  };

  // End the current patrol
  const endPatrol = () => {
    if (!activePatrol) return;

    setActivePatrol((prev) => {
      if (!prev) return null;
      
      // Create log entries for missed points
      const missedPoints = prev.patrolPoints
        .filter((point) => !prev.completedPoints.includes(point.id));
      
      if (missedPoints.length > 0) {
        const missedLogEntries = missedPoints.map((point): LogEntry => ({
          id: Date.now().toString() + point.id,
          patrolId: prev.id,
          pointId: point.id,
          pointName: point.name,
          timestamp: new Date().toISOString(),
          status: 'missed',
        }));
        
        setLogEntries((logs) => [...missedLogEntries, ...logs]);
      }
      
      return {
        ...prev,
        status: 'completed',
        endTime: new Date().toISOString(),
      };
    });

    // Create a final completed patrol in log
    setTimeout(() => {
      setActivePatrol(null);
      toast.success('Patrol completed');
    }, 500);
  };

  // Update settings
  const updateSettings = (newSettings: Partial<typeof settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    toast.success('Settings updated');
  };

  const value = {
    patrolPoints,
    addPatrolPoint,
    updatePatrolPoint,
    deletePatrolPoint,
    activePatrol,
    startPatrol,
    completePatrolPoint,
    endPatrol,
    logEntries,
    settings,
    updateSettings,
    loading,
  };

  return <PatrolContext.Provider value={value}>{children}</PatrolContext.Provider>;
};

export const usePatrol = () => {
  const context = useContext(PatrolContext);
  if (context === undefined) {
    throw new Error('usePatrol must be used within a PatrolProvider');
  }
  return context;
};
