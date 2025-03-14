import React, { useEffect, useRef } from 'react';
import { PatrolPoint as PatrolPointType } from '@/types/patrol-types';
import { usePatrol } from '@/context/PatrolContext';
import { sendMissedPointNotification } from '@/utils/notificationService';
import { useLocation } from '@/hooks/useLocation';
import { calculateDistance } from '@/utils/geoUtils';
import PatrolPointItem from './PatrolPointItem';

type PatrolPointProps = {
  point: PatrolPointType;
  onComplete: (pointId: string) => void;
};

const PatrolPoint: React.FC<PatrolPointProps> = ({ point, onComplete }) => {
  const { settings, testMode = false } = usePatrol();
  const { location } = useLocation();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const notificationSentRef = useRef(false);

  useEffect(() => {
    if (!point.startTime || point.isCompleted || notificationSentRef.current) return;

    const startTime = new Date(point.startTime).getTime();
    const timeoutMs = (point.timeMinutes || settings.patrolTimeMinutes) * 60 * 1000 * (testMode ? 0.1 : 1);
    const now = Date.now();
    const remaining = timeoutMs - (now - startTime);

    if (remaining <= 0) {
      if (!notificationSentRef.current) {
        sendMissedPointNotification(point, {
          telegramBotToken: settings.telegramBotToken,
          telegramChatId: settings.telegramChatId,
          ...settings.smtpSettings
        });
        notificationSentRef.current = true;
      }
      return;
    }

    timeoutRef.current = setTimeout(() => {
      if (!point.isCompleted && !notificationSentRef.current) {
        sendMissedPointNotification(point, {
          telegramBotToken: settings.telegramBotToken,
          telegramChatId: settings.telegramChatId,
          ...settings.smtpSettings
        });
        notificationSentRef.current = true;
      }
    }, remaining);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [point, settings, testMode]);

  useEffect(() => {
    if (!location || point.isCompleted) return;

    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      point.latitude,
      point.longitude
    );

    if (distance <= point.radiusMeters) {
      onComplete(point.id);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  }, [location, point, onComplete]);

  return (
    <PatrolPointItem
      point={point}
      isVerifiable={true}
      isCompleted={point.isCompleted}
      onVerify={() => onComplete(point.id)}
    />
  );
};

export default PatrolPoint;
