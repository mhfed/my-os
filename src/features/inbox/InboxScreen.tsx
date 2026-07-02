import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { FarmBackground } from '@/components/skia';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { Icon } from '@/theme/icons';
import { useInboxStore } from '@/store/inboxStore';
import { InboxItemRow } from '@/features/inbox/components/InboxItemRow';

export function InboxScreen() {
  const router = useRouter();
  const ready = useInboxStore((s) => s.ready);
  const open = useInboxStore((s) => s.open);
  const openCount = useInboxStore((s) => s.openCount);
  // Subscribe to items so the list re-renders on capture/triage/remove.
  useInboxStore((s) => s.items);

  useEffect(() => {
    useInboxStore.getState().init();
  }, []);

  const items = open();

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <FarmBackground domain='inbox' />
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={({ pressed }) => [
            styles.back,
            pressed ? styles.pressed : null,
          ]}
        >
          <Icon name='chevron-left' size={26} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Inbox</Text>
        {ready && openCount() > 0 ? (
          <View style={styles.countChip}>
            <Text style={styles.countText}>{openCount()}</Text>
          </View>
        ) : null}
      </View>

      {!ready ? (
        <View style={styles.center}>
          <Text style={styles.placeholder}>Loading…</Text>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <Icon name='inbox-arrow-down' size={48} color={colors.muted} />
          <Text style={styles.emptyText}>Inbox zero ✨</Text>
          <Text style={styles.emptySub}>Nothing to triage</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {items.map((item) => (
            <InboxItemRow key={item.id} item={item} />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 6,
  },
  back: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -6,
  },
  pressed: {
    opacity: 0.6,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 26,
    letterSpacing: -0.4,
    color: colors.text,
  },
  countChip: {
    minWidth: 24,
    height: 24,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: colors.track,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontFamily: fonts.monoSemibold,
    fontSize: 13,
    color: colors.muted,
  },
  content: {
    paddingTop: 14,
    paddingHorizontal: 18,
    paddingBottom: 110,
    gap: 12,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  placeholder: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.muted,
  },
  emptyText: {
    fontFamily: fonts.semibold,
    fontSize: 17,
    color: colors.text,
    marginTop: 8,
  },
  emptySub: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
  },
});
