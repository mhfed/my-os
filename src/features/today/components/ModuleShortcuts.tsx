import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { colors, domains } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { Icon, type IconName } from '@/theme/icons';
import { PressableScale } from '@/components/motion';
import { useSettingsStore, type SuperAppItemKey } from '@/store/settingsStore';
import { useInboxStore } from '@/store/inboxStore';
import { useJournalStore } from '@/store/journalStore';
import { useNoteStore } from '@/store/noteStore';
import { useGoalStore } from '@/store/goalStore';
import { useFinanceStore } from '@/store/financeStore';
import { useGymStore } from '@/store/gymStore';
import { formatCompactVND } from '@/utils/currency';

interface ModuleDef {
  key: SuperAppItemKey;
  route: string;
  icon: IconName;
  label: string;
  getStat: () => string;
}

const MODULE_DEFS: ModuleDef[] = [
  {
    key: 'inbox',
    route: '/(tabs)/inbox',
    icon: 'bell-outline',
    label: 'Inbox',
    getStat: () => {
      const items = useInboxStore.getState().items;
      const open = items.filter((i) => i.status === 'inbox').length;
      return open > 0 ? `${open} mới` : '0';
    },
  },
  {
    key: 'journal',
    route: '/(tabs)/journal',
    icon: 'book-open-outline',
    label: 'Nhật ký',
    getStat: () => {
      const count = useJournalStore.getState().entries.length;
      return `${count} bài`;
    },
  },
  {
    key: 'notes',
    route: '/(tabs)/notes',
    icon: 'note-text-outline',
    label: 'Ghi chú',
    getStat: () => {
      const count = useNoteStore.getState().notes.length;
      return count > 0 ? `${count} ghi chú` : 'Trống';
    },
  },
  {
    key: 'goals',
    route: '/goals',
    icon: 'trophy-outline',
    label: 'Mục tiêu',
    getStat: () => {
      const goals = useGoalStore.getState().goals;
      const active = goals.filter((g) => g.status === 'active').length;
      return active > 0 ? `${active} mục tiêu` : '0';
    },
  },
  {
    key: 'finance',
    route: '/finance',
    icon: 'wallet',
    label: 'Tài chính',
    getStat: () => {
      const overview = useFinanceStore.getState().getOverview();
      return formatCompactVND(overview.spent);
    },
  },
  {
    key: 'health',
    route: '/health',
    icon: 'heart-pulse',
    label: 'Sức khỏe',
    getStat: () => {
      const history = useGymStore.getState().history;
      const thisWeek = history.filter(
        (w) => w.startTime > Date.now() - 7 * 86400000
      ).length;
      return `${thisWeek}/tuần`;
    },
  },
];

export const ModuleShortcuts = memo(function ModuleShortcuts() {
  const router = useRouter();
  const pinnedItems = useSettingsStore((s) => s.pinnedItems);
  const ready = useSettingsStore((s) => s.ready);

  if (!ready) return null;

  // Pick up to 4 pinned items
  const visible = pinnedItems
    .filter((k) => MODULE_DEFS.some((m) => m.key === k))
    .slice(0, 4);

  if (visible.length === 0) return null;

  // If we have fewer than 4, pad with defaults
  const defs = visible
    .map((k) => MODULE_DEFS.find((m) => m.key === k)!)
    .slice(0, 4);

  return (
    <View style={styles.grid}>
      {defs.map((mod) => {
        const palette = domains[mod.key as keyof typeof domains] ?? domains.today;
        const stat = mod.getStat();
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
            </View>
            <Text style={styles.label}>{mod.label}</Text>
            <Text style={[styles.stat, { color: palette.accent }]} numberOfLines={1}>
              {stat}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  cell: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: 'center',
    gap: 6,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fonts.displayBold,
    fontSize: 11,
    color: colors.text,
  },
  stat: {
    fontFamily: fonts.medium,
    fontSize: 10,
  },
});
