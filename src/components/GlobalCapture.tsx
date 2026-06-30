import { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/theme/colors';
import { Icon } from '@/theme/icons';
import { fonts } from '@/theme/typography';
import { useInboxStore } from '@/store/inboxStore';

export function GlobalCapture() {
  const insets = useSafeAreaInsets();
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  const capture = useInboxStore((s) => s.capture);

  const submit = () => {
    if (text.trim().length > 0) {
      capture(text.trim());
    }
    close();
  };

  const close = () => {
    Keyboard.dismiss();
    setIsOpen(false);
    setText('');
  };

  const inputRef = useRef<TextInput>(null);

  // Auto focus when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  return (
    <>
      <Pressable
        style={[
          styles.fab,
          {
            bottom: insets.bottom + 100, // 88 is tabbar height approximately
          },
        ]}
        onPress={() => setIsOpen(true)}
      >
        <Icon name='plus' size={24} color='#0A0A0F' />
      </Pressable>

      <Modal
        transparent
        visible={isOpen}
        animationType='fade'
        onRequestClose={close}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <Pressable style={styles.backdrop} onPress={close} />

          <View
            style={[
              styles.inputWrapper,
              { paddingBottom: Math.max(insets.bottom, 16) },
            ]}
          >
            <View style={styles.inputHeader}>
              <Text style={styles.inputTitle}>Quick Capture</Text>
              <Pressable onPress={close}>
                <Icon name='close' size={20} color={colors.muted} />
              </Pressable>
            </View>
            <View style={styles.row}>
              <TextInput
                ref={inputRef}
                style={styles.input}
                value={text}
                onChangeText={setText}
                placeholder="What's on your mind?"
                placeholderTextColor={colors.muted}
                onSubmitEditing={submit}
                returnKeyType='done'
                autoFocus
              />
              <Pressable style={styles.button} onPress={submit}>
                <Icon name='arrow-up' size={18} color='#0A0A0F' />
              </Pressable>
            </View>
            <View style={styles.actions}>
              <Pressable style={styles.actionBtn}>
                <Icon name='microphone' size={16} color={colors.text} />
                <Text style={styles.actionText}>Voice capture (P1)</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,10,15,0.7)',
  },
  inputWrapper: {
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputTitle: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.screenBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 16,
    paddingRight: 6,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 16,
    paddingVertical: 10,
  },
  button: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.screenBg,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.text,
  },
});
