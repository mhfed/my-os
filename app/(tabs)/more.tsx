import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { colors, radius, tint } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { Icon, type IconName } from '@/theme/icons';
import { PressableScale } from '@/components/motion';
import { useSettingsStore, type SuperAppItemKey } from '@/store/settingsStore';
import { exportAllData } from '@/utils/export';

interface SuperAppItemConfig {
  key: SuperAppItemKey;
  label: string;
  icon: IconName;
  color: string;
}

const SUPER_APP_ALL: SuperAppItemConfig[] = [
  { key: 'inbox',   label: 'Inbox',   icon: 'inbox',                  color: colors.purple },
  { key: 'journal', label: 'Journal', icon: 'notebook',               color: colors.teal   },
  { key: 'habits',  label: 'Habits',  icon: 'chart-box',              color: colors.purple },
  { key: 'notes',   label: 'Notes',   icon: 'brain',                  color: colors.orange },
  { key: 'goals',   label: 'Goals',   icon: 'target',                 color: colors.red    },
  { key: 'today',   label: 'Today',   icon: 'view-grid',              color: colors.purple },
  { key: 'tasks',   label: 'Tasks',   icon: 'checkbox-marked-outline',color: colors.teal   },
  { key: 'health',  label: 'Health',  icon: 'heart-pulse',            color: colors.red    },
  { key: 'finance', label: 'Finance', icon: 'wallet',                 color: colors.orange },
];

interface MoreItem {
  label: string;
  sub: string;
  icon: IconName;
  color: string;
  route?: string;
}

const ITEMS: MoreItem[] = [
  { label: 'Inbox',   sub: 'Triage your quick captures',    icon: 'inbox',                  color: colors.purple, route: '/inbox'   },
  { label: 'Journal', sub: 'Daily entry · mood · time capsule', icon: 'notebook',           color: colors.teal,   route: '/journal' },
  { label: 'Habits',  sub: 'Streaks & weekly grid',         icon: 'chart-box',              color: colors.purple, route: '/habits'  },
  { label: 'Notes',   sub: 'Second brain · reading list',   icon: 'brain',                  color: colors.orange, route: '/notes'   },
  { label: 'Goals',   sub: 'OKRs & milestones',             icon: 'target',                 color: colors.red,    route: '/goals'   },
];

export default function MoreScreen() {
  const router = useRouter();
  const pinnedItems  = useSettingsStore((s) => s.pinnedItems);
  const togglePinned = useSettingsStore((s) => s.togglePinnedItem);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <LinearGradient
        colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.screenGlow}
        pointerEvents='none'
      />

      <Text style={styles.title}>More</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* ── Super App settings ── */}
        <View style={styles.group}>
          <View style={styles.groupHeader}>
            <Icon name='view-grid-plus' size={14} color={colors.purple} />
            <Text style={styles.groupTitle}>Super App</Text>
          </View>
          <Text style={styles.groupSub}>Chọn module hiển thị khi bấm nút giữa</Text>

          <View style={styles.flatGroup}>
            {SUPER_APP_ALL.map((item, idx) => {
              const pinned = pinnedItems.includes(item.key);
              return (
                <PressableScale
                  key={item.key}
                  style={[styles.flatRow, idx < SUPER_APP_ALL.length - 1 && styles.flatRowBorder]}
                  onPress={() => togglePinned(item.key)}
                  scaleTo={0.97}
                  haptic='light'
                >
                  <View style={[styles.rowIcon, { backgroundColor: tint(item.color) }]}>
                    <Icon name={item.icon} size={16} color={item.color} />
                  </View>
                  <Text style={styles.rowLabel}>{item.label}</Text>
                  <View style={[styles.checkbox, pinned && styles.checkboxActive]}>
                    {pinned && <Icon name='check' size={12} color='#fff' />}
                  </View>
                </PressableScale>
              );
            })}
          </View>
        </View>

        {/* ── All Features ── */}
        <View style={styles.group}>
          <View style={styles.groupHeader}>
            <Icon name='apps' size={14} color={colors.muted} />
            <Text style={styles.groupTitle}>All Features</Text>
          </View>

          <View style={styles.flatGroup}>
            {ITEMS.map((item, idx) => {
              const enabled = !!item.route;
              return (
                <PressableScale
                  key={item.label}
                  style={[styles.flatRow, idx < ITEMS.length - 1 && styles.flatRowBorder]}
                  onPress={() => item.route && router.push(item.route as any)}
                  scaleTo={enabled ? 0.97 : 1}
                  haptic={enabled ? 'light' : undefined}
                >
                  <View style={[styles.rowIcon, { backgroundColor: tint(item.color) }]}>
                    <Icon name={item.icon} size={18} color={item.color} />
                  </View>
                  <View style={styles.rowTextWrap}>
                    <Text style={[styles.rowLabel, !enabled && { opacity: 0.4 }]}>{item.label}</Text>
                    <Text style={styles.rowSub}>{item.sub}</Text>
                  </View>
                  {enabled
                    ? <Icon name='chevron-right' size={16} color={colors.tabInactive} />
                    : <Icon name='lock-outline' size={14} color={colors.tabInactive} />}
                </PressableScale>
              );
            })}
          </View>
        </View>

        {/* ── Data ── */}
        <View style={styles.group}>
          <View style={styles.groupHeader}>
            <Icon name='database' size={14} color={colors.muted} />
            <Text style={styles.groupTitle}>Data</Text>
          </View>

          <View style={styles.flatGroup}>
            <PressableScale style={styles.flatRow} onPress={exportAllData} scaleTo={0.97} haptic='light'>
              <View style={[styles.rowIcon, { backgroundColor: tint(colors.muted) }]}>
                <Icon name='database-export' size={18} color={colors.muted} />
              </View>
              <View style={styles.rowTextWrap}>
                <Text style={styles.rowLabel}>Export Data</Text>
                <Text style={styles.rowSub}>Backup all SQLite tables as JSON</Text>
              </View>
              <Icon name='chevron-right' size={16} color={colors.tabInactive} />
            </PressableScale>
          </View>
        </View>

      </ScrollView>
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
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 26,
    letterSpacing: -0.4,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.tabClear,
    gap: spacing.sm,
  },

  // ── Group (replaces card section) ──────────────
  group: {
    gap: spacing.xs,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.xs,
    marginBottom: 2,
  },
  groupTitle: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.muted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  groupSub: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.tabInactive,
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.xs,
  },

  // ── Flat group with top border container ────────
  flatGroup: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.04)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  flatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: spacing.xs,
    // NO background, NO border-radius — flat
  },
  flatRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },

  // ── Row contents ────────────────────────────────
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.text,
  },
  rowTextWrap: {
    flex: 1,
    gap: 1,
  },
  rowSub: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
  },

  // ── Checkbox (Super App toggle) ─────────────────
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.purple,
    borderColor: colors.purple,
  },
});
