import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, tint } from '@/theme/colors';
import { Icon, type IconName } from '@/theme/icons';
import { useFinanceStore } from '@/store/financeStore';
import { fonts } from '@/theme/typography';
import type { TxnType } from '@/types/finance';

interface AddTransactionSheetProps {
  visible: boolean;
  onClose: () => void;
}

/** App palette swatches offered when creating a new category inline. */
const PALETTE = [
  colors.purple,
  colors.teal,
  colors.orange,
  colors.red,
] as const;

/** Default MCI glyph for a freshly-created category. */
const DEFAULT_ICON: IconName = 'tag';

/** Parse free-typed digits into a positive integer VND amount. */
function parseAmount(raw: string): number {
  const digits = raw.replace(/[^0-9]/g, '');
  if (!digits) return 0;
  return parseInt(digits, 10);
}

/** Group the digits for display: "1234567" → "1,234,567". */
function groupDigits(amount: number): string {
  return amount > 0 ? amount.toLocaleString('en-US') : '';
}

/**
 * Slide-up modal to record a transaction in ≤3 taps (PRD §3.2 "Ghi giao dịch
 * nhanh"). Type toggle filters the category chips; an inline "+ New" row creates
 * a category on the fly.
 */
export function AddTransactionSheet({
  visible,
  onClose,
}: AddTransactionSheetProps) {
  const insets = useSafeAreaInsets();
  const allCategories = useFinanceStore((s) => s.categories);
  const addTransaction = useFinanceStore((s) => s.addTransaction);
  const addCategory = useFinanceStore((s) => s.addCategory);

  const [type, setType] = useState<TxnType>('expense');
  const [amountText, setAmountText] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [note, setNote] = useState('');

  // inline add-category state
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState<string>(PALETTE[0]);

  const amount = parseAmount(amountText);

  const categories = useMemo(
    () => allCategories.filter((c) => c.type === type),
    [allCategories, type]
  );

  function reset() {
    setType('expense');
    setAmountText('');
    setCategoryId(null);
    setNote('');
    setAdding(false);
    setNewName('');
    setNewColor(PALETTE[0]);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function switchType(next: TxnType) {
    if (next === type) return;
    setType(next);
    setCategoryId(null);
    setAdding(false);
  }

  async function handleAddCategory() {
    const name = newName.trim();
    if (!name) return;
    const before = new Set(useFinanceStore.getState().categories.map((c) => c.id));
    await addCategory({
      name,
      type,
      color: newColor,
      icon: DEFAULT_ICON,
    });
    const created = useFinanceStore
      .getState()
      .categories.find((c) => !before.has(c.id));
    if (created) setCategoryId(created.id);
    setAdding(false);
    setNewName('');
    setNewColor(PALETTE[0]);
  }

  async function handleSubmit() {
    if (amount <= 0 || !categoryId) return;
    await addTransaction({
      type,
      amount,
      categoryId,
      note: note.trim() || undefined,
      date: Date.now(),
    });
    handleClose();
  }

  const canSubmit = amount > 0 && !!categoryId;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={handleClose} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.kav}
        >
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 18 }]}>
            <View style={styles.handle} />

            <View style={styles.headerRow}>
              <Text style={styles.title}>Add transaction</Text>
              <Pressable
                hitSlop={10}
                onPress={handleClose}
                style={styles.closeBtn}
              >
                <Icon name="close" size={18} color={colors.muted} />
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Type toggle */}
              <View style={styles.segment}>
                {(['expense', 'income'] as const).map((t) => {
                  const active = type === t;
                  return (
                    <Pressable
                      key={t}
                      onPress={() => switchType(t)}
                      style={[styles.segmentBtn, active && styles.segmentBtnActive]}
                    >
                      <Text
                        style={[
                          styles.segmentText,
                          active && styles.segmentTextActive,
                        ]}
                      >
                        {t === 'expense' ? 'Expense' : 'Income'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Amount */}
              <View style={styles.amountWrap}>
                <Text style={styles.dong}>₫</Text>
                <TextInput
                  value={groupDigits(amount)}
                  onChangeText={setAmountText}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={colors.tabInactive}
                  style={styles.amountInput}
                  autoFocus
                />
              </View>

              {/* Category */}
              <Text style={styles.label}>Category</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chips}
                keyboardShouldPersistTaps="handled"
              >
                {categories.map((cat) => {
                  const selected = cat.id === categoryId;
                  return (
                    <Pressable
                      key={cat.id}
                      onPress={() => setCategoryId(cat.id)}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: selected
                            ? tint(cat.color, '2E')
                            : colors.card,
                          borderColor: selected ? cat.color : colors.border,
                        },
                      ]}
                    >
                      <Icon
                        name={cat.icon as IconName}
                        size={16}
                        color={cat.color}
                      />
                      <Text
                        style={[
                          styles.chipText,
                          selected && { color: colors.text },
                        ]}
                        numberOfLines={1}
                      >
                        {cat.name}
                      </Text>
                    </Pressable>
                  );
                })}

                <Pressable
                  onPress={() => setAdding((v) => !v)}
                  style={[styles.chip, styles.newChip]}
                >
                  <Icon name="plus" size={16} color={colors.purple} />
                  <Text style={[styles.chipText, { color: colors.purple }]}>
                    New
                  </Text>
                </Pressable>
              </ScrollView>

              {/* Inline add-category row */}
              {adding && (
                <View style={styles.addRow}>
                  <TextInput
                    value={newName}
                    onChangeText={setNewName}
                    placeholder="New category name"
                    placeholderTextColor={colors.tabInactive}
                    style={styles.addInput}
                    autoFocus
                  />
                  <View style={styles.swatches}>
                    {PALETTE.map((c) => {
                      const picked = c === newColor;
                      return (
                        <Pressable
                          key={c}
                          onPress={() => setNewColor(c)}
                          style={[
                            styles.swatch,
                            { backgroundColor: c },
                            picked && styles.swatchPicked,
                          ]}
                        />
                      );
                    })}
                  </View>
                  <Pressable
                    onPress={handleAddCategory}
                    disabled={!newName.trim()}
                    style={[
                      styles.addBtn,
                      !newName.trim() && styles.disabled,
                    ]}
                  >
                    <Icon name="check" size={18} color={colors.white} />
                  </Pressable>
                </View>
              )}

              {/* Note */}
              <Text style={styles.label}>Note</Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Optional"
                placeholderTextColor={colors.tabInactive}
                style={styles.noteInput}
              />

              {/* Submit */}
              <Pressable
                onPress={handleSubmit}
                disabled={!canSubmit}
                style={[styles.submit, !canSubmit && styles.disabled]}
              >
                <Text style={styles.submitText}>Add</Text>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  kav: {
    width: '100%',
  },
  sheet: {
    backgroundColor: colors.screenBg,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 20,
    paddingTop: 10,
    maxHeight: '88%',
  },
  handle: {
    alignSelf: 'center',
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 17,
    color: colors.text,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
    gap: 4,
    marginBottom: 22,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  segmentBtnActive: {
    backgroundColor: colors.purple,
  },
  segmentText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.muted,
  },
  segmentTextActive: {
    color: colors.white,
  },
  amountWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 24,
  },
  dong: {
    fontFamily: fonts.monoMedium,
    fontSize: 30,
    color: colors.muted,
  },
  amountInput: {
    fontFamily: fonts.monoSemibold,
    fontSize: 40,
    color: colors.text,
    minWidth: 60,
    padding: 0,
    textAlign: 'center',
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.muted,
    marginBottom: 10,
  },
  chips: {
    gap: 9,
    paddingRight: 4,
    paddingBottom: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
  },
  newChip: {
    backgroundColor: tint(colors.purple, '1A'),
    borderColor: colors.purple,
    borderStyle: 'dashed',
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.muted,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    padding: 10,
  },
  addInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
    padding: 0,
  },
  swatches: {
    flexDirection: 'row',
    gap: 6,
  },
  swatch: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchPicked: {
    borderColor: colors.white,
  },
  addBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteInput: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 20,
    marginBottom: 24,
  },
  submit: {
    backgroundColor: colors.purple,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  submitText: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.white,
  },
  disabled: {
    opacity: 0.4,
  },
});
