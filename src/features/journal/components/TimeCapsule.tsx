import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { Icon } from '@/theme/icons';
import { useJournalStore } from '@/store/journalStore';
import { formatTxnDate } from '@/utils/date';

/** "On this day" callback surface with a gradient backdrop. */
export function TimeCapsule() {
  const capsule = useJournalStore((s) => s.getTimeCapsule());

  if (!capsule) return null;

  return (
    <LinearGradient
      colors={['#1A1730', '#13131A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.header}>
        <Icon name='clock-outline' size={18} color={colors.purple} />
        <Text style={styles.headerLabel}>TIME CAPSULE</Text>
      </View>
      <Text style={styles.body} numberOfLines={3}>
        {capsule.text}
      </Text>
      <Pressable style={styles.link}>
        <Text style={styles.linkLabel}>
          Entry from {formatTxnDate(new Date(capsule.date).getTime())}
        </Text>
        <Icon name='arrow-right' size={15} color={colors.purple} />
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#3A3360',
    borderRadius: 16,
    padding: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  headerLabel: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    letterSpacing: 0.3,
    color: '#B8B0FF',
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: '#D8D8EC',
    marginBottom: 12,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  linkLabel: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.purple,
  },
});
