import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, gradients, radius } from '@/theme/colors';
import { fonts, textShadow } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { AnimatedCard, PressableScale } from '@/components/motion';
import { GameIconButton, StreakFlame } from '@/components/game';

interface TodayAppBarProps {
  greeting: string;
  level: number;
  streak: number;
  onOpenProfile: () => void;
  onOpenInbox: () => void;
}

/**
 * Today app bar (DESIGN_SPEC §5.1.1) — avatar with level badge, greeting,
 * streak flame and a notifications bell. Neutral chrome; the only glow lives on
 * the flame (an "alive" element).
 */
export const TodayAppBar = memo(function TodayAppBar({
  greeting,
  level,
  streak,
  onOpenProfile,
  onOpenInbox,
}: TodayAppBarProps) {
  return (
    <AnimatedCard index={0} style={styles.bar}>
      <PressableScale
        onPress={onOpenProfile}
        hitSlop={8}
        haptic='selection'
        accessibilityRole='button'
        accessibilityLabel='Hồ sơ'
        style={styles.avatarWrap}
      >
        <LinearGradient
          colors={gradients.gem}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={styles.avatar}
        >
          <Text style={styles.avatarLetter}>H</Text>
        </LinearGradient>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>{level}</Text>
        </View>
      </PressableScale>

      <View style={styles.center}>
        <Text style={styles.hi} numberOfLines={1}>
          {greeting}
        </Text>
        <Text style={styles.name} numberOfLines={1}>
          Minh Hiếu
        </Text>
      </View>

      <View style={styles.right}>
        {streak > 0 ? <StreakFlame count={streak} label='ngày' size={16} /> : null}
        <GameIconButton
          icon='bell-outline'
          variant='gem'
          size={38}
          onPress={onOpenInbox}
          accessibilityLabel='Thông báo'
        />
      </View>
    </AnimatedCard>
  );
});

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatarWrap: {
    width: 46,
    height: 46,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  avatarLetter: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: colors.white,
    ...textShadow.button,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -5,
    alignSelf: 'center',
    minWidth: 22,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.teal,
    borderWidth: 2,
    borderColor: colors.screenBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelText: {
    fontFamily: fonts.displayBold,
    fontSize: 9,
    color: colors.black,
  },
  center: {
    flex: 1,
  },
  hi: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
  },
  name: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: colors.text,
    ...textShadow.emboss,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
