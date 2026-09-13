import { useState, useEffect, useCallback } from 'react';
import { AppSettings } from '@/lib/types';
import { loadSettings, saveSettings } from '@/lib/storage';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    loadSettings().then(setSettings);
  }, []);

  const update = useCallback(async (updates: Partial<AppSettings>) => {
    setSettings((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...updates };
      saveSettings(next);
      return next;
    });
  }, []);

  return { settings, update };
}
