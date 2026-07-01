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

import {
  colors,
  gradients,
  tint,
  radius,
  elevation,
  base3D,
} from '@/theme/colors';
import { fonts, textShadow } from '@/theme/typography';
import { Icon, type IconName } from '@/theme/icons';
import { useSettingsStore, type SuperAppItemKey } from '@/store/settingsStore';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_PADDING = 20;
const GRID_GAP = 10;
const ITEM_WIDTH = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP * 2) / 3;

interface ItemConfig {
  key: SuperAppItemKey;
  label: string;
  icon: IconName;
  color: string;
  route: string;
}

const ALL_ITEMS: ItemConfig[] = [
  {
    key: 'inbox',
    label: 'Inbox',
    icon: 'inbox',
    color: colors.purple,
    route: '/inbox',
  },
  {
    key: 'journal',
    label: 'Journal',
    icon: 'notebook',
    color: colors.teal,
    route: '/journal',
  },
  {
    key: 'habits',
    label: 'Habits',
    icon: 'chart-box',
    color: colors.purple,
    route: '/habits',
  },
  {
    key: 'notes',
    label: 'Notes',
    icon: 'brain',
    color: colors.orange,
    route: '/notes',
  },
  {
    key: 'goals',
    label: 'Goals',
    icon: 'target',
    color: colors.red,
    route: '/goals',
  },
  {
    key: 'today',
    label: 'Today',
    icon: 'view-grid',
    color: colors.purple,
    route: '/',
  },
  {
    key: 'tasks',
    label: 'Tasks',
    icon: 'checkbox-marked-outline',
    color: colors.teal,
    route: '/tasks',
  },
  {
    key: 'health',
    label: 'Health',
    icon: 'heart-pulse',
    color: colors.red,
    route: '/health',
  },
  {
    key: 'finance',
    label: 'Finance',
    icon: 'wallet',
    color: colors.orange,
    route: '/finance',
  },
];

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
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 22,
          stiffness: 240,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 600,
          damping: 24,
          stiffness: 260,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 140,
          useNativeDriver: true,
        }),
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
        {/* Handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {editMode ? 'Customize' : 'Super App'}
          </Text>
          <Pressable
            style={styles.editBtn}
            onPress={() => setEditMode(!editMode)}
          >
            <Text style={styles.editBtnText}>{editMode ? 'Done' : 'Edit'}</Text>
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps='handled'
        >
          {!editMode ? (
            /* Grid view */
            <>
              {pinned.length === 0 ? (
                <View style={styles.emptyState}>
                  <Icon name='apps' size={32} color={colors.muted} />
                  <Text style={styles.emptyText}>
                    Tap Edit to add apps to Super App
                  </Text>
                </View>
              ) : (
                <View style={styles.grid}>
                  {pinned.map((item) => (
                    <Pressable
                      key={item.key}
                      style={({ pressed }) => [
                        styles.gridItem,
                        pressed && styles.gridItemPressed,
                      ]}
                      onPress={() => handleItemPress(item)}
                    >
                      <View style={styles.gridIconWrap}>
                        <LinearGradient
                          colors={[item.color, item.color]}
                          start={{ x: 0.3, y: 0 }}
                          end={{ x: 0.7, y: 1 }}
                          style={styles.gridIcon}
                        >
                          <Icon
                            name={item.icon}
                            size={26}
                            color={colors.white}
                          />
                        </LinearGradient>
                      </View>
                      <Text style={styles.gridLabel} numberOfLines={1}>
                        {item.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </>
          ) : (
            /* Edit view */
            <View style={styles.editList}>
              {/* Pinned section */}
              {pinned.length > 0 && (
                <>
                  <Text style={styles.editSectionLabel}>Pinned</Text>
                  {pinned.map((item) => (
                    <Pressable
                      key={item.key}
                      style={({ pressed }) => [
                        styles.editRow,
                        pressed && { opacity: 0.7 },
                      ]}
                      onPress={() => togglePinned(item.key)}
                    >
                      <View style={styles.editIconWrap}>
                        <LinearGradient
                          colors={[item.color, item.color]}
                          style={styles.editIcon}
                        >
                          <Icon
                            name={item.icon}
                            size={18}
                            color={colors.white}
                          />
                        </LinearGradient>
                      </View>
                      <Text style={styles.editLabel}>{item.label}</Text>
                      <Icon name='minus-circle' size={24} color={colors.red} />
                    </Pressable>
                  ))}
                </>
              )}

              {/* Unpinned section */}
              {unpinned.length > 0 && (
                <>
                  <Text style={[styles.editSectionLabel, { marginTop: 16 }]}>
                    Add to Super App
                  </Text>
                  {unpinned.map((item) => (
                    <Pressable
                      key={item.key}
                      style={({ pressed }) => [
                        styles.editRow,
                        pressed && { opacity: 0.7 },
                      ]}
                      onPress={() => togglePinned(item.key)}
                    >
                      <View style={styles.editIconWrap}>
                        <LinearGradient
                          colors={[item.color, item.color]}
                          style={styles.editIcon}
                        >
                          <Icon
                            name={item.icon}
                            size={18}
                            color={colors.white}
                          />
                        </LinearGradient>
                      </View>
                      <Text style={styles.editLabel}>{item.label}</Text>
                      <Icon name='plus-circle' size={24} color={colors.green} />
                    </Pressable>
                  ))}
                </>
              )}
            </View>
          )}
        </ScrollView>

        {/* Footer: navigate to More settings */}
        {!editMode && (
          <Pressable
            style={({ pressed }) => [
              styles.footer,
              pressed && { opacity: 0.6 },
            ]}
            onPress={() => {
              handleClose();
              setTimeout(() => router.push('/more' as any), 50);
            }}
          >
            <Icon name='cog-outline' size={15} color={colors.muted} />
            <Text style={styles.footerText}>More settings</Text>
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
    backgroundColor: 'rgba(74,46,18,0.72)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.cardAlt,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.85)',
    ...elevation.panel,
    maxHeight: '82%',
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
    color: colors.text,
    ...textShadow.emboss,
  },
  editBtn: {
    backgroundColor: colors.purple,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.pill,
    ...base3D(colors.purpleDeep, 3),
  },
  editBtnText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.textOnDark,
    ...textShadow.button,
  },
  scrollContent: {
    paddingBottom: 16,
  },

  /* Grid (normal mode) */
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: GRID_PADDING,
    gap: GRID_GAP,
    paddingTop: 12,
  },
  gridItem: {
    width: ITEM_WIDTH,
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
    gap: 8,
    ...elevation.card,
  },
  gridItemPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.95 }],
  },
  gridIconWrap: {
    ...base3D(colors.purpleDeep, 3),
    borderRadius: radius.md,
  },
  gridIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  gridLabel: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.text,
    textAlign: 'center',
  },

  /* Empty state */
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.muted,
    textAlign: 'center',
  },

  /* Footer */
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
    borderTopWidth: 2,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
    marginTop: 8,
  },
  footerText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.muted,
  },

  /* Edit mode */
  editList: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  editSectionLabel: {
    fontFamily: fonts.displayBold,
    fontSize: 13,
    color: colors.muted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 10,
    ...textShadow.emboss,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 10,
    ...elevation.card,
  },
  editIconWrap: {
    ...base3D(colors.purpleDeep, 2),
    borderRadius: radius.sm,
  },
  editIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  editLabel: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.text,
  },
});
