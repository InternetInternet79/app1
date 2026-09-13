import { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Trash2, Pencil, Check, X, Play, Square } from 'lucide-react-native';
import { COLORS, CATEGORY_MAP, CATEGORIES, SYNC_LABELS } from '@/lib/constants';
import { useThoughts } from '@/hooks/useThoughts';
import { Thought, CategoryId } from '@/lib/types';
import { formatDate, formatTime, formatDuration } from '@/lib/time';
import { EmptyState } from '@/components/EmptyState';

export default function ThoughtDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getThought, updateThought, deleteThought, thoughts } = useThoughts();

  const thought = id ? getThought(id) : undefined;
  const [editing, setEditing] = useState<'title' | 'summary' | 'transcript' | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSaveEdit = useCallback(() => {
    if (!thought || !editing) return;
    const updates: Partial<Thought> = {};
    if (editing === 'title') updates.title = editValue.trim();
    if (editing === 'summary') updates.summary = editValue.trim();
    if (editing === 'transcript') updates.rawTranscript = editValue.trim();
    updateThought(thought.id, updates);
    setEditing(null);
  }, [thought, editing, editValue, updateThought]);

  const startEdit = (field: 'title' | 'summary' | 'transcript') => {
    if (!thought) return;
    if (field === 'title') setEditValue(thought.title);
    if (field === 'summary') setEditValue(thought.summary);
    if (field === 'transcript') setEditValue(thought.rawTranscript);
    setEditing(field);
  };

  const handleDelete = useCallback(() => {
    if (!thought) return;
    Alert.alert(
      'Delete thought?',
      'This will mark the thought for deletion. The original recording and transcript will be removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteThought(thought.id);
            router.back();
          },
        },
      ]
    );
  }, [thought, deleteThought, router]);

  const handleCategoryChange = useCallback((cat: CategoryId) => {
    if (!thought) return;
    updateThought(thought.id, { category: cat, categoryConfidence: 1.0 });
    setShowCategoryPicker(false);
  }, [thought, updateThought]);

  if (!thought) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft color={COLORS.textPrimary} size={22} />
          </Pressable>
        </View>
        <EmptyState emoji="🔍" title="Thought not found" subtitle="This thought may have been deleted." />
      </SafeAreaView>
    );
  }

  const cat = CATEGORY_MAP[thought.category] || CATEGORY_MAP.thought;
  const syncInfo = SYNC_LABELS[thought.syncStatus] || SYNC_LABELS.LOCAL_ONLY;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft color={COLORS.textPrimary} size={22} />
        </Pressable>
        <View style={styles.headerActions}>
          <Pressable style={styles.headerButton} onPress={handleDelete}>
            <Trash2 color={COLORS.error} size={20} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={styles.section}>
          {editing === 'title' ? (
            <View style={styles.editContainer}>
              <TextInput
                style={styles.titleInput}
                value={editValue}
                onChangeText={setEditValue}
                autoFocus
                multiline
              />
              <View style={styles.editActions}>
                <Pressable style={styles.editCancelButton} onPress={() => setEditing(null)}>
                  <X color={COLORS.textSecondary} size={18} />
                </Pressable>
                <Pressable style={styles.editSaveButton} onPress={handleSaveEdit}>
                  <Check color={COLORS.textPrimary} size={18} />
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable style={styles.editableField} onPress={() => startEdit('title')}>
              <Text style={styles.title}>{thought.title}</Text>
              <Pencil color={COLORS.textTertiary} size={16} />
            </Pressable>
          )}
        </View>

        {/* Category */}
        <View style={styles.section}>
          {showCategoryPicker ? (
            <View style={styles.categoryPicker}>
              <Text style={styles.pickerLabel}>Select category</Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((c) => (
                  <Pressable
                    key={c.id}
                    style={[
                      styles.categoryOption,
                      thought.category === c.id && styles.categoryOptionSelected,
                    ]}
                    onPress={() => handleCategoryChange(c.id)}
                  >
                    <Text style={styles.categoryOptionEmoji}>{c.emoji}</Text>
                    <Text
                      style={[
                        styles.categoryOptionLabel,
                        thought.category === c.id && styles.categoryOptionLabelSelected,
                      ]}
                    >
                      {c.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : (
            <Pressable
              style={[styles.categoryBadge, { backgroundColor: cat.bgColor }]}
              onPress={() => setShowCategoryPicker(true)}
            >
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              <Text style={[styles.categoryLabelText, { color: cat.color }]}>{cat.label}</Text>
              <Pencil color={cat.color} size={12} />
            </Pressable>
          )}
        </View>

        {/* Date */}
        <View style={styles.dateRow}>
          <Text style={styles.dateText}>{formatDate(thought.createdAt)}</Text>
          <Text style={styles.dateText}>{formatTime(thought.createdAt)}</Text>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SUMMARY</Text>
          {editing === 'summary' ? (
            <View style={styles.editContainer}>
              <TextInput
                style={styles.bodyInput}
                value={editValue}
                onChangeText={setEditValue}
                autoFocus
                multiline
              />
              <View style={styles.editActions}>
                <Pressable style={styles.editCancelButton} onPress={() => setEditing(null)}>
                  <X color={COLORS.textSecondary} size={18} />
                </Pressable>
                <Pressable style={styles.editSaveButton} onPress={handleSaveEdit}>
                  <Check color={COLORS.textPrimary} size={18} />
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable style={styles.editableField} onPress={() => startEdit('summary')}>
              <Text style={styles.bodyText}>
                {thought.summary || 'No summary generated. Tap to add one.'}
              </Text>
              <Pencil color={COLORS.textTertiary} size={16} />
            </Pressable>
          )}
        </View>

        {/* Tags */}
        {thought.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>TAGS</Text>
            <View style={styles.tagsRow}>
              {thought.tags.map((tag) => (
                <View key={tag} style={styles.tagPill}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Action Items */}
        {thought.actionItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>ACTION ITEMS</Text>
            {thought.actionItems.map((item) => (
              <View key={item.id} style={styles.actionItem}>
                <View style={[styles.actionCheckbox, item.completed && styles.actionCheckboxDone]}>
                  {item.completed && <Check color={COLORS.textPrimary} size={12} strokeWidth={3} />}
                </View>
                <View style={styles.actionContent}>
                  <Text style={[styles.actionText, item.completed && styles.actionTextDone]}>
                    {item.text}
                  </Text>
                  {item.dueDate && (
                    <Text style={styles.actionDue}>{item.dueDate}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Original Transcript */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ORIGINAL TRANSCRIPT</Text>
          {editing === 'transcript' ? (
            <View style={styles.editContainer}>
              <TextInput
                style={styles.bodyInput}
                value={editValue}
                onChangeText={setEditValue}
                autoFocus
                multiline
              />
              <View style={styles.editActions}>
                <Pressable style={styles.editCancelButton} onPress={() => setEditing(null)}>
                  <X color={COLORS.textSecondary} size={18} />
                </Pressable>
                <Pressable style={styles.editSaveButton} onPress={handleSaveEdit}>
                  <Check color={COLORS.textPrimary} size={18} />
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable style={styles.editableField} onPress={() => startEdit('transcript')}>
              <Text style={styles.transcriptText}>{thought.rawTranscript}</Text>
              <Pencil color={COLORS.textTertiary} size={16} />
            </Pressable>
          )}
        </View>

        {/* Audio */}
        {thought.audioPath && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>ORIGINAL RECORDING</Text>
            <View style={styles.audioPlayer}>
              <Pressable
                style={styles.playButton}
                onPress={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? (
                  <Square color={COLORS.textPrimary} size={20} fill={COLORS.textPrimary} />
                ) : (
                  <Play color={COLORS.textPrimary} size={20} fill={COLORS.textPrimary} />
                )}
              </Pressable>
              <View style={styles.audioInfo}>
                <Text style={styles.audioDuration}>{formatDuration(thought.duration)}</Text>
                <View style={styles.audioWaveform}>
                  {Array.from({ length: 30 }).map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.waveformBar,
                        { height: 4 + Math.abs(Math.sin(i * 0.5)) * 20 },
                      ]}
                    />
                  ))}
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Sync status */}
        <View style={styles.section}>
          <View style={styles.syncRow}>
            <Text style={[styles.syncText, { color: syncInfo.color }]}>
              {syncInfo.icon} {syncInfo.label}
            </Text>
            <Text style={styles.versionText}>v{thought.version}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  section: {
    marginBottom: 24,
  },
  editableField: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  editContainer: {
    width: '100%',
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  bodyInput: {
    fontSize: 16,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    minHeight: 80,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  editCancelButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editSaveButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  categoryEmoji: {
    fontSize: 14,
  },
  categoryLabelText: {
    fontSize: 14,
    fontWeight: '700',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  paddingHorizontal: 2,
  },
  dateText: {
    fontSize: 13,
    color: COLORS.textTertiary,
    fontWeight: '500',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textTertiary,
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  bodyText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
  transcriptText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagPill: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  tagText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
  },
  actionCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  actionCheckboxDone: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  actionContent: {
    flex: 1,
  },
  actionText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  actionTextDone: {
    textDecorationLine: 'line-through',
    color: COLORS.textTertiary,
  },
  actionDue: {
    fontSize: 12,
    color: COLORS.accent,
    fontWeight: '600',
    marginTop: 2,
  },
  audioPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioInfo: {
    flex: 1,
  },
  audioDuration: {
    fontSize: 13,
    color: COLORS.textTertiary,
    fontWeight: '600',
    marginBottom: 8,
  },
  audioWaveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 24,
  },
  waveformBar: {
    flex: 1,
    backgroundColor: COLORS.accent,
    borderRadius: 2,
    minHeight: 4,
  },
  syncRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  syncText: {
    fontSize: 13,
    fontWeight: '600',
  },
  versionText: {
    fontSize: 12,
    color: COLORS.textTertiary,
    fontWeight: '500',
  },
  categoryPicker: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  pickerLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  categoryOptionSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentDim,
  },
  categoryOptionEmoji: {
    fontSize: 13,
  },
  categoryOptionLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  categoryOptionLabelSelected: {
    color: COLORS.accent,
  },
});
