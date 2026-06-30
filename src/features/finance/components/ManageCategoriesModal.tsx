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

import { colors, tint } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { Icon } from '@/theme/icons';
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
const COMMON_COLORS = [
  colors.orange,
  colors.teal,
  colors.purple,
  colors.red,
  '#3498db',
  '#e84393',
  '#f1c40f',
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
            <View style={styles.grabber} />
            <Text style={styles.heading}>Manage Categories</Text>

            {editingId ? (
              <View style={styles.editPane}>
                <Pressable
                  onPress={() => setEditingId(null)}
                  style={styles.backBtn}
                >
                  <Icon name='arrow-left' size={20} color={colors.text} />
                  <Text style={styles.backText}>Back</Text>
                </Pressable>

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
                  contentContainerStyle={{ gap: 8 }}
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
                  contentContainerStyle={{ gap: 8 }}
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

                <Pressable
                  style={[styles.saveBtn, !canSave && { opacity: 0.5 }]}
                  onPress={handleSave}
                  disabled={!canSave}
                >
                  <Text style={styles.saveBtnText}>Save Category</Text>
                </Pressable>
              </View>
            ) : (
              <ScrollView style={{ marginTop: 10, maxHeight: 400 }}>
                {categories.map((c) => (
                  <View key={c.id} style={styles.row}>
                    <View
                      style={[
                        styles.iconBox,
                        { backgroundColor: tint(c.color) },
                      ]}
                    >
                      <Icon name={c.icon as any} size={18} color={c.color} />
                    </View>
                    <Text style={styles.rowText}>{c.name}</Text>
                    <Pressable
                      onPress={() => handleEdit(c)}
                      style={styles.actionBtn}
                    >
                      <Icon name='pencil' size={16} color={colors.muted} />
                    </Pressable>
                    <Pressable
                      onPress={() => handleDelete(c.id)}
                      style={[styles.actionBtn, { marginLeft: 8 }]}
                    >
                      <Icon
                        name='trash-can-outline'
                        size={16}
                        color={colors.red}
                      />
                    </Pressable>
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
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  backdropFill: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderColor: colors.border,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 34,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: 16,
  },
  heading: {
    fontFamily: fonts.semibold,
    fontSize: 20,
    color: colors.text,
    letterSpacing: -0.3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  rowText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.text,
  },
  actionBtn: {
    padding: 8,
  },
  editPane: {
    marginTop: 16,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  backText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.text,
  },
  input: {
    backgroundColor: colors.screenBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
    marginBottom: 16,
  },
  fieldLabel: {
    fontFamily: fonts.monoSemibold,
    fontSize: 11,
    color: colors.muted,
    marginBottom: 8,
  },
  iconChoice: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: colors.screenBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  colorChoice: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 24,
  },
  saveBtn: {
    backgroundColor: colors.purple,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtnText: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.white,
  },
});
