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

import { colors, elevation, radius, tint } from '@/theme/colors';
import { Icon, type IconName } from '@/theme/icons';
import { useFinanceStore } from '@/store/financeStore';
import { fonts, textShadow } from '@/theme/typography';
import { PressableScale } from '@/components/motion';
import { GameButton, GameIconButton } from '@/components/game';
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

/** Epoch ms of today at midnight (local time). */
function todayStart(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Human-readable label for a date epoch: "Hôm nay", "Hôm qua", "27/6". */
function dayLabel(epochMs: number): string {
  const today = todayStart();
  const yesterday = today - 86_400_000;
  if (epochMs >= today) return 'Hôm nay';
  if (epochMs >= yesterday) return 'Hôm qua';
  const d = new Date(epochMs);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

/**
 * Slide-up modal to record a transaction in ≤3 taps (PRD §3.2 "Ghi giao dịch
 * nhanh"). Type toggle filters the category chips; an inline "+ New" row creates
 * a category on the fly.
 */
import { ManageCategoriesModal } from './ManageCategoriesModal';

export function AddTransactionSheet({
  visible,
  onClose,
}: AddTransactionSheetProps) {
  const insets = useSafeAreaInsets();
  const allCategories = useFinanceStore((s) => s.categories);
  const addTransaction = useFinanceStore((s) => s.addTransaction);
  const addCategory = useFinanceStore((s) => s.addCategory);

  const [type, setType] = useState<TxnType>('expense');
  const [manageCategoriesOpen, setManageCategoriesOpen] = useState(false);
  const [amountText, setAmountText] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(todayStart);

  // inline add-category state
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState<string>(PALETTE[0]);

  const amount = parseAmount(amountText);

  const categories = useMemo(
    () => allCategories.filter((c) => c.type === type),
    [allCategories, type],
  );

  function reset() {
    setType('expense');
    setAmountText('');
    setCategoryId(null);
    setNote('');
    setDate(todayStart());
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
    const before = new Set(
      useFinanceStore.getState().categories.map((c) => c.id),
    );
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

  const today = todayStart();
  const isToday = date >= today;

  function prevDay() {
    setDate((d) => d - 86_400_000);
  }
  function nextDay() {
    setDate((d) => Math.min(d + 86_400_000, today));
  }

  async function handleSubmit() {
    if (amount <= 0 || !categoryId) return;
    // Use noon of the selected day so the transaction falls clearly within that day
    const txnDate = date + 12 * 3_600_000;
    await addTransaction({
      type,
      amount,
      categoryId,
      note: note.trim() || undefined,
      date: txnDate,
    });
    handleClose();
  }

  const canSubmit = amount > 0 && !!categoryId;

  return (
    <Modal
      visible={visible}
      transparent
      animationType='slide'
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
              <GameIconButton
                icon='close'
                variant='red'
                size={36}
                iconSize={16}
                onPress={handleClose}
              />
            </View>

            <ScrollView
              keyboardShouldPersistTaps='handled'
              showsVerticalScrollIndicator={false}
            >
              {/* Type toggle */}
              <View style={styles.segment}>
                {(['expense', 'income'] as const).map((t) => {
                  const active = type === t;
                  const activeVariantColor =
                    t === 'expense' ? colors.red : colors.green;
                  const activeVariantDeep =
                    t === 'expense' ? colors.redDeep : colors.greenDeep;
                  return (
                    <PressableScale
                      key={t}
                      onPress={() => switchType(t)}
                      haptic='selection'
                      style={[
                        styles.segmentBtn,
                        active && {
                          backgroundColor: activeVariantColor,
                          borderColor: activeVariantDeep,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.segmentText,
                          active && styles.segmentTextActive,
                        ]}
                      >
                        {t === 'expense' ? 'Expense' : 'Income'}
                      </Text>
                    </PressableScale>
                  );
                })}
              </View>

              {/* Amount */}
              <View style={styles.amountWrap}>
                <Text style={styles.dong}>₫</Text>
                <TextInput
                  value={groupDigits(amount)}
                  onChangeText={setAmountText}
                  keyboardType='number-pad'
                  placeholder='0'
                  placeholderTextColor={colors.tabInactive}
                  style={styles.amountInput}
                  autoFocus
                />
              </View>

              {/* Category */}
              <View style={styles.fieldHeaderRow}>
                <Text style={styles.label}>Category</Text>
                <Pressable onPress={() => setManageCategoriesOpen(true)}>
                  <Text style={styles.manageText}>Manage</Text>
                </Pressable>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chips}
                keyboardShouldPersistTaps='handled'
              >
                {categories.map((cat) => {
                  const selected = cat.id === categoryId;
                  return (
                    <PressableScale
                      key={cat.id}
                      onPress={() => setCategoryId(cat.id)}
                      haptic='selection'
                      style={[
                        styles.chip,
                        {
                          backgroundColor: selected
                            ? tint(cat.color, '2E')
                            : colors.white,
                          borderColor: selected ? cat.color : colors.track,
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
                    </PressableScale>
                  );
                })}

                <PressableScale
                  onPress={() => setAdding((v) => !v)}
                  haptic='light'
                  style={[styles.chip, styles.newChip]}
                >
                  <Icon name='plus' size={16} color={colors.purple} />
                  <Text style={[styles.chipText, { color: colors.purple }]}>
                    New
                  </Text>
                </PressableScale>
              </ScrollView>

              {/* Inline add-category row */}
              {adding && (
                <View style={styles.addRow}>
                  <TextInput
                    value={newName}
                    onChangeText={setNewName}
                    placeholder='New category name'
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
                  <GameIconButton
                    icon='check'
                    variant='green'
                    size={36}
                    iconSize={16}
                    onPress={handleAddCategory}
                    disabled={!newName.trim()}
                    style={!newName.trim() ? styles.disabled : undefined}
                  />
                </View>
              )}

              {/* Date */}
              <Text style={[styles.label, { marginTop: 18 }]}>Date</Text>
              <View style={styles.dateRow}>
                <Pressable onPress={prevDay} style={styles.dateArrow} hitSlop={8}>
                  <Icon name='chevron-left' size={18} color={colors.muted} />
                </Pressable>
                <Text style={styles.dateLabel}>{dayLabel(date)}</Text>
                <Pressable
                  onPress={nextDay}
                  style={styles.dateArrow}
                  disabled={isToday}
                  hitSlop={8}
                >
                  <Icon
                    name='chevron-right'
                    size={18}
                    color={isToday ? colors.tabInactive : colors.muted}
                  />
                </Pressable>
              </View>

              {/* Note */}
              <Text style={styles.label}>Note</Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder='Optional'
                placeholderTextColor={colors.tabInactive}
                style={styles.noteInput}
              />

              {/* Submit */}
              <GameButton
                label='Add'
                variant={type === 'income' ? 'green' : 'gem'}
                size='md'
                fullWidth
                disabled={!canSubmit}
                style={!canSubmit ? styles.disabled : undefined}
                onPress={handleSubmit}
              />
              <View style={{ height: 8 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
      <ManageCategoriesModal
        visible={manageCategoriesOpen}
        onClose={() => setManageCategoriesOpen(false)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  fieldHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  manageText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.purple,
    marginBottom: 8,
  },
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(74,46,18,0.72)',
  },
  kav: {
    width: '100%',
  },
  sheet: {
    backgroundColor: colors.cardAlt,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.85)',
    ...elevation.panel,
    paddingHorizontal: 20,
    paddingTop: 10,
    maxHeight: '88%',
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
    marginBottom: 18,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: colors.text,
    ...textShadow.emboss,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.track,
    padding: 4,
    gap: 4,
    marginBottom: 22,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.pill,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  segmentText: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.muted,
  },
  segmentTextActive: {
    fontFamily: fonts.displayBold,
    color: colors.white,
    ...textShadow.button,
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
    fontFamily: fonts.semibold,
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
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
    borderWidth: 2,
  },
  newChip: {
    backgroundColor: tint(colors.purple, '1A'),
    borderColor: colors.purple,
    borderStyle: 'dashed',
  },
  chipText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.muted,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.track,
    borderRadius: radius.lg,
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
    borderColor: colors.text,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.track,
    borderRadius: radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 10,
    marginBottom: 18,
    gap: 4,
  },
  dateArrow: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateLabel: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.text,
  },
  noteInput: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.track,
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 24,
  },
  disabled: {
    opacity: 0.4,
  },
});
