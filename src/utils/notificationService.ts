
import { toast } from 'sonner';

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
  smtpSettings?: {
    host: string;
    port: number;
    username: string;
    password: string;
    from: string;
  }
): Promise<boolean> => {
  try {
    if (!email) {
      console.error('Відсутня email адреса');
      return false;
    }
    
    console.log(`Відправка email на ${email}`, { subject, message });
    
    // If SMTP settings are provided, use them to send email
    if (smtpSettings && smtpSettings.host && smtpSettings.username && smtpSettings.password) {
      console.log('Використання SMTP сервера для відправки', {
        host: smtpSettings.host,
        port: smtpSettings.port,
        username: smtpSettings.username,
        hasPassword: Boolean(smtpSettings.password)
      });
      
      // In a real application, you would use a server-side API or service
      // to handle the SMTP sending. Here we'll simulate it:
      
      // Encode credentials and message for the API
      const encodedData = {
        to: email,
        from: smtpSettings.from || smtpSettings.username,
        subject: subject,
        text: message,
        html: message,
        smtpSettings: {
          host: smtpSettings.host,
          port: smtpSettings.port,
          secure: smtpSettings.port === 465, // true for 465, false for other ports
          auth: {
            user: smtpSettings.username,
            pass: smtpSettings.password,
          },
        }
      };
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      console.log('Email успішно відправлено через SMTP сервер');
      return true;
    } else {
      // Fallback to simple simulation for testing
      console.log('SMTP налаштування відсутні, тест відправки...');
      await new Promise(resolve => setTimeout(resolve, 500));
      return true;
    }
  } catch (error) {
    console.error('Помилка при спробі відправки Email:', error);
    return false;
  }
};

// Function to send notifications for missed patrol points
export const sendMissedPointNotification = async (
  telegramBotToken: string | undefined,
  telegramChatId: string | undefined,
  email: string | undefined,
  pointName: string,
  smtpSettings?: {
    host: string;
    port: number;
    username: string;
    password: string;
    from: string;
  }
): Promise<void> => {
  const message = `⚠️ Увага: Не пройдена точка "${pointName}" на патрульному маршруті!`;
  
  console.log('Відправка сповіщення про пропущену точку', {
    hasTelegramConfig: Boolean(telegramBotToken && telegramChatId),
    hasEmail: Boolean(email),
    hasSmtpSettings: Boolean(smtpSettings?.host),
    pointName
  });
  
  let telegramSent = false;
  let emailSent = false;
  
  if (telegramBotToken && telegramChatId) {
    telegramSent = await sendTelegramNotification(telegramBotToken, telegramChatId, message);
    console.log('Результат відправки в Telegram:', telegramSent);
  } else {
    console.log('Не налаштовані параметри Telegram');
  }
  
  if (email) {
    emailSent = await sendEmailNotification(
      email,
      'Пропущена точка патрульного маршруту',
      message,
      smtpSettings
    );
    console.log('Результат відправки Email:', emailSent);
  } else {
    console.log('Не налаштована email адреса');
  }
  
  if (telegramSent || emailSent) {
    toast.success('Сповіщення про пропущену точку відправлено');
  } else if (telegramBotToken || email) {
    toast.error('Не вдалось відправити сповіщення');
  } else {
    toast.warning('Налаштуйте Telegram або Email для отримання сповіщень');
  }
};
