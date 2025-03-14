import React from 'react';
import { usePatrol } from '@/context/PatrolContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export const SettingsForm = () => {
  const { settings, updateSettings } = usePatrol();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Час на обхід (хвилини)</Label>
        <Input
          type="number"
          min={1}
          max={35}
          value={settings.patrolTimeMinutes}
          onChange={(e) => {
            const value = parseInt(e.target.value);
            if (value >= 1 && value <= 35) {
              updateSettings({ patrolTimeMinutes: value });
            }
          }}
          className="w-full"
        />
        <p className="text-sm text-zinc-400">
          Встановіть час на обхід однієї точки (від 1 до 35 хвилин)
        </p>
      </div>

      <div className="space-y-2">
        <Label>Метод перевірки</Label>
        <select
          value={settings.verificationMethod}
          onChange={(e) => updateSettings({ verificationMethod: e.target.value as any })}
          className="w-full p-2 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-100"
        >
          <option value="gps">GPS</option>
          <option value="qrcode">QR-код</option>
          <option value="manual">Вручну</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label>Радіус перевірки (метри)</Label>
        <Input
          type="number"
          value={settings.proximityThreshold}
          onChange={(e) => updateSettings({ proximityThreshold: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label>Email для сповіщень</Label>
        <Input
          type="email"
          value={settings.notificationEmail || ''}
          onChange={(e) => updateSettings({ notificationEmail: e.target.value })}
          className="w-full"
          placeholder="example@domain.com"
        />
      </div>

      <div className="space-y-2">
        <Label>Telegram Bot Token</Label>
        <Input
          type="text"
          value={settings.telegramBotToken || ''}
          onChange={(e) => updateSettings({ telegramBotToken: e.target.value })}
          className="w-full"
          placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
        />
      </div>

      <div className="space-y-2">
        <Label>Telegram Chat ID</Label>
        <Input
          type="text"
          value={settings.telegramChatId || ''}
          onChange={(e) => updateSettings({ telegramChatId: e.target.value })}
          className="w-full"
          placeholder="-1001234567890"
        />
      </div>
    </div>
  );
}; 