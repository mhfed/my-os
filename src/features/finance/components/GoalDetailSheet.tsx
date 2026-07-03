import { useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

import { colors, gradients, radius, elevation, tint } from '@/theme/colors';
import { Icon, type IconName } from '@/theme/icons';
import { fonts, textShadow } from '@/theme/typography';
import { GameButton, GameIconButton } from '@/components/game';
import { useSavingsStore } from '@/store/savingsStore';
import { formatVND, formatCompactVND } from '@/utils/currency';
import { formatTxnDate } from '@/utils/date';
import type { SavingsGoalView } from '@/types/savings';
import { DatePickerModal } from '@/components/DatePickerModal';
import { GOAL_PALETTE } from './AddGoalSheet';

interface GoalDetailSheetProps {
  goalId: string | null;
  onClose: () => void;
}

const PALETTE = GOAL_PALETTE.map((s) => s.color);

/** Look up the matching gradient for a stored accent color. */
function gradientFor(barColor: string): readonly [string, string] {
  const spec = GOAL_PALETTE.find((s) => s.color === barColor);
  return spec?.gradient ?? gradients.purple;
}

const ICONS: IconName[] = [
  'car', 'airplane', 'home', 'school', 'hospital-box', 'laptop',
  'phone', 'camera', 'shopping', 'piggy-bank', 'heart', 'star',
];

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
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

function deadlineDayLabel(epochMs: number): string {
  const d = new Date(epochMs);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

function parseAmount(raw: string): number {
  return parseInt(raw.replace(/[^0-9]/g, ''), 10) || 0;
}

function groupDigits(n: number): string {
  return n > 0 ? n.toLocaleString('en-US') : '';
}

export function GoalDetailSheet({ goalId, onClose }: GoalDetailSheetProps) {
  const getGoalView = useSavingsStore((s) => s.getGoalView);
  const addContribution = useSavingsStore((s) => s.addContribution);
  const markAchieved = useSavingsStore((s) => s.markAchieved);
  const deleteGoal = useSavingsStore((s) => s.deleteGoal);
  const updateGoal = useSavingsStore((s) => s.updateGoal);

  const [contribOpen, setContribOpen] = useState(false);
  const [contribAmountText, setContribAmountText] = useState('');
  const [contribNote, setContribNote] = useState('');
  const [contribDate, setContribDate] = useState(todayStart);
  const [linkTxn, setLinkTxn] = useState(true);

  // Edit panel state
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAmountText, setEditAmountText] = useState('');
  const [editHasDeadline, setEditHasDeadline] = useState(false);
  const [editDeadline, setEditDeadline] = useState(() => todayStart() + 365 * 86_400_000);
  const [editIcon, setEditIcon] = useState<IconName>('piggy-bank');
  const [editColor, setEditColor] = useState<string>(PALETTE[0]);
  const [editNote, setEditNote] = useState('');
  const [editDeadlinePickerOpen, setEditDeadlinePickerOpen] = useState(false);

  // Cache last valid view so the pageSheet can animate out before unmounting
  const viewRef = useRef<SavingsGoalView | null>(null);
  const liveView = goalId ? getGoalView(goalId) : null;
  if (liveView) viewRef.current = liveView;
  const view = viewRef.current;

  if (!view) return null;

  const today = todayStart();
  const contribAmount = parseAmount(contribAmountText);
  const editAmount = parseAmount(editAmountText);
  const progressColor =
    view.status === 'achieved'
      ? colors.teal
      : view.isOverdue
      ? colors.red
      : view.color;

  function handlePencilPress() {
    if (editOpen) {
      setEditOpen(false);
    } else {
      setEditName(view!.name);
      setEditAmountText(String(view!.targetAmount));
      setEditHasDeadline(!!view!.deadline);
      setEditDeadline(view!.deadline ?? todayStart() + 365 * 86_400_000);
      setEditIcon(view!.icon as IconName);
      setEditColor(view!.color);
      setEditNote(view!.note ?? '');
      setEditOpen(true);
    }
  }

  async function handleSaveEdit() {
    await updateGoal(view!.id, {
      name: editName.trim(),
      targetAmount: editAmount,
      deadline: editHasDeadline ? editDeadline + 12 * 3_600_000 : undefined,
      icon: editIcon,
      color: editColor,
      note: editNote.trim() || undefined,
    });
    setEditOpen(false);
  }

  async function handleAddContribution() {
    if (contribAmount <= 0) return;
    await addContribution(view!.id, contribAmount, contribDate + 12 * 3_600_000, contribNote.trim() || undefined, linkTxn);
    setContribOpen(false);
    setContribAmountText('');
    setContribNote('');
    setContribDate(todayStart());
    setLinkTxn(true);

    // Auto-prompt achieve if now done
    const updated = useSavingsStore.getState().getGoalView(view!.id);
    if (updated && updated.currentAmount >= updated.targetAmount && updated.status === 'active') {
      Alert.alert('Đạt mục tiêu! 🎉', 'Bạn đã tích luỹ đủ. Đánh dấu hoàn thành?', [
        { text: 'Để sau', style: 'cancel' },
        { text: 'Hoàn thành', onPress: () => markAchieved(view!.id) },
      ]);
    }
  }

  function handleDelete() {
    Alert.alert('Xoá mục tiêu?', 'Tất cả đóng góp sẽ bị xoá.', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Xoá',
        style: 'destructive',
        onPress: async () => {
          await deleteGoal(view!.id);
          onClose();
        },
      },
    ]);
  }

  return (
    <Modal
      visible={!!goalId}
      animationType='slide'
      presentationStyle='pageSheet'
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        <LinearGradient
          colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0)']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.screenGlow}
          pointerEvents='none'
        />
        {/* Header */}
        <View style={styles.header}>
          <GameIconButton icon='chevron-down' variant='purple' size={36} iconSize={18} onPress={onClose} />
          <Text style={styles.title} numberOfLines={1}>{view.name}</Text>
          <GameIconButton
            icon='pencil'
            variant={editOpen ? 'purple' : 'gold'}
            size={36}
            iconSize={16}
            onPress={handlePencilPress}
          />
          <GameIconButton icon='delete-outline' variant='red' size={36} iconSize={16} onPress={handleDelete} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Edit panel */}
          {editOpen && (
            <View style={styles.editPanel}>
              {/* Icon picker */}
              <Text style={styles.editLabel}>Icon</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.iconRow}>
                {ICONS.map((ic) => (
                  <Pressable
                    key={ic}
                    onPress={() => setEditIcon(ic)}
                    style={[styles.iconChip, editIcon === ic && { backgroundColor: tint(editColor, '33'), borderColor: editColor }]}
                  >
                    <Icon name={ic} size={22} color={editIcon === ic ? editColor : colors.muted} />
                  </Pressable>
                ))}
              </ScrollView>

              {/* Color picker */}
              <Text style={styles.editLabel}>Màu</Text>
              <View style={styles.palette}>
                {PALETTE.map((c) => (
                  <Pressable
                    key={c}
                    onPress={() => setEditColor(c)}
                    style={[
                      styles.swatch,
                      { backgroundColor: c },
                      editColor === c && styles.swatchSelected,
                    ]}
                  />
                ))}
              </View>

              {/* Name */}
              <Text style={styles.editLabel}>Tên mục tiêu</Text>
              <TextInput
                value={editName}
                onChangeText={setEditName}
                placeholder='Tên mục tiêu...'
                placeholderTextColor={colors.tabInactive}
                style={styles.editInput}
              />

              {/* Target amount */}
              <Text style={styles.editLabel}>Số tiền mục tiêu</Text>
              <View style={styles.editAmountWrap}>
                <Text style={styles.editDong}>₫</Text>
                <TextInput
                  value={groupDigits(editAmount)}
                  onChangeText={setEditAmountText}
                  keyboardType='number-pad'
                  placeholder='0'
                  placeholderTextColor={colors.tabInactive}
                  style={styles.editAmountInput}
                />
              </View>

              {/* Deadline */}
              <View style={styles.deadlineHeader}>
                <Text style={styles.editLabel}>Ngày mục tiêu</Text>
                <Pressable
                  onPress={() => setEditHasDeadline((v) => !v)}
                  style={[styles.toggle, editHasDeadline && { backgroundColor: editColor }]}
                >
                  <View style={[styles.toggleThumb, editHasDeadline && styles.toggleThumbOn]} />
                </Pressable>
              </View>
              {editHasDeadline && (
                <Pressable style={styles.editDateRow} onPress={() => setEditDeadlinePickerOpen(true)}>
                  <Icon name='calendar-clock' size={16} color={colors.muted} />
                  <Text style={styles.editDateLabel}>{deadlineDayLabel(editDeadline)}</Text>
                  <Icon name='chevron-right' size={14} color={colors.tabInactive} />
                </Pressable>
              )}

              {/* Note */}
              <Text style={styles.editLabel}>Ghi chú</Text>
              <TextInput
                value={editNote}
                onChangeText={setEditNote}
                placeholder='Chi tiết kế hoạch...'
                placeholderTextColor={colors.tabInactive}
                style={[styles.editInput, styles.editNoteInput]}
                multiline
                numberOfLines={2}
              />

              {/* Actions */}
              <GameButton
                label='Lưu'
                variant='purple'
                size='md'
                fullWidth
                onPress={handleSaveEdit}
                disabled={editAmount <= 0 || editName.trim().length === 0}
                style={(editAmount <= 0 || editName.trim().length === 0) ? styles.disabled : styles.editSaveBtn}
              />
              <Pressable onPress={() => setEditOpen(false)} style={styles.editCancelBtn}>
                <Text style={styles.editCancelText}>Huỷ</Text>
              </Pressable>
            </View>
          )}

          {/* Progress card */}
          <View style={[styles.progressCard, { borderColor: tint(progressColor, '44') }]}>
            <View style={styles.iconRow2}>
              <View style={[styles.iconBox, { backgroundColor: tint(view.color, '22') }]}>
                <Icon name={view.icon as IconName} size={28} color={view.color} />
              </View>
              <View style={styles.progressAmounts}>
                <Text style={styles.progressCurrent}>{formatVND(view.currentAmount)}</Text>
                <Text style={styles.progressTarget}>/ {formatVND(view.targetAmount)}</Text>
              </View>
              {view.isAchieved && <Text style={styles.celebrateEmoji}>{'\u{1F389}'}</Text>}
            </View>

            {/* Progress bar — chunky gradient track */}
            <View style={styles.track}>
              <LinearGradient
                colors={gradientFor(progressColor)}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.fill, { width: `${Math.min(1, view.progressPct) * 100}%` }]}
              >
                <LinearGradient
                  colors={gradients.gloss}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={styles.fillGloss}
                  pointerEvents='none'
                />
              </LinearGradient>
            </View>

            <View style={styles.progressMeta}>
              <Text style={styles.metaText}>{Math.round(view.progressPct * 100)}% hoàn thành</Text>
              <Text style={[styles.metaText, { color: view.remaining > 0 ? colors.text : colors.teal }]}>
                {view.remaining > 0 ? `Còn ${formatCompactVND(view.remaining)}` : 'Đã đạt!'}
              </Text>
            </View>

            {view.deadline && (
              <View style={styles.deadlineRow}>
                <Icon
                  name='calendar-clock'
                  size={13}
                  color={view.isOverdue ? colors.red : view.daysUntilDeadline !== null && view.daysUntilDeadline <= 30 ? colors.orange : colors.muted}
                />
                <Text style={[styles.deadlineText, {
                  color: view.isOverdue ? colors.red : view.daysUntilDeadline !== null && view.daysUntilDeadline <= 30 ? colors.orange : colors.muted
                }]}>
                  {view.isOverdue
                    ? `Quá hạn ${Math.abs(view.daysUntilDeadline ?? 0)} ngày`
                    : `Còn ${view.daysUntilDeadline} ngày · ${new Date(view.deadline).getDate()}/${new Date(view.deadline).getMonth() + 1}/${new Date(view.deadline).getFullYear()}`}
                </Text>
                {view.monthlyNeeded && (
                  <Text style={styles.monthlyNeeded}>
                    ~{formatCompactVND(view.monthlyNeeded)}/tháng
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Note */}
          {view.note && (
            <View style={styles.noteBox}>
              <Icon name='text-box-outline' size={14} color={colors.muted} />
              <Text style={styles.noteText}>{view.note}</Text>
            </View>
          )}

          {/* Contributions */}
          <Text style={styles.sectionTitle}>Lịch sử đóng góp</Text>
          {view.contributions.length === 0 ? (
            <Text style={styles.emptyText}>Chưa có đóng góp nào</Text>
          ) : (
            view.contributions.map((c) => (
              <View key={c.id} style={styles.contribRow}>
                <View style={styles.contribLeft}>
                  <Text style={styles.contribDate}>{formatTxnDate(c.date)}</Text>
                  {c.note && <Text style={styles.contribNote}>{c.note}</Text>}
                  {c.linkedTransactionId && (
                    <Text style={styles.linkedBadge}>Ghi vào chi tiêu</Text>
                  )}
                </View>
                <Text style={[styles.contribAmount, { color: progressColor }]}>
                  +{formatCompactVND(c.amount)}
                </Text>
              </View>
            ))
          )}
        </ScrollView>

        {/* Actions */}
        {view.status === 'active' && (
          <View style={styles.actions}>
            <GameButton
              label='Đóng góp thêm'
              icon='plus'
              variant='purple'
              size='md'
              style={styles.actionBtn}
              onPress={() => setContribOpen(true)}
            />
            {view.isAchieved && (
              <GameButton
                label='Hoàn thành'
                icon='check-circle'
                variant='gem'
                size='md'
                style={styles.actionBtn}
                onPress={() => markAchieved(view!.id)}
              />
            )}
          </View>
        )}

        {/* Add contribution modal */}
        <Modal
          visible={contribOpen}
          transparent
          animationType='slide'
          onRequestClose={() => setContribOpen(false)}
        >
          <View style={styles.payRoot}>
            <Pressable style={styles.backdrop} onPress={() => setContribOpen(false)} />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.kav}>
              <View style={styles.paySheet}>
            <BlurView tint="light" intensity={46} style={StyleSheet.absoluteFill} />
                <View style={styles.handle} />
                <Text style={styles.payTitle}>{`Đóng góp cho "${view.name}"`}</Text>

                <View style={styles.amountWrap}>
                  <Text style={styles.dong}>₫</Text>
                  <TextInput
                    value={groupDigits(contribAmount)}
                    onChangeText={setContribAmountText}
                    keyboardType='number-pad'
                    placeholder='0'
                    placeholderTextColor={colors.tabInactive}
                    style={styles.amountInput}
                    autoFocus
                  />
                </View>

                <Text style={styles.label}>Ngày</Text>
                <View style={styles.dateRow}>
                  <Pressable onPress={() => setContribDate((d) => d - 86_400_000)} style={styles.dateArrow} hitSlop={8}>
                    <Icon name='chevron-left' size={18} color={colors.muted} />
                  </Pressable>
                  <Text style={styles.dateLabel}>{dayLabel(contribDate)}</Text>
                  <Pressable
                    onPress={() => setContribDate((d) => Math.min(d + 86_400_000, today))}
                    style={styles.dateArrow}
                    disabled={contribDate >= today}
                    hitSlop={8}
                  >
                    <Icon name='chevron-right' size={18} color={contribDate >= today ? colors.tabInactive : colors.muted} />
                  </Pressable>
                </View>

                <Text style={styles.label}>Ghi chú</Text>
                <TextInput
                  value={contribNote}
                  onChangeText={setContribNote}
                  placeholder='Lương tháng 7...'
                  placeholderTextColor={colors.tabInactive}
                  style={styles.noteInput}
                />

                <View style={styles.linkTxnRow}>
                  <Text style={styles.linkTxnLabel}>Ghi vào chi tiêu Finance</Text>
                  <Switch
                    value={linkTxn}
                    onValueChange={setLinkTxn}
                    trackColor={{ false: colors.track, true: tint(view.color, '55') }}
                    thumbColor={linkTxn ? view.color : colors.muted}
                  />
                </View>

                <GameButton
                  label='Lưu'
                  variant='purple'
                  size='lg'
                  fullWidth
                  onPress={handleAddContribution}
                  disabled={contribAmount <= 0}
                  style={contribAmount <= 0 ? styles.disabled : undefined}
                />
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>

        {/* Edit deadline date picker */}
        <DatePickerModal
          visible={editDeadlinePickerOpen}
          value={editDeadline}
          onSelect={setEditDeadline}
          onClose={() => setEditDeadlinePickerOpen(false)}
          minDate={todayStart()}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.screenBg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 10,
  },
  title: {
    flex: 1,
    fontFamily: fonts.displayBold,
    fontSize: 19,
    color: colors.text,
    textAlign: 'center',
    ...textShadow.emboss,
  },
  content: { paddingHorizontal: 20, paddingBottom: 100, gap: 16 },

  // Edit panel
  editPanel: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    ...elevation.card,
  },
  editLabel: { fontFamily: fonts.semibold, fontSize: 13, color: colors.muted, marginBottom: 8 },
  iconRow: { gap: 8, paddingBottom: 4, marginBottom: 14 },
  iconChip: {
    width: 46, height: 46, borderRadius: radius.md, borderWidth: 1,
    borderColor: colors.track, backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center',
  },
  palette: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  swatch: {
    width: 32, height: 32, borderRadius: radius.sm, borderWidth: 1, borderColor: 'transparent',
  },
  swatchSelected: { borderColor: colors.white, transform: [{ scale: 1.15 }], ...elevation.card },
  editInput: {
    fontFamily: fonts.regular, fontSize: 14, color: colors.text,
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.track,
    borderRadius: radius.pill, paddingHorizontal: 18, paddingVertical: 12, marginBottom: 14,
  },
  editNoteInput: { textAlignVertical: 'top', minHeight: 60, borderRadius: radius.md },
  editAmountWrap: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, marginBottom: 14,
  },
  editDong: { fontFamily: fonts.monoMedium, fontSize: 24, color: colors.muted },
  editAmountInput: {
    fontFamily: fonts.monoSemibold, fontSize: 32, color: colors.text,
    minWidth: 60, padding: 0, textAlign: 'center',
  },
  deadlineHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8,
  },
  toggle: {
    width: 44, height: 26, borderRadius: radius.pill, backgroundColor: colors.track,
    justifyContent: 'center', paddingHorizontal: 3,
  },
  toggleThumb: { width: 20, height: 20, borderRadius: radius.pill, backgroundColor: colors.white },
  toggleThumbOn: { alignSelf: 'flex-end' },
  editDateRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white,
    borderWidth: 1, borderColor: colors.track, borderRadius: radius.pill,
    paddingHorizontal: 18, paddingVertical: 12, marginBottom: 14, gap: 10,
  },
  editDateLabel: { flex: 1, fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  editSaveBtn: { marginTop: 4 },
  editCancelBtn: { alignItems: 'center', paddingVertical: 10 },
  editCancelText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.muted },

  // Main content
  progressCard: {
    backgroundColor: colors.card, borderWidth: 1, borderRadius: radius.lg, padding: 18, gap: 12,
    ...elevation.card,
  },
  iconRow2: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 52, height: 52, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  progressAmounts: { flex: 1 },
  progressCurrent: { fontFamily: fonts.monoSemibold, fontSize: 22, color: colors.text },
  progressTarget: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  celebrateEmoji: { fontSize: 26 },
  track: { height: 14, backgroundColor: colors.track, borderRadius: radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill, overflow: 'hidden' },
  fillGloss: { position: 'absolute', top: 0, left: 0, right: 0, height: '55%' },
  progressMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  metaText: { fontFamily: fonts.medium, fontSize: 12, color: colors.muted },
  deadlineRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  deadlineText: { fontFamily: fonts.medium, fontSize: 12 },
  monthlyNeeded: { flex: 1, textAlign: 'right', fontFamily: fonts.monoMedium, fontSize: 11, color: colors.muted },
  noteBox: {
    flexDirection: 'row', gap: 8, backgroundColor: colors.card,
    borderRadius: radius.md, padding: 12, alignItems: 'flex-start',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  noteText: { flex: 1, fontFamily: fonts.regular, fontSize: 13, color: colors.muted, lineHeight: 18 },
  sectionTitle: {
    fontFamily: fonts.displayBold, fontSize: 15, color: colors.text,
    ...textShadow.emboss,
  },
  emptyText: { fontFamily: fonts.regular, fontSize: 13, color: colors.tabInactive, textAlign: 'center', paddingVertical: 16 },
  contribRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.card, borderRadius: radius.md, padding: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  contribLeft: { flex: 1 },
  contribDate: { fontFamily: fonts.medium, fontSize: 13, color: colors.text },
  contribNote: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted, marginTop: 2 },
  linkedBadge: { fontFamily: fonts.regular, fontSize: 10, color: colors.purple, marginTop: 2 },
  contribAmount: { fontFamily: fonts.monoSemibold, fontSize: 14 },
  actions: {
    flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingVertical: 12,
    borderTopWidth: 2, borderColor: colors.border, backgroundColor: colors.screenBg,
  },
  actionBtn: { flex: 1 },
  // Contribution modal
  screenGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 180 },
  payRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(24,32,51,0.72)' },
  kav: { width: '100%' },
  paySheet: {
    backgroundColor: colors.cardAlt, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40,
    ...elevation.panel,
  },
  handle: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: colors.border, marginBottom: 14 },
  payTitle: {
    fontFamily: fonts.displayBold, fontSize: 18, color: colors.text, marginBottom: 16,
    ...textShadow.emboss,
  },
  amountWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 22 },
  dong: { fontFamily: fonts.monoMedium, fontSize: 28, color: colors.muted },
  amountInput: {
    fontFamily: fonts.monoSemibold, fontSize: 38, color: colors.text,
    minWidth: 60, padding: 0, textAlign: 'center',
  },
  label: { fontFamily: fonts.semibold, fontSize: 13, color: colors.muted, marginBottom: 8 },
  dateRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white,
    borderWidth: 1, borderColor: colors.track, borderRadius: radius.pill,
    paddingHorizontal: 6, paddingVertical: 8, marginBottom: 18,
  },
  dateArrow: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  dateLabel: { flex: 1, textAlign: 'center', fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  noteInput: {
    fontFamily: fonts.regular, fontSize: 14, color: colors.text,
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.track,
    borderRadius: radius.pill, paddingHorizontal: 18, paddingVertical: 12, marginBottom: 16,
  },
  linkTxnRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.track,
    borderRadius: radius.pill, paddingHorizontal: 18, paddingVertical: 10, marginBottom: 20,
  },
  linkTxnLabel: { fontFamily: fonts.medium, fontSize: 13, color: colors.text },
  disabled: { opacity: 0.4 },
});
