import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { colors, radius, tint } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fonts } from '@/theme/typography';
import { Icon } from '@/theme/icons';
import { EmptyState, GameIconButton } from '@/components/game';
import { AnimatedCard, PressableScale } from '@/components/motion';
import { useNoteStore } from '@/store/noteStore';
import type { Note } from '@/types/note';

import { NoteEditorModal } from './components/NoteEditorModal';

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

export function NotesScreen() {
  const router = useRouter();
  const ready = useNoteStore((s) => s.ready);
  const notes = useNoteStore((s) => s.notes);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>(undefined);

  const handleBack = () => router.navigate('/more');

  if (!ready) {
    return <View style={[styles.screen, styles.center]} />;
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

      {/* Header — flat, no card */}
      <View style={styles.headerWrap}>
        <PressableScale
          onPress={handleBack}
          haptic='light'
          hitSlop={8}
          style={styles.back}
          accessibilityRole='button'
          accessibilityLabel='Quay lại'
        >
          <Icon name='arrow-left' size={22} color={colors.text} />
        </PressableScale>
        <View>
          <Text style={styles.title}>Second Brain</Text>
          <Text style={styles.subtitle}>{notes.length} ghi chú</Text>
        </View>
        <PressableScale
          onPress={() => { setEditingNote(undefined); setEditorOpen(true); }}
          haptic='light'
          style={styles.addBtn}
          accessibilityLabel='Tạo ghi chú mới'
        >
          <Icon name='plus' size={20} color={colors.text} />
        </PressableScale>
      </View>

      {/* Divider */}
      <View style={styles.headerDivider} />

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={notes.length === 0 ? styles.emptyContent : styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item, index }) => (
          <AnimatedCard index={index + 1}>
            <PressableScale
              onPress={() => { setEditingNote(item); setEditorOpen(true); }}
              haptic='light'
              style={styles.noteRow}
            >
              {/* Icon */}
              <View style={styles.noteIconWrap}>
                <Icon name='note-text-outline' size={18} color={colors.purple} />
              </View>

              {/* Content */}
              <View style={styles.noteContent}>
                <View style={styles.noteTopRow}>
                  <Text style={styles.noteTitle} numberOfLines={1}>
                    {item.title || 'Chưa có tiêu đề'}
                  </Text>
                  <Text style={styles.noteDate}>{noteDate(item.updatedAt)}</Text>
                </View>

                {item.content ? (
                  <Text style={styles.notePreview} numberOfLines={2}>
                    {item.content}
                  </Text>
                ) : null}

                {item.tags && item.tags.length > 0 ? (
                  <View style={styles.tagRow}>
                    {item.tags.slice(0, 3).map((t) => (
                      <View key={t} style={styles.tagPill}>
                        <Text style={styles.tagText}>#{t}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>

              <Icon name='chevron-right' size={14} color={colors.tabInactive} />
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

  // ── Header (flat, no card) ──────────────────────
  headerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  back: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: colors.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.muted,
    marginTop: 1,
  },
  addBtn: {
    marginLeft: 'auto',
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.sm,
  },
  headerDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },

  // ── List ────────────────────────────────────────
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.tabClear,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginLeft: 36 + spacing.sm, // align with text, skip icon
  },

  // ── Note row (flat, no card) ────────────────────
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: 12,
  },
  noteIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: tint(colors.purple, '12'),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  noteContent: {
    flex: 1,
    gap: 3,
  },
  noteTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  noteTitle: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.text,
  },
  noteDate: {
    fontFamily: fonts.monoRegular,
    fontSize: 10,
    color: colors.tabInactive,
  },
  notePreview: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  tagPill: {
    backgroundColor: tint(colors.purple, '14'),
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  tagText: {
    fontFamily: fonts.monoMedium,
    fontSize: 10,
    color: colors.purple,
  },

  // ── FAB ─────────────────────────────────────────
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.tabClear,
  },
});
