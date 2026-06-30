import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { Icon } from '@/theme/icons';
import { useNoteStore } from '@/store/noteStore';
import type { Note } from '@/types/note';

interface NoteEditorModalProps {
  visible: boolean;
  existingNote?: Note;
  onClose: () => void;
}

export function NoteEditorModal({
  visible,
  existingNote,
  onClose,
}: NoteEditorModalProps) {
  const saveNote = useNoteStore((s) => s.saveNote);
  const deleteNote = useNoteStore((s) => s.deleteNote);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
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
    if (existingNote) {
      await deleteNote(existingNote.id);
    }
    onClose();
  }

  return (
    <Modal visible={visible} animationType='slide' onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={8}>
            <Text style={styles.headerBtn}>Cancel</Text>
          </Pressable>
          <Text style={styles.headerTitle}>
            {existingNote ? 'Edit Note' : 'New Note'}
          </Text>
          <Pressable onPress={handleSave} hitSlop={8} disabled={!canSave}>
            <Text
              style={[
                styles.headerBtn,
                styles.saveBtn,
                !canSave && styles.disabledBtn,
              ]}
            >
              Save
            </Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.body}
          contentContainerStyle={{ paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
        >
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder='Title'
            placeholderTextColor={colors.muted}
            autoFocus={!existingNote}
          />

          <TextInput
            style={styles.tagsInput}
            value={tagsInput}
            onChangeText={setTagsInput}
            placeholder='Tags (comma separated)...'
            placeholderTextColor={colors.track}
          />

          <View style={styles.divider} />

          <TextInput
            style={styles.contentInput}
            value={content}
            onChangeText={setContent}
            placeholder='Write using markdown...'
            placeholderTextColor={colors.muted}
            multiline
            textAlignVertical='top'
          />

          {existingNote && (
            <Pressable style={styles.deleteBtn} onPress={handleDelete}>
              <Icon name='trash-can-outline' size={20} color={colors.red} />
              <Text style={styles.deleteText}>Delete Note</Text>
            </Pressable>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0F0F13',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: colors.screenBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.text,
  },
  headerBtn: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.muted,
  },
  saveBtn: {
    color: colors.purple,
    fontFamily: fonts.semibold,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  body: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 16,
  },
  titleInput: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.text,
    marginBottom: 8,
  },
  tagsInput: {
    fontFamily: fonts.monoRegular,
    fontSize: 13,
    color: colors.teal,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 16,
  },
  contentInput: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    minHeight: 200,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 40,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 69, 58, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.3)',
  },
  deleteText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.red,
  },
});
