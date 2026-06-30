import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { Icon } from '@/theme/icons';
import { useNoteStore } from '@/store/noteStore';
import { formatTxnDate } from '@/utils/date';

import { NoteEditorModal } from './components/NoteEditorModal';
import type { Note } from '@/types/note';

export function NotesScreen() {
  const router = useRouter();
  const ready = useNoteStore((s) => s.ready);
  const notes = useNoteStore((s) => s.notes);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>(undefined);

  if (!ready) {
    return (
      <View style={[styles.screen, styles.center]}>
        <ActivityIndicator color={colors.purple} />
      </View>
    );
  }

  function handleOpenNew() {
    setEditingNote(undefined);
    setEditorOpen(true);
  }

  function handleOpenEdit(note: Note) {
    setEditingNote(note);
    setEditorOpen(true);
  }

  const handleBack = () => router.navigate('/more');

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          hitSlop={8}
          style={{ position: 'absolute', left: 22, zIndex: 1, top: 12 }}
        >
          <Icon name='arrow-left' size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Second Brain</Text>
      </View>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => handleOpenEdit(item)}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.cardDate}>
                {formatTxnDate(item.updatedAt)}
              </Text>
            </View>
            <Text style={styles.cardPreview} numberOfLines={2}>
              {item.content || 'Empty note...'}
            </Text>
            {item.tags && item.tags.length > 0 && (
              <View style={styles.tagRow}>
                {item.tags.map((t) => (
                  <View key={t} style={styles.tagPill}>
                    <Text style={styles.tagText}>#{t}</Text>
                  </View>
                ))}
              </View>
            )}
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No notes yet. Create one to capture ideas.
          </Text>
        }
      />

      <Pressable style={styles.fab} onPress={handleOpenNew}>
        <Icon name='plus' size={24} color={colors.white} />
      </Pressable>

      <NoteEditorModal
        visible={editorOpen}
        existingNote={editingNote}
        onClose={() => setEditorOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.screenBg,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.track,
    position: 'relative',
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 20,
    color: colors.text,
  },
  listContent: {
    padding: 22,
    gap: 12,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.text,
    flex: 1,
    marginRight: 10,
  },
  cardDate: {
    fontFamily: fonts.monoRegular,
    fontSize: 12,
    color: colors.muted,
  },
  cardPreview: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  tagPill: {
    backgroundColor: colors.track,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontFamily: fonts.monoMedium,
    fontSize: 11,
    color: colors.teal,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 40,
  },
  fab: {
    position: 'absolute',
    right: 22,
    bottom: 40,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
});
