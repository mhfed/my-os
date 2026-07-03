import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, type DomainKey } from '@/theme/colors';

export type { DomainKey };

/**
 * Lumina OS backdrop: deep charcoal gradient with a subtle domain-tinted glow.
 * Lighter weight than SkiaBackground — use for screens that don't need canvas.
 */
interface FarmBackgroundProps {
  domain?: DomainKey;
}

export function FarmBackground({ domain = 'today' }: FarmBackgroundProps) {
  const accent = colors.appBg;

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Base dark gradient */}
      <LinearGradient
        colors={['#131313', '#1A1A1A', '#131313']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      {/* Subtle ambient glow from bottom */}
      <LinearGradient
        colors={['transparent', accent + '15']}
        start={{ x: 0.5, y: 0.6 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}
