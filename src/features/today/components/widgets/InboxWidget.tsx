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

  const items = useInboxStore.getState().items;
  const openItems = items.filter((i) => i.status === 'inbox');
  const openCount = openItems.length;
  const archivedToday = items.filter(
    (i) => i.status === 'archived'
  ).length;

  return (
    <WidgetCard
      domain='inbox'
      title='Hộp thư'
      icon='bell-outline'
      onPress={() => router.push('/(tabs)/inbox')}
    >
      {openCount > 0 ? (
        <>
          <View style={styles.countRow}>
            <Text style={styles.count}>{openCount}</Text>
            <View style={[styles.dot, { backgroundColor: colors.purple }]} />
          </View>
          <View style={styles.previewList}>
            {openItems.slice(0, 3).map((item) => (
              <View key={item.id} style={styles.previewRow}>
                <Text style={styles.previewText} numberOfLines={1}>
                  {item.text}
                </Text>
              </View>
            ))}
          </View>
        </>
      ) : (
        <View style={styles.emptyState}>
          <Icon name='check-circle' size={22} color={colors.green} />
          <Text style={styles.emptyText}>Tất cả đã xử lý</Text>
        </View>
      )}
      {archivedToday > 0 && (
        <Text style={styles.processedText}>
          Đã xử lý {archivedToday} hôm nay
        </Text>
      )}
    </WidgetCard>
  );
}

const styles = StyleSheet.create({
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  count: {
    fontFamily: fonts.displayExtra,
    fontSize: 22,
    color: colors.purple,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  previewList: {
    gap: 4,
  },
  previewRow: {
    paddingVertical: 2,
    borderLeftWidth: 2,
    borderLeftColor: colors.purple + '30',
    paddingLeft: 8,
  },
  previewText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
  },
  emptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  emptyText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.green,
  },
  processedText: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.muted,
    marginTop: 6,
  },
});
