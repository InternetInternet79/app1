import { useState, useEffect, useCallback } from 'react';
import { Thought, AppSettings } from '@/lib/types';
import { loadThoughts, saveThoughts, loadSettings, saveSettings, generateId } from '@/lib/storage';
import { processThought } from '@/lib/ai';

export function useThoughts() {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadThoughts().then((data) => {
      setThoughts(data);
      setLoading(false);
    });
  }, []);

  const persist = useCallback(async (updated: Thought[]) => {
    setThoughts(updated);
    const all = await loadThoughts().then(async (existing) => {
      const merged = [...existing, ...updated.filter((u) => !existing.some((e) => e.id === u.id))];
      const finalList = merged.map((m) => {
        const upd = updated.find((u) => u.id === m.id);
        return upd || m;
      });
      return finalList;
    });
    await saveThoughts(all);
  }, []);

  const addThought = useCallback(
    async (transcript: string, audioPath: string | null, duration: number, language: AppSettings['language']) => {
      const ai = processThought(transcript);
      const thought: Thought = {
        id: generateId(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        title: ai.title,
        rawTranscript: transcript,
        summary: ai.summary,
        category: ai.category,
        categoryConfidence: ai.categoryConfidence,
        tags: ai.tags,
        actionItems: ai.actionItems,
        importance: ai.importance,
        language,
        duration,
        audioPath,
        syncStatus: 'PENDING_UPLOAD',
        version: 1,
        deletedAt: null,
        sessionId: null,
      };
      await persist([thought, ...thoughts]);
      return thought;
    },
    [thoughts, persist]
  );

  const updateThought = useCallback(
    async (id: string, updates: Partial<Thought>) => {
      const updated = thoughts.map((t) =>
        t.id === id
          ? {
              ...t,
              ...updates,
              updatedAt: Date.now(),
              version: t.version + 1,
              syncStatus: (t.syncStatus === 'SYNCED' ? 'PENDING_UPDATE' : t.syncStatus) as Thought['syncStatus'],
            }
          : t
      );
      await persist(updated);
    },
    [thoughts, persist]
  );

  const deleteThought = useCallback(
    async (id: string) => {
      const updated = thoughts.map((t) =>
        t.id === id
          ? { ...t, deletedAt: Date.now(), syncStatus: 'PENDING_DELETE' as const }
          : t
      );
      await persist(updated);
    },
    [thoughts, persist]
  );

  const getThought = useCallback((id: string) => thoughts.find((t) => t.id === id), [thoughts]);

  return { thoughts, loading, addThought, updateThought, deleteThought, getThought };
}
