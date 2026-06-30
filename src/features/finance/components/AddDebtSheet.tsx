import { useState } from 'react';
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
import { Icon } from '@/theme/icons';
import { fonts } from '@/theme/typography';
import { useDebtStore } from '@/store/debtStore';
import { DatePickerModal } from '@/components/DatePickerModal';
import type { DebtType, InterestPeriod, InterestType } from '@/types/debt';

interface AddDebtSheetProps {
  visible: boolean;
  onClose: () => void;
}

function todayStart(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function dayLabel(epochMs: number): string {
  const today = todayStart();
  const tomorrow = today + 86_400_000;
  if (epochMs >= tomorrow) {
    const d = new Date(epochMs);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  }
  if (epochMs >= today) return 'Hôm nay';
  if (epochMs >= today - 86_400_000) return 'Hôm qua';
  const d = new Date(epochMs);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

function parseAmount(raw: string): number {
  const digits = raw.replace(/[^0-9]/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

function groupDigits(n: number): string {
  return n > 0 ? n.toLocaleString('en-US') : '';
}

const INTEREST_TYPES: { key: InterestType; label: string }[] = [
  { key: 'none', label: 'Không lãi' },
  { key: 'simple', label: 'Lãi đơn' },
  { key: 'compound', label: 'Lãi kép' },
];

export function AddDebtSheet({ visible, onClose }: AddDebtSheetProps) {
  const insets = useSafeAreaInsets();
  const addDebt = useDebtStore((s) => s.addDebt);

  const [type, setType] = useState<DebtType>('lend');
  const [party, setParty] = useState('');
  const [amountText, setAmountText] = useState('');
  const [note, setNote] = useState('');
  const [startDate, setStartDate] = useState(todayStart);
  const [hasDueDate, setHasDueDate] = useState(false);
  const [dueDate, setDueDate] = useState(() => todayStart() + 30 * 86_400_000);
  const [interestType, setInterestType] = useState<InterestType>('none');
  const [interestRateText, setInterestRateText] = useState('');
  const [interestPeriod, setInterestPeriod] = useState<InterestPeriod>('month');
  const [showInterest, setShowInterest] = useState(false);
  const [startPickerOpen, setStartPickerOpen] = useState(false);
  const [duePickerOpen, setDuePickerOpen] = useState(false);

  const amount = parseAmount(amountText);
  const today = todayStart();
  const canSubmit = amount > 0 && party.trim().length > 0;

  function reset() {
    setType('lend');
    setParty('');
    setAmountText('');
    setNote('');
    setStartDate(todayStart());
    setHasDueDate(false);
    setDueDate(todayStart() + 30 * 86_400_000);
    setInterestType('none');
    setInterestRateText('');
    setInterestPeriod('month');
    setShowInterest(false);
    setStartPickerOpen(false);
    setDuePickerOpen(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    const interestRate = parseFloat(interestRateText) || undefined;
    await addDebt({
      type,
      party: party.trim(),
      originalAmount: amount,
      note: note.trim() || undefined,
      startDate: startDate + 12 * 3_600_000,
      dueDate: hasDueDate ? dueDate + 12 * 3_600_000 : undefined,
      interestType,
      interestRate: interestType !== 'none' ? interestRate : undefined,
      interestPeriod: interestType !== 'none' ? interestPeriod : undefined,
    });
    handleClose();
  }

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
              <Text style={styles.title}>Thêm khoản nợ</Text>
              <Pressable onPress={handleClose} style={styles.closeBtn} hitSlop={10}>
                <Icon name='close' size={18} color={colors.muted} />
              </Pressable>
            </View>

            <ScrollView keyboardShouldPersistTaps='handled' showsVerticalScrollIndicator={false}>
              {/* Type toggle */}
              <View style={styles.segment}>
                {(['lend', 'borrow'] as const).map((t) => {
                  const active = type === t;
                  return (
                    <Pressable
                      key={t}
                      onPress={() => setType(t)}
                      style={[styles.segmentBtn, active && styles.segmentBtnActive]}
                    >
                      <Icon
                        name={t === 'lend' ? 'hand-coin' : 'bank-outline'}
                        size={16}
                        color={active ? colors.white : colors.muted}
                      />
                      <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                        {t === 'lend' ? 'Tôi cho vay' : 'Tôi đi vay'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Party name */}
              <Text style={styles.label}>Tên người / tổ chức</Text>
              <TextInput
                value={party}
                onChangeText={setParty}
                placeholder={type === 'lend' ? 'Nguyễn A' : 'VPBank'}
                placeholderTextColor={colors.tabInactive}
                style={styles.input}
                autoCapitalize='words'
              />

              {/* Amount */}
              <Text style={styles.label}>Số tiền</Text>
              <View style={styles.amountWrap}>
                <Text style={styles.dong}>₫</Text>
                <TextInput
                  value={groupDigits(amount)}
                  onChangeText={setAmountText}
                  keyboardType='number-pad'
                  placeholder='0'
                  placeholderTextColor={colors.tabInactive}
                  style={styles.amountInput}
                />
              </View>

              {/* Start date */}
              <Text style={styles.label}>Ngày phát sinh</Text>
              <Pressable style={styles.dateRow} onPress={() => setStartPickerOpen(true)}>
                <Icon name='calendar' size={16} color={colors.muted} />
                <Text style={styles.dateLabel}>{dayLabel(startDate)}</Text>
                <Icon name='chevron-right' size={14} color={colors.tabInactive} />
              </Pressable>

              {/* Due date */}
              <View style={styles.dueDateHeader}>
                <Text style={styles.label}>Ngày đến hạn</Text>
                <Pressable
                  onPress={() => setHasDueDate((v) => !v)}
                  style={[styles.toggle, hasDueDate && styles.toggleOn]}
                >
                  <View style={[styles.toggleThumb, hasDueDate && styles.toggleThumbOn]} />
                </Pressable>
              </View>
              {hasDueDate && (
                <Pressable style={styles.dateRow} onPress={() => setDuePickerOpen(true)}>
                  <Icon name='calendar-clock' size={16} color={colors.muted} />
                  <Text style={styles.dateLabel}>{dayLabel(dueDate)}</Text>
                  <Icon name='chevron-right' size={14} color={colors.tabInactive} />
                </Pressable>
              )}

              {/* Interest */}
              <Pressable
                onPress={() => setShowInterest((v) => !v)}
                style={styles.interestToggleRow}
              >
                <Icon name='percent' size={14} color={colors.muted} />
                <Text style={styles.interestToggleText}>
                  {showInterest ? 'Ẩn lãi suất' : 'Thêm lãi suất (tùy chọn)'}
                </Text>
                <Icon name={showInterest ? 'chevron-up' : 'chevron-down'} size={14} color={colors.muted} />
              </Pressable>

              {showInterest && (
                <View style={styles.interestBox}>
                  <View style={styles.interestTypeRow}>
                    {INTEREST_TYPES.map((it) => {
                      const active = interestType === it.key;
                      return (
                        <Pressable
                          key={it.key}
                          onPress={() => setInterestType(it.key)}
                          style={[styles.interestChip, active && styles.interestChipActive]}
                        >
                          <Text style={[styles.interestChipText, active && styles.interestChipTextActive]}>
                            {it.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  {interestType !== 'none' && (
                    <View style={styles.interestRateRow}>
                      <TextInput
                        value={interestRateText}
                        onChangeText={setInterestRateText}
                        keyboardType='decimal-pad'
                        placeholder='10'
                        placeholderTextColor={colors.tabInactive}
                        style={styles.rateInput}
                      />
                      <Text style={styles.pctLabel}>%</Text>
                      <View style={styles.periodToggle}>
                        {(['month', 'year'] as const).map((p) => (
                          <Pressable
                            key={p}
                            onPress={() => setInterestPeriod(p)}
                            style={[styles.periodBtn, interestPeriod === p && styles.periodBtnActive]}
                          >
                            <Text style={[styles.periodText, interestPeriod === p && styles.periodTextActive]}>
                              {p === 'month' ? 'Tháng' : 'Năm'}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              )}

              {/* Note */}
              <Text style={[styles.label, { marginTop: 16 }]}>Ghi chú</Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder='Lý do, điều kiện...'
                placeholderTextColor={colors.tabInactive}
                style={[styles.input, styles.noteInput]}
                multiline
                numberOfLines={3}
              />

              <Pressable
                onPress={handleSubmit}
                disabled={!canSubmit}
                style={[styles.submit, !canSubmit && styles.disabled]}
              >
                <Text style={styles.submitText}>
                  {type === 'lend' ? 'Ghi nhận cho vay' : 'Ghi nhận đi vay'}
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>

      <DatePickerModal
        visible={startPickerOpen}
        value={startDate}
        onSelect={setStartDate}
        onClose={() => setStartPickerOpen(false)}
        maxDate={today}
      />
      <DatePickerModal
        visible={duePickerOpen}
        value={dueDate}
        onSelect={setDueDate}
        onClose={() => setDuePickerOpen(false)}
        minDate={today}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  kav: { width: '100%' },
  sheet: {
    backgroundColor: colors.screenBg,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 20,
    paddingTop: 10,
    maxHeight: '90%',
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
    marginBottom: 20,
  },
  title: { fontFamily: fonts.semibold, fontSize: 17, color: colors.text },
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  segmentBtnActive: { backgroundColor: colors.purple },
  segmentText: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted },
  segmentTextActive: { color: colors.white },
  label: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.muted,
    marginBottom: 8,
  },
  input: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 18,
  },
  noteInput: { textAlignVertical: 'top', minHeight: 70 },
  amountWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 22,
  },
  dong: { fontFamily: fonts.monoMedium, fontSize: 28, color: colors.muted },
  amountInput: {
    fontFamily: fonts.monoSemibold,
    fontSize: 38,
    color: colors.text,
    minWidth: 60,
    padding: 0,
    textAlign: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 18,
    gap: 10,
  },
  dateLabel: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.text,
  },
  dueDateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  toggle: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.track,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleOn: { backgroundColor: colors.purple },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.white,
  },
  toggleThumbOn: { alignSelf: 'flex-end' },
  interestToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    marginBottom: 8,
  },
  interestToggleText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.muted,
  },
  interestBox: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    gap: 14,
  },
  interestTypeRow: { flexDirection: 'row', gap: 8 },
  interestChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  interestChipActive: { backgroundColor: tint(colors.purple, '2E'), borderColor: colors.purple },
  interestChipText: { fontFamily: fonts.medium, fontSize: 12, color: colors.muted },
  interestChipTextActive: { color: colors.purple },
  interestRateRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rateInput: {
    width: 70,
    fontFamily: fonts.monoSemibold,
    fontSize: 22,
    color: colors.text,
    borderBottomWidth: 2,
    borderColor: colors.purple,
    paddingVertical: 4,
    textAlign: 'center',
  },
  pctLabel: { fontFamily: fonts.semibold, fontSize: 18, color: colors.muted },
  periodToggle: { flexDirection: 'row', flex: 1, gap: 6 },
  periodBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  periodBtnActive: { backgroundColor: tint(colors.purple, '2E'), borderColor: colors.purple },
  periodText: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted },
  periodTextActive: { color: colors.purple },
  submit: {
    backgroundColor: colors.purple,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  submitText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.white },
  disabled: { opacity: 0.4 },
  track: { backgroundColor: colors.track },
});
