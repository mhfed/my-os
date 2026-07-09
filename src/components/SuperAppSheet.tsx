import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

import { colors, tint, radius, glass } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fonts } from '@/theme/typography';
import { Icon, type IconName } from '@/theme/icons';
import { PressableScale } from '@/components/motion';
import { useSettingsStore } from '@/store/settingsStore';

interface QuickActionConfig {
  label: string;
  sub: string;
  icon: IconName;
  color: string;
  action: () => void;
}

export function SuperAppSheet() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const isOpen = useSettingsStore((s) => s.superAppOpen);
  const close = useSettingsStore((s) => s.closeSuperApp);

  const [modalVisible, setModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(600)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      setModalVisible(true);
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, damping: 22, stiffness: 240, useNativeDriver: true }),
        Animated.timing(fadeAnim,  { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 600, damping: 24, stiffness: 260, useNativeDriver: true }),
        Animated.timing(fadeAnim,  { toValue: 0, duration: 140, useNativeDriver: true }),
      ]).start(() => setModalVisible(false));
    }
  }, [isOpen]);

  const handleClose = () => { close(); };

  const handleAction = (route: string) => {
    handleClose();
    setTimeout(() => router.push(route as any), 50);
  };

  const ACTIONS: QuickActionConfig[] = [
    {
      label: 'Nhiệm vụ mới',
      sub: 'Thêm task, hẹn giờ hoặc lặp lại',
      icon: 'checkbox-marked-outline',
      color: colors.teal,
      action: () => handleAction('/tasks?create=true'),
    },
    {
      label: 'Nháp nhanh',
      sub: 'Lưu ghi chú nháp vào bộ nhớ nhanh',
      icon: 'inbox',
      color: colors.purple,
      action: () => handleAction('/notes?create_inbox=true'),
    },
    {
      label: 'Ghi nhận chi tiêu',
      sub: 'Thu nhập, chi phí hoặc ghi nợ',
      icon: 'wallet',
      color: colors.orange,
      action: () => handleAction('/finance?create=true'),
    },
    {
      label: 'Bắt đầu tập Gym',
      sub: 'Ghi chép Sets, Reps và PRs',
      icon: 'heart-pulse',
      color: colors.red,
      action: () => handleAction('/health'),
    },
  ];

  return (
    <Modal transparent visible={modalVisible} animationType='none' onRequestClose={handleClose} statusBarTranslucent>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} pointerEvents='box-none'>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24), transform: [{ translateY: slideAnim }] }]}>
        <BlurView tint='dark' intensity={40} style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0)']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.sheetGloss}
          pointerEvents='none'
        />

        {/* Handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>Tạo Nhanh</Text>
          <PressableScale onPress={handleClose} scaleTo={0.92} haptic='light' style={styles.closeBtn}>
            <Icon name='close' size={18} color={colors.white} />
          </PressableScale>
        </View>

        {/* Action list with premium design */}
        <View style={styles.actionsContainer}>
          {ACTIONS.map((item, idx) => (
            <PressableScale
              key={item.label}
              style={[
                styles.actionRow,
                idx < ACTIONS.length - 1 && styles.actionRowBorder
              ]}
              onPress={item.action}
              scaleTo={0.97}
              haptic='light'
            >
              <View style={[styles.iconContainer, { backgroundColor: tint(item.color) }]}>
                <Icon name={item.icon} size={22} color={item.color} />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.actionLabel}>{item.label}</Text>
                <Text style={styles.actionSub}>{item.sub}</Text>
              </View>
              <Icon name='chevron-right' size={18} color={colors.tabInactive} />
            </PressableScale>
          ))}
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5,8,15,0.55)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(14,16,22,0.97)',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderColor: glass.rim,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 14,
    overflow: 'hidden',
  },
  sheetGloss: { ...StyleSheet.absoluteFillObject },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: colors.text,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  actionsContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 16,
  },
  actionRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  actionLabel: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.text,
  },
  actionSub: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
  },
});
