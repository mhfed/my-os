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
import { Icon, type IconName } from '@/theme/icons';
import { fonts } from '@/theme/typography';
import { useSavingsStore } from '@/store/savingsStore';
import { DatePickerModal } from '@/components/DatePickerModal';

interface AddGoalSheetProps {
  visible: boolean;
  onClose: () => void;
}

function todayStart(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function dayLabel(epochMs: number): string {
  const d = new Date(epochMs);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

function parseAmount(raw: string): number {
  return parseInt(raw.replace(/[^0-9]/g, ''), 10) || 0;
}

function groupDigits(n: number): string {
  return n > 0 ? n.toLocaleString('en-US') : '';
}

const PALETTE = [colors.purple, colors.teal, colors.orange, colors.red, '#5B8AF0', '#C16EF5'] as const;

const ICONS: IconName[] = [
  'car', 'airplane', 'home', 'school', 'hospital-box', 'laptop',
  'phone', 'camera', 'shopping', 'piggy-bank', 'heart', 'star',
];

export function AddGoalSheet({ visible, onClose }: AddGoalSheetProps) {
  const insets = useSafeAreaInsets();
  const addGoal = useSavingsStore((s) => s.addGoal);

  const [name, setName] = useState('');
  const [amountText, setAmountText] = useState('');
  const [hasDeadline, setHasDeadline] = useState(false);
  const [deadline, setDeadline] = useState(() => todayStart() + 365 * 86_400_000);
  const [icon, setIcon] = useState<IconName>('piggy-bank');
  const [color, setColor] = useState<string>(PALETTE[0]);
  const [note, setNote] = useState('');
  const [deadlinePickerOpen, setDeadlinePickerOpen] = useState(false);

  const amount = parseAmount(amountText);
  const canSubmit = amount > 0 && name.trim().length > 0;

  function reset() {
    setName('');
    setAmountText('');
    setHasDeadline(false);
    setDeadline(todayStart() + 365 * 86_400_000);
    setIcon('piggy-bank');
    setColor(PALETTE[0]);
    setNote('');
    setDeadlinePickerOpen(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    await addGoal({
      name: name.trim(),
      targetAmount: amount,
      deadline: hasDeadline ? deadline + 12 * 3_600_000 : undefined,
      icon,
      color,
      note: note.trim() || undefined,
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
              <Text style={styles.title}>Mục tiêu tiết kiệm</Text>
              <Pressable onPress={handleClose} style={styles.closeBtn} hitSlop={10}>
                <Icon name='close' size={18} color={colors.muted} />
              </Pressable>
            </View>

            <ScrollView keyboardShouldPersistTaps='handled' showsVerticalScrollIndicator={false}>
              {/* Icon picker */}
              <Text style={styles.label}>Icon</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.iconRow}>
                {ICONS.map((ic) => (
                  <Pressable
                    key={ic}
                    onPress={() => setIcon(ic)}
                    style={[styles.iconChip, icon === ic && { backgroundColor: tint(color, '33'), borderColor: color }]}
                  >
                    <Icon name={ic} size={22} color={icon === ic ? color : colors.muted} />
                  </Pressable>
                ))}
              </ScrollView>

              {/* Color picker */}
              <Text style={styles.label}>Màu</Text>
              <View style={styles.palette}>
                {PALETTE.map((c) => (
                  <Pressable
                    key={c}
                    onPress={() => setColor(c)}
                    style={[styles.swatch, { backgroundColor: c }, color === c && styles.swatchSelected]}
                  />
                ))}
              </View>

              {/* Name */}
              <Text style={styles.label}>Tên mục tiêu</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder='Mua xe, Du lịch Nhật...'
                placeholderTextColor={colors.tabInactive}
                style={styles.input}
              />

              {/* Target amount */}
              <Text style={styles.label}>Số tiền mục tiêu</Text>
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

              {/* Deadline */}
              <View style={styles.deadlineHeader}>
                <Text style={styles.label}>Ngày mục tiêu</Text>
                <Pressable
                  onPress={() => setHasDeadline((v) => !v)}
                  style={[styles.toggle, hasDeadline && styles.toggleOn]}
                >
                  <View style={[styles.toggleThumb, hasDeadline && styles.toggleThumbOn]} />
                </Pressable>
              </View>
              {hasDeadline && (
                <Pressable style={styles.dateRow} onPress={() => setDeadlinePickerOpen(true)}>
                  <Icon name='calendar-clock' size={16} color={colors.muted} />
                  <Text style={styles.dateLabel}>{dayLabel(deadline)}</Text>
                  <Icon name='chevron-right' size={14} color={colors.tabInactive} />
                </Pressable>
              )}

              {/* Note */}
              <Text style={styles.label}>Ghi chú</Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder='Chi tiết kế hoạch...'
                placeholderTextColor={colors.tabInactive}
                style={[styles.input, styles.noteInput]}
                multiline
                numberOfLines={2}
              />

              <Pressable
                onPress={handleSubmit}
                disabled={!canSubmit}
                style={[styles.submit, { backgroundColor: color }, !canSubmit && styles.disabled]}
              >
                <Text style={styles.submitText}>Tạo mục tiêu</Text>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
      <DatePickerModal
        visible={deadlinePickerOpen}
        value={deadline}
        onSelect={setDeadline}
        onClose={() => setDeadlinePickerOpen(false)}
        minDate={todayStart()}
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
  label: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted, marginBottom: 8 },
  iconRow: { gap: 8, paddingBottom: 4, marginBottom: 18 },
  iconChip: {
    width: 46,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  palette: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  swatch: {
    width: 30,
    height: 30,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchSelected: { borderColor: colors.white, transform: [{ scale: 1.15 }] },
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
  noteInput: { textAlignVertical: 'top', minHeight: 60 },
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
  deadlineHeader: {
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
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.white },
  toggleThumbOn: { alignSelf: 'flex-end' },
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
  submit: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  submitText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.white },
  disabled: { opacity: 0.4 },
});
