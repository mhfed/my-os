import { useRef, useState } from 'react';
import {
  Alert,
  FlatList,
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

import { colors, tint } from '@/theme/colors';
import { Icon } from '@/theme/icons';
import { fonts } from '@/theme/typography';
import { useDebtStore } from '@/store/debtStore';
import { formatVND, formatCompactVND } from '@/utils/currency';
import { formatTxnDate } from '@/utils/date';
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
  if (view.status === 'settled') return { text: 'Đã tất toán', color: colors.teal };
  if (view.isOverdue) {
    const days = Math.abs(view.daysUntilDue ?? 0);
    return { text: `Quá hạn ${days} ngày`, color: colors.red };
  }
  if (view.dueDate) {
    const days = view.daysUntilDue ?? 0;
    if (days <= 7) return { text: `Còn ${days} ngày`, color: colors.orange };
    const d = new Date(view.dueDate);
    return { text: `Đến hạn ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`, color: colors.muted };
  }
  return { text: view.status === 'partial' ? 'Đã thanh toán một phần' : 'Đang mở', color: colors.muted };
}

export function DebtDetailSheet({ debtId, onClose }: DebtDetailSheetProps) {
  const getDebtView = useDebtStore((s) => s.getDebtView);
  const addPayment = useDebtStore((s) => s.addPayment);
  const deletePayment = useDebtStore((s) => s.deletePayment);
  const settleDebt = useDebtStore((s) => s.settleDebt);
  const deleteDebt = useDebtStore((s) => s.deleteDebt);

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [payAmountText, setPayAmountText] = useState('');
  const [payNote, setPayNote] = useState('');
  const [payDate, setPayDate] = useState(todayStart);
  const [linkTxnOnSettle, setLinkTxnOnSettle] = useState(true);

  // Cache last valid view so the pageSheet can animate out before unmounting
  const viewRef = useRef<DebtView | null>(null);
  const liveView = debtId ? getDebtView(debtId) : null;
  if (liveView) viewRef.current = liveView;
  const view = viewRef.current;

  if (!view) return null;

  const payAmount = parseAmount(payAmountText);
  const today = todayStart();
  const status = statusLabel(view);

  async function handleAddPayment() {
    if (payAmount <= 0) return;
    await addPayment(view!.id, payAmount, payDate + 12 * 3_600_000, payNote.trim() || undefined);
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
      : colors.purple;

  return (
    <Modal
      visible={!!debtId}
      animationType='slide'
      presentationStyle='pageSheet'
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
            <Icon name='chevron-down' size={20} color={colors.muted} />
          </Pressable>
          <Text style={styles.title} numberOfLines={1}>
            {view.party}
          </Text>
          <Pressable onPress={handleDelete} style={styles.deleteBtn} hitSlop={8}>
            <Icon name='delete-outline' size={18} color={colors.red} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Type badge */}
          <View style={styles.typeBadge}>
            <Icon
              name={view.type === 'lend' ? 'hand-coin' : 'bank-outline'}
              size={13}
              color={view.type === 'lend' ? colors.teal : colors.orange}
            />
            <Text style={[styles.typeText, { color: view.type === 'lend' ? colors.teal : colors.orange }]}>
              {view.type === 'lend' ? 'Tôi cho vay' : 'Tôi đi vay'}
            </Text>
            <View style={styles.dot} />
            <Text style={[styles.statusText, { color: status.color }]}>{status.text}</Text>
          </View>

          {/* Progress card */}
          <View style={styles.progressCard}>
            <View style={styles.progressAmounts}>
              <View>
                <Text style={styles.progressLabel}>Số tiền gốc</Text>
                <Text style={styles.progressOriginal}>{formatVND(view.originalAmount)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.progressLabel}>Còn lại</Text>
                <Text style={[styles.progressRemaining, { color: progressColor }]}>
                  {formatVND(view.totalOwed)}
                </Text>
              </View>
            </View>

            {/* Progress bar */}
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${progressW * 100}%`, backgroundColor: progressColor }]} />
            </View>

            <View style={styles.progressMeta}>
              <Text style={styles.progressMetaText}>
                Đã trả: {formatCompactVND(view.paidAmount)} ({Math.round(view.progressPct * 100)}%)
              </Text>
              {view.accruedInterest > 0 && (
                <Text style={[styles.progressMetaText, { color: colors.orange }]}>
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

          {/* Settle link toggle (only when not yet settled) */}
          {view.status !== 'settled' && (
            <View style={styles.settleLinkRow}>
              <Text style={styles.settleLinkLabel}>Ghi vào giao dịch khi tất toán</Text>
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
            view.payments.map((p) => (
              <View key={p.id} style={styles.paymentRow}>
                <View style={styles.paymentLeft}>
                  <Text style={styles.paymentDate}>{formatTxnDate(p.date)}</Text>
                  {p.note && <Text style={styles.paymentNote}>{p.note}</Text>}
                </View>
                <Text style={[styles.paymentAmount, { color: colors.teal }]}>
                  +{formatCompactVND(p.amount)}
                </Text>
                <Pressable
                  hitSlop={8}
                  onPress={() => deletePayment(p.id, view!.id, p.amount)}
                >
                  <Icon name='close' size={14} color={colors.tabInactive} />
                </Pressable>
              </View>
            ))
          )}
        </ScrollView>

        {/* Actions */}
        {view.status !== 'settled' && (
          <View style={styles.actions}>
            <Pressable style={styles.addPayBtn} onPress={() => setPaymentOpen(true)}>
              <Icon name='plus' size={18} color={colors.purple} />
              <Text style={styles.addPayText}>Ghi nhận thanh toán</Text>
            </Pressable>
            <Pressable style={styles.settleBtn} onPress={handleSettle}>
              <Icon name='check-circle-outline' size={18} color={colors.white} />
              <Text style={styles.settleBtnText}>Tất toán</Text>
            </Pressable>
          </View>
        )}

        {/* Add payment inline modal */}
        <Modal visible={paymentOpen} transparent animationType='slide' onRequestClose={() => setPaymentOpen(false)}>
          <View style={styles.payRoot}>
            <Pressable style={styles.backdrop} onPress={() => setPaymentOpen(false)} />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.kav}>
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
                  <Pressable onPress={() => setPayDate((d) => d - 86_400_000)} style={styles.dateArrow} hitSlop={8}>
                    <Icon name='chevron-left' size={18} color={colors.muted} />
                  </Pressable>
                  <Text style={styles.dateLabel}>{dayLabel(payDate)}</Text>
                  <Pressable
                    onPress={() => setPayDate((d) => Math.min(d + 86_400_000, today))}
                    style={styles.dateArrow}
                    disabled={payDate >= today}
                    hitSlop={8}
                  >
                    <Icon name='chevron-right' size={18} color={payDate >= today ? colors.tabInactive : colors.muted} />
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

                <Pressable
                  onPress={handleAddPayment}
                  disabled={payAmount <= 0}
                  style={[styles.submit, payAmount <= 0 && styles.disabled]}
                >
                  <Text style={styles.submitText}>Lưu</Text>
                </Pressable>
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>
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
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: tint(colors.red, '22'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { paddingHorizontal: 20, paddingBottom: 100, gap: 16 },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeText: { fontFamily: fonts.medium, fontSize: 12 },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.tabInactive },
  statusText: { fontFamily: fonts.medium, fontSize: 12 },
  progressCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 18,
    gap: 12,
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
    borderRadius: 12,
    padding: 12,
    alignItems: 'flex-start',
  },
  noteText: { flex: 1, fontFamily: fonts.regular, fontSize: 13, color: colors.muted, lineHeight: 18 },
  settleLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  settleLinkLabel: { fontFamily: fonts.medium, fontSize: 13, color: colors.text },
  sectionTitle: { fontFamily: fonts.semibold, fontSize: 13, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  emptyPayments: { fontFamily: fonts.regular, fontSize: 13, color: colors.tabInactive, textAlign: 'center', paddingVertical: 16 },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
  },
  paymentLeft: { flex: 1 },
  paymentDate: { fontFamily: fonts.medium, fontSize: 13, color: colors.text },
  paymentNote: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted, marginTop: 2 },
  paymentAmount: { fontFamily: fonts.monoSemibold, fontSize: 14 },
  actions: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
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
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.purple,
    backgroundColor: tint(colors.purple, '1A'),
  },
  addPayText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.purple },
  settleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: colors.teal,
  },
  settleBtnText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.white },
  // Payment modal
  payRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  kav: { width: '100%' },
  paySheet: {
    backgroundColor: colors.screenBg,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  handle: {
    alignSelf: 'center',
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: 14,
  },
  payTitle: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text, marginBottom: 16 },
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
  label: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted, marginBottom: 8 },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
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
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
  },
  submit: {
    backgroundColor: colors.purple,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  submitText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.white },
  disabled: { opacity: 0.4 },
});
