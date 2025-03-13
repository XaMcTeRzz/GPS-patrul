import { playAlertSound } from './sound';

export const sendTelegramNotification = async (message: string) => {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (!botToken || !chatId) {
      console.error('Telegram credentials are not configured');
      return;
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

    if (response.ok) {
      playAlertSound(); // Воспроизводим звук при успешной отправке уведомления
    }
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
  }
}; 