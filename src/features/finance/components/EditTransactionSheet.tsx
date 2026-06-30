import { useEffect, useMemo, useState } from 'react';
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

import { DatePickerModal } from '@/components/DatePickerModal';
import { useFinanceStore } from '@/store/financeStore';
import { colors, tint } from '@/theme/colors';
import { Icon, type IconName } from '@/theme/icons';
import { fonts } from '@/theme/typography';
import type { TransactionView, TxnType } from '@/types/finance';

interface EditTransactionSheetProps {
  txn: TransactionView | null;
  onClose: () => void;
}

function parseAmount(raw: string): number {
  const digits = raw.replace(/[^0-9]/g, '');
  if (!digits) return 0;
  return parseInt(digits, 10);
}

function groupDigits(amount: number): string {
  return amount > 0 ? amount.toLocaleString('en-US') : '';
}

function todayStart(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function dayLabel(epochMs: number): string {
  const today = todayStart();
  const yesterday = today - 86_400_000;
  if (epochMs >= today) return 'Hôm nay';
  if (epochMs >= yesterday) return 'Hôm qua';
  const d = new Date(epochMs);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

export function EditTransactionSheet({ txn, onClose }: EditTransactionSheetProps) {
  const insets = useSafeAreaInsets();
  const allCategories = useFinanceStore((s) => s.categories);
  const transactions = useFinanceStore((s) => s.transactions);
  const updateTransaction = useFinanceStore((s) => s.updateTransaction);

  const [type, setType] = useState<TxnType>('expense');
  const [amountText, setAmountText] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(todayStart);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const visible = txn !== null;

  // Reset state when a new txn is provided
  useEffect(() => {
    if (!txn) return;
    // Find original transaction to get categoryId
    const original = transactions.find((t) => t.id === txn.id);
    setType(txn.type);
    setAmountText(txn.amount > 0 ? String(txn.amount) : '');
    setCategoryId(original?.categoryId ?? null);
    setNote(original?.note ?? '');
    // Normalize date to start of day for display
    const d = new Date(txn.date);
    d.setHours(0, 0, 0, 0);
    setDate(d.getTime());
  }, [txn?.id]);

  const amount = parseAmount(amountText);

  const categories = useMemo(
    () => allCategories.filter((c) => c.type === type),
    [allCategories, type],
  );

  function switchType(next: TxnType) {
    if (next === type) return;
    setType(next);
    setCategoryId(null);
  }

  async function handleSubmit() {
    if (!txn || amount <= 0 || !categoryId) return;
    // Use noon of the selected day so the transaction falls clearly within that day
    const txnDate = date + 12 * 3_600_000;
    await updateTransaction(txn.id, {
      amount,
      type,
      categoryId,
      note: note.trim() || undefined,
      date: txnDate,
    });
    onClose();
  }

  const canSubmit = amount > 0 && !!categoryId;

  return (
    <Modal
      visible={visible}
      transparent
      animationType='slide'
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.kav}
        >
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 18 }]}>
            <View style={styles.handle} />

            <View style={styles.headerRow}>
              <Text style={styles.title}>Sửa giao dịch</Text>
              <Pressable hitSlop={10} onPress={onClose} style={styles.closeBtn}>
                <Icon name='close' size={18} color={colors.muted} />
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps='handled'
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
                        style={[styles.segmentText, active && styles.segmentTextActive]}
                      >
                        {t === 'expense' ? 'Chi tiêu' : 'Thu nhập'}
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
                  keyboardType='number-pad'
                  placeholder='0'
                  placeholderTextColor={colors.tabInactive}
                  style={styles.amountInput}
                  autoFocus
                />
              </View>

              {/* Category */}
              <Text style={styles.label}>Danh mục</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chips}
                keyboardShouldPersistTaps='handled'
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
                        style={[styles.chipText, selected && { color: colors.text }]}
                        numberOfLines={1}
                      >
                        {cat.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Date */}
              <Text style={[styles.label, { marginTop: 18 }]}>Ngày</Text>
              <Pressable
                style={styles.dateRow}
                onPress={() => setDatePickerOpen(true)}
              >
                <Icon name='calendar' size={18} color={colors.muted} />
                <Text style={styles.dateLabel}>{dayLabel(date)}</Text>
                <Icon name='chevron-right' size={18} color={colors.muted} />
              </Pressable>

              {/* Note */}
              <Text style={styles.label}>Ghi chú</Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder='Tuỳ chọn'
                placeholderTextColor={colors.tabInactive}
                style={styles.noteInput}
              />

              {/* Submit */}
              <Pressable
                onPress={handleSubmit}
                disabled={!canSubmit}
                style={[styles.submit, !canSubmit && styles.disabled]}
              >
                <Text style={styles.submitText}>Lưu thay đổi</Text>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>

      <DatePickerModal
        visible={datePickerOpen}
        value={date}
        onSelect={(ms) => setDate(ms)}
        onClose={() => setDatePickerOpen(false)}
        maxDate={Date.now()}
      />
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
  chipText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.muted,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 18,
    gap: 10,
  },
  dateLabel: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.text,
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
