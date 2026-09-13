import { CategoryMeta, ModelInfo } from './types';

export const CATEGORIES: CategoryMeta[] = [
  { id: 'idea', label: 'Idea', emoji: '💡', color: '#F59E0B', bgColor: '#F59E0B1A' },
  { id: 'principle', label: 'Life Principle', emoji: '🧠', color: '#8B5CF6', bgColor: '#8B5CF61A' },
  { id: 'learning', label: 'Learning', emoji: '📚', color: '#3B82F6', bgColor: '#3B82F61A' },
  { id: 'goal', label: 'Goal', emoji: '🎯', color: '#EF4444', bgColor: '#EF44441A' },
  { id: 'task', label: 'Task', emoji: '✅', color: '#22C55E', bgColor: '#22C55E1A' },
  { id: 'reflection', label: 'Reflection', emoji: '📔', color: '#EC4899', bgColor: '#EC48991A' },
  { id: 'work', label: 'Work', emoji: '💼', color: '#6366F1', bgColor: '#6366F11A' },
  { id: 'thought', label: 'Thought', emoji: '💭', color: '#94A3B8', bgColor: '#94A3B81A' },
  { id: 'journal', label: 'Journal', emoji: '📖', color: '#14B8A6', bgColor: '#14B8A61A' },
  { id: 'important', label: 'Important', emoji: '⭐', color: '#EAB308', bgColor: '#EAB3081A' },
  { id: 'other', label: 'Other', emoji: '📌', color: '#A8A29E', bgColor: '#A8A29E1A' },
];

export const CATEGORY_MAP: Record<string, CategoryMeta> = CATEGORIES.reduce(
  (acc, c) => ({ ...acc, [c.id]: c }),
  {} as Record<string, CategoryMeta>
);

export const SPEECH_MODELS: ModelInfo[] = [
  {
    id: 'whisper-tiny',
    name: 'Whisper Tiny',
    size: '75 MB',
    downloadSize: '39 MB',
    installed: false,
    description: 'Fastest, lowest battery. Good for short captures.',
  },
  {
    id: 'whisper-base',
    name: 'Whisper Base',
    size: '142 MB',
    downloadSize: '74 MB',
    installed: false,
    description: 'Balanced accuracy and speed. Recommended for most devices.',
  },
  {
    id: 'whisper-small',
    name: 'Whisper Small',
    size: '466 MB',
    downloadSize: '244 MB',
    installed: false,
    description: 'Higher accuracy, especially for Hindi and Hinglish.',
  },
];

export const LLM_MODELS: ModelInfo[] = [
  {
    id: 'llm-small',
    name: 'Small LLM (1B)',
    size: '620 MB',
    downloadSize: '620 MB',
    installed: false,
    description: 'Basic categorization and titles. Works on low-end devices.',
  },
  {
    id: 'llm-medium',
    name: 'Medium LLM (3B)',
    size: '1.8 GB',
    downloadSize: '1.8 GB',
    installed: false,
    description: 'Better summaries and tags. Recommended for mid-range devices.',
  },
  {
    id: 'llm-large',
    name: 'Large LLM (7B)',
    size: '4.1 GB',
    downloadSize: '4.1 GB',
    installed: false,
    description: 'Best quality analysis. Requires a high-end device.',
  },
];

export const EMBEDDING_MODELS: ModelInfo[] = [
  {
    id: 'emb-mini',
    name: 'Mini Embeddings',
    size: '90 MB',
    downloadSize: '90 MB',
    installed: false,
    description: 'Enables semantic search. Optional for MVP.',
  },
];

export const COLORS = {
  background: '#0B0D14',
  surface: '#141823',
  surfaceElevated: '#1C2030',
  surfaceHover: '#232839',
  border: '#2A3041',
  borderLight: '#1F2433',
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  accent: '#F59E0B',
  accentDim: '#F59E0B33',
  success: '#22C55E',
  warning: '#EAB308',
  error: '#EF4444',
  info: '#3B82F6',
};

export const STORAGE_KEYS = {
  THOUGHTS: '@thoughtvault_thoughts',
  SETTINGS: '@thoughtvault_settings',
  SESSIONS: '@thoughtvault_sessions',
};

export const SYNC_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  LOCAL_ONLY: { label: 'Saved locally', icon: '✓', color: '#22C55E' },
  PENDING_UPLOAD: { label: 'Waiting for internet', icon: '⟳', color: '#EAB308' },
  SYNCED: { label: 'Synced', icon: '☁', color: '#3B82F6' },
  PENDING_UPDATE: { label: 'Pending update', icon: '⟳', color: '#EAB308' },
  PENDING_DELETE: { label: 'Pending delete', icon: '⟳', color: '#EF4444' },
  CONFLICT: { label: 'Conflict', icon: '!', color: '#EF4444' },
};
