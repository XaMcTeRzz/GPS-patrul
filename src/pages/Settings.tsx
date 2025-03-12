
import React from 'react';
import { usePatrol } from '@/context/PatrolContext';
import Navbar from '@/components/Navbar';
import { Check } from 'lucide-react';

const Settings = () => {
  const { settings, updateSettings } = usePatrol();

  const handleVerificationMethodChange = (method: 'gps' | 'qrcode' | 'manual') => {
    updateSettings({ verificationMethod: method });
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

  const handleTelegramChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ telegramBotToken: e.target.value });
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
          <h2 className="text-lg font-medium mb-4">Сповіщення</h2>
          
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
              />
            </div>
            
            <div>
              <label htmlFor="telegramToken" className="block text-sm font-medium mb-1">
                Telegram Bot Token
              </label>
              <input
                id="telegramToken"
                type="text"
                value={settings.telegramBotToken || ''}
                onChange={handleTelegramChange}
                className="input w-full"
                placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
              />
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
