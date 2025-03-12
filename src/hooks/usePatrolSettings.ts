
import { useState } from 'react';
import { toast } from 'sonner';
import { Settings, defaultSettings } from '@/types/patrol-types';

export const usePatrolSettings = () => {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('patrolSettings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  // Update settings
  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    toast.success('Налаштування оновлено');
  };

  return {
    settings,
    setSettings,
    updateSettings,
  };
};
