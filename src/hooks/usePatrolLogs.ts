
import { useState } from 'react';
import { LogEntry } from '@/types/patrol-types';

export const usePatrolLogs = () => {
  const [logEntries, setLogEntries] = useState<LogEntry[]>(() => {
    const saved = localStorage.getItem('logEntries');
    return saved ? JSON.parse(saved) : [];
  });

  const addLogEntry = (entry: Omit<LogEntry, 'id'>) => {
    const newEntry: LogEntry = {
      ...entry,
      id: Date.now().toString(),
    };
    
    setLogEntries(prev => [newEntry, ...prev]);
  };

  return {
    logEntries,
    setLogEntries,
    addLogEntry,
  };
};
