import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { colors, domains, radius } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { Icon, type IconName } from '@/theme/icons';
import { PressableScale } from '@/components/motion';
import { useSettingsStore, type SuperAppItemKey } from '@/store/settingsStore';
import { useInboxStore } from '@/store/inboxStore';
import { useJournalStore } from '@/store/journalStore';
import { useNoteStore } from '@/store/noteStore';
import { useGoalStore } from '@/store/goalStore';
import { useGymStore } from '@/store/gymStore';

interface ModuleDef {
  key: SuperAppItemKey;
  route: string;
  icon: IconName;
  label: string;
}

const MODULE_DEFS: ModuleDef[] = [
  {
    key: 'inbox',
    route: '/(tabs)/inbox',
    icon: 'bell-outline',
    label: 'Inbox',
  },
  {
    key: 'journal',
    route: '/(tabs)/journal',
    icon: 'book-open-outline',
    label: 'Nhật ký',
  },
  {
    key: 'notes',
    route: '/(tabs)/notes',
    icon: 'note-text-outline',
    label: 'Ghi chú',
  },
  {
    key: 'goals',
    route: '/goals',
    icon: 'trophy-outline',
    label: 'Mục tiêu',
  },
  {
    key: 'finance',
    route: '/finance',
    icon: 'wallet',
    label: 'Tài chính',
  },
  {
    key: 'health',
    route: '/health',
    icon: 'heart-pulse',
    label: 'Sức khỏe',
  },
];

export const ModuleShortcuts = memo(function ModuleShortcuts() {
  const router = useRouter();
  const pinnedItems = useSettingsStore((s) => s.pinnedItems);
  const ready = useSettingsStore((s) => s.ready);

  // Subscriptions to stores to trigger re-renders on counts change
  const inboxCount = useInboxStore((s) => s.items.filter((i) => i.status === 'inbox').length);
  const journalCount = useJournalStore((s) => s.entries.length);
  const notesCount = useNoteStore((s) => s.notes.length);
  const goalsCount = useGoalStore((s) => s.goals.filter((g) => g.status === 'active').length);
  const healthCount = useGymStore((s) => {
    const weekAgo = Date.now() - 7 * 86400000;
    return s.history.filter((w) => w.startTime > weekAgo).length;
  });

  if (!ready) return null;

  // Pick up to 4 pinned items
  const visible = pinnedItems
    .filter((k) => MODULE_DEFS.some((m) => m.key === k))
    .slice(0, 4);

  if (visible.length === 0) return null;

  const defs = visible
    .map((k) => MODULE_DEFS.find((m) => m.key === k)!)
    .slice(0, 4);

  const getCountForKey = (key: SuperAppItemKey) => {
    switch (key) {
      case 'inbox':
        return inboxCount;
      case 'journal':
        return journalCount;
      case 'notes':
        return notesCount;
      case 'goals':
        return goalsCount;
      case 'health':
        return healthCount;
      default:
        return 0;
    }
  };

  return (
    <View style={styles.grid}>
      {defs.map((mod) => {
        const palette = domains[mod.key as keyof typeof domains] ?? domains.today;
        const count = getCountForKey(mod.key);
        return (
          <PressableScale
            key={mod.key}
            style={styles.cell}
            onPress={() => router.push(mod.route as any)}
            scaleTo={0.95}
            haptic='light'
          >
            <View style={[styles.iconWrap, { backgroundColor: palette.accent + '16' }]}>
              <Icon name={mod.icon} size={22} color={palette.accent} />
              {count > 0 ? (
                <View style={[styles.badge, { backgroundColor: palette.accent }]}>
                  <Text style={styles.badgeText}>{count}</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.label}>{mod.label}</Text>
          </PressableScale>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  cell: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignItems: 'center',
    gap: 8,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: colors.screenBg,
  },
  badgeText: {
    fontFamily: fonts.monoSemibold,
    fontSize: 8,
    color: colors.white,
    textAlign: 'center',
  },
  label: {
    fontFamily: fonts.displayBold,
    fontSize: 11,
    color: colors.text,
  },
});
