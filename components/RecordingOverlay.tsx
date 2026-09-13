import { Modal, StyleSheet, View, Text, Pressable, ActivityIndicator } from 'react-native';
import { X, Square } from 'lucide-react-native';
import { Animated, Easing } from 'react-native';
import { useEffect, useRef } from 'react';
import { COLORS } from '@/lib/constants';
import { formatDuration } from '@/lib/time';

interface RecordingOverlayProps {
  visible: boolean;
  state: 'recording' | 'processing' | 'done' | 'error';
  transcript: string;
  interimTranscript: string;
  duration: number;
  error: string | null;
  onStop: () => void;
  onClose: () => void;
}

export function RecordingOverlay({
  visible,
  state,
  transcript,
  interimTranscript,
  duration,
  error,
  onStop,
  onClose,
}: RecordingOverlayProps) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (state === 'recording') {
      const pulseAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1.3,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnim.start();
      return () => pulseAnim.stop();
    } else {
      Animated.timing(pulse, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [state, pulse]);

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <X color={COLORS.textSecondary} size={24} />
          </Pressable>
          <Text style={styles.headerTitle}>
            {state === 'recording' ? 'Recording' : state === 'processing' ? 'Processing' : 'Thought captured'}
          </Text>
          <View style={styles.closeButton} />
        </View>

        {state === 'recording' && (
          <>
            <View style={styles.recordingVisual}>
              <View style={styles.pulseRing} />
              <Animated.View
                style={[
                  styles.pulseRing2,
                  {
                    transform: [{ scale: pulse }],
                  },
                ]}
              />
              <View style={styles.micCircle}>
                <View style={styles.micInner} />
              </View>
            </View>
            <Text style={styles.durationText}>{formatDuration(duration)}</Text>
            <Text style={styles.hintText}>Speak naturally. Tap stop when done.</Text>
          </>
        )}

        {state === 'recording' && (transcript || interimTranscript) && (
          <View style={styles.transcriptContainer}>
            <Text style={styles.transcriptLabel}>Live transcript</Text>
            <Text style={styles.transcriptText}>
              {transcript}
              <Text style={styles.interimText}>{interimTranscript}</Text>
            </Text>
          </View>
        )}

        {state === 'processing' && (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color={COLORS.accent} />
            <Text style={styles.processingText}>Analyzing your thought...</Text>
            <Text style={styles.processingSubtext}>Generating title, category, tags, and summary</Text>
          </View>
        )}

        {state === 'done' && (
          <View style={styles.doneContainer}>
            <Text style={styles.transcriptLabel}>Transcript</Text>
            <Text style={styles.transcriptText}>{transcript}</Text>
          </View>
        )}

        {state === 'error' && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error || 'Something went wrong'}</Text>
          </View>
        )}

        {state === 'recording' && (
          <Pressable style={styles.stopButton} onPress={onStop}>
            <Square color={COLORS.textPrimary} size={24} fill={COLORS.textPrimary} />
            <Text style={styles.stopButtonText}>Stop</Text>
          </Pressable>
        )}

        {(state === 'done' || state === 'error') && (
          <Pressable style={styles.saveButton} onPress={onClose}>
            <Text style={styles.saveButtonText}>
              {state === 'done' ? 'Done' : 'Close'}
            </Text>
          </Pressable>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  recordingVisual: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    marginBottom: 20,
  },
  pulseRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.accentDim,
    zIndex: 0,
  },
  pulseRing2: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.accent + '22',
    zIndex: 0,
  },
  micCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  micInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.textPrimary,
  },
  durationText: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
    marginBottom: 8,
  },
  hintText: {
    fontSize: 14,
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginBottom: 24,
  },
  transcriptContainer: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: 24,
    maxHeight: 300,
    overflow: 'hidden',
  },
  transcriptLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  transcriptText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    lineHeight: 24,
    flex: 1,
  },
  interimText: {
    color: COLORS.textTertiary,
  },
  processingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 20,
  },
  processingSubtext: {
    fontSize: 14,
    color: COLORS.textTertiary,
    marginTop: 8,
  },
  doneContainer: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: 24,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
    lineHeight: 24,
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error,
    borderRadius: 16,
    paddingVertical: 18,
    gap: 8,
    marginBottom: 40,
  },
  stopButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  saveButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 40,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
});
