
import React from 'react';
import { usePatrol } from '@/context/PatrolContext';
import Navbar from '@/components/Navbar';

const Settings = () => {
  const { settings, updateSettings } = usePatrol();

  const handleVerificationMethodChange = (method: 'gps' | 'qrcode' | 'manual') => {
    updateSettings({ verificationMethod: method });
  };

  const handleNotificationsToggle = () => {
    updateSettings({ notificationsEnabled: !settings.notificationsEnabled });
  };

  const handleProximityThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      updateSettings({ proximityThreshold: value });
    }
  };

  return (
    <div className="patrol-container pb-20">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="space-y-6">
        <div className="bg-card border rounded-lg p-4">
          <h2 className="text-lg font-medium mb-4">Checkpoint Verification</h2>
          
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name="verificationMethod"
                checked={settings.verificationMethod === 'gps'}
                onChange={() => handleVerificationMethodChange('gps')}
                className="h-4 w-4 text-primary"
              />
              <span>GPS Location</span>
            </label>
            
            <label className="flex items-center space-x-3 opacity-50 cursor-not-allowed">
              <input
                type="radio"
                name="verificationMethod"
                disabled
                className="h-4 w-4"
              />
              <span>QR Code (coming soon)</span>
            </label>
            
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name="verificationMethod"
                checked={settings.verificationMethod === 'manual'}
                onChange={() => handleVerificationMethodChange('manual')}
                className="h-4 w-4 text-primary"
              />
              <span>Manual Verification</span>
            </label>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <h2 className="text-lg font-medium mb-4">GPS Settings</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="proximityThreshold" className="block text-sm font-medium mb-1">
                Proximity Threshold (meters)
              </label>
              <input
                id="proximityThreshold"
                type="number"
                min="1"
                value={settings.proximityThreshold}
                onChange={handleProximityThresholdChange}
                className="input w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Distance within which a checkpoint is considered reached
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <h2 className="text-lg font-medium mb-4">Notifications</h2>
          
          <div className="flex items-center justify-between">
            <span>Enable Notifications</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notificationsEnabled}
                onChange={handleNotificationsToggle}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <h2 className="text-lg font-medium mb-2">About</h2>
          <p className="text-sm text-muted-foreground">
            Patrol Manager v1.0
          </p>
        </div>
      </div>

      <Navbar />
    </div>
  );
};

export default Settings;
