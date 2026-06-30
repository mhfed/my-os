import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '@/theme/colors';
import { Icon } from '@/theme/icons';
import { fonts } from '@/theme/typography';

interface FinishBarProps {
  onFinish: () => void;
}

/** Absolute bottom bar with the gradient "Finish workout" button. */
export function FinishBar({ onFinish }: FinishBarProps) {
  return (
    <View style={styles.bar}>
      <Pressable
        onPress={onFinish}
        accessibilityRole="button"
        accessibilityLabel="Finish workout"
      >
        <LinearGradient
          colors={[colors.purple, colors.teal]}
          start={{ x: 0.07, y: 0 }}
          end={{ x: 0.93, y: 0.5 }}
          style={styles.button}
        >
          <Icon name="flag-checkered" size={19} color={colors.screenBg} />
          <Text style={styles.buttonText}>Finish workout</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 14,
    paddingHorizontal: 22,
    paddingBottom: 30,
    backgroundColor: 'rgba(10,10,15,0.9)',
    borderTopWidth: 1,
    borderTopColor: colors.track,
  },
  button: {
    borderRadius: 14,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  buttonText: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.screenBg,
  },
});
