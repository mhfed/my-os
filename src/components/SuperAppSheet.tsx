import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
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
import { useSettingsStore, type SuperAppItemKey } from '@/store/settingsStore';

interface ItemConfig {
  key: SuperAppItemKey;
  label: string;
  icon: IconName;
  color: string;
  route: string;
}

const ALL_ITEMS: ItemConfig[] = [
  { key: 'inbox',   label: 'Inbox',    icon: 'inbox',                  color: colors.purple, route: '/inbox' },
  { key: 'journal', label: 'Journal',  icon: 'notebook',               color: colors.teal,   route: '/journal' },
  { key: 'habits',  label: 'Habits',   icon: 'chart-box',              color: colors.purple, route: '/habits' },
  { key: 'notes',   label: 'Notes',    icon: 'brain',                  color: colors.orange, route: '/notes' },
  { key: 'goals',   label: 'Goals',    icon: 'target',                 color: colors.red,    route: '/goals' },
  { key: 'today',   label: 'Today',    icon: 'view-grid',              color: colors.purple, route: '/' },
  { key: 'tasks',   label: 'Tasks',    icon: 'checkbox-marked-outline',color: colors.teal,   route: '/tasks' },
  { key: 'health',  label: 'Health',   icon: 'heart-pulse',            color: colors.red,    route: '/health' },
  { key: 'finance', label: 'Finance',  icon: 'wallet',                 color: colors.orange, route: '/finance' },
];

export function SuperAppSheet() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const isOpen      = useSettingsStore((s) => s.superAppOpen);
  const editMode    = useSettingsStore((s) => s.editMode);
  const pinnedItems = useSettingsStore((s) => s.pinnedItems);
  const close       = useSettingsStore((s) => s.closeSuperApp);
  const setEditMode = useSettingsStore((s) => s.setEditMode);
  const togglePinned = useSettingsStore((s) => s.togglePinnedItem);

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

  const handleClose = () => { setEditMode(false); close(); };

  const handleItemPress = (item: ItemConfig) => {
    if (editMode) return;
    handleClose();
    setTimeout(() => router.push(item.route as any), 50);
  };

  const pinned   = ALL_ITEMS.filter((i) => pinnedItems.includes(i.key));
  const unpinned = ALL_ITEMS.filter((i) => !pinnedItems.includes(i.key));

  return (
    <Modal transparent visible={modalVisible} animationType='none' onRequestClose={handleClose} statusBarTranslucent>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} pointerEvents='box-none'>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20), transform: [{ translateY: slideAnim }] }]}>
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
          <Text style={styles.title}>Super App</Text>
          <PressableScale onPress={() => setEditMode(!editMode)} scaleTo={0.92} haptic='light' style={styles.editBtn}>
            <Text style={styles.editBtnText}>{editMode ? 'Xong' : 'Sửa'}</Text>
          </PressableScale>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} bounces={false}>
          {editMode ? (
            /* ── Edit mode: flat list with 1px dividers ── */
            <View style={styles.editList}>
              <Text style={styles.editSectionLabel}>Đã ghim</Text>
              {pinned.length === 0 ? (
                <Text style={styles.editEmptyLabel}>Chưa có mục nào được ghim</Text>
              ) : (
                <View style={styles.flatList}>
                  {pinned.map((item, idx) => (
                    <PressableScale
                      key={item.key}
                      style={[styles.flatRow, idx < pinned.length - 1 && styles.flatRowBorder]}
                      onPress={() => togglePinned(item.key)}
                      scaleTo={0.97}
                      haptic='light'
                    >
                      <View style={[styles.editIcon, { backgroundColor: tint(item.color) }]}>
                        <Icon name={item.icon} size={20} color={item.color} />
                      </View>
                      <Text style={styles.editLabel}>{item.label}</Text>
                      <Icon name='pin-off-outline' size={18} color={colors.red} />
                    </PressableScale>
                  ))}
                </View>
              )}

              <Text style={[styles.editSectionLabel, { marginTop: spacing.md }]}>Thêm mục</Text>
              <View style={styles.flatList}>
                {unpinned.map((item, idx) => (
                  <PressableScale
                    key={item.key}
                    style={[styles.flatRow, idx < unpinned.length - 1 && styles.flatRowBorder]}
                    onPress={() => togglePinned(item.key)}
                    scaleTo={0.97}
                    haptic='light'
                  >
                    <View style={[styles.editIcon, { backgroundColor: tint(item.color) }]}>
                      <Icon name={item.icon} size={20} color={item.color} />
                    </View>
                    <Text style={styles.editLabel}>{item.label}</Text>
                    <Icon name='pin-outline' size={18} color={colors.teal} />
                  </PressableScale>
                ))}
              </View>
            </View>
          ) : (
            /* ── Normal mode: iOS-style borderless icon grid ── */
            <View>
              {pinned.length === 0 ? (
                <View style={styles.emptyState}>
                  <Icon name='view-grid-plus' size={48} color={colors.muted} />
                  <Text style={styles.emptyText}>Nhấn "Sửa" để chọn module cho Super App</Text>
                </View>
              ) : (
                <View style={styles.grid}>
                  {pinned.map((item) => (
                    <PressableScale
                      key={item.key}
                      style={styles.gridItem}
                      onPress={() => handleItemPress(item)}
                      scaleTo={0.88}
                      haptic='light'
                    >
                      <View style={[styles.gridIcon, { backgroundColor: tint(item.color, '20') }]}>
                        <Icon name={item.icon} size={28} color={item.color} />
                      </View>
                      <Text style={styles.gridLabel} numberOfLines={1}>{item.label}</Text>
                    </PressableScale>
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        {!editMode && (
          <PressableScale
            style={styles.footer}
            onPress={() => { handleClose(); setTimeout(() => router.push('/more' as any), 50); }}
            scaleTo={0.97}
            haptic='light'
          >
            <Icon name='cog-outline' size={15} color={colors.muted} />
            <Text style={styles.footerText}>Tuỳ chỉnh thêm</Text>
            <Icon name='chevron-right' size={15} color={colors.tabInactive} />
          </PressableScale>
        )}
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
    maxHeight: '82%',
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
  editBtn: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  editBtnText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.text,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.sm,
  },

  // ── Grid (normal mode) ──────────────────────────────
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    gap: 6,
    justifyContent: 'flex-start',
  },
  gridItem: {
    width: '22%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: spacing.xs,
    paddingHorizontal: 4,
    // NO background, NO border — borderless iOS-style
  },
  gridIcon: {
    width: 58,
    height: 58,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridLabel: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.text,
    textAlign: 'center',
  },

  // ── Edit mode: flat list ────────────────────────────
  editList: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  editSectionLabel: {
    fontFamily: fonts.displayBold,
    fontSize: 11,
    color: colors.muted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  flatList: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.04)',
  },
  flatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 11,
    // no background, no border-radius
  },
  flatRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  editIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editLabel: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.text,
  },
  editEmptyLabel: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
    marginBottom: spacing.sm,
  },

  // ── Misc ────────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: spacing.sm,
  },
  emptyText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.04)',
    marginTop: spacing.xs,
  },
  footerText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.muted,
  },
});
