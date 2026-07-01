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

import { colors, gradients, radius, elevation, base3D, tint } from '@/theme/colors';
import { Icon, type IconName } from '@/theme/icons';
import { fonts, textShadow } from '@/theme/typography';
import { GameButton } from '@/components/game';
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

interface AccentSpec {
  color: string;
  deep: string;
  gradient: readonly [string, string];
}

export const GOAL_PALETTE: AccentSpec[] = [
  { color: colors.purple, deep: colors.purpleDeep, gradient: gradients.purple },
  { color: colors.teal, deep: colors.tealDeep, gradient: gradients.gem },
  { color: colors.orange, deep: colors.orangeDeep, gradient: gradients.gold },
  { color: colors.red, deep: colors.redDeep, gradient: gradients.red },
  { color: colors.blue, deep: colors.blueDeep, gradient: gradients.blue },
  { color: colors.pink, deep: colors.pinkDeep, gradient: gradients.pink },
];

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
  const [color, setColor] = useState<string>(GOAL_PALETTE[0].color);
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
    setColor(GOAL_PALETTE[0].color);
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
                {GOAL_PALETTE.map((spec) => (
                  <Pressable
                    key={spec.color}
                    onPress={() => setColor(spec.color)}
                    style={[
                      styles.swatch,
                      { backgroundColor: spec.color },
                      color === spec.color && styles.swatchSelected,
                    ]}
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
                  style={[styles.toggle, hasDeadline && { backgroundColor: color }]}
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

              <GameButton
                label='Tạo mục tiêu'
                variant='purple'
                size='lg'
                fullWidth
                onPress={handleSubmit}
                disabled={!canSubmit}
                style={!canSubmit ? styles.disabled : undefined}
              />
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
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(74,46,18,0.72)' },
  kav: { width: '100%' },
  sheet: {
    backgroundColor: colors.cardAlt,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 20,
    paddingTop: 10,
    maxHeight: '90%',
    ...elevation.panel,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: colors.text,
    ...textShadow.emboss,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    ...elevation.card,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.muted,
    marginBottom: 8,
  },
  iconRow: { gap: 8, paddingBottom: 4, marginBottom: 18 },
  iconChip: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.track,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  palette: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchSelected: { borderColor: colors.white, transform: [{ scale: 1.15 }], ...elevation.card },
  input: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.track,
    borderRadius: radius.pill,
    paddingHorizontal: 18,
    paddingVertical: 13,
    marginBottom: 18,
  },
  noteInput: {
    textAlignVertical: 'top',
    minHeight: 64,
    borderRadius: radius.md,
  },
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
    borderRadius: radius.pill,
    backgroundColor: colors.track,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleThumb: { width: 20, height: 20, borderRadius: radius.pill, backgroundColor: colors.white },
  toggleThumbOn: { alignSelf: 'flex-end' },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.track,
    borderRadius: radius.pill,
    paddingHorizontal: 18,
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
  disabled: { opacity: 0.4 },
});
