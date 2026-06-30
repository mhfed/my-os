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

import { colors, tint } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { Icon, type IconName } from '@/theme/icons';
import {
  useSettingsStore,
  type SuperAppItemKey,
} from '@/store/settingsStore';

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
            <Text style={styles.editBtnText}>
              {editMode ? 'Done' : 'Edit'}
            </Text>
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
                      <View
                        style={[
                          styles.gridIcon,
                          { backgroundColor: tint(item.color, '26') },
                        ]}
                      >
                        <Icon name={item.icon} size={28} color={item.color} />
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
                      <View
                        style={[
                          styles.editIcon,
                          { backgroundColor: tint(item.color) },
                        ]}
                      >
                        <Icon name={item.icon} size={18} color={item.color} />
                      </View>
                      <Text style={styles.editLabel}>{item.label}</Text>
                      <Icon
                        name='minus-circle'
                        size={22}
                        color={colors.red}
                      />
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
                      <View
                        style={[
                          styles.editIcon,
                          { backgroundColor: tint(item.color) },
                        ]}
                      >
                        <Icon name={item.icon} size={18} color={item.color} />
                      </View>
                      <Text style={styles.editLabel}>{item.label}</Text>
                      <Icon
                        name='plus-circle-outline'
                        size={22}
                        color={colors.teal}
                      />
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
            style={({ pressed }) => [styles.footer, pressed && { opacity: 0.6 }]}
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
    backgroundColor: 'rgba(5,5,7,0.78)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: '82%',
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 18,
    color: colors.text,
    letterSpacing: -0.3,
  },
  editBtn: {
    backgroundColor: colors.track,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  editBtnText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.purple,
  },
  scrollContent: {
    paddingBottom: 12,
  },

  /* Grid (normal mode) */
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: GRID_PADDING,
    gap: GRID_GAP,
    paddingTop: 4,
  },
  gridItem: {
    width: ITEM_WIDTH,
    alignItems: 'center',
    paddingVertical: 18,
    backgroundColor: colors.track,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  gridItemPressed: {
    opacity: 0.65,
    transform: [{ scale: 0.96 }],
  },
  gridIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridLabel: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
  },

  /* Empty state */
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
  },

  /* Footer */
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: colors.track,
  },
  footerText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.muted,
  },

  /* Edit mode */
  editList: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  editSectionLabel: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.muted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.track,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  editIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editLabel: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.text,
  },
});
