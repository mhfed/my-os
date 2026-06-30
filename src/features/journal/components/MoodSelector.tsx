import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, tint } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { Icon, type IconName } from '@/theme/icons';
import type { Mood } from '@/types/journal';

interface MoodOption {
  icon: IconName;
  color: string;
}

const MOODS: MoodOption[] = [
  { icon: 'emoticon-cry-outline', color: colors.red },
  { icon: 'emoticon-sad-outline', color: colors.orange },
  { icon: 'emoticon-neutral-outline', color: colors.muted },
  { icon: 'emoticon-happy-outline', color: colors.teal },
  { icon: 'emoticon-excited-outline', color: colors.purple },
];

interface MoodSelectorProps {
  selected: Mood;
  onSelect: (i: Mood) => void;
}

/** Five-button mood picker — highlights the active mood with its accent. */
export function MoodSelector({ selected, onSelect }: MoodSelectorProps) {
  return (
    <View>
      <Text style={styles.label}>How are you feeling?</Text>
      <View style={styles.row}>
        {MOODS.map((mood, i) => {
          const isSelected = i === selected;
          return (
            <Pressable
              key={i}
              onPress={() => onSelect(i as Mood)}
              style={[
                styles.button,
                isSelected
                  ? {
                      backgroundColor: tint(mood.color, '26'),
                      borderWidth: 1.5,
                      borderColor: mood.color,
                    }
                  : styles.buttonIdle,
              ]}
            >
              <Icon
                name={mood.icon}
                size={24}
                color={isSelected ? mood.color : colors.tabInactive}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  button: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIdle: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
