import { useState, useRef } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight, Check, Shield, Mic, Cloud, Brain } from 'lucide-react-native';
import { COLORS } from '@/lib/constants';
import { Language, ModelSize, AppSettings } from '@/lib/types';
import { useSettings } from '@/hooks/useSettings';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();
  const { settings, update } = useSettings();
  const [step, setStep] = useState(0);
  const [language, setLanguage] = useState<Language>('english');
  const [modelSize, setModelSize] = useState<ModelSize>('medium');
  const scrollRef = useRef<ScrollView>(null);

  const steps = [
    { title: 'Welcome', subtitle: 'Capture thoughts without stopping what you\'re doing' },
    { title: 'Choose Language', subtitle: 'Select your preferred speech languages' },
    { title: 'Download AI Model', subtitle: 'Choose a model size that fits your device' },
    { title: 'Google Drive', subtitle: 'Back up your thoughts to the cloud' },
  ];

  const finishOnboarding = async () => {
    const newSettings: Partial<AppSettings> = {
      language,
      modelSize,
      onboardingComplete: true,
    };
    await update(newSettings);
    router.replace('/(tabs)');
  };

  const next = () => {
    if (step < 3) {
      setStep(step + 1);
      scrollRef.current?.scrollTo({ x: (step + 1) * width, animated: true });
    } else {
      finishOnboarding();
    }
  };

  const skipDrive = async () => {
    await update({ driveConnected: false });
    finishOnboarding();
  };

  const connectDrive = async () => {
    await update({ driveConnected: true });
    finishOnboarding();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressContainer}>
        {steps.map((_, i) => (
          <View
            key={i}
            style={[styles.progressDot, i === step && styles.progressDotActive, i < step && styles.progressDotDone]}
          >
            {i < step && <Check color={COLORS.textPrimary} size={10} strokeWidth={3} />}
          </View>
        ))}
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
      >
        {/* Step 0: Welcome */}
        <View style={styles.page}>
          <View style={styles.iconContainer}>
            <Brain color={COLORS.accent} size={64} strokeWidth={1.5} />
          </View>
          <Text style={styles.pageTitle}>ThoughtVault</Text>
          <Text style={styles.pageSubtitle}>
            Your private external brain.{'\n'}Capture thoughts by voice,{'\n'}organized automatically by AI.
          </Text>
          <View style={styles.featureList}>
            <View style={styles.featureRow}>
              <Mic color={COLORS.accent} size={20} />
              <Text style={styles.featureText}>Voice-first capture — just speak</Text>
            </View>
            <View style={styles.featureRow}>
              <Brain color={COLORS.accent} size={20} />
              <Text style={styles.featureText}>AI categorizes and summarizes locally</Text>
            </View>
            <View style={styles.featureRow}>
              <Shield color={COLORS.accent} size={20} />
              <Text style={styles.featureText}>Your thoughts never leave your device</Text>
            </View>
            <View style={styles.featureRow}>
              <Cloud color={COLORS.accent} size={20} />
              <Text style={styles.featureText}>Optional Google Drive backup</Text>
            </View>
          </View>
        </View>

        {/* Step 1: Language */}
        <View style={styles.page}>
          <Text style={styles.pageTitle}>Choose Language</Text>
          <Text style={styles.pageSubtitle}>Which languages do you speak?</Text>
          {[
            { id: 'english' as Language, label: 'English', desc: 'Capture thoughts in English' },
            { id: 'hindi' as Language, label: 'Hindi', desc: 'Capture thoughts in Hindi' },
            { id: 'both' as Language, label: 'English + Hindi', desc: 'For Hinglish and mixed speech' },
          ].map((opt) => (
            <Pressable
              key={opt.id}
              style={[styles.optionCard, language === opt.id && styles.optionCardSelected]}
              onPress={() => setLanguage(opt.id)}
            >
              <View style={styles.optionContent}>
                <Text style={styles.optionLabel}>{opt.label}</Text>
                <Text style={styles.optionDesc}>{opt.desc}</Text>
              </View>
              <View style={[styles.radioButton, language === opt.id && styles.radioButtonSelected]}>
                {language === opt.id && <View style={styles.radioButtonInner} />}
              </View>
            </Pressable>
          ))}
        </View>

        {/* Step 2: Model */}
        <View style={styles.page}>
          <Text style={styles.pageTitle}>Download AI Model</Text>
          <Text style={styles.pageSubtitle}>Choose a model for offline AI processing</Text>
          {[
            { id: 'small' as ModelSize, label: 'Small', size: '~700 MB', desc: 'For low-end devices. Basic analysis.' },
            { id: 'medium' as ModelSize, label: 'Recommended', size: '~1.9 GB', desc: 'Balanced quality. Most devices.' },
            { id: 'large' as ModelSize, label: 'Large', size: '~4.5 GB', desc: 'Best quality. High-end devices only.' },
          ].map((opt) => (
            <Pressable
              key={opt.id}
              style={[styles.optionCard, modelSize === opt.id && styles.optionCardSelected]}
              onPress={() => setModelSize(opt.id)}
            >
              <View style={styles.optionContent}>
                <Text style={styles.optionLabel}>{opt.label}</Text>
                <Text style={styles.optionDesc}>{opt.desc}</Text>
                <Text style={styles.optionSize}>{opt.size}</Text>
              </View>
              <View style={[styles.radioButton, modelSize === opt.id && styles.radioButtonSelected]}>
                {modelSize === opt.id && <View style={styles.radioButtonInner} />}
              </View>
            </Pressable>
          ))}
          <Text style={styles.disclaimer}>
            Models download once, then work fully offline. You can change this later.
          </Text>
        </View>

        {/* Step 3: Drive */}
        <View style={styles.page}>
          <Text style={styles.pageTitle}>Google Drive Backup</Text>
          <Text style={styles.pageSubtitle}>
            Back up your thoughts to Google Drive.{'\n'}Your data stays private and encrypted.
          </Text>
          <Pressable style={styles.primaryButton} onPress={connectDrive}>
            <Cloud color={COLORS.textPrimary} size={20} />
            <Text style={styles.primaryButtonText}>Connect Google Drive</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={skipDrive}>
            <Text style={styles.secondaryButtonText}>Skip for now</Text>
          </Pressable>
          <Text style={styles.disclaimer}>
            You can always connect later in Settings. The app works fully offline without it.
          </Text>
        </View>
      </ScrollView>

      {step < 3 && (
        <View style={styles.footer}>
          {step > 0 && (
            <Pressable style={styles.backButton} onPress={() => {
              setStep(step - 1);
              scrollRef.current?.scrollTo({ x: (step - 1) * width, animated: true });
            }}>
              <Text style={styles.backText}>Back</Text>
            </Pressable>
          )}
          <Pressable style={styles.nextButton} onPress={next}>
            <Text style={styles.nextButtonText}>
              {step === 0 ? 'Get Started' : 'Continue'}
            </Text>
            <ArrowRight color={COLORS.textPrimary} size={20} />
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 60,
    paddingBottom: 20,
  },
  progressDot: {
    width: 24,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
  },
  progressDotActive: {
    backgroundColor: COLORS.accent,
    width: 32,
  },
  progressDotDone: {
    backgroundColor: COLORS.accent,
  },
  scroll: {
    flex: 1,
  },
  page: {
    width,
    paddingHorizontal: 32,
    alignItems: 'center',
    paddingTop: 20,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.accentDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  pageSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  featureList: {
    width: '100%',
    gap: 16,
    marginTop: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  featureText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  optionCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: 12,
  },
  optionCardSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentDim,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  optionDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  optionSize: {
    fontSize: 12,
    color: COLORS.accent,
    fontWeight: '600',
    marginTop: 4,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: COLORS.accent,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.accent,
  },
  disclaimer: {
    fontSize: 13,
    color: COLORS.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 16,
    paddingHorizontal: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 50,
    paddingTop: 16,
  },
  backButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  backText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    marginLeft: 'auto',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});
