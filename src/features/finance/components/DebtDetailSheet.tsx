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

import { colors, radius, tint, base3D, elevation } from '@/theme/colors';
import { Icon } from '@/theme/icons';
import { fonts, textShadow } from '@/theme/typography';
import { PressableScale, AnimatedCard } from '@/components/motion';
import { GameButton } from '@/components/game';
import { useDebtStore } from '@/store/debtStore';
import { formatVND, formatCompactVND } from '@/utils/currency';
import { formatTxnDate } from '@/utils/date';
import { DatePickerModal } from '@/components/DatePickerModal';
import type { DebtView } from '@/types/debt';

interface DebtDetailSheetProps {
  debtId: string | null;
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

function statusLabel(view: DebtView): { text: string; color: string } {
  if (view.status === 'settled')
    return { text: 'Đã tất toán ✅', color: colors.tealDeep };
  if (view.isOverdue) {
    const days = Math.abs(view.daysUntilDue ?? 0);
    return { text: `Quá hạn ${days} ngày`, color: colors.redDeep };
  }
  if (view.dueDate) {
    const days = view.daysUntilDue ?? 0;
    if (days <= 7)
      return { text: `Còn ${days} ngày`, color: colors.orangeDeep };
    const d = new Date(view.dueDate);
    return {
      text: `Đến hạn ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`,
      color: colors.muted,
    };
  }
  return {
    text: view.status === 'partial' ? 'Đã thanh toán một phần' : 'Đang mở',
    color: colors.muted,
  };
}

export function DebtDetailSheet({ debtId, onClose }: DebtDetailSheetProps) {
  const getDebtView = useDebtStore((s) => s.getDebtView);
  const addPayment = useDebtStore((s) => s.addPayment);
  const deletePayment = useDebtStore((s) => s.deletePayment);
  const settleDebt = useDebtStore((s) => s.settleDebt);
  const deleteDebt = useDebtStore((s) => s.deleteDebt);
  const updateDebt = useDebtStore((s) => s.updateDebt);

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [payAmountText, setPayAmountText] = useState('');
  const [payNote, setPayNote] = useState('');
  const [payDate, setPayDate] = useState(todayStart);
  const [linkTxnOnSettle, setLinkTxnOnSettle] = useState(true);

  // Netting state
  const [nettingOpen, setNettingOpen] = useState(false);
  const [nettingAmountText, setNettingAmountText] = useState('');
  const [nettingNote, setNettingNote] = useState('');

  // Edit panel state
  const [editOpen, setEditOpen] = useState(false);
  const [editParty, setEditParty] = useState('');
  const [editAmountText, setEditAmountText] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editDueDate, setEditDueDate] = useState<number | undefined>(undefined);
  const [editHasDueDate, setEditHasDueDate] = useState(false);
  const [editDueDatePickerOpen, setEditDueDatePickerOpen] = useState(false);

  // Cache last valid view so the pageSheet can animate out before unmounting
  const viewRef = useRef<DebtView | null>(null);
  const liveView = debtId ? getDebtView(debtId) : null;
  if (liveView) viewRef.current = liveView;
  const view = viewRef.current;

  // Find opposing active entries for this party
  const entries = useDebtStore((s) => s.entries);
  const opposingEntries = view ? entries.filter(
    (e) => e.status !== 'settled' && e.party === view.party && e.type !== view.type
  ) : [];
  const opposingView = opposingEntries[0] ? getDebtView(opposingEntries[0].id) : null;

  if (!view) return null;

  const payAmount = parseAmount(payAmountText);
  const editAmount = parseAmount(editAmountText);
  const today = todayStart();
  const status = statusLabel(view);
  const isLend = view.type === 'lend';
  const typeAccent = isLend ? colors.green : colors.red;
  const typeAccentDeep = isLend ? colors.greenDeep : colors.redDeep;

  function handlePencilPress() {
    if (editOpen) {
      setEditOpen(false);
    } else {
      setEditParty(view!.party);
      setEditAmountText(String(view!.originalAmount));
      setEditNote(view!.note ?? '');
      const hasDue = !!view!.dueDate;
      setEditHasDueDate(hasDue);
      setEditDueDate(view!.dueDate ?? todayStart() + 30 * 86_400_000);
      setEditOpen(true);
    }
  }

