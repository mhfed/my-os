import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { Icon } from '@/theme/icons';
import { WidgetCard } from '../WidgetCard';
import { useInboxStore } from '@/store/inboxStore';

export function InboxWidget() {
  const router = useRouter();
  const ready = useInboxStore((s) => s.ready);

  if (!ready) return null;

  const openCount = useInboxStore.getState().openCount();
  const openItems = useInboxStore.getState().open();
  const latest = openItems[0];

  return (
    <WidgetCard
      domain='inbox'
      title='Inbox'
      icon='inbox'
      onPress={() => router.push('/inbox')}
    >
      {openCount > 0 ? (
        <>
          <Text style={styles.count}>{openCount} item{openCount !== 1 ? 's' : ''}</Text>
          {latest && (
            <Text style={styles.preview} numberOfLines={2}>
              {latest.text}
            </Text>
          )}
        </>
      ) : (
        <View style={styles.emptyRow}>
          <Icon name='check-circle-outline' size={14} color={colors.green} />
          <Text style={styles.emptyText}>All clear ✨</Text>
        </View>
      )}
    </WidgetCard>
  );
}

const styles = StyleSheet.create({
  count: {
    fontFamily: fonts.displayExtra,
    fontSize: 18,
    color: colors.purple,
  },
  preview: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
    lineHeight: 16,
  },
  emptyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  emptyText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.muted,
  },
});
