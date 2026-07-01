import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, gradients, radius } from '@/theme/colors';
import { fonts, textShadow } from '@/theme/typography';
import { AnimatedCard, PressableScale } from '@/components/motion';
import { CurrencyChip, GameIconButton } from '@/components/game';
import { getGreeting } from '@/utils/day';

import { StreakIndicator } from './StreakIndicator';

interface TodayHudProps {
  score: number;
  doneTodayCount: number;
  streak: number;
  onOpenInbox: () => void;
}

export function TodayHud({ score, doneTodayCount, streak, onOpenInbox }: TodayHudProps) {
  const level = Math.max(1, Math.ceil(score / 20));

  const [greeting, setGreeting] = useState(getGreeting());
  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatedCard index={0} style={styles.hud}>
      <PressableScale onPress={onOpenInbox} hitSlop={8} haptic='selection'>
        <View style={styles.avatarWrap}>
          <LinearGradient
            colors={gradients.purple}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={styles.avatar}
          >
            <Text style={styles.avatarLetter}>H</Text>
          </LinearGradient>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{level}</Text>
          </View>
        </View>
      </PressableScale>

      <View style={styles.centerBlock}>
        <Text style={styles.greeting}>{greeting}, Minh Hiếu</Text>
        <StreakIndicator count={streak} />
      </View>

      <View style={styles.rightBlock}>
        <View style={styles.hudResources}>
          <CurrencyChip kind='coins' value={score} />
          <CurrencyChip kind='gems' value={doneTodayCount} />
        </View>
        <GameIconButton
          icon='bell-outline'
          variant='gold'
          size={36}
          onPress={onOpenInbox}
        />
      </View>
    </AnimatedCard>
  );
}

const styles = StyleSheet.create({
  hud: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  avatarWrap: {
    width: 44,
    height: 44,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  avatarLetter: {
    fontFamily: fonts.displayExtra,
    fontSize: 18,
    color: colors.white,
    ...textShadow.button,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    alignSelf: 'center',
    minWidth: 22,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.yellow,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelText: {
    fontFamily: fonts.displayExtra,
    fontSize: 9,
    color: colors.text,
  },
  centerBlock: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  greeting: {
    fontFamily: fonts.displayBold,
    fontSize: 14,
    color: colors.text,
    ...textShadow.emboss,
  },
  rightBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hudResources: {
    flexDirection: 'row',
    gap: 6,
  },
});
