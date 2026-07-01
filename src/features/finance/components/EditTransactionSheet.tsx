import { useEffect, useMemo, useState } from 'react';
import { BlurView } from 'expo-blur';
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
import { colors, elevation, radius, tint } from '@/theme/colors';
import { Icon, type IconName } from '@/theme/icons';
import { fonts, textShadow } from '@/theme/typography';
import { PressableScale } from '@/components/motion';
import { GameButton, GameIconButton } from '@/components/game';
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
            <BlurView tint="light" intensity={46} style={StyleSheet.absoluteFill} />
            <View style={styles.handle} />

            <View style={styles.headerRow}>
              <Text style={styles.title}>Sửa giao dịch</Text>
              <GameIconButton
                icon='close'
                variant='red'
                size={36}
                iconSize={16}
                onPress={onClose}
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
                        {t === 'expense' ? 'Chi tiêu' : 'Thu nhập'}
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
                        style={[styles.chipText, selected && { color: colors.text }]}
                        numberOfLines={1}
                      >
                        {cat.name}
                      </Text>
                    </PressableScale>
                  );
                })}
              </ScrollView>

              {/* Date */}
              <Text style={[styles.label, { marginTop: 18 }]}>Ngày</Text>
              <PressableScale
                style={styles.dateRow}
                onPress={() => setDatePickerOpen(true)}
                haptic='light'
              >
                <Icon name='calendar' size={18} color={colors.muted} />
                <Text style={styles.dateLabel}>{dayLabel(date)}</Text>
                <Icon name='chevron-right' size={18} color={colors.muted} />
              </PressableScale>

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
              <GameButton
                label='Lưu thay đổi'
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
    backgroundColor: "rgba(24,32,51,0.72)",
  },
  kav: {
    width: '100%',
  },
  sheet: {
    backgroundColor: "rgba(244,248,255,0.92)",
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
  chipText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.muted,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.track,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginBottom: 18,
    gap: 10,
  },
  dateLabel: {
    flex: 1,
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
