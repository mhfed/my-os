import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { colors, glass, radius, tint } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fonts } from '@/theme/typography';
import { Icon } from '@/theme/icons';
import { EmptyState } from '@/components/game';
import { AnimatedCard, PressableScale } from '@/components/motion';
import { useInboxStore } from '@/store/inboxStore';
import { InboxItemRow } from '@/features/inbox/components/InboxItemRow';

/** Inbox screen (DESIGN_SPEC §5.10) — capture triage centre. */
export function InboxScreen() {
  const router = useRouter();
  const ready = useInboxStore((s) => s.ready);
  const open = useInboxStore((s) => s.open);
  const openCount = useInboxStore((s) => s.openCount);
  useInboxStore((s) => s.items);

  useEffect(() => {
    useInboxStore.getState().init();
  }, []);

  const items = open();
  const count = openCount();

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
              onPress={() => router.back()}
              haptic='light'
              hitSlop={10}
              style={styles.back}
              accessibilityRole='button'
              accessibilityLabel='Quay lại'
            >
              <Icon name='chevron-left' size={26} color={colors.text} />
            </PressableScale>
            <Text style={styles.title}>Inbox</Text>
            {count > 0 ? (
              <View style={styles.countChip}>
                <Text style={styles.countText}>{count}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </AnimatedCard>

      {!ready ? (
        <View style={styles.center}>
          <Text style={styles.placeholder}>Đang tải…</Text>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <EmptyState
            icon='inbox-arrow-down'
            title='Inbox zero ✨'
            subtitle='Không có gì cần xử lý.'
          />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {items.map((item, index) => (
            <AnimatedCard key={item.id} index={index + 1}>
              <InboxItemRow item={item} />
            </AnimatedCard>
          ))}
        </ScrollView>
      )}
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
  headerWrap: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  headerCard: {
    backgroundColor: glass.fillStrong,
    borderWidth: 1,
    borderColor: glass.rim,
    borderRadius: radius.lg,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  back: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -spacing.xs,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 26,
    letterSpacing: -0.4,
    color: colors.text,
    flex: 1,
  },
  countChip: {
    minWidth: 24,
    height: 24,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
    backgroundColor: tint(colors.purple, '1A'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontFamily: fonts.monoSemibold,
    fontSize: 13,
    color: colors.purple,
  },
  content: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.tabClear,
    gap: spacing.sm,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  placeholder: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.muted,
  },
});
