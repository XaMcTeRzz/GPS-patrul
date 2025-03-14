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
    settings
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

  const sendNotification = async (notification: PatrolNotification) => {
    const { notificationsEnabled, notificationEmail, telegramBotToken, telegramChatId, smtpSettings } = settings;
    
    if (!notificationsEnabled) return;

    try {
      // Отправка уведомления в Telegram
      if (telegramBotToken && telegramChatId) {
        const telegramUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
        await fetch(telegramUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: telegramChatId,
            text: notification.message,
            parse_mode: 'HTML',
          }),
        });
      }

      // Отправка уведомления по email
      if (notificationEmail && smtpSettings) {
        const emailData = {
          from: smtpSettings.from,
          to: notificationEmail,
          subject: `Патруль: ${notification.type === 'point_expired' ? 'Точка не перевірена' : 'Повідомлення'}`,
          text: notification.message,
        };

        await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailData),
        });
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

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
