import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { Icon } from '@/theme/icons';
import { WidgetCard } from '../WidgetCard';
import { useJournalStore } from '@/store/journalStore';
import { todayKey } from '@/utils/day';

export const JournalWidget = memo(function JournalWidget() {
  const router = useRouter();
  const ready = useJournalStore((s) => s.ready);

  if (!ready) return null;

  const entries = useJournalStore.getState().entries;
  const totalEntries = entries.length;
  const todayEntry = useJournalStore.getState().entryFor(todayKey());
  const streak = useJournalStore.getState().streak();

  return (
    <WidgetCard
      domain='journal'
      title='Nhật ký'
      icon='book-open-outline'
      onPress={() => router.push('/(tabs)/journal')}
    >
      {todayEntry ? (
        <>
          <View style={styles.statusRow}>
            <Icon name='check-circle' size={16} color={colors.green} />
            <Text style={styles.statusText}>Đã viết hôm nay</Text>
          </View>
          <Text style={styles.preview} numberOfLines={2}>
            {todayEntry.text}
          </Text>
        </>
      ) : (
        <View style={styles.statusRow}>
          <Icon name='pencil-outline' size={16} color={colors.muted} />
          <Text style={styles.promptText}>Hôm nay thế nào?</Text>
        </View>
      )}
      <View style={styles.footer}>
        {streak > 0 && (
          <Text style={styles.streakText}>
            <Icon name='fire' size={10} color={colors.pink} /> {streak} ngày liên tiếp
          </Text>
        )}
        <Text style={styles.totalText}>{totalEntries} bài</Text>
      </View>
    </WidgetCard>
  );
});

const styles = StyleSheet.create({
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  statusText: {
    fontFamily: fonts.displayBold,
    fontSize: 13,
    color: colors.green,
  },
  promptText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.muted,
  },
  preview: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.text,
    lineHeight: 17,
    marginBottom: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  streakText: {
    fontFamily: fonts.display,
    fontSize: 11,
    color: colors.pink,
  },
  totalText: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.muted,
  },
});
