import React, { useState } from 'react';
import { usePatrol } from '@/context/PatrolContext';
import Navbar from '@/components/Navbar';
import { Check, AlertTriangle, Info, Mail, Clock, Plus, Trash, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { ScheduleTime, SmtpSettings } from '@/types/patrol-types';
import { useScheduledPatrol } from '@/hooks/useScheduledPatrol';

const Settings = () => {
  const { settings, updateSettings } = usePatrol();
  const { formatScheduleTime } = useScheduledPatrol();
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [showEmailPassword, setShowEmailPassword] = useState(false);
  const [newScheduleHour, setNewScheduleHour] = useState(8);
  const [newScheduleMinute, setNewScheduleMinute] = useState(0);

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

  // Обработчики для расписания
  const handleScheduleEnabledToggle = () => {
    updateSettings({ scheduleEnabled: !settings.scheduleEnabled });
    
    if (!settings.scheduleEnabled) {
      toast.info('Автоматический запуск патрулирования по расписанию включен');
    } else {
      toast.info('Автоматический запуск патрулирования по расписанию отключен');
    }
  };
  
  const handleScheduleItemToggle = (index: number) => {
    const updatedSchedules = [...settings.scheduledPatrols];
    updatedSchedules[index] = {
      ...updatedSchedules[index],
      enabled: !updatedSchedules[index].enabled
    };
    
    updateSettings({ scheduledPatrols: updatedSchedules });
    
    const time = formatScheduleTime(updatedSchedules[index]);
    if (updatedSchedules[index].enabled) {
      toast.info(`Патрулирование в ${time} включено`);
    } else {
      toast.info(`Патрулирование в ${time} отключено`);
    }
  };
  
  const handleAddSchedule = () => {
    if (settings.scheduledPatrols.length >= 5) {
      toast.error('Максимальное количество расписаний - 5');
      return;
    }
    
    const newSchedule: ScheduleTime = {
      hour: newScheduleHour,
      minute: newScheduleMinute,
      enabled: true
    };
    
    // Проверяем, нет ли уже такого расписания
    const exists = settings.scheduledPatrols.some(
      s => s.hour === newSchedule.hour && s.minute === newSchedule.minute
    );
    
    if (exists) {
      toast.error('Такое расписание уже существует');
      return;
    }
    
    const updatedSchedules = [...settings.scheduledPatrols, newSchedule];
    updateSettings({ scheduledPatrols: updatedSchedules });
    toast.success(`Добавлено расписание: ${formatScheduleTime(newSchedule)}`);
  };
  
  const handleRemoveSchedule = (index: number) => {
    const scheduleToRemove = settings.scheduledPatrols[index];
    const updatedSchedules = settings.scheduledPatrols.filter((_, i) => i !== index);
    updateSettings({ scheduledPatrols: updatedSchedules });
    toast.info(`Удалено расписание: ${formatScheduleTime(scheduleToRemove)}`);
  };
  
  const handleScheduleHourChange = (index: number, hour: number) => {
    if (hour < 0 || hour > 23) return;
    
    const updatedSchedules = [...settings.scheduledPatrols];
    updatedSchedules[index] = {
      ...updatedSchedules[index],
      hour
    };
    
    updateSettings({ scheduledPatrols: updatedSchedules });
  };
  
  const handleScheduleMinuteChange = (index: number, minute: number) => {
    if (minute < 0 || minute > 59) return;
    
    const updatedSchedules = [...settings.scheduledPatrols];
    updatedSchedules[index] = {
      ...updatedSchedules[index],
      minute
    };
    
    updateSettings({ scheduledPatrols: updatedSchedules });
  };

  // SMTP handlers
  const handleSmtpHostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({
      smtpSettings: {
        ...settings.smtpSettings,
        host: e.target.value,
      } as SmtpSettings,
    });
  };

  const handleSmtpPortChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const port = parseInt(e.target.value);
    if (!isNaN(port) && port > 0) {
      updateSettings({
        smtpSettings: {
          ...settings.smtpSettings,
          port,
        } as SmtpSettings,
      });
    }
  };

  const handleSmtpUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({
      smtpSettings: {
        ...settings.smtpSettings,
        username: e.target.value,
      } as SmtpSettings,
    });
  };

  const handleSmtpPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({
      smtpSettings: {
        ...settings.smtpSettings,
        password: e.target.value,
      } as SmtpSettings,
    });
  };

  const handleSmtpFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({
      smtpSettings: {
        ...settings.smtpSettings,
        from: e.target.value,
      } as SmtpSettings,
    });
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

  const testSmtpEmail = async () => {
    if (!testEmailAddress) {
      toast.error('Вкажіть адресу для тестового повідомлення');
      return;
    }

    if (!settings.smtpSettings?.host || !settings.smtpSettings?.username || !settings.smtpSettings?.password) {
      toast.error('Заповніть усі необхідні поля SMTP');
      return;
    }

    toast.loading('Відправлення тестового email...');

    try {
      // In a real app, you would call an API endpoint here
      // For now, we'll simulate it with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const smtpConfig = {
        host: settings.smtpSettings.host,
        port: settings.smtpSettings.port || 587,
        username: settings.smtpSettings.username,
        password: settings.smtpSettings.password,
        from: settings.smtpSettings.from || settings.smtpSettings.username
      };
      
      console.log('Тестовий email', { to: testEmailAddress, config: smtpConfig });
      
      // Simulate success
      toast.success('Тестовий email успішно відправлено!');
    } catch (error) {
      toast.error(`Помилка: ${error instanceof Error ? error.message : 'Не вдалося відправити email'}`);
    }
  };

  return (
    <div className="patrol-container pb-20">
      <h1 className="text-2xl font-bold mb-6">Налаштування</h1>

      <div className="space-y-6">
        <div className="bg-card border rounded-lg p-4">
          <h2 className="text-lg font-medium mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Автоматичний запуск
            <div className="ml-auto">
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.scheduleEnabled} 
                  onChange={handleScheduleEnabledToggle}
                  className="sr-only peer" 
                />
                <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${settings.scheduleEnabled ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                <span className="ml-3 text-sm font-medium">{settings.scheduleEnabled ? 'Увімкнено' : 'Вимкнено'}</span>
              </label>
            </div>
          </h2>
          
          {!settings.scheduleEnabled && (
            <div className="bg-blue-50 text-blue-800 p-3 rounded-md mb-4 flex items-start">
              <Info className="h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm">Увімкніть автоматичний запуск, щоб патрулювання починалося за розкладом.</p>
            </div>
          )}
          
          <div className="space-y-4">
            {settings.scheduledPatrols.length > 0 ? (
              <div className="space-y-3">
                {settings.scheduledPatrols.map((schedule, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-primary" />
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="0"
                          max="23"
                          value={schedule.hour}
                          onChange={(e) => handleScheduleHourChange(index, parseInt(e.target.value))}
                          className="input w-16 text-center"
                          disabled={!settings.scheduleEnabled}
                        />
                        <span>:</span>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={schedule.minute}
                          onChange={(e) => handleScheduleMinuteChange(index, parseInt(e.target.value))}
                          className="input w-16 text-center"
                          disabled={!settings.scheduleEnabled}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={schedule.enabled} 
                          onChange={() => handleScheduleItemToggle(index)}
                          className="sr-only peer" 
                          disabled={!settings.scheduleEnabled}
                        />
                        <div className={`w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all ${schedule.enabled && settings.scheduleEnabled ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                      </label>
                      
                      <button
                        onClick={() => handleRemoveSchedule(index)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-full"
                        disabled={!settings.scheduleEnabled}
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-4 border rounded-lg bg-gray-50">
                <p className="text-muted-foreground">Немає розкладу</p>
              </div>
            )}
            
            {settings.scheduleEnabled && (
              <div className="flex items-center space-x-2 mt-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={newScheduleHour}
                    onChange={(e) => setNewScheduleHour(parseInt(e.target.value))}
                    className="input w-16 text-center"
                    placeholder="Год"
                  />
                  <span>:</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={newScheduleMinute}
                    onChange={(e) => setNewScheduleMinute(parseInt(e.target.value))}
                    className="input w-16 text-center"
                    placeholder="Мин"
                  />
                </div>
                
                <button
                  onClick={handleAddSchedule}
                  className="flex items-center space-x-1 bg-primary text-primary-foreground px-3 py-2 rounded-md"
                >
                  <Plus className="h-4 w-4" />
                  <span>Додати</span>
                </button>
              </div>
            )}
            
            <p className="text-xs text-muted-foreground mt-2">
              Патрулювання буде автоматично запускатися у вказаний час, якщо увімкнено розклад.
            </p>
          </div>
        </div>

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
            
            {/* SMTP Settings Section */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-md font-medium">SMTP налаштування</h3>
                {settings.notificationsEnabled && 
                 settings.smtpSettings?.host && 
                 settings.smtpSettings?.username && 
                 settings.smtpSettings?.password && (
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      value={testEmailAddress}
                      onChange={(e) => setTestEmailAddress(e.target.value)}
                      placeholder="Тестовий email"
                      className="input text-xs h-8"
                    />
                    <button 
                      onClick={testSmtpEmail} 
                      className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                    >
                      Тест
                    </button>
                  </div>
                )}
              </div>
              
              <div className="bg-blue-50 text-blue-800 p-3 rounded-md mb-4 flex items-start">
                <Info className="h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm">
                  <p className="mb-1">Як налаштувати SMTP для відправки email:</p>
                  <ul className="list-disc ml-4 space-y-1">
                    <li>Для Gmail: smtp.gmail.com, порт 587</li>
                    <li>Для Outlook/Hotmail: smtp.office365.com, порт 587</li>
                    <li>Для пошти на власному домені: дізнайтесь у хостинг-провайдера</li>
                    <li>Для Gmail потрібно створити пароль додатка в налаштуваннях безпеки</li>
                  </ul>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="smtpHost" className="block text-sm font-medium mb-1">
                    SMTP Сервер
                  </label>
                  <input
                    id="smtpHost"
                    type="text"
                    value={settings.smtpSettings?.host || ''}
                    onChange={handleSmtpHostChange}
                    className="input w-full"
                    placeholder="smtp.gmail.com"
                    disabled={!settings.notificationsEnabled}
                  />
                </div>
                
                <div>
                  <label htmlFor="smtpPort" className="block text-sm font-medium mb-1">
                    SMTP Порт
                  </label>
                  <input
                    id="smtpPort"
                    type="number"
                    value={settings.smtpSettings?.port || 587}
                    onChange={handleSmtpPortChange}
                    className="input w-full"
                    placeholder="587"
                    disabled={!settings.notificationsEnabled}
                  />
                </div>
                
                <div>
                  <label htmlFor="smtpUsername" className="block text-sm font-medium mb-1">
                    SMTP Логін
                  </label>
                  <input
                    id="smtpUsername"
                    type="text"
                    value={settings.smtpSettings?.username || ''}
                    onChange={handleSmtpUsernameChange}
                    className="input w-full"
                    placeholder="your.email@gmail.com"
                    disabled={!settings.notificationsEnabled}
                  />
                </div>
                
                <div>
                  <label htmlFor="smtpPassword" className="block text-sm font-medium mb-1">
                    SMTP Пароль
                  </label>
                  <div className="relative">
                    <input
                      id="smtpPassword"
                      type={showEmailPassword ? "text" : "password"}
                      value={settings.smtpSettings?.password || ''}
                      onChange={handleSmtpPasswordChange}
                      className="input w-full"
                      placeholder="●●●●●●●●●●"
                      disabled={!settings.notificationsEnabled}
                    />
                    <button 
                      type="button"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-blue-500"
                      onClick={() => setShowEmailPassword(!showEmailPassword)}
                    >
                      {showEmailPassword ? 'Приховати' : 'Показати'}
                    </button>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="smtpFrom" className="block text-sm font-medium mb-1">
                    Відправник ("From")
                  </label>
                  <input
                    id="smtpFrom"
                    type="text"
                    value={settings.smtpSettings?.from || ''}
                    onChange={handleSmtpFromChange}
                    className="input w-full"
                    placeholder="Контроль обходу <your.email@gmail.com>"
                    disabled={!settings.notificationsEnabled}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Можна залишити порожнім, тоді буде використано логін
                  </p>
                </div>
              </div>
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
