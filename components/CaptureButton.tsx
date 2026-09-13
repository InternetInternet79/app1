import { Pressable, StyleSheet, View, Text } from 'react-native';
import { Mic, MicOff } from 'lucide-react-native';
import { Animated, Easing } from 'react-native';
import { useEffect, useRef } from 'react';
import { COLORS } from '@/lib/constants';

interface CaptureButtonProps {
  isRecording: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export function CaptureButton({ isRecording, onPress, disabled }: CaptureButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecording) {
      const pulseAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.08,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      const ringAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(ringOpacity, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(ringOpacity, {
            toValue: 0.4,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(ringScale, {
            toValue: 1.5,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnim.start();
      ringAnim.start();
      return () => {
        pulseAnim.stop();
        ringAnim.stop();
      };
    } else {
      Animated.timing(scale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      Animated.timing(ringOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
      ringScale.setValue(1);
    }
  }, [isRecording, scale, ringOpacity, ringScale]);

  return (
    <View style={styles.container}>
      <View style={styles.ringContainer}>
        <Animated.View
          style={[
            styles.ring,
            {
              opacity: ringOpacity,
              transform: [{ scale: ringScale }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.button,
            {
              transform: [{ scale }],
            },
          ]}
        >
          <Pressable
            onPress={onPress}
            disabled={disabled}
            style={styles.pressable}
            accessibilityLabel={isRecording ? 'Stop recording' : 'Capture thought'}
          >
            {isRecording ? (
              <MicOff color={COLORS.textPrimary} size={36} strokeWidth={2} />
            ) : (
              <Mic color={COLORS.textPrimary} size={36} strokeWidth={2} />
            )}
          </Pressable>
        </Animated.View>
      </View>
      <Text style={styles.label}>{isRecording ? 'Tap to stop' : 'Capture thought'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.accent,
    opacity: 0,
    zIndex: 0,
  },
  button: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 1,
  },
  pressable: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
});
