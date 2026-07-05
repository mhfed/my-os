import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { colors, glass, radius, tint } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { Icon, type IconName } from '@/theme/icons';
import { AnimatedCard } from '@/components/motion';
import { useSettingsStore, type SuperAppItemKey } from '@/store/settingsStore';
import { exportAllData } from '@/utils/export';

interface SuperAppItemConfig {
  key: SuperAppItemKey;
  label: string;
  icon: IconName;
  color: string;
}

const SUPER_APP_ALL: SuperAppItemConfig[] = [
  { key: 'inbox', label: 'Inbox', icon: 'inbox', color: colors.purple },
  { key: 'journal', label: 'Journal', icon: 'notebook', color: colors.teal },
  { key: 'habits', label: 'Habits', icon: 'chart-box', color: colors.purple },
  { key: 'notes', label: 'Notes', icon: 'brain', color: colors.orange },
  { key: 'goals', label: 'Goals', icon: 'target', color: colors.red },
  { key: 'today', label: 'Today', icon: 'view-grid', color: colors.purple },
  { key: 'tasks', label: 'Tasks', icon: 'checkbox-marked-outline', color: colors.teal },
  { key: 'health', label: 'Health', icon: 'heart-pulse', color: colors.red },
  { key: 'finance', label: 'Finance', icon: 'wallet', color: colors.orange },
];

interface MoreItem {
  label: string;
  sub: string;
  icon: IconName;
  color: string;
  route?: '/inbox' | '/journal' | '/habits' | '/notes' | '/goals';
}

const ITEMS: MoreItem[] = [
  {
    label: 'Inbox',
    sub: 'Triage your quick captures',
    icon: 'inbox',
    color: colors.purple,
    route: '/inbox',
  },
  {
    label: 'Journal',
    sub: 'Daily entry · mood · time capsule',
    icon: 'notebook',
    color: colors.teal,
    route: '/journal',
  },
  {
    label: 'Habits',
    sub: 'Streaks & weekly grid',
    icon: 'chart-box',
    color: colors.purple,
    route: '/habits',
  },
  {
    label: 'Notes',
    sub: 'Second brain · reading list',
    icon: 'brain',
    color: colors.orange,
    route: '/notes' as any,
  },
  {
    label: 'Goals',
    sub: 'OKRs & milestones',
    icon: 'target',
    color: colors.red,
    route: '/goals' as any,
  },
];

export default function MoreScreen() {
  const router = useRouter();
  const pinnedItems = useSettingsStore((s) => s.pinnedItems);
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Super App settings */}
        <AnimatedCard index={0} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name='view-grid-plus' size={16} color={colors.purple} />
            <Text style={styles.sectionTitle}>Super App</Text>
          </View>
          <Text style={styles.sectionSub}>
            Choose what appears when you tap the center button
          </Text>
          <View style={styles.toggleList}>
            {SUPER_APP_ALL.map((item) => {
              const pinned = pinnedItems.includes(item.key);
              return (
                <Pressable
                  key={item.key}
                  style={({ pressed }) => [
                    styles.toggleRow,
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => togglePinned(item.key)}
                >
                  <View
                    style={[
                      styles.toggleIcon,
                      { backgroundColor: tint(item.color) },
                    ]}
                  >
                    <Icon name={item.icon} size={16} color={item.color} />
                  </View>
                  <Text style={styles.toggleLabel}>{item.label}</Text>
                  <View
                    style={[
                      styles.toggleCheck,
                      pinned && styles.toggleCheckActive,
                    ]}
                  >
                    {pinned && (
                      <Icon name='check' size={14} color='#fff' />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </AnimatedCard>

        {/* Feature links */}
        <AnimatedCard index={1} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name='apps' size={16} color={colors.muted} />
            <Text style={styles.sectionTitle}>All Features</Text>
          </View>
          <View style={styles.featureList}>
            {ITEMS.map((item) => {
              const enabled = !!item.route;
              return (
                <Pressable
                  key={item.label}
                  disabled={!enabled}
                  onPress={() => item.route && router.push(item.route)}
                  style={({ pressed }) => [
                    styles.row,
                    pressed && enabled ? styles.rowPressed : null,
                    !enabled ? styles.rowDisabled : null,
                  ]}
                >
                  <View
                    style={[
                      styles.iconChip,
                      { backgroundColor: tint(item.color) },
                    ]}
                  >
                    <Icon name={item.icon} size={20} color={item.color} />
                  </View>
                  <View style={styles.rowText}>
                    <Text style={styles.rowLabel}>{item.label}</Text>
                    <Text style={styles.rowSub}>{item.sub}</Text>
                  </View>
                  {enabled ? (
                    <Icon name='chevron-right' size={20} color={colors.muted} />
                  ) : (
                    <Icon
                      name='lock-outline'
                      size={16}
                      color={colors.tabInactive}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>
        </AnimatedCard>

        {/* Data */}
        <AnimatedCard index={2} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name='database' size={16} color={colors.muted} />
            <Text style={styles.sectionTitle}>Data</Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.row,
              pressed ? styles.rowPressed : null,
            ]}
            onPress={exportAllData}
          >
            <View
              style={[
                styles.iconChip,
                { backgroundColor: tint(colors.muted) },
              ]}
            >
              <Icon name='database-export' size={20} color={colors.white} />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Export Data</Text>
              <Text style={styles.rowSub}>Backup all SQLite tables as JSON</Text>
            </View>
          </Pressable>
        </AnimatedCard>
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
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.tabClear,
    gap: spacing.md,
  },
  section: {
    gap: spacing.sm,
    backgroundColor: glass.fillStrong,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: glass.rim,
    padding: spacing.md,
  },

  /* Section headers */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.muted,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  sectionSub: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.tabInactive,
  },

  /* Toggle rows (Super App settings) */
  toggleList: {
    gap: 6,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: glass.fill,
    borderWidth: 1,
    borderColor: glass.rim,
    borderRadius: radius.xl,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  toggleIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleLabel: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.text,
  },
  toggleCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: glass.rim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleCheckActive: {
    backgroundColor: colors.purple,
    borderColor: colors.purple,
  },

  /* Feature link rows */
  featureList: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: glass.fill,
    borderWidth: 1,
    borderColor: glass.rim,
    borderRadius: radius.xl,
    padding: 14,
  },
  rowPressed: {
    opacity: 0.7,
  },
  rowDisabled: {
    opacity: 0.5,
  },
  iconChip: {
    width: 40,
    height: 40,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  rowLabel: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.text,
  },
  rowSub: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
});
