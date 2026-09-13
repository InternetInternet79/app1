import { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Cloud,
  HardDrive,
  Shield,
  Brain,
  Mic,
  Download,
  Trash2,
  Check,
  ChevronRight,
  Wifi,
  RefreshCw,
} from 'lucide-react-native';
import { COLORS, SPEECH_MODELS, LLM_MODELS, EMBEDDING_MODELS } from '@/lib/constants';
import { useSettings } from '@/hooks/useSettings';
import { useThoughts } from '@/hooks/useThoughts';
import { ModelInfo } from '@/lib/types';

export default function SettingsScreen() {
  const { settings, update } = useSettings();
  const { thoughts } = useThoughts();
  const [showModelManager, setShowModelManager] = useState(false);
  const [installedModels, setInstalledModels] = useState<Set<string>>(new Set());

  const toggleModel = useCallback((model: ModelInfo) => {
    setInstalledModels((prev) => {
      const next = new Set(prev);
      if (next.has(model.id)) {
        Alert.alert(
          'Delete model?',
          `This will free up ${model.size} of storage. You can download it again later.`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => {
                next.delete(model.id);
                setInstalledModels(new Set(next));
              },
            },
          ]
        );
        return prev;
      }
      next.add(model.id);
      return next;
    });
  }, []);

  const handleSyncNow = useCallback(() => {
    if (!settings?.driveConnected) {
      Alert.alert('Not connected', 'Connect Google Drive first to sync your thoughts.');
      return;
    }
    Alert.alert('Syncing', 'Syncing your thoughts to Google Drive...', [
      { text: 'OK', onPress: () => update({ lastBackupAt: Date.now() }) },
    ]);
  }, [settings, update]);

  const handleClearAllData = useCallback(() => {
    Alert.alert(
      'Clear all data?',
      'This will permanently delete all thoughts, transcripts, and recordings from this device. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete everything',
          style: 'destructive',
          onPress: () => Alert.alert('Data cleared', 'All local data has been removed.'),
        },
      ]
    );
  }, []);

  if (!settings) return null;

  const pendingCount = thoughts.filter(
    (t) => t.syncStatus === 'PENDING_UPLOAD' || t.syncStatus === 'PENDING_UPDATE'
  ).length;

  const audioSize = thoughts.filter((t) => t.audioPath).length * 2.4;
  const transcriptSize = thoughts.length * 0.012;
  const totalStorage = audioSize + transcriptSize + 1.8 + 0.018;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Settings</Text>

        {/* Privacy banner */}
        <View style={styles.privacyBanner}>
          <Shield color={COLORS.success} size={20} />
          <View style={styles.privacyText}>
            <Text style={styles.privacyTitle}>Your thoughts are private</Text>
            <Text style={styles.privacyDesc}>
              All AI processing happens on your device. No thoughts, audio, or
              transcripts are sent to any cloud AI service.
            </Text>
          </View>
        </View>

        {/* Google Drive Backup */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>BACKUP & SYNC</Text>
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <View style={styles.cardIcon}>
                <Cloud color={COLORS.accent} size={20} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Google Drive</Text>
                <Text style={styles.cardSubtitle}>
                  {settings.driveConnected ? 'Connected' : 'Not connected'}
                </Text>
              </View>
              <Pressable
                style={[styles.connectButton, settings.driveConnected && styles.connectButtonActive]}
                onPress={() => update({ driveConnected: !settings.driveConnected })}
              >
                <Text style={styles.connectButtonText}>
                  {settings.driveConnected ? 'Disconnect' : 'Connect'}
                </Text>
              </Pressable>
            </View>

            {settings.driveConnected && (
              <>
                <View style={styles.divider} />
                <View style={styles.cardRow}>
                  <Text style={styles.rowLabel}>Automatic backup</Text>
                  <Switch
                    value={settings.autoBackup}
                    onValueChange={(v) => update({ autoBackup: v })}
                    trackColor={{ false: COLORS.border, true: COLORS.accent }}
                  />
                </View>
                <View style={styles.cardRow}>
                  <View style={styles.rowLabelWithIcon}>
                    <Wifi color={COLORS.textTertiary} size={16} />
                    <Text style={styles.rowLabel}>Wi-Fi only</Text>
                  </View>
                  <Switch
                    value={settings.wifiOnly}
                    onValueChange={(v) => update({ wifiOnly: v })}
                    trackColor={{ false: COLORS.border, true: COLORS.accent }}
                  />
                </View>
                <View style={styles.cardRow}>
                  <Text style={styles.rowLabel}>Include audio recordings</Text>
                  <Switch
                    value={settings.backupAudio}
                    onValueChange={(v) => update({ backupAudio: v })}
                    trackColor={{ false: COLORS.border, true: COLORS.accent }}
                  />
                </View>
                <View style={styles.divider} />
                <View style={styles.cardRow}>
                  <View>
                    <Text style={styles.rowLabel}>Last backup</Text>
                    <Text style={styles.rowSubValue}>
                      {settings.lastBackupAt
                        ? new Date(settings.lastBackupAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })
                        : 'Never'}
                    </Text>
                  </View>
                  {pendingCount > 0 && (
                    <Text style={styles.pendingText}>{pendingCount} pending</Text>
                  )}
                </View>
                <Pressable style={styles.syncButton} onPress={handleSyncNow}>
                  <RefreshCw color={COLORS.textPrimary} size={18} />
                  <Text style={styles.syncButtonText}>Sync now</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>

        {/* AI Models */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>AI MODELS</Text>
          <Pressable style={styles.card} onPress={() => setShowModelManager(true)}>
            <View style={styles.cardRow}>
              <View style={styles.cardIcon}>
                <Brain color={COLORS.accent} size={20} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Model Management</Text>
                <Text style={styles.cardSubtitle}>
                  {installedModels.size} models installed
                </Text>
              </View>
              <ChevronRight color={COLORS.textTertiary} size={20} />
            </View>
          </Pressable>
        </View>

        {/* Storage */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>STORAGE</Text>
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <View style={styles.cardIcon}>
                <HardDrive color={COLORS.accent} size={20} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Storage usage</Text>
                <Text style={styles.cardSubtitle}>{totalStorage.toFixed(2)} GB total</Text>
              </View>
            </View>
            <View style={styles.divider} />
            {[
              { label: 'Audio recordings', size: `${audioSize.toFixed(1)} GB` },
              { label: 'Transcripts', size: `${transcriptSize.toFixed(2)} MB` },
              { label: 'AI Models', size: '1.80 GB' },
              { label: 'Database', size: '0.02 MB' },
            ].map((row) => (
              <View key={row.label} style={styles.storageRow}>
                <Text style={styles.rowLabel}>{row.label}</Text>
                <Text style={styles.storageValue}>{row.size}</Text>
              </View>
            ))}
            <View style={styles.divider} />
            <Pressable
              style={styles.dangerRow}
              onPress={() =>
                Alert.alert(
                  'Delete all recordings?',
                  'This will remove all audio recordings but keep transcripts and AI data.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete recordings', style: 'destructive' },
                  ]
                )
              }
            >
              <Trash2 color={COLORS.error} size={18} />
              <Text style={styles.dangerText}>Delete all audio recordings</Text>
            </Pressable>
          </View>
        </View>

        {/* Language */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>LANGUAGE</Text>
          <View style={styles.card}>
            {[
              { id: 'english' as const, label: 'English' },
              { id: 'hindi' as const, label: 'Hindi' },
              { id: 'both' as const, label: 'English + Hindi' },
            ].map((opt, i, arr) => (
              <Pressable
                key={opt.id}
                style={[styles.cardRow, i < arr.length - 1 && styles.borderedRow]}
                onPress={() => update({ language: opt.id })}
              >
                <Text style={styles.rowLabel}>{opt.label}</Text>
                {settings.language === opt.id && (
                  <Check color={COLORS.accent} size={20} />
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ABOUT</Text>
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <View style={styles.cardIcon}>
                <Mic color={COLORS.accent} size={20} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>ThoughtVault</Text>
                <Text style={styles.cardSubtitle}>Version 1.0.0</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <Text style={styles.aboutText}>
              ThoughtVault is a privacy-first, offline AI thought capture app.
              Your thoughts are processed entirely on your device. Internet is
              only used for Google Drive backup, which you control.
            </Text>
          </View>
        </View>

        {/* Danger zone */}
        <View style={styles.section}>
          <Pressable style={styles.dangerCard} onPress={handleClearAllData}>
            <Trash2 color={COLORS.error} size={18} />
            <Text style={styles.dangerCardText}>Clear all local data</Text>
          </Pressable>
        </View>

        <Text style={styles.footer}>ThoughtVault — Your private external brain</Text>
      </ScrollView>

      {/* Model Manager Modal */}
      <Modal
        visible={showModelManager}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowModelManager(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setShowModelManager(false)} style={styles.modalCloseButton}>
              <Text style={styles.modalCloseText}>Done</Text>
            </Pressable>
            <Text style={styles.modalTitle}>AI Models</Text>
            <View style={styles.modalCloseButton} />
          </View>

          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.modalSectionLabel}>SPEECH RECOGNITION</Text>
            {SPEECH_MODELS.map((model) => (
              <ModelRow
                key={model.id}
                model={model}
                installed={installedModels.has(model.id)}
                onToggle={() => toggleModel(model)}
              />
            ))}

            <Text style={styles.modalSectionLabel}>LANGUAGE MODEL (AI ANALYSIS)</Text>
            {LLM_MODELS.map((model) => (
              <ModelRow
                key={model.id}
                model={model}
                installed={installedModels.has(model.id)}
                onToggle={() => toggleModel(model)}
              />
            ))}

            <Text style={styles.modalSectionLabel}>EMBEDDING MODEL (SEMANTIC SEARCH)</Text>
            {EMBEDDING_MODELS.map((model) => (
              <ModelRow
                key={model.id}
                model={model}
                installed={installedModels.has(model.id)}
                onToggle={() => toggleModel(model)}
              />
            ))}

            <Text style={styles.modalNote}>
              Models download once and then work fully offline. Downloading
              requires internet, but inference never does.
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function ModelRow({
  model,
  installed,
  onToggle,
}: {
  model: ModelInfo;
  installed: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.modelRow}>
      <View style={styles.modelInfo}>
        <View style={styles.modelNameRow}>
          <Text style={styles.modelName}>{model.name}</Text>
          {installed && (
            <View style={styles.installedBadge}>
              <Check color={COLORS.success} size={12} strokeWidth={3} />
              <Text style={styles.installedText}>Installed</Text>
            </View>
          )}
        </View>
        <Text style={styles.modelDesc}>{model.description}</Text>
        <Text style={styles.modelSize}>{model.size}</Text>
      </View>
      <Pressable
        style={[styles.modelButton, installed && styles.modelButtonDelete]}
        onPress={onToggle}
      >
        {installed ? (
          <Trash2 color={COLORS.error} size={16} />
        ) : (
          <Download color={COLORS.textPrimary} size={16} />
        )}
        <Text style={[styles.modelButtonText, installed && styles.modelButtonTextDelete]}>
          {installed ? 'Delete' : 'Download'}
        </Text>
      </Pressable>
    </View>
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
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    paddingTop: 16,
    paddingBottom: 24,
  },
  privacyBanner: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: COLORS.success + '15',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.success + '30',
    marginBottom: 24,
  },
  privacyText: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.success,
    marginBottom: 4,
  },
  privacyDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textTertiary,
    letterSpacing: 1.2,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  borderedRow: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    paddingBottom: 12,
    marginBottom: 6,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  cardSubtitle: {
    fontSize: 13,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  connectButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  connectButtonActive: {
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  connectButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 10,
  },
  rowLabel: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  rowLabelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowSubValue: {
    fontSize: 13,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  pendingText: {
    fontSize: 13,
    color: COLORS.warning,
    fontWeight: '600',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 10,
  },
  syncButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  storageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  storageValue: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  dangerText: {
    fontSize: 14,
    color: COLORS.error,
    fontWeight: '500',
  },
  aboutText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  paddingHorizontal: 4,
  },
  dangerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.error + '15',
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: COLORS.error + '30',
  },
  dangerCardText: {
    fontSize: 15,
    color: COLORS.error,
    fontWeight: '600',
  },
  footer: {
    fontSize: 13,
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginTop: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalCloseButton: {
    width: 60,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: COLORS.accent,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 60,
  },
  modalSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textTertiary,
    letterSpacing: 1.2,
    marginBottom: 12,
    marginTop: 16,
  },
  modelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: 10,
  },
  modelInfo: {
    flex: 1,
    marginRight: 12,
  },
  modelNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  modelName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  installedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  installedText: {
    fontSize: 11,
    color: COLORS.success,
    fontWeight: '600',
  },
  modelDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  modelSize: {
    fontSize: 12,
    color: COLORS.accent,
    fontWeight: '600',
  },
  modelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  modelButtonDelete: {
    backgroundColor: COLORS.error + '15',
    borderWidth: 1,
    borderColor: COLORS.error + '30',
  },
  modelButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modelButtonTextDelete: {
    color: COLORS.error,
  },
  modalNote: {
    fontSize: 13,
    color: COLORS.textTertiary,
    lineHeight: 20,
    marginTop: 20,
    paddingHorizontal: 4,
  },
});
