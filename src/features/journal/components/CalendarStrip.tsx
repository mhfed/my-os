import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { useJournalStore } from '@/store/journalStore';
import { lastNDays, startOfDay, weekdayLetter } from '@/utils/day';

/** Day-of-month ("01".."31") for a "YYYY-MM-DD" key. */
function dayOfMonth(key: string): string {
  const d = new Date(startOfDay(key)).getDate();
  return d < 10 ? `0${d}` : `${d}`;
}

/**
 * Rolling 7-day strip ending today. Highlights the active day (purple), shows
 * a dot on days that have an entry, and selects a day on tap.
 */
export function CalendarStrip() {
  const activeDate = useJournalStore((s) => s.activeDate);
  const setActiveDate = useJournalStore((s) => s.setActiveDate);
  const writtenDates = useJournalStore((s) => s.writtenDatesSet);

  const days = lastNDays(7);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.strip}
    >
      {days.map((date) => {
        const isActive = date === activeDate;
        const hasEntry = writtenDates.has(date);
        const dotColor = hasEntry
          ? isActive
            ? '#0A0A0F'
            : colors.teal
          : 'transparent';
        return (
          <Pressable
            key={date}
            onPress={() => setActiveDate(date)}
            style={[styles.cell, isActive ? styles.cellActive : styles.cellDefault]}
          >
            <Text
              style={[styles.dow, { color: isActive ? '#0A0A0F' : colors.muted }]}
            >
              {weekdayLetter(date)}
            </Text>
            <Text
              style={[styles.num, { color: isActive ? '#0A0A0F' : colors.muted }]}
            >
              {dayOfMonth(date)}
            </Text>
            <View style={[styles.dot, { backgroundColor: dotColor }]} />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  strip: {
    marginBottom: 24,
  },
  row: {
    gap: 8,
  },
  cell: {
    width: 44,
    height: 64,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  cellActive: {
    backgroundColor: colors.purple,
  },
  cellDefault: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dow: {
    fontFamily: fonts.regular,
    fontSize: 10,
    opacity: 0.7,
  },
  num: {
    fontFamily: fonts.monoSemibold,
    fontSize: 15,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
});
