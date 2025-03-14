import { usePatrol } from '@/context/PatrolContext';
import { PatrolNotification } from '@/types/patrol-types';

export const useNotifications = () => {
  const { settings } = usePatrol();

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

  return { sendNotification };
}; 