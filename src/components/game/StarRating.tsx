import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme/colors';
import { Icon } from '@/theme/icons';

interface StarRatingProps {
  /** How many stars are filled (0..count). */
  filled: number;
  count?: number;
  size?: number;
}

/**
 * The level "★ ★ ★" progress strip from the reference HUD. Filled stars glow
 * gold; empty stars are a muted track.
 */
export function StarRating({ filled, count = 3, size = 20 }: StarRatingProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: count }).map((_, i) => {
        const isOn = i < filled;
        return (
          <View
            key={i}
            style={[
              styles.starWrap,
              isOn && {
                shadowColor: colors.yellow,
                shadowOpacity: 0.8,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 0 },
              },
            ]}
          >
            <Icon
              name={isOn ? 'star' : 'star-outline'}
              size={size}
              color={isOn ? colors.yellow : colors.tabInactive}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 2,
  },
  starWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
