import { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, radius, tint, base3D, elevation } from '@/theme/colors';
import { Icon } from '@/theme/icons';
import { fonts, textShadow } from '@/theme/typography';
import { PressableScale, AnimatedCard } from '@/components/motion';
import { GameIconButton } from '@/components/game';
import { useDebtStore } from '@/store/debtStore';
import { formatCompactVND, formatVND } from '@/utils/currency';
import type { DebtType, DebtView } from '@/types/debt';

import { AddDebtSheet } from './AddDebtSheet';
import { DebtDetailSheet } from './DebtDetailSheet';

interface DebtLedgerSheetProps {
  visible: boolean;
  onClose: () => void;
}

type DebtFilter = 'open' | 'settled';

function DebtRow({
  view,
  onPress,
  index,
}: {
  view: DebtView;
  onPress: () => void;
  index: number;
}) {
  // Red for debts I owe (borrow), green for debts owed to me (lend).
  const isLend = view.type === 'lend';
  const accent = isLend ? colors.green : colors.red;
  const accentDeep = isLend ? colors.greenDeep : colors.redDeep;

  const progressColor =
    view.status === 'settled'
      ? colors.teal
      : view.isOverdue
        ? colors.red
        : (view.daysUntilDue ?? Infinity) <= 7
          ? colors.orange
          : accent;

  const statusLabel =
    view.status === 'settled'
      ? { text: 'Tất toán ✅', color: colors.tealDeep }
      : view.isOverdue
        ? {
            text: `Quá hạn ${Math.abs(view.daysUntilDue ?? 0)} ngày`,
            color: colors.redDeep,
          }
        : view.dueDate
          ? (view.daysUntilDue ?? Infinity) <= 7
            ? { text: `Còn ${view.daysUntilDue} ngày`, color: colors.orangeDeep }
            : (() => {
                const d = new Date(view.dueDate);
                return {
                  text: `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`,
                  color: colors.muted,
                };
              })()
          : {
              text: view.status === 'partial' ? 'Một phần' : 'Đang mở',
              color: colors.muted,
            };

  const pct = Math.min(1, view.progressPct);

  return (
    <AnimatedCard index={index}>
      <PressableScale style={styles.row} onPress={onPress} haptic='light'>
        {/* Icon badge */}
        <View style={[styles.avatarWrap, base3D(accentDeep, 3)]}>
          <View style={[styles.avatar, { backgroundColor: accent }]}>
            <Icon
              name={isLend ? 'hand-coin' : 'bank-outline'}
              size={18}
              color={colors.white}
            />
          </View>
        </View>

        <View style={styles.rowMid}>
          <View style={styles.rowTop}>
            <Text style={styles.party} numberOfLines={1}>
              {view.party}
            </Text>
            <Text style={[styles.statusBadge, { color: statusLabel.color }]}>
              {statusLabel.text}
            </Text>
          </View>

          {/* Mini progress bar */}
          <View style={styles.miniTrack}>
            <View
              style={[
                styles.miniFill,
                { width: `${pct * 100}%`, backgroundColor: progressColor },
              ]}
            />
          </View>

          <View style={styles.rowBottom}>
            <Text style={styles.paidText}>
              {formatCompactVND(view.paidAmount)} /{' '}
              {formatCompactVND(view.originalAmount)}
            </Text>
            <Text style={[styles.remainText, { color: accentDeep }]}>
              {view.status === 'settled'
                ? '✓'
                : `còn ${formatCompactVND(view.totalOwed)}`}
            </Text>
          </View>
        </View>

        <Icon name='chevron-right' size={16} color={colors.tabInactive} />
      </PressableScale>
    </AnimatedCard>
  );
}

