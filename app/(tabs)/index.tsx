import { useState, useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pencil } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/lib/constants';
import { useThoughts } from '@/hooks/useThoughts';
import { useSettings } from '@/hooks/useSettings';
import { useRecording } from '@/hooks/useRecording';
import { CaptureButton } from '@/components/CaptureButton';
import { ThoughtCard } from '@/components/ThoughtCard';
import { RecordingOverlay } from '@/components/RecordingOverlay';
import { ManualInputModal } from '@/components/ManualInputModal';
import { EmptyState } from '@/components/EmptyState';

export default function HomeScreen() {
  const router = useRouter();
  const { thoughts, addThought } = useThoughts();
  const { settings } = useSettings();
  const [showManual, setShowManual] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const savedRef = useRef(false);

  const recording = useRecording(settings?.language || 'english');

  const recentThoughts = thoughts.slice(0, 5);

  const handleCapturePress = useCallback(() => {
    savedRef.current = false;
    recording.reset();
    setOverlayVisible(true);
    setTimeout(() => recording.start(), 300);
  }, [recording]);

  const handleStop = useCallback(() => {
    recording.stop();
  }, [recording]);

  const handleCloseOverlay = useCallback(() => {
    setOverlayVisible(false);
    savedRef.current = false;
    recording.reset();
  }, [recording]);

  const handleSaveThought = useCallback(async (transcript: string) => {
    if (transcript.trim().length === 0) return;
    await addThought(transcript, null, 0, settings?.language || 'english');
  }, [addThought, settings]);

  useEffect(() => {
    if (recording.state === 'done' && !savedRef.current && recording.transcript.trim().length > 0) {
      savedRef.current = true;
      handleSaveThought(recording.transcript);
    }
    if (recording.state === 'idle') {
      savedRef.current = false;
    }
  }, [recording.state, recording.transcript, handleSaveThought]);

  const handleManualSubmit = useCallback(async (text: string) => {
    const thought = await addThought(text, null, 0, settings?.language || 'english');
    router.push(`/thought/${thought.id}`);
  }, [addThought, settings, router]);

  const handleThoughtPress = useCallback((id: string) => {
    router.push(`/thought/${id}`);
  }, [router]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.appName}>ThoughtVault</Text>
            <Text style={styles.tagline}>What's on your mind?</Text>
          </View>
          <Pressable style={styles.typeButton} onPress={() => setShowManual(true)}>
            <Pencil color={COLORS.textSecondary} size={18} />
          </Pressable>
        </View>

        <View style={styles.captureSection}>
          <CaptureButton
            isRecording={recording.state === 'recording'}
            onPress={handleCapturePress}
          />
        </View>

        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent</Text>
            {thoughts.length > 5 && (
              <Pressable onPress={() => router.push('/(tabs)/thoughts')}>
                <Text style={styles.seeAllText}>See all</Text>
              </Pressable>
            )}
          </View>

          {thoughts.length === 0 ? (
            <EmptyState
              emoji="🎙️"
              title="No thoughts yet"
              subtitle="Tap the microphone above to capture your first thought. Or type it with the pencil icon."
            />
          ) : (
            <View style={styles.thoughtsList}>
              {recentThoughts.map((thought) => (
                <ThoughtCard key={thought.id} thought={thought} onPress={handleThoughtPress} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <RecordingOverlay
        visible={overlayVisible}
        state={recording.state === 'idle' ? 'recording' : recording.state}
        transcript={recording.transcript}
        interimTranscript={recording.interimTranscript}
        duration={recording.duration}
        error={recording.error}
        onStop={handleStop}
        onClose={handleCloseOverlay}
      />

      <ManualInputModal
        visible={showManual}
        onClose={() => setShowManual(false)}
        onSubmit={handleManualSubmit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 16,
    paddingBottom: 8,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 15,
    color: COLORS.textTertiary,
    marginTop: 4,
  },
  typeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  captureSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  recentSection: {
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: '600',
  },
  thoughtsList: {
    paddingBottom: 20,
  },
});
