import { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { BlurView } from 'expo-blur';
import { colors, elevation, radius } from '@/theme/colors';
import { fonts, textShadow } from '@/theme/typography';
import { Icon } from '@/theme/icons';
import { PressableScale } from '@/components/motion';
import { GameButton, GameIconButton, IconBadge } from '@/components/game';
import { useFinanceStore } from '@/store/financeStore';
import type { Category } from '@/types/finance';

interface ManageCategoriesModalProps {
  visible: boolean;
  onClose: () => void;
}

const COMMON_ICONS = [
  'food',
  'car',
  'shopping',
  'home',
  'movie-open',
  'gift',
  'heart',
  'airplane',
];
const COMMON_COLORS: string[] = [
  colors.orange,
  colors.teal,
  colors.purple,
  colors.red,
  colors.blue,
  colors.pink,
  colors.yellow,
];

export function ManageCategoriesModal({
  visible,
  onClose,
}: ManageCategoriesModalProps) {
  const categories = useFinanceStore((s) => s.categories);
  const updateCategory = useFinanceStore((s) => s.updateCategory);
  const deleteCategory = useFinanceStore((s) => s.deleteCategory);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(COMMON_ICONS[0]);
  const [color, setColor] = useState(COMMON_COLORS[0]);

  const canSave = name.trim().length > 0;

  function handleEdit(c: Category) {
    setEditingId(c.id);
    setName(c.name);
    setIcon(c.icon);
    setColor(c.color);
  }

  async function handleSave() {
    if (!canSave || !editingId) return;
    await updateCategory(editingId, { name: name.trim(), icon, color });
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    await deleteCategory(id);
    if (editingId === id) setEditingId(null);
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType='slide'
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropFill} onPress={onClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.sheet}>
            <BlurView tint="light" intensity={46} style={StyleSheet.absoluteFill} />
            <View style={styles.handle} />
            <View style={styles.headerRow}>
              <Text style={styles.heading}>Manage Categories</Text>
              <GameIconButton
                icon='close'
                variant='red'
                size={36}
                iconSize={16}
                onPress={onClose}
              />
            </View>

            {editingId ? (
              <View style={styles.editPane}>
                <PressableScale
                  onPress={() => setEditingId(null)}
                  haptic='light'
                  style={styles.backBtn}
                >
                  <Icon name='arrow-left' size={20} color={colors.text} />
                  <Text style={styles.backText}>Back</Text>
                </PressableScale>

                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder='Category Name'
                  placeholderTextColor={colors.muted}
                />

                <Text style={styles.fieldLabel}>ICON</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.choiceRow}
                >
                  {COMMON_ICONS.map((ic) => (
                    <Pressable
                      key={ic}
                      onPress={() => setIcon(ic)}
                      style={[
                        styles.iconChoice,
                        icon === ic && { borderColor: color },
                      ]}
                    >
                      <Icon
                        name={ic as any}
                        size={20}
                        color={icon === ic ? color : colors.muted}
                      />
                    </Pressable>
                  ))}
                </ScrollView>

                <Text style={styles.fieldLabel}>COLOR</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.choiceRow}
                >
                  {COMMON_COLORS.map((c) => (
                    <Pressable
                      key={c}
                      onPress={() => setColor(c)}
                      style={[
                        styles.colorChoice,
                        { backgroundColor: c },
                        color === c && { borderColor: colors.text },
                      ]}
                    />
                  ))}
                </ScrollView>

                <GameButton
                  label='Save Category'
                  variant='purple'
                  size='md'
                  fullWidth
                  disabled={!canSave}
                  style={!canSave ? styles.disabled : undefined}
                  onPress={handleSave}
                />
              </View>
            ) : (
              <ScrollView style={styles.list}>
                {categories.map((c) => (
                  <View key={c.id} style={styles.row}>
                    <IconBadge icon={c.icon as any} color={c.color} size={36} iconSize={18} />
                    <Text style={styles.rowText} numberOfLines={1}>
                      {c.name}
                    </Text>
                    <GameIconButton
                      icon='pencil'
                      variant='blue'
                      size={34}
                      iconSize={15}
                      onPress={() => handleEdit(c)}
                      style={styles.rowActionBtn}
                    />
                    <GameIconButton
                      icon='trash-can-outline'
                      variant='red'
                      size={34}
                      iconSize={15}
                      onPress={() => handleDelete(c.id)}
                      style={styles.rowActionBtn}
                    />
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(24,32,51,0.72)',
  },
  backdropFill: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: 'rgba(244,248,255,0.92)',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.85)',
    ...elevation.panel,
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 34,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  heading: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: colors.text,
    ...textShadow.emboss,
  },
  list: {
    marginTop: 10,
    maxHeight: 400,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
    borderRadius: radius.md,
    padding: 10,
    marginBottom: 10,
    ...elevation.card,
  },
  rowText: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.text,
  },
  rowActionBtn: {
    marginLeft: 2,
  },
  editPane: {
    marginTop: 8,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  backText: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.text,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.track,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
    marginBottom: 16,
  },
  fieldLabel: {
    fontFamily: fonts.displayBold,
    fontSize: 11,
    color: colors.muted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  choiceRow: {
    gap: 8,
    paddingBottom: 4,
  },
  iconChoice: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  colorChoice: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 24,
  },
  disabled: {
    opacity: 0.4,
  },
});
