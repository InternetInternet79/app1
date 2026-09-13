import { useState, useMemo, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, CATEGORIES, CATEGORY_MAP } from '@/lib/constants';
import { useThoughts } from '@/hooks/useThoughts';
import { ThoughtCard } from '@/components/ThoughtCard';
import { EmptyState } from '@/components/EmptyState';
import { Thought, CategoryId } from '@/lib/types';
import { formatDateHeader } from '@/lib/time';

type FilterType = 'all' | CategoryId;

export default function ThoughtsScreen() {
  const router = useRouter();
  const { thoughts, loading } = useThoughts();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filteredThoughts = useMemo(() => {
    if (activeFilter === 'all') return thoughts;
    return thoughts.filter((t) => t.category === activeFilter);
  }, [thoughts, activeFilter]);

  const groupedThoughts = useMemo(() => {
    const groups: { date: string; items: Thought[] }[] = [];
    for (const thought of filteredThoughts) {
      const dateKey = formatDateHeader(thought.createdAt);
      const existing = groups.find((g) => g.date === dateKey);
      if (existing) {
        existing.items.push(thought);
      } else {
        groups.push({ date: dateKey, items: [thought] });
      }
    }
    return groups;
  }, [filteredThoughts]);

  const handleThoughtPress = useCallback((id: string) => {
    router.push(`/thought/${id}`);
  }, [router]);

  const renderGroup = ({ item: group }: { item: { date: string; items: Thought[] } }) => (
    <View style={styles.group}>
      <Text style={styles.dateHeader}>{group.date}</Text>
      {group.items.map((thought) => (
        <ThoughtCard key={thought.id} thought={thought} onPress={handleThoughtPress} />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Thoughts</Text>
        <Text style={styles.count}>
          {thoughts.length} {thoughts.length === 1 ? 'thought' : 'thoughts'}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        <Pressable
          style={[styles.filterChip, activeFilter === 'all' && styles.filterChipActive]}
          onPress={() => setActiveFilter('all')}
        >
          <Text style={[styles.filterChipText, activeFilter === 'all' && styles.filterChipTextActive]}>
            All
          </Text>
        </Pressable>
        {CATEGORIES.map((cat) => {
          const count = thoughts.filter((t) => t.category === cat.id).length;
          if (count === 0) return null;
          return (
            <Pressable
              key={cat.id}
              style={[styles.filterChip, activeFilter === cat.id && styles.filterChipActive]}
              onPress={() => setActiveFilter(cat.id)}
            >
              <Text style={styles.filterEmoji}>{cat.emoji}</Text>
              <Text style={[styles.filterChipText, activeFilter === cat.id && styles.filterChipTextActive]}>
                {cat.label}
              </Text>
              <Text style={[styles.filterCount, activeFilter === cat.id && styles.filterCountActive]}>
                {count}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {filteredThoughts.length === 0 ? (
        <EmptyState
          emoji="💭"
          title={activeFilter === 'all' ? 'No thoughts yet' : 'No thoughts in this category'}
          subtitle={activeFilter === 'all' ? 'Capture your first thought from the Home tab' : 'Try a different filter or capture a new thought'}
        />
      ) : (
        <FlatList
          data={groupedThoughts}
          renderItem={renderGroup}
          keyExtractor={(item) => item.date}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  count: {
    fontSize: 14,
    color: COLORS.textTertiary,
    fontWeight: '500',
  },
  filterScroll: {
    flexGrow: 0,
    maxHeight: 50,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  filterChipActive: {
    backgroundColor: COLORS.accentDim,
    borderColor: COLORS.accent,
  },
  filterEmoji: {
    fontSize: 13,
  },
  filterChipText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: COLORS.accent,
  },
  filterCount: {
    fontSize: 11,
    color: COLORS.textTertiary,
    fontWeight: '500',
  },
  filterCountActive: {
    color: COLORS.accent,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  group: {
    marginBottom: 8,
  },
  dateHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 12,
  },
});
