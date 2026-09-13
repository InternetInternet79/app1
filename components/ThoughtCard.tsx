import { Pressable, StyleSheet, View, Text } from 'react-native';
import { COLORS, CATEGORY_MAP, SYNC_LABELS } from '@/lib/constants';
import { Thought } from '@/lib/types';
import { formatRelativeTime } from '@/lib/time';

interface ThoughtCardProps {
  thought: Thought;
  onPress: (id: string) => void;
}

export function ThoughtCard({ thought, onPress }: ThoughtCardProps) {
  const cat = CATEGORY_MAP[thought.category] || CATEGORY_MAP.thought;
  const syncInfo = SYNC_LABELS[thought.syncStatus] || SYNC_LABELS.LOCAL_ONLY;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onPress(thought.id)}
    >
      <View style={styles.header}>
        <View style={[styles.categoryBadge, { backgroundColor: cat.bgColor }]}>
          <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
          <Text style={[styles.categoryLabel, { color: cat.color }]}>{cat.label}</Text>
        </View>
        <Text style={styles.timeText}>{formatRelativeTime(thought.createdAt)}</Text>
      </View>
      <Text style={styles.title} numberOfLines={2}>{thought.title}</Text>
      {thought.summary ? (
        <Text style={styles.summary} numberOfLines={2}>{thought.summary}</Text>
      ) : null}
      {thought.tags.length > 0 && (
        <View style={styles.tagsRow}>
          {thought.tags.slice(0, 3).map((tag) => (
            <View key={tag} style={styles.tagPill}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
          {thought.tags.length > 3 && (
            <Text style={styles.tagMore}>+{thought.tags.length - 3}</Text>
          )}
        </View>
      )}
      <View style={styles.footer}>
        <Text style={[styles.syncIndicator, { color: syncInfo.color }]}>
          {syncInfo.icon} {syncInfo.label}
        </Text>
        {thought.actionItems.length > 0 && (
          <Text style={styles.actionCount}>
            {thought.actionItems.filter((a) => !a.completed).length} action items
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  cardPressed: {
    backgroundColor: COLORS.surfaceHover,
    transform: [{ scale: 0.98 }],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  categoryEmoji: {
    fontSize: 12,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 22,
    marginBottom: 4,
  },
  summary: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  tagPill: {
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    color: COLORS.textTertiary,
    fontWeight: '500',
  },
  tagMore: {
    fontSize: 11,
    color: COLORS.textTertiary,
    fontWeight: '500',
    paddingHorizontal: 4,
    paddingVertical: 3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  syncIndicator: {
    fontSize: 11,
    fontWeight: '500',
  },
  actionCount: {
    fontSize: 11,
    color: COLORS.textTertiary,
    fontWeight: '500',
  },
});
