import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { colors, tint } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { Icon, type IconName } from '@/theme/icons';

interface MoreItem {
  label: string;
  sub: string;
  icon: IconName;
  color: string;
  route?: '/inbox' | '/journal' | '/habits';
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

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <Text style={styles.title}>More</Text>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
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
                style={[styles.iconChip, { backgroundColor: tint(item.color) }]}
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.screenBg,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 26,
    letterSpacing: -0.4,
    color: colors.text,
    paddingHorizontal: 22,
    paddingTop: 8,
  },
  content: {
    paddingTop: 18,
    paddingHorizontal: 22,
    paddingBottom: 110,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
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
