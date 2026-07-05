import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { colors, glass, radius, tint } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fonts } from '@/theme/typography';
import { Icon } from '@/theme/icons';
import { EmptyState, GameIconButton, ListRow } from '@/components/game';
import { AnimatedCard, PressableScale } from '@/components/motion';
import { useNoteStore } from '@/store/noteStore';
import type { Note } from '@/types/note';

import { NoteEditorModal } from './components/NoteEditorModal';

/** Date label — "Hôm nay" / "Hôm qua" / "dd/mm". */
function noteDate(updatedAt: number): string {
  const now = new Date();
  const d = new Date(updatedAt);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const noteDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = (today.getTime() - noteDay.getTime()) / 86_400_000;
  if (diff === 0) return 'Hôm nay';
  if (diff === 1) return 'Hôm qua';
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

/** Notes screen (DESIGN_SPEC §5.9) — second brain with searchable note cards. */
export function NotesScreen() {
  const router = useRouter();
  const ready = useNoteStore((s) => s.ready);
  const notes = useNoteStore((s) => s.notes);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>(undefined);

  const handleBack = () => router.navigate('/more');

  if (!ready) {
    return (
      <View style={[styles.screen, styles.center]}>
        <View />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <LinearGradient
        colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.screenGlow}
        pointerEvents='none'
      />

      {/* Header */}
      <AnimatedCard index={0} style={styles.headerWrap}>
        <View style={styles.headerCard}>
          <View style={styles.header}>
            <PressableScale
              onPress={handleBack}
              haptic='light'
              hitSlop={8}
              style={styles.back}
              accessibilityRole='button'
              accessibilityLabel='Quay lại'
            >
              <Icon name='arrow-left' size={24} color={colors.text} />
            </PressableScale>
            <Text style={styles.title}>Second Brain</Text>
          </View>
        </View>
      </AnimatedCard>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          notes.length === 0 ? styles.emptyContent : styles.listContent
        }
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <AnimatedCard index={index + 1}>
            <PressableScale
              onPress={() => { setEditingNote(item); setEditorOpen(true); }}
              haptic='light'
              style={styles.card}
            >
              <ListRow
                icon='note-text-outline'
                title={item.title || 'Chưa có tiêu đề'}
                subtitle={noteDate(item.updatedAt)}
                trailing={item.content ? undefined : 'empty'}
              />
              {item.content ? (
                <Text style={styles.preview} numberOfLines={2}>
                  {item.content}
                </Text>
              ) : null}
              {item.tags && item.tags.length > 0 ? (
                <View style={styles.tagRow}>
                  {item.tags.map((t) => (
                    <View key={t} style={styles.tagPill}>
                      <Text style={styles.tagText}>#{t}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </PressableScale>
          </AnimatedCard>
        )}
        ListEmptyComponent={
          <EmptyState
            icon='brain'
            title='Chưa có ghi chú nào 🧠'
            subtitle='Tạo ghi chú đầu tiên để lưu giữ ý tưởng.'
            actionLabel='Tạo ghi chú'
            actionVariant='gem'
            onAction={() => { setEditingNote(undefined); setEditorOpen(true); }}
          />
        }
      />

      <GameIconButton
        icon='plus'
        variant='gem'
        size={60}
        style={styles.fab}
        onPress={() => { setEditingNote(undefined); setEditorOpen(true); }}
        accessibilityLabel='Tạo ghi chú mới'
      />

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
  screenGlow: {
    ...StyleSheet.absoluteFillObject,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerWrap: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  headerCard: {
    backgroundColor: glass.fillStrong,
    borderWidth: 1,
    borderColor: glass.rim,
    borderRadius: radius.xl,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  back: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -spacing.xs,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
    lineHeight: 28,
    color: colors.text,
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.tabClear,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: glass.fillStrong,
    borderWidth: 1,
    borderColor: glass.rim,
    borderRadius: radius.xl,
    padding: spacing.md,
  },
  preview: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20,
    marginTop: spacing.xs,
    paddingLeft: 48,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.sm,
    paddingLeft: 48,
  },
  tagPill: {
    backgroundColor: tint(colors.purple, '18'),
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: tint(colors.purple, '30'),
  },
  tagText: {
    fontFamily: fonts.monoMedium,
    fontSize: 11,
    color: colors.purple,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xxl,
  },
});
