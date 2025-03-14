import React, { createContext, useContext, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  type PatrolPoint, 
  type PatrolSession, 
  type PatrolContextType, 
  type Settings,
  type PatrolNotification,
  defaultSettings 
} from '@/types/patrol-types';
import { usePatrolPoints } from '@/hooks/usePatrolPoints';
import { usePatrolLogs } from '@/hooks/usePatrolLogs';
import { usePatrolSession } from '@/hooks/usePatrolSession';
import { usePatrolSettings } from '@/hooks/usePatrolSettings';
import { useNotifications } from '@/hooks/useNotifications';

const PatrolContext = createContext<PatrolContextType | undefined>(undefined);

export const PatrolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    patrolPoints, 
    setPatrolPoints, 
    addPatrolPoint, 
    updatePatrolPoint, 
    deletePatrolPoint,
    loading 
  } = usePatrolPoints();
  
  const { logEntries, setLogEntries, addLogEntry } = usePatrolLogs();
  
  const { settings, setSettings, updateSettings } = usePatrolSettings();
  
  const { sendNotification } = useNotifications(settings);
  
  const { 
    activePatrol, 
    setActivePatrol, 
    startPatrol, 
    completePatrolPoint, 
    endPatrol,
    toggleTestMode,
    testMode
  } = usePatrolSession({ 
    patrolPoints, 
    addLogEntry,
    settings,
    sendNotification
  });

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

  const value: PatrolContextType = {
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
    toggleTestMode,
    testMode,
    sendNotification,
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
