import { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, type DomainKey, domains } from '@/theme/colors';
import { fonts, textShadow } from '@/theme/typography';
import { Icon, type IconName } from '@/theme/icons';
import { AnimatedCard, PressableScale } from '@/components/motion';
import { GamePanel } from '@/components/game';

interface WidgetCardProps {
  domain: DomainKey;
  title: string;
  icon: IconName;
  children: ReactNode;
  onPress: () => void;
  index?: number;
}

export function WidgetCard({
  domain,
  title,
  icon,
  children,
  onPress,
  index = 0,
}: WidgetCardProps) {
  const palette = domains[domain];

  return (
    <AnimatedCard index={index} style={styles.wrapper}>
      <PressableScale onPress={onPress} haptic='light' scaleTo={0.97}>
        <GamePanel style={styles.panel}>
          <View style={styles.header}>
            <View
              style={[
                styles.iconWrap,
                { backgroundColor: palette.accent + '18' },
              ]}
            >
              <Icon name={icon} size={18} color={palette.accent} />
            </View>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          </View>
          <View style={styles.body}>{children}</View>
        </GamePanel>
      </PressableScale>
    </AnimatedCard>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    minWidth: '45%',
  },
  panel: {
    paddingBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 15,
    color: colors.text,
    ...textShadow.emboss,
    flex: 1,
  },
  body: {
    paddingHorizontal: 12,
    gap: 6,
  },
});
