import { useState } from 'react';
import { Modal, StyleSheet, View, Text, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { X } from 'lucide-react-native';
import { COLORS } from '@/lib/constants';

interface ManualInputModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (text: string) => void;
}

export function ManualInputModal({ visible, onClose, onSubmit }: ManualInputModalProps) {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (text.trim().length > 0) {
      onSubmit(text.trim());
      setText('');
      onClose();
    }
  };

  const handleClose = () => {
    setText('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Type your thought</Text>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <X color={COLORS.textSecondary} size={22} />
            </Pressable>
          </View>
          <TextInput
            style={styles.input}
            multiline
            autoFocus
            placeholder="What's on your mind?"
            placeholderTextColor={COLORS.textTertiary}
            value={text}
            onChangeText={setText}
            textAlignVertical="top"
          />
          <Pressable
            style={[styles.submitButton, text.trim().length === 0 && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={text.trim().length === 0}
          >
            <Text style={styles.submitButtonText}>Capture thought</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: COLORS.surfaceElevated,
  },
  input: {
    minHeight: 120,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.4,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
});