export function DebtLedgerSheet({ visible, onClose }: DebtLedgerSheetProps) {
  const entries = useDebtStore((s) => s.entries);
  const payments = useDebtStore((s) => s.payments);
  const getDebtView = useDebtStore((s) => s.getDebtView);
  const getSummary = useDebtStore((s) => s.getSummary);

  const [tab, setTab] = useState<DebtType>('lend');
  const [statusFilter, setStatusFilter] = useState<DebtFilter>('open');
  const [addOpen, setAddOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const summary = getSummary();

  const views = entries
    .filter((e) => {
      if (e.type !== tab) return false;
      if (statusFilter === 'open') return e.status !== 'settled';
      return e.status === 'settled';
    })
    .map((e) => getDebtView(e.id)!)
    .filter(Boolean)
    .sort((a, b) => {
      // Sort: overdue → upcoming → open → partial
      if (a.status === 'settled' && b.status !== 'settled') return 1;
      if (b.status === 'settled' && a.status !== 'settled') return -1;
      if (a.isOverdue && !b.isOverdue) return -1;
      if (b.isOverdue && !a.isOverdue) return 1;
      if (a.dueDate && b.dueDate) return a.dueDate - b.dueDate;
      return b.createdAt - a.createdAt;
    });

  return (
    <Modal
      visible={visible}
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
          <Text style={styles.title}>Sổ nợ</Text>
          <PressableScale
            onPress={onClose}
            haptic='light'
            style={styles.closeBtn}
          >
            <Icon name='close' size={18} color={colors.muted} />
          </PressableScale>
        </View>

        {/* Summary bar */}
        <View style={styles.summaryBar}>
          <View style={styles.summaryCol}>
            <Text style={styles.summaryLabel}>Thu về</Text>
            <Text style={[styles.summaryValue, { color: colors.greenDeep }]}>
              +{formatCompactVND(summary.totalReceivable)}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryCol}>
            <Text style={styles.summaryLabel}>Phải trả</Text>
            <Text style={[styles.summaryValue, { color: colors.redDeep }]}>
              -{formatCompactVND(summary.totalPayable)}
            </Text>
          </View>
          {(summary.overdueCount > 0 || summary.upcomingCount > 0) && (
            <>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryCol}>
                <Text style={styles.summaryLabel}>Cảnh báo</Text>
                <Text
                  style={[
                    styles.summaryValue,
                    { color: colors.orangeDeep, fontSize: 13 },
                  ]}
                >
                  {summary.overdueCount > 0
                    ? `${summary.overdueCount} quá hạn`
                    : `${summary.upcomingCount} sắp hạn`}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Tab: Lend / Borrow */}
        <View style={styles.tabs}>
          {(['lend', 'borrow'] as const).map((t) => {
            const active = tab === t;
            return (
              <Pressable
                key={t}
                onPress={() => setTab(t)}
                style={[styles.tabBtn, active && styles.tabBtnActive]}
              >
                <Icon
                  name={t === 'lend' ? 'hand-coin' : 'bank-outline'}
                  size={14}
                  color={active ? colors.white : colors.muted}
                />
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                  {t === 'lend' ? 'Tôi cho vay' : 'Tôi đang nợ'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Status filter chips */}
        <View style={styles.filterRow}>
          {(['open', 'settled'] as const).map((f) => {
            const active = statusFilter === f;
            return (
              <Pressable
                key={f}
                onPress={() => setStatusFilter(f)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text
                  style={[styles.chipText, active && styles.chipTextActive]}
                >
                  {f === 'open' ? 'Đang mở' : 'Đã tất toán'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* List */}
        <FlatList
          data={views}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Icon name='handshake' size={36} color={colors.tabInactive} />
              <Text style={styles.emptyText}>
                {statusFilter === 'open'
                  ? 'Không có khoản đang mở'
                  : 'Không có khoản đã tất toán'}
              </Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <DebtRow
              view={item}
              index={index}
              onPress={() => setSelectedId(item.id)}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />

        {/* FAB */}
        <GameIconButton
          icon='plus'
          variant='purple'
          size={56}
          style={styles.fab}
          onPress={() => setAddOpen(true)}
        />
      </SafeAreaView>

      {/* Sub-sheets must be inside the pageSheet Modal to appear on top of it */}
      <AddDebtSheet visible={addOpen} onClose={() => setAddOpen(false)} />
      <DebtDetailSheet debtId={selectedId} onClose={() => setSelectedId(null)} />
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.screenBg },
  screenGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 180 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
    color: colors.text,
    ...textShadow.emboss,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    ...elevation.card,
  },
  summaryBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
    borderRadius: radius.lg,
    paddingVertical: 14,
    ...elevation.card,
  },
  summaryCol: { flex: 1, alignItems: 'center', gap: 3 },
  summaryLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.muted,
  },
  summaryValue: { fontFamily: fonts.monoSemibold, fontSize: 15 },
  summaryDivider: { width: 1, backgroundColor: colors.border },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: colors.cardAlt,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.track,
    padding: 4,
    gap: 4,
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.sm,
  },
  tabBtnActive: {
    backgroundColor: colors.purple,
    ...base3D(colors.purpleDeep, 2),
  },
  tabText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.muted },
  tabTextActive: { color: colors.white, ...textShadow.button },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.track,
    backgroundColor: colors.card,
  },
  chipActive: {
    backgroundColor: tint(colors.purple, '22'),
    borderColor: colors.purple,
  },
  chipText: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted },
  chipTextActive: { color: colors.purple, fontFamily: fonts.semibold },
  list: { paddingHorizontal: 20, paddingBottom: 110, paddingTop: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
    borderRadius: radius.lg,
    padding: 14,
    ...elevation.card,
  },
  avatarWrap: {
    borderRadius: radius.sm,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  rowMid: { flex: 1, gap: 6 },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  party: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  statusBadge: { fontFamily: fonts.medium, fontSize: 11 },
  miniTrack: {
    height: 5,
    backgroundColor: colors.track,
    borderRadius: 3,
    overflow: 'hidden',
  },
  miniFill: { height: '100%', borderRadius: 3 },
  rowBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  paidText: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted },
  remainText: { fontFamily: fonts.monoSemibold, fontSize: 11 },
  separator: { height: 10 },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.tabInactive,
  },
  fab: {
    position: 'absolute',
    right: 22,
    bottom: 28,
  },
});
