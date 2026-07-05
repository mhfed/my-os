import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
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

import { colors, gradients, tint, radius, base3D, glass } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fonts } from '@/theme/typography';
import { Icon, type IconName } from '@/theme/icons';
import { useSettingsStore, type SuperAppItemKey } from '@/store/settingsStore';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_PADDING = 16;
const ITEM_GAP = 10;
const ITEM_MIN_WIDTH = 100;

interface ItemConfig {
  key: SuperAppItemKey;
  label: string;
  icon: IconName;
  color: string;
  route: string;
}

const ALL_ITEMS: ItemConfig[] = [
  { key: 'inbox', label: 'Inbox', icon: 'inbox', color: colors.purple, route: '/inbox' },
  { key: 'journal', label: 'Journal', icon: 'notebook', color: colors.teal, route: '/journal' },
  { key: 'habits', label: 'Habits', icon: 'chart-box', color: colors.purple, route: '/habits' },
  { key: 'notes', label: 'Notes', icon: 'brain', color: colors.orange, route: '/notes' },
  { key: 'goals', label: 'Goals', icon: 'target', color: colors.red, route: '/goals' },
  { key: 'today', label: 'Today', icon: 'view-grid', color: colors.purple, route: '/' },
  { key: 'tasks', label: 'Tasks', icon: 'checkbox-marked-outline', color: colors.teal, route: '/tasks' },
  { key: 'health', label: 'Health', icon: 'heart-pulse', color: colors.red, route: '/health' },
  { key: 'finance', label: 'Finance', icon: 'wallet', color: colors.orange, route: '/finance' },
];

/** Super App sheet (DESIGN_SPEC §4.2) — bottom sheet launcher for all modules. */
export function SuperAppSheet() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const isOpen = useSettingsStore((s) => s.superAppOpen);
  const editMode = useSettingsStore((s) => s.editMode);
  const pinnedItems = useSettingsStore((s) => s.pinnedItems);
  const close = useSettingsStore((s) => s.closeSuperApp);
  const setEditMode = useSettingsStore((s) => s.setEditMode);
  const togglePinned = useSettingsStore((s) => s.togglePinnedItem);

  const [modalVisible, setModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(600)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      setModalVisible(true);
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, damping: 22, stiffness: 240, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 600, damping: 24, stiffness: 260, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0, duration: 140, useNativeDriver: true }),
      ]).start(() => setModalVisible(false));
    }
  }, [isOpen]);

  const handleClose = () => {
    setEditMode(false);
    close();
  };

  const handleItemPress = (item: ItemConfig) => {
    if (editMode) return;
    handleClose();
    setTimeout(() => router.push(item.route as any), 50);
  };

  const pinned = ALL_ITEMS.filter((i) => pinnedItems.includes(i.key));
  const unpinned = ALL_ITEMS.filter((i) => !pinnedItems.includes(i.key));

  return (
    <Modal
      transparent
      visible={modalVisible}
      animationType='none'
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Animated.View
        style={[styles.backdrop, { opacity: fadeAnim }]}
        pointerEvents='box-none'
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          {
            paddingBottom: Math.max(insets.bottom, 20),
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <BlurView tint='dark' intensity={40} style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={['rgba(255,255,255,0.04)', 'rgba(255,255,255,0)']}
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
          <Pressable
            onPress={() => setEditMode(!editMode)}
            style={({ pressed }) => [styles.editBtn, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.editBtnText}>{editMode ? 'Xong' : 'Sửa'}</Text>
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          bounces={false}
        >
          {editMode ? (
            /* Edit mode */
            <View style={styles.editList}>
              <Text style={styles.editSectionLabel}>Đã ghim</Text>
              {pinned.length === 0 ? (
                <Text style={styles.editEmptyLabel}>Chưa có mục nào được ghim</Text>
              ) : (
                pinned.map((item) => (
                  <Pressable
                    key={item.key}
                    style={({ pressed }) => [styles.editRow, pressed && { opacity: 0.7 }]}
                    onPress={() => togglePinned(item.key)}
                  >
                    <View style={[styles.editIcon, { backgroundColor: tint(item.color) }]}>
                      <Icon name={item.icon} size={22} color={item.color} />
                    </View>
                    <Text style={styles.editLabel}>{item.label}</Text>
                    <Icon name='pin-off-outline' size={20} color={colors.red} />
                  </Pressable>
                ))
              )}

              <Text style={[styles.editSectionLabel, { marginTop: spacing.sm }]}>Thêm mục</Text>
              {unpinned.map((item) => (
                <Pressable
                  key={item.key}
                  style={({ pressed }) => [styles.editRow, pressed && { opacity: 0.7 }]}
                  onPress={() => togglePinned(item.key)}
                >
                  <View style={[styles.editIcon, { backgroundColor: tint(item.color) }]}>
                    <Icon name={item.icon} size={22} color={item.color} />
                  </View>
                  <Text style={styles.editLabel}>{item.label}</Text>
                  <Icon name='pin-outline' size={20} color={colors.teal} />
                </Pressable>
              ))}
            </View>
          ) : (
            /* Normal mode: grid */
            <View>
              {pinned.length === 0 ? (
                <View style={styles.emptyState}>
                  <Icon name='view-grid-plus' size={48} color={colors.muted} />
                  <Text style={styles.emptyText}>Nhấn "Sửa" để chọn module cho Super App</Text>
                </View>
              ) : (
                <View style={styles.grid}>
                  {pinned.map((item) => (
                    <Pressable
                      key={item.key}
                      style={({ pressed }) => [styles.gridItem, pressed && styles.gridItemPressed]}
                      onPress={() => handleItemPress(item)}
                    >
                      <View style={[styles.gridIcon, { backgroundColor: tint(item.color) }]}>
                        <Icon name={item.icon} size={26} color={item.color} />
                      </View>
                      <Text style={styles.gridLabel}>{item.label}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        {!editMode && (
          <Pressable
            style={({ pressed }) => [styles.footer, pressed && { opacity: 0.6 }]}
            onPress={() => { handleClose(); setTimeout(() => router.push('/more' as any), 50); }}
          >
            <Icon name='cog-outline' size={15} color={colors.muted} />
            <Text style={styles.footerText}>Tuỳ chỉnh thêm</Text>
            <Icon name='chevron-right' size={15} color={colors.tabInactive} />
          </Pressable>
        )}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20,29,48,0.34)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(28,27,27,0.96)',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderColor: glass.rim,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
    maxHeight: '82%',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  sheetGloss: { ...StyleSheet.absoluteFillObject },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
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
    borderBottomColor: glass.rim,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
    color: colors.text,
  },
  editBtn: {
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm - 4,
    borderRadius: radius.pill,
  },
  editBtnText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.onPrimaryContainer,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingBottom: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SHEET_PADDING,
    gap: ITEM_GAP,
    paddingTop: spacing.sm,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  gridItem: {
    minWidth: ITEM_MIN_WIDTH,
    flex: 1,
    aspectRatio: 1.1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: glass.rim,
    gap: spacing.sm,
    padding: spacing.sm,
  },
  gridItemPressed: { opacity: 0.75, transform: [{ scale: 0.95 }] },
  gridIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  gridLabel: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.text,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: spacing.sm,
  },
  emptyText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.muted,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: glass.rim,
    backgroundColor: 'rgba(28,27,27,0.85)',
    marginTop: spacing.sm,
  },
  footerText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.muted,
  },
  editList: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  editSectionLabel: {
    fontFamily: fonts.displayBold,
    fontSize: 13,
    color: colors.muted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  editEmptyLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: glass.rim,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  editIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  editLabel: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.text,
  },
});
