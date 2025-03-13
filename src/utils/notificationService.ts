
import { toast } from 'sonner';

// Function to send a notification via Telegram
export const sendTelegramNotification = async (
  botToken: string,
  chatId: string,
  message: string
): Promise<boolean> => {
  try {
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

// Function to send an email notification
export const sendEmailNotification = async (
  email: string,
  subject: string,
  message: string
): Promise<boolean> => {
  try {
    // For demonstration, we're using a mock service
    // In production, you'd use a real email service API
    console.log(`Відправка email на ${email}`, { subject, message });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return true;
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
  pointName: string
): Promise<void> => {
  const message = `⚠️ Увага: Не пройдена точка "${pointName}" на патрульному маршруті!`;
  
  let telegramSent = false;
  let emailSent = false;
  
  if (telegramBotToken && telegramChatId) {
    telegramSent = await sendTelegramNotification(telegramBotToken, telegramChatId, message);
  }
  
  if (email) {
    emailSent = await sendEmailNotification(
      email,
      'Пропущена точка патрульного маршруту',
      message
    );
  }
  
  if (telegramSent || emailSent) {
    toast.success('Сповіщення про пропущену точку відправлено');
  } else if (telegramBotToken || email) {
    toast.error('Не вдалось відправити сповіщення');
  }
};
