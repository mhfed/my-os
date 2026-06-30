import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { Icon, type IconName } from '@/theme/icons';
import { useJournalStore, wordCount } from '@/store/journalStore';
import { startOfDay } from '@/utils/day';
import type { Mood } from '@/types/journal';

import { MoodSelector } from './MoodSelector';

const MONTHS = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
] as const;
const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;

/** Format a "YYYY-MM-DD" key as "MON · 30 JUN 2025". */
function formatDateHeader(key: string): string {
  const d = new Date(startOfDay(key));
  const wd = WEEKDAYS[d.getDay()];
  const month = MONTHS[d.getMonth()];
  return `${wd} · ${d.getDate()} ${month} ${d.getFullYear()}`;
}

/** Per-mood accent for the small glyph shown in the entry header. */
const MOOD_ICON: { icon: IconName; color: string }[] = [
  { icon: 'emoticon-cry-outline', color: colors.red },
  { icon: 'emoticon-sad-outline', color: colors.orange },
  { icon: 'emoticon-neutral-outline', color: colors.muted },
  { icon: 'emoticon-happy-outline', color: colors.teal },
  { icon: 'emoticon-excited-outline', color: colors.purple },
];

const DEFAULT_MOOD: Mood = 3;

/**
 * Mood picker + editable journal entry, both bound to the active day. Loads
 * text/mood from the store's entry for `activeDate` (falling back to empty
 * text / mood 3), edits locally, and persists via `saveEntry` on Save.
 */
export function EntryCard() {
  const activeDate = useJournalStore((s) => s.activeDate);
  const entry = useJournalStore((s) => s.entryFor(activeDate));
  const saveEntry = useJournalStore((s) => s.saveEntry);

  const [text, setText] = useState(entry?.text ?? '');
  const [mood, setMood] = useState<Mood>(entry?.mood ?? DEFAULT_MOOD);

  // Reload local draft whenever the active day (or its stored entry) changes.
  useEffect(() => {
    setText(entry?.text ?? '');
    setMood(entry?.mood ?? DEFAULT_MOOD);
  }, [activeDate, entry?.text, entry?.mood]);

  const words = wordCount(text);
  const headerIcon = MOOD_ICON[mood];

  return (
    <View>
      <MoodSelector selected={mood} onSelect={(i) => setMood(i as Mood)} />

      <View style={styles.card}>
        <View style={styles.topRow}>
          <Text style={styles.date}>{formatDateHeader(activeDate)}</Text>
          <Icon name={headerIcon.icon} size={18} color={headerIcon.color} />
        </View>
        <TextInput
          value={text}
          onChangeText={setText}
          multiline
          textAlignVertical="top"
          placeholder="What's on your mind today?"
          style={styles.input}
          placeholderTextColor={colors.muted}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.words}>{words} words</Text>
        <Pressable
          style={styles.saveButton}
          onPress={() => {
            void saveEntry(text, mood);
          }}
        >
          <Icon name="content-save" size={16} color="#0A0A0F" />
          <Text style={styles.saveLabel}>Save</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  date: {
    fontFamily: fonts.monoMedium,
    fontSize: 12,
    color: colors.muted,
  },
  input: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 24,
    color: '#D8D8EC',
    minHeight: 120,
    padding: 0,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  words: {
    fontFamily: fonts.monoRegular,
    fontSize: 12,
    color: colors.muted,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: colors.purple,
    borderRadius: 11,
    paddingVertical: 9,
    paddingHorizontal: 18,
  },
  saveLabel: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: '#0A0A0F',
  },
});
