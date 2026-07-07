import { memo, type ReactNode } from 'react';
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

export const WidgetCard = memo(function WidgetCard({
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
        <View style={styles.panel}>
          <View style={styles.header}>
            <View
              style={[
                styles.iconWrap,
                { backgroundColor: palette.accent + '12' },
              ]}
            >
              <Icon name={icon} size={15} color={palette.accent} />
            </View>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            <Icon name='chevron-right' size={14} color={colors.tabInactive} />
          </View>
          <View style={styles.body}>{children}</View>
        </View>
      </PressableScale>
    </AnimatedCard>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  panel: {
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: radius.xl,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  body: {
    gap: 6,
  },
});
