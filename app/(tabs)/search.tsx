import { useState, useMemo, useCallback } from 'react';
import { StyleSheet, View, Text, TextInput, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, X, Sparkles } from 'lucide-react-native';
import { COLORS, CATEGORY_MAP } from '@/lib/constants';
import { useThoughts } from '@/hooks/useThoughts';
import { ThoughtCard } from '@/components/ThoughtCard';
import { EmptyState } from '@/components/EmptyState';

export default function SearchScreen() {
  const router = useRouter();
  const { thoughts } = useThoughts();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const lower = query.toLowerCase();
    const terms = lower.split(/\s+/).filter((t) => t.length > 0);

    return thoughts
      .map((thought) => {
        const titleLower = thought.title.toLowerCase();
        const transcriptLower = thought.rawTranscript.toLowerCase();
        const summaryLower = thought.summary.toLowerCase();
        const tagsLower = thought.tags.join(' ').toLowerCase();
        const categoryLabel = (CATEGORY_MAP[thought.category]?.label || '').toLowerCase();

        let score = 0;
        for (const term of terms) {
          if (titleLower.includes(term)) score += 5;
          if (tagsLower.includes(term)) score += 4;
          if (categoryLabel.includes(term)) score += 3;
          if (summaryLower.includes(term)) score += 2;
          if (transcriptLower.includes(term)) score += 1;
        }

        return { thought, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.thought);
  }, [thoughts, query]);

  const handleThoughtPress = useCallback((id: string) => {
    router.push(`/thought/${id}`);
  }, [router]);

  const suggestions = [
    'discipline',
    'motivation',
    'ideas about AI',
    'goals',
    'what did I say about building apps',
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
      </View>

      <View style={styles.searchBar}>
        <Search color={COLORS.textTertiary} size={20} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search your thoughts..."
          placeholderTextColor={COLORS.textTertiary}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')} style={styles.clearButton}>
            <X color={COLORS.textTertiary} size={18} />
          </Pressable>
        )}
      </View>

      {!query.trim() ? (
        <View style={styles.suggestionsContainer}>
          <View style={styles.suggestionsHeader}>
            <Sparkles color={COLORS.accent} size={18} />
            <Text style={styles.suggestionsTitle}>Try searching for</Text>
          </View>
          {suggestions.map((s) => (
            <Pressable
              key={s}
              style={styles.suggestionChip}
              onPress={() => setQuery(s)}
            >
              <Text style={styles.suggestionText}>{s}</Text>
            </Pressable>
          ))}
          <Text style={styles.semanticNote}>
            Semantic search (meaning-based, not just keywords) will be available
            once the embedding model is downloaded from Settings.
          </Text>
        </View>
      ) : results.length === 0 ? (
        <EmptyState
          emoji="🔍"
          title="No results found"
          subtitle={`No thoughts match "${query}". Try different keywords.`}
        />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ThoughtCard thought={item} onPress={handleThoughtPress} />
          )}
          contentContainerStyle={styles.results}
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  clearButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  suggestionsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  suggestionChip: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  semanticNote: {
    fontSize: 13,
    color: COLORS.textTertiary,
    lineHeight: 20,
    marginTop: 20,
    paddingHorizontal: 4,
  },
  results: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
});
