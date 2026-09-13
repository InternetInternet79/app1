export type CategoryId =
  | 'idea'
  | 'principle'
  | 'learning'
  | 'goal'
  | 'task'
  | 'reflection'
  | 'work'
  | 'thought'
  | 'journal'
  | 'important'
  | 'other';

export type SyncStatus =
  | 'LOCAL_ONLY'
  | 'PENDING_UPLOAD'
  | 'SYNCED'
  | 'PENDING_UPDATE'
  | 'PENDING_DELETE'
  | 'CONFLICT';

export type Language = 'english' | 'hindi' | 'both';

export type ModelSize = 'small' | 'medium' | 'large' | null;

export interface ActionItem {
  id: string;
  text: string;
  dueDate: string | null;
  completed: boolean;
}

export interface Thought {
  id: string;
  createdAt: number;
  updatedAt: number;
  title: string;
  rawTranscript: string;
  summary: string;
  category: CategoryId;
  categoryConfidence: number;
  tags: string[];
  actionItems: ActionItem[];
  importance: number;
  language: Language;
  duration: number;
  audioPath: string | null;
  syncStatus: SyncStatus;
  version: number;
  deletedAt: number | null;
  sessionId: string | null;
}

export interface Session {
  id: string;
  createdAt: number;
  audioPath: string;
  duration: number;
  thoughtIds: string[];
}

export interface AppSettings {
  language: Language;
  modelSize: ModelSize;
  driveConnected: boolean;
  autoBackup: boolean;
  wifiOnly: boolean;
  backupAudio: boolean;
  onboardingComplete: boolean;
  lastBackupAt: number | null;
}

export interface ModelInfo {
  id: string;
  name: string;
  size: string;
  downloadSize: string;
  installed: boolean;
  description: string;
}

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
}
