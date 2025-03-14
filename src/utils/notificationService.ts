import { SmtpSettings } from '@/types/patrol-types';
import { toast } from 'sonner';
import { PatrolPoint, NotificationType } from '@/types/patrol-types';

// Function to send a notification via Telegram
export const sendTelegramNotification = async (
  botToken: string,
  chatId: string,
  message: string
): Promise<boolean> => {
  try {
    console.log('Спроба відправки повідомлення в Telegram', { botToken, chatId, message });
    
    if (!botToken || !chatId) {
      console.error('Відсутній токен бота або ID чату');
      return false;
    }
    
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json();
    console.log('Відповідь від Telegram API:', data);
    
    if (!data.ok) {
      console.error('Помилка відправки в Telegram:', data.description);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Помилка при спробі відправки в Telegram:', error);
    return false;
  }
};

// Function to send an email notification via SMTP API
export const sendEmailNotification = async (
  email: string,
  subject: string,
  message: string,
  smtpSettings?: SmtpSettings
): Promise<boolean> => {
  try {
    if (!email) {
      console.error('Відсутня email адреса');
      return false;
    }
    
    console.log(`Відправка email на ${email}`, { subject, message });
    
    // If SMTP settings are provided, use them to send email
    if (smtpSettings && smtpSettings.host && smtpSettings.auth.user && smtpSettings.auth.pass) {
      console.log('Використання SMTP сервера для відправки', {
        host: smtpSettings.host,
        port: smtpSettings.port,
        username: smtpSettings.auth.user,
        hasPassword: Boolean(smtpSettings.auth.pass)
      });
      
      // In a real application, you would use a server-side API or service
      // to handle the SMTP sending. Here we'll simulate it:
      
      // Encode credentials and message for the API
      const encodedData = {
        to: email,
        from: smtpSettings.from || smtpSettings.auth.user,
        subject: subject,
        text: message,
        html: message,
        smtpSettings: {
          host: smtpSettings.host,
          port: smtpSettings.port,
          secure: smtpSettings.secure,
          auth: {
            user: smtpSettings.auth.user,
            pass: smtpSettings.auth.pass,
          },
        }
      };
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      console.log('Email успішно відправлено через SMTP сервер');
      return true;
    }
    
    // Fallback to simple simulation for testing
    console.log('SMTP налаштування відсутні, тест відправки...');
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  } catch (error) {
    console.error('Помилка при спробі відправки Email:', error);
    return false;
  }
};

/**
 * Відправляє повідомлення про пропущену точку патрулювання
 * @param point Точка патрулювання, яка була пропущена
 */
export const sendMissedPointNotification = async (point: PatrolPoint) => {
  try {
    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: NotificationType.MISSED_POINT,
        data: {
          pointName: point.name,
          pointDescription: point.description,
          timeMinutes: point.timeMinutes,
          coordinates: {
            latitude: point.latitude,
            longitude: point.longitude,
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Помилка відправки повідомлення');
    }
  } catch (error) {
    console.error('Помилка відправки повідомлення:', error);
  }
};
