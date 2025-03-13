
import React from 'react';
import { usePatrol } from '@/context/PatrolContext';
import Navbar from '@/components/Navbar';
import { Check, AlertTriangle, Info } from 'lucide-react';
import { toast } from 'sonner';

const Settings = () => {
  const { settings, updateSettings } = usePatrol();

  const handleVerificationMethodChange = (method: 'gps' | 'qrcode' | 'manual') => {
    updateSettings({ verificationMethod: method });
  };

  const handleNotificationsToggle = () => {
    updateSettings({ notificationsEnabled: !settings.notificationsEnabled });
  };

  const handlePatrolTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      updateSettings({ patrolTimeMinutes: value });
    }
  };

  const handleProximityThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      updateSettings({ proximityThreshold: value });
    }
  };

  const handleNotificationEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ notificationEmail: e.target.value });
  };

  const handleTelegramBotTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ telegramBotToken: e.target.value });
  };

  const handleTelegramChatIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ telegramChatId: e.target.value });
  };

  const testTelegramNotification = async () => {
    if (!settings.telegramBotToken || !settings.telegramChatId) {
      toast.error('Вкажіть Telegram Bot Token та Chat ID');
      return;
    }

    toast.loading('Відправлення тестового повідомлення...');

    try {
      const response = await fetch(`https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: settings.telegramChatId,
          text: '✅ Тестове повідомлення від додатку "Контроль обходу"',
          parse_mode: 'HTML',
        }),
      });

      const data = await response.json();
      
      if (data.ok) {
        toast.success('Тестове повідомлення успішно відправлено!');
      } else {
        toast.error(`Помилка: ${data.description}`);
      }
    } catch (error) {
      toast.error(`Помилка: ${error instanceof Error ? error.message : 'Не вдалося відправити повідомлення'}`);
    }
  };

  return (
    <div className="patrol-container pb-20">
      <h1 className="text-2xl font-bold mb-6">Налаштування</h1>

      <div className="space-y-6">
        <div className="bg-card border rounded-lg p-4">
          <h2 className="text-lg font-medium mb-4">Перевірка точок</h2>
          
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name="verificationMethod"
                checked={settings.verificationMethod === 'gps'}
                onChange={() => handleVerificationMethodChange('gps')}
                className="h-4 w-4 text-primary"
              />
              <span>GPS локація</span>
            </label>
            
            <label className="flex items-center space-x-3 opacity-50 cursor-not-allowed">
              <input
                type="radio"
                name="verificationMethod"
                disabled
                className="h-4 w-4"
              />
              <span>QR код (скоро)</span>
            </label>
            
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name="verificationMethod"
                checked={settings.verificationMethod === 'manual'}
                onChange={() => handleVerificationMethodChange('manual')}
                className="h-4 w-4 text-primary"
              />
              <span>Ручна перевірка</span>
            </label>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <h2 className="text-lg font-medium mb-4">Час обходу</h2>
          
          <div>
            <label htmlFor="patrolTime" className="block text-sm font-medium mb-1">
              Час на обхід (хвилини)
            </label>
            <input
              id="patrolTime"
              type="number"
              min="1"
              value={settings.patrolTimeMinutes}
              onChange={handlePatrolTimeChange}
              className="input w-full"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Рекомендований час: 5-15 хвилин
            </p>
            <p className="text-xs text-amber-500 mt-2">
              ⚠️ Сповіщення про пропущені точки будуть відправлені після {settings.patrolTimeMinutes} хвилин
            </p>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <h2 className="text-lg font-medium mb-4">GPS налаштування</h2>
          
          <div>
            <label htmlFor="proximityThreshold" className="block text-sm font-medium mb-1">
              Радіус перевірки (метри)
            </label>
            <input
              id="proximityThreshold"
              type="number"
              min="1"
              value={settings.proximityThreshold}
              onChange={handleProximityThresholdChange}
              className="input w-full"
            />
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <h2 className="text-lg font-medium mb-4 flex items-center">
            Сповіщення
            <div className="ml-auto">
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.notificationsEnabled} 
                  onChange={handleNotificationsToggle}
                  className="sr-only peer" 
                />
                <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${settings.notificationsEnabled ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                <span className="ml-3 text-sm font-medium">{settings.notificationsEnabled ? 'Увімкнено' : 'Вимкнено'}</span>
              </label>
            </div>
          </h2>
          
          {!settings.notificationsEnabled && (
            <div className="bg-amber-50 text-amber-800 p-3 rounded-md mb-4 flex items-start">
              <AlertTriangle className="h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm">Сповіщення вимкнені. Увімкніть їх, щоб отримувати повідомлення про пропущені точки.</p>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="notificationEmail" className="block text-sm font-medium mb-1">
                Email для сповіщень
              </label>
              <input
                id="notificationEmail"
                type="email"
                value={settings.notificationEmail || ''}
                onChange={handleNotificationEmailChange}
                className="input w-full"
                placeholder="example@domain.com"
                disabled={!settings.notificationsEnabled}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Буде використано для сповіщень про пропущені точки
              </p>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-md font-medium">Telegram-сповіщення</h3>
                {settings.notificationsEnabled && settings.telegramBotToken && settings.telegramChatId && (
                  <button 
                    onClick={testTelegramNotification} 
                    className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                  >
                    Тест
                  </button>
                )}
              </div>
              
              <div className="bg-blue-50 text-blue-800 p-3 rounded-md mb-4 flex items-start">
                <Info className="h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm">
                  <p className="mb-1">Як налаштувати Telegram-сповіщення:</p>
                  <ol className="list-decimal ml-4 space-y-1">
                    <li>Створіть бота через @BotFather в Telegram</li>
                    <li>Скопіюйте отриманий токен бота</li>
                    <li>Додайте бота до групи або розпочніть з ним приватний чат</li>
                    <li>Отримайте ID чату через @userinfobot або @RawDataBot</li>
                  </ol>
                </div>
              </div>
              
              <div>
                <label htmlFor="telegramToken" className="block text-sm font-medium mb-1">
                  Telegram Bot Token
                </label>
                <input
                  id="telegramToken"
                  type="text"
                  value={settings.telegramBotToken || ''}
                  onChange={handleTelegramBotTokenChange}
                  className="input w-full"
                  placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                  disabled={!settings.notificationsEnabled}
                />
              </div>
              
              <div className="mt-3">
                <label htmlFor="telegramChatId" className="block text-sm font-medium mb-1">
                  Telegram Chat ID
                </label>
                <input
                  id="telegramChatId"
                  type="text"
                  value={settings.telegramChatId || ''}
                  onChange={handleTelegramChatIdChange}
                  className="input w-full"
                  placeholder="123456789"
                  disabled={!settings.notificationsEnabled}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <h2 className="text-lg font-medium mb-2">Про програму</h2>
          <p className="text-sm text-muted-foreground">
            Контроль обходу v1.0
          </p>
        </div>
      </div>

      <Navbar />
    </div>
  );
};

export default Settings;