  async function handleSaveEdit() {
    await updateDebt(view!.id, {
      party: editParty.trim(),
      originalAmount: editAmount,
      dueDate: editHasDueDate ? editDueDate : undefined,
      note: editNote.trim() || undefined,
    });
    setEditOpen(false);
  }

  async function handleAddPayment() {
    if (payAmount <= 0) return;
    await addPayment(
      view!.id,
      payAmount,
      payDate + 12 * 3_600_000,
      payNote.trim() || undefined,
    );
    setPaymentOpen(false);
    setPayAmountText('');
    setPayNote('');
    setPayDate(todayStart());
  }

  function handleSettle() {
    Alert.alert(
      'Tất toán khoản này?',
      'Đánh dấu hoàn tất và tuỳ chọn ghi vào lịch sử giao dịch.',
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Tất toán',
          onPress: async () => {
            await settleDebt(view!.id, linkTxnOnSettle);
            onClose();
          },
        },
      ],
    );
  }

  function handleDelete() {
    Alert.alert('Xoá khoản này?', 'Hành động không thể hoàn tác.', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Xoá',
        style: 'destructive',
        onPress: async () => {
          await deleteDebt(view!.id);
          onClose();
        },
      },
    ]);
  }

  const progressW = Math.min(1, view.progressPct);
  const progressColor =
    view.status === 'settled'
      ? colors.teal
      : view.isOverdue
        ? colors.red
        : typeAccent;
  const progressColorDeep =
    view.status === 'settled'
      ? colors.tealDeep
      : view.isOverdue
        ? colors.redDeep
        : typeAccentDeep;

  return (
    <Modal
      visible={!!debtId}
      animationType='slide'
      presentationStyle='pageSheet'
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.screen}
      >
        <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <PressableScale
            onPress={onClose}
            haptic='light'
            style={styles.closeBtn}
          >
            <Icon name='chevron-down' size={20} color={colors.muted} />
          </PressableScale>
          <Text style={styles.title} numberOfLines={1}>
            {view.party}
          </Text>
          <PressableScale
            onPress={handlePencilPress}
            haptic='light'
            style={styles.editBtn}
          >
            <Icon
              name='pencil'
              size={16}
              color={editOpen ? colors.purple : colors.muted}
            />
          </PressableScale>
          <PressableScale
            onPress={handleDelete}
            haptic='light'
            style={styles.deleteBtn}
          >
            <Icon name='delete-outline' size={18} color={colors.redDeep} />
          </PressableScale>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps='handled'
        >
          {/* Inline edit panel */}
          {editOpen && (
            <View style={styles.editPanel}>
              {/* Party */}
              <Text style={styles.editLabel}>Tên người / tổ chức</Text>
              <TextInput
                value={editParty}
                onChangeText={setEditParty}
                placeholder='Nguyễn A'
                placeholderTextColor={colors.tabInactive}
                style={styles.editInput}
                autoCapitalize='words'
              />

              {/* Amount */}
              <Text style={styles.editLabel}>Số tiền (₫)</Text>
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

              {/* Due date */}
              <View style={styles.editDueDateHeader}>
                <Text style={styles.editLabel}>Ngày đến hạn</Text>
                <Pressable
                  onPress={() => setEditHasDueDate((v) => !v)}
                  style={[styles.toggle, editHasDueDate && styles.toggleOn]}
                >
                  <View
                    style={[
                      styles.toggleThumb,
                      editHasDueDate && styles.toggleThumbOn,
                    ]}
                  />
                </Pressable>
              </View>
              {editHasDueDate && (
                <Pressable
                  style={styles.editDateRow}
                  onPress={() => setEditDueDatePickerOpen(true)}
                >
                  <Icon name='calendar-clock' size={16} color={colors.muted} />
                  <Text style={styles.editDateLabel}>
                    {editDueDate ? dayLabel(editDueDate) : 'Chọn ngày'}
                  </Text>
                  <Icon
                    name='chevron-right'
                    size={14}
                    color={colors.tabInactive}
                  />
                </Pressable>
              )}

              {/* Note */}
              <Text style={styles.editLabel}>Ghi chú</Text>
              <TextInput
                value={editNote}
                onChangeText={setEditNote}
                placeholder='Lý do, điều kiện...'
                placeholderTextColor={colors.tabInactive}
                style={[styles.editInput, styles.editNoteInput]}
                multiline
                numberOfLines={3}
              />

              {/* Actions */}
              <View style={styles.editActions}>
                <Pressable
                  onPress={() => setEditOpen(false)}
                  style={styles.editCancelBtn}
                >
                  <Text style={styles.editCancelText}>Huỷ</Text>
                </Pressable>
                <GameButton
                  label='Lưu'
                  variant='purple'
                  size='sm'
                  disabled={editParty.trim().length === 0 || editAmount <= 0}
                  style={
                    editParty.trim().length === 0 || editAmount <= 0
                      ? styles.disabled
                      : undefined
                  }
                  onPress={handleSaveEdit}
                />
              </View>
            </View>
          )}

          {/* Type badge */}
          <View style={styles.typeBadge}>
            <Icon
              name={isLend ? 'hand-coin' : 'bank-outline'}
              size={13}
              color={isLend ? colors.greenDeep : colors.orangeDeep}
            />
            <Text
              style={[
                styles.typeText,
                { color: isLend ? colors.greenDeep : colors.orangeDeep },
              ]}
            >
              {isLend ? 'Tôi cho vay' : 'Tôi đi vay'}
            </Text>
            <View style={styles.dot} />
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.text}
            </Text>
          </View>

          {/* Progress card */}
          <View style={styles.progressCard}>
            <View style={styles.progressAmounts}>
              <View>
                <Text style={styles.progressLabel}>Số tiền gốc</Text>
                <Text style={styles.progressOriginal}>
                  {formatVND(view.originalAmount)}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.progressLabel}>Còn lại</Text>
                <Text
                  style={[
                    styles.progressRemaining,
                    { color: progressColorDeep },
                  ]}
                >
                  {formatVND(view.totalOwed)}
                </Text>
              </View>
            </View>

            {/* Progress bar */}
            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  { width: `${progressW * 100}%`, backgroundColor: progressColor },
                ]}
              />
            </View>

            <View style={styles.progressMeta}>
              <Text style={styles.progressMetaText}>
                Đã trả: {formatCompactVND(view.paidAmount)} (
                {Math.round(view.progressPct * 100)}%)
              </Text>
              {view.accruedInterest > 0 && (
                <Text
                  style={[styles.progressMetaText, { color: colors.orangeDeep }]}
                >
                  Lãi: +{formatCompactVND(view.accruedInterest)}
                </Text>
              )}
            </View>
          </View>

          {/* Note */}
          {view.note && (
            <View style={styles.noteBox}>
              <Icon name='text-box-outline' size={14} color={colors.muted} />
              <Text style={styles.noteText}>{view.note}</Text>
            </View>
          )}

          {/* Opposing debt netting banner */}
          {opposingView && view.status !== 'settled' && (
            <View style={styles.nettingBanner}>
              <Icon name='swap-horizontal' size={18} color={colors.orangeDeep} />
              <View style={{ flex: 1 }}>
                <Text style={styles.nettingTitle}>⚡ Phát hiện khoản vay chéo!</Text>
                <Text style={styles.nettingSub}>
                  Bạn có thể cấn trừ tối đa {formatCompactVND(Math.min(view.totalOwed, opposingView.totalOwed))} ₫ để giảm dư nợ.
                </Text>
              </View>
              <PressableScale
                onPress={() => {
                  const maxNet = Math.min(view.totalOwed, opposingView.totalOwed);
                  setNettingAmountText(String(maxNet));
                  setNettingNote(`Cấn trừ đối ứng tự động với ${view.party}`);
                  setNettingOpen(true);
                }}
                haptic='medium'
                style={[styles.nettingBtn, base3D(colors.orangeDeep, 2)]}
              >
                <Text style={styles.nettingBtnText}>Cấn trừ</Text>
              </PressableScale>
            </View>
          )}

          {/* Settle link toggle (only when not yet settled) */}
          {view.status !== 'settled' && (
            <View style={styles.settleLinkRow}>
              <Text style={styles.settleLinkLabel}>
                Ghi vào giao dịch khi tất toán
              </Text>
              <Switch
                value={linkTxnOnSettle}
                onValueChange={setLinkTxnOnSettle}
                trackColor={{ false: colors.track, true: tint(colors.purple, '55') }}
                thumbColor={linkTxnOnSettle ? colors.purple : colors.muted}
              />
            </View>
          )}

          {/* Payment timeline */}
          <Text style={styles.sectionTitle}>Lịch sử thanh toán</Text>
          {view.payments.length === 0 ? (
            <Text style={styles.emptyPayments}>Chưa có lần thanh toán nào</Text>
          ) : (
            view.payments.map((p, i) => {
              const isNetting = p.paymentMethod === 'netting';
              const pIcon = isNetting ? 'swap-horizontal' : 'cash-check';
              const pColor = isNetting ? colors.orange : colors.teal;
              const pColorDeep = isNetting ? colors.orangeDeep : colors.tealDeep;
              return (
                <AnimatedCard key={p.id} index={i}>
                  <View style={styles.paymentRow}>
                    <View style={[styles.paymentIconWrap, base3D(pColorDeep, 2)]}>
                      <View style={[styles.paymentIcon, { backgroundColor: pColor, borderColor: 'rgba(255,255,255,0.1)' }]}>
                        <Icon name={pIcon} size={16} color={colors.white} />
                      </View>
                    </View>
                    <View style={styles.paymentLeft}>
                      <Text style={styles.paymentDate}>
                        {formatTxnDate(p.date)} {isNetting && <Text style={{ color: colors.orangeDeep, fontSize: 11, fontFamily: fonts.semibold }}>[Cấn trừ]</Text>}
                      </Text>
                      {p.note && (
                        <Text style={styles.paymentNote}>{p.note}</Text>
                      )}
                    </View>
                    <Text style={[styles.paymentAmount, { color: pColorDeep }]}>
                      +{formatCompactVND(p.amount)}
                    </Text>
                    <Pressable
                      hitSlop={8}
                      onPress={() => deletePayment(p.id, view!.id, p.amount)}
                    >
                      <Icon name='close' size={14} color={colors.tabInactive} />
                    </Pressable>
                  </View>
                </AnimatedCard>
              );
            })
          )}
        </ScrollView>

        {/* Actions */}
        {view.status !== 'settled' && (
          <View style={styles.actions}>
            <Pressable style={styles.addPayBtn} onPress={() => setPaymentOpen(true)}>
              <Icon name='plus' size={18} color={colors.purple} />
              <Text style={styles.addPayText}>Ghi nhận thanh toán</Text>
            </Pressable>
            <GameButton
              label='Tất toán'
              variant='gem'
              size='md'
              icon='check-circle-outline'
              onPress={handleSettle}
              style={styles.settleBtn}
            />
          </View>
        )}

        {/* Add payment inline modal */}
        <Modal
          visible={paymentOpen}
          transparent
          animationType='slide'
          onRequestClose={() => setPaymentOpen(false)}
        >
          <View style={styles.payRoot}>
            <Pressable
              style={styles.backdrop}
              onPress={() => setPaymentOpen(false)}
            />
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.kav}
            >
              <View style={styles.paySheet}>
                <View style={styles.handle} />
                <Text style={styles.payTitle}>Ghi nhận thanh toán</Text>

                <View style={styles.amountWrap}>
                  <Text style={styles.dong}>₫</Text>
                  <TextInput
                    value={groupDigits(payAmount)}
                    onChangeText={setPayAmountText}
                    keyboardType='number-pad'
                    placeholder='0'
                    placeholderTextColor={colors.tabInactive}
                    style={styles.amountInput}
                    autoFocus
                  />
                </View>

                <Text style={styles.label}>Ngày</Text>
                <View style={styles.dateRow}>
                  <Pressable
                    onPress={() => setPayDate((d) => d - 86_400_000)}
                    style={styles.dateArrow}
                    hitSlop={8}
                  >
                    <Icon name='chevron-left' size={18} color={colors.muted} />
                  </Pressable>
                  <Text style={styles.dateLabel}>{dayLabel(payDate)}</Text>
                  <Pressable
                    onPress={() =>
                      setPayDate((d) => Math.min(d + 86_400_000, today))
                    }
                    style={styles.dateArrow}
                    disabled={payDate >= today}
                    hitSlop={8}
                  >
                    <Icon
                      name='chevron-right'
                      size={18}
                      color={payDate >= today ? colors.tabInactive : colors.muted}
                    />
                  </Pressable>
                </View>

                <Text style={styles.label}>Ghi chú</Text>
                <TextInput
                  value={payNote}
                  onChangeText={setPayNote}
                  placeholder='Chuyển khoản MB...'
                  placeholderTextColor={colors.tabInactive}
                  style={styles.noteInput}
                />

                <GameButton
                  label='Lưu'
                  variant='gem'
                  size='md'
                  fullWidth
                  disabled={payAmount <= 0}
                  style={payAmount <= 0 ? styles.disabled : undefined}
                  onPress={handleAddPayment}
                />
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>

        {/* Netting modal */}
        <Modal
          visible={nettingOpen}
          transparent
          animationType='slide'
          onRequestClose={() => setNettingOpen(false)}
        >
          <View style={styles.payRoot}>
            <Pressable
              style={styles.backdrop}
              onPress={() => setNettingOpen(false)}
            />
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.kav}
            >
              <View style={styles.paySheet}>
                <View style={styles.handle} />
                <Text style={styles.payTitle}>Cấn trừ nợ chéo</Text>

                {opposingView && (
                  <View style={styles.nettingCompareRow}>
                    <View style={styles.nettingCompareCell}>
                      <Text style={styles.nettingCompareLabel}>Khoản hiện tại</Text>
                      <Text style={styles.nettingCompareVal}>{formatCompactVND(view.totalOwed)} ₫</Text>
                    </View>
                    <Icon name='swap-horizontal' size={20} color={colors.muted} />
                    <View style={styles.nettingCompareCell}>
                      <Text style={styles.nettingCompareLabel}>Khoản đối ứng</Text>
                      <Text style={styles.nettingCompareVal}>{formatCompactVND(opposingView.totalOwed)} ₫</Text>
                    </View>
                  </View>
                )}

                <View style={styles.amountWrap}>
                  <Text style={styles.dong}>₫</Text>
                  <TextInput
                    value={groupDigits(parseAmount(nettingAmountText))}
                    onChangeText={setNettingAmountText}
                    keyboardType='number-pad'
                    placeholder='0'
                    placeholderTextColor={colors.tabInactive}
                    style={styles.amountInput}
                    autoFocus
                  />
                </View>

                <Text style={styles.label}>Ghi chú</Text>
                <TextInput
                  value={nettingNote}
                  onChangeText={setNettingNote}
                  placeholder='Đối trừ công nợ...'
                  placeholderTextColor={colors.tabInactive}
                  style={styles.noteInput}
                />

                <GameButton
                  label='Xác nhận cấn trừ'
                  variant='gold'
                  size='md'
                  fullWidth
                  disabled={
                    parseAmount(nettingAmountText) <= 0 ||
                    (opposingView
                      ? parseAmount(nettingAmountText) > Math.min(view.totalOwed, opposingView.totalOwed)
                      : true)
                  }
                  style={
                    (parseAmount(nettingAmountText) <= 0 ||
                    (opposingView
                      ? parseAmount(nettingAmountText) > Math.min(view.totalOwed, opposingView.totalOwed)
                      : true))
                      ? styles.disabled
                      : undefined
                  }
                  onPress={async () => {
                    const amt = parseAmount(nettingAmountText);
                    const maxNet = opposingView ? Math.min(view.totalOwed, opposingView.totalOwed) : 0;
                    if (amt <= 0 || amt > maxNet || !opposingView) return;
                    const borrowId = view.type === 'borrow' ? view.id : opposingView.id;
                    const lendId = view.type === 'lend' ? view.id : opposingView.id;
                    await useDebtStore.getState().addNetting(
                      view.party,
                      amt,
                      borrowId,
                      lendId,
                      nettingNote.trim() || undefined
                    );
                    setNettingOpen(false);
                  }}
                />
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>
        </SafeAreaView>
      </KeyboardAvoidingView>

      {/* DatePickerModal for edit due date — sibling to SafeAreaView, inside outer Modal */}
      <DatePickerModal
        visible={editDueDatePickerOpen}
        value={editDueDate ?? todayStart() + 30 * 86_400_000}
        onSelect={setEditDueDate}
        onClose={() => setEditDueDatePickerOpen(false)}
      />
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
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    ...elevation.card,
  },
  title: {
    flex: 1,
    fontFamily: fonts.displayBold,
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    ...textShadow.emboss,
  },
  editBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    ...elevation.card,
  },
  deleteBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: tint(colors.red, '22'),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    ...elevation.card,
  },
  content: { paddingHorizontal: 20, paddingBottom: 100, gap: 16 },
  // Edit panel
  editPanel: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    ...elevation.card,
  },
  editLabel: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.muted,
    marginBottom: 6,
    marginTop: 4,
  },
  editInput: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.track,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  editNoteInput: {
    textAlignVertical: 'top',
    minHeight: 64,
    borderRadius: radius.md,
  },
  editAmountWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.track,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    gap: 6,
  },
  editDong: {
    fontFamily: fonts.monoMedium,
    fontSize: 18,
    color: colors.muted,
  },
  editAmountInput: {
    flex: 1,
    fontFamily: fonts.monoSemibold,
    fontSize: 20,
    color: colors.text,
    padding: 0,
  },
  editDueDateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    marginTop: 4,
  },
  editDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.track,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    gap: 10,
  },
  editDateLabel: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.text,
  },
  toggle: {
    width: 44,
    height: 26,
    borderRadius: radius.pill,
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
  editActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  editCancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: radius.pill,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.track,
  },
  editCancelText: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.muted,
  },
  disabled: { opacity: 0.4 },
  // —— original styles below ——
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeText: { fontFamily: fonts.semibold, fontSize: 12 },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.tabInactive },
  statusText: { fontFamily: fonts.semibold, fontSize: 12 },
  progressCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.lg,
    padding: 18,
    gap: 12,
    ...elevation.card,
  },
  progressAmounts: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted, marginBottom: 2 },
  progressOriginal: { fontFamily: fonts.monoSemibold, fontSize: 18, color: colors.text },
  progressRemaining: { fontFamily: fonts.monoSemibold, fontSize: 18 },
  track: {
    height: 8,
    backgroundColor: colors.track,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 4 },
  progressMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  progressMetaText: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  noteBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 12,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  noteText: { flex: 1, fontFamily: fonts.regular, fontSize: 13, color: colors.muted, lineHeight: 18 },
  settleLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...elevation.card,
  },
  settleLinkLabel: { fontFamily: fonts.medium, fontSize: 13, color: colors.text },
  sectionTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 13,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    ...textShadow.emboss,
  },
  emptyPayments: { fontFamily: fonts.medium, fontSize: 13, color: colors.tabInactive, textAlign: 'center', paddingVertical: 16 },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    ...elevation.card,
  },
  paymentIconWrap: {
    borderRadius: radius.sm,
  },
  paymentIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  paymentLeft: { flex: 1 },
  paymentDate: { fontFamily: fonts.semibold, fontSize: 13, color: colors.text },
  paymentNote: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted, marginTop: 2 },
  paymentAmount: { fontFamily: fonts.monoSemibold, fontSize: 14 },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.screenBg,
  },
  addPayBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.purple,
    backgroundColor: tint(colors.purple, '1A'),
  },
  addPayText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.purple },
  settleBtn: { flex: 1 },
  // Payment modal
  payRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(74,46,18,0.72)' },
  kav: { width: '100%' },
  paySheet: {
    backgroundColor: colors.cardAlt,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
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
  payTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    color: colors.text,
    marginBottom: 16,
    ...textShadow.emboss,
  },
  amountWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.track,
    borderRadius: radius.lg,
    paddingVertical: 14,
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
  label: { fontFamily: fonts.semibold, fontSize: 13, color: colors.muted, marginBottom: 8 },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.track,
    borderRadius: radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 8,
    marginBottom: 18,
  },
  dateArrow: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  dateLabel: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.text,
  },
  noteInput: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.track,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
  },
  nettingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: tint(colors.orange, '1F'),
    borderWidth: 1,
    borderColor: colors.orangeDeep,
    borderRadius: radius.md,
    padding: 14,
    ...elevation.card,
  },
  nettingTitle: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.orangeDeep,
  },
  nettingSub: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
    lineHeight: 15,
  },
  nettingBtn: {
    backgroundColor: colors.orangeDeep,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  nettingBtnText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.white,
  },
  nettingCompareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginVertical: 14,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  nettingCompareCell: {
    alignItems: 'center',
  },
  nettingCompareLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.muted,
    marginBottom: 2,
  },
  nettingCompareVal: {
    fontFamily: fonts.monoSemibold,
    fontSize: 16,
    color: colors.text,
  },
});
