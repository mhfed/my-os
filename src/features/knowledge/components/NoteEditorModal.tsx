import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, radius, tint } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fonts } from '@/theme/typography';
import { Icon } from '@/theme/icons';
import { PressableScale } from '@/components/motion';
import { useNoteStore } from '@/store/noteStore';
import type { Note } from '@/types/note';

interface NoteEditorModalProps {
  visible: boolean;
  existingNote?: Note;
  onClose: () => void;
}

export function NoteEditorModal({ visible, existingNote, onClose }: NoteEditorModalProps) {
  const insets = useSafeAreaInsets();
  const saveNote   = useNoteStore((s) => s.saveNote);
  const deleteNote = useNoteStore((s) => s.deleteNote);

  const [title, setTitle]       = useState('');
  const [content, setContent]   = useState('');
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (visible) {
      setTitle(existingNote?.title ?? '');
      setContent(existingNote?.content ?? '');
      setTagsInput(existingNote?.tags?.join(', ') ?? '');
    }
  }, [visible, existingNote]);

  const canSave = title.trim().length > 0;

  async function handleSave() {
    if (!canSave) return;
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);
    await saveNote({
      id: existingNote?.id,
      title: title.trim(),
      content: content.trim(),
      tags,
      isReadingList: existingNote?.isReadingList ?? false,
      url: existingNote?.url,
    });
    onClose();
  }

  async function handleDelete() {
    if (existingNote) await deleteNote(existingNote.id);
    onClose();
  }

  return (
    <Modal visible={visible} animationType='slide' onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Screen glow */}
        <LinearGradient
          colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0)']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.screenGlow}
          pointerEvents='none'
        />

        {/* Top bar */}
        <View style={[styles.topBar, { paddingTop: insets.top + spacing.xs }]}>
          <PressableScale onPress={onClose} hitSlop={8} scaleTo={0.9} haptic='light'>
            <Text style={styles.topBarBtn}>Hủy</Text>
          </PressableScale>

          <Text style={styles.topBarTitle}>
            {existingNote ? 'Sửa ghi chú' : 'Ghi chú mới'}
          </Text>

          <PressableScale
            onPress={handleSave}
            hitSlop={8}
            scaleTo={canSave ? 0.9 : 1}
            haptic={canSave ? 'light' : undefined}
            disabled={!canSave}
          >
            <Text style={[styles.topBarBtn, styles.saveBtn, !canSave && styles.disabledBtn]}>
              Lưu
            </Text>
          </PressableScale>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        <ScrollView
          style={styles.body}
          contentContainerStyle={{ paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode='interactive'
        >
          {/* Title */}
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder='Tiêu đề...'
            placeholderTextColor={colors.tabInactive}
            autoFocus={!existingNote}
            returnKeyType='next'
          />

          {/* Tags */}
          <View style={styles.tagsRow}>
            <Icon name='tag-outline' size={14} color={colors.muted} />
            <TextInput
              style={styles.tagsInput}
              value={tagsInput}
              onChangeText={setTagsInput}
              placeholder='Tags, ngăn cách bằng dấu phẩy...'
              placeholderTextColor={colors.tabInactive}
              returnKeyType='next'
            />
          </View>

          <View style={styles.divider} />

          {/* Content */}
          <TextInput
            style={styles.contentInput}
            value={content}
            onChangeText={setContent}
            placeholder='Viết bằng markdown...'
            placeholderTextColor={colors.tabInactive}
            multiline
            textAlignVertical='top'
          />

          {/* Delete */}
          {existingNote && (
            <PressableScale
              style={styles.deleteBtn}
              onPress={handleDelete}
              scaleTo={0.96}
              haptic='medium'
            >
              <Icon name='trash-can-outline' size={18} color={colors.red} />
              <Text style={styles.deleteText}>Xóa ghi chú</Text>
            </PressableScale>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.screenBg,
  },
  screenGlow: {
    ...StyleSheet.absoluteFillObject,
  },

  // ── Top bar ──────────────────────────────────────
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  topBarTitle: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.text,
  },
  topBarBtn: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.muted,
  },
  saveBtn: {
    color: colors.purple,
    fontFamily: fonts.semibold,
  },
  disabledBtn: {
    opacity: 0.35,
  },

  // ── Divider ──────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
  },

  // ── Body ─────────────────────────────────────────
  body: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  titleInput: {
    fontFamily: fonts.displayBold,
    fontSize: 24,
    color: colors.text,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    letterSpacing: -0.3,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingBottom: spacing.sm,
  },
  tagsInput: {
    flex: 1,
    fontFamily: fonts.monoRegular,
    fontSize: 13,
    color: colors.teal,
  },
  contentInput: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.text,
    lineHeight: 26,
    minHeight: 200,
    paddingTop: spacing.xs,
  },

  // ── Delete ───────────────────────────────────────
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 48,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: tint(colors.red, '10'),
    borderWidth: 1,
    borderColor: tint(colors.red, '22'),
  },
  deleteText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.red,
  },
});
