import { Thought, AppSettings, Session } from './types';
import { STORAGE_KEYS } from './constants';
import { Platform } from 'react-native';

type StorageImpl = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
};

function getStorage(): StorageImpl {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    return {
      getItem: async (key: string) => window.localStorage.getItem(key),
      setItem: async (key: string, value: string) => window.localStorage.setItem(key, value),
    };
  }
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  return AsyncStorage;
}

const DEFAULT_SETTINGS: AppSettings = {
  language: 'english',
  modelSize: null,
  driveConnected: false,
  autoBackup: true,
  wifiOnly: true,
  backupAudio: true,
  onboardingComplete: false,
  lastBackupAt: null,
};

export async function loadThoughts(): Promise<Thought[]> {
  try {
    const storage = getStorage();
    const raw = await storage.getItem(STORAGE_KEYS.THOUGHTS);
    if (!raw) return [];
    const thoughts: Thought[] = JSON.parse(raw);
    return thoughts.filter((t) => t.deletedAt === null).sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

export async function saveThoughts(thoughts: Thought[]): Promise<void> {
  const storage = getStorage();
  await storage.setItem(STORAGE_KEYS.THOUGHTS, JSON.stringify(thoughts));
}

export async function loadSettings(): Promise<AppSettings> {
  try {
    const storage = getStorage();
    const raw = await storage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const storage = getStorage();
  await storage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export async function loadSessions(): Promise<Session[]> {
  try {
    const storage = getStorage();
    const raw = await storage.getItem(STORAGE_KEYS.SESSIONS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function saveSessions(sessions: Session[]): Promise<void> {
  const storage = getStorage();
  await storage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
}
