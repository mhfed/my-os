import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, tint } from '@/theme/colors';
import { Icon } from '@/theme/icons';
import { fonts } from '@/theme/typography';

interface DatePickerModalProps {
  visible: boolean;
  value: number;
  onSelect: (epochMs: number) => void;
  onClose: () => void;
  minDate?: number;
  maxDate?: number;
}

const DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const MONTH_NAMES = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
  'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
  'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
];

function startOfDay(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

// Monday-first offset: Mon=0 … Sun=6
function firstDayOffset(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return (day - 1 + 7) % 7;
}

function buildGrid(year: number, month: number): (number | null)[][] {
  const offset = firstDayOffset(year, month);
  const days = daysInMonth(year, month);
  const totalCells = Math.ceil((offset + days) / 7) * 7;
  const cells: (number | null)[] = Array(totalCells).fill(null);
  for (let d = 1; d <= days; d++) cells[offset + d - 1] = d;
  const rows: (number | null)[][] = [];
  for (let i = 0; i < totalCells; i += 7) rows.push(cells.slice(i, i + 7));
  return rows;
}

export function DatePickerModal({
  visible,
  value,
  onSelect,
  onClose,
  minDate,
  maxDate,
}: DatePickerModalProps) {
  const insets = useSafeAreaInsets();
  const selected = startOfDay(value);

  const init = new Date(value);
  const [viewYear, setViewYear] = useState(init.getFullYear());
  const [viewMonth, setViewMonth] = useState(init.getMonth());

  const todayMs = startOfDay(Date.now());
  const grid = useMemo(() => buildGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  function prevMonth() {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  }

  function selectDay(day: number) {
    const d = new Date(viewYear, viewMonth, day);
    d.setHours(0, 0, 0, 0);
    const ms = d.getTime();
    if (minDate && ms < startOfDay(minDate)) return;
    if (maxDate && ms > startOfDay(maxDate)) return;
    onSelect(ms);
    onClose();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.handle} />

          {/* Month nav */}
          <View style={styles.nav}>
            <Pressable onPress={prevMonth} style={styles.navBtn} hitSlop={10}>
              <Icon name='chevron-left' size={20} color={colors.text} />
            </Pressable>
            <Text style={styles.monthLabel}>{MONTH_NAMES[viewMonth]}, {viewYear}</Text>
            <Pressable onPress={nextMonth} style={styles.navBtn} hitSlop={10}>
              <Icon name='chevron-right' size={20} color={colors.text} />
            </Pressable>
          </View>

          {/* Day-of-week header */}
          <View style={styles.row}>
            {DAY_LABELS.map((lbl) => (
              <Text key={lbl} style={styles.dayHeader}>{lbl}</Text>
            ))}
          </View>

          {/* Calendar grid */}
          {grid.map((week, wi) => (
            <View key={wi} style={styles.row}>
              {week.map((day, di) => {
                if (!day) return <View key={di} style={styles.cell} />;

                const d = new Date(viewYear, viewMonth, day);
                d.setHours(0, 0, 0, 0);
                const ms = d.getTime();
                const isSelected = ms === selected;
                const isToday = ms === todayMs;
                const disabled =
                  (!!minDate && ms < startOfDay(minDate)) ||
                  (!!maxDate && ms > startOfDay(maxDate));

                return (
                  <Pressable
                    key={di}
                    style={[styles.cell, isSelected && styles.cellSelected]}
                    onPress={() => !disabled && selectDay(day)}
                    disabled={disabled}
                  >
                    <Text style={[
                      styles.dayText,
                      isSelected && styles.dayTextSelected,
                      isToday && !isSelected && styles.dayTextToday,
                      disabled && styles.dayTextDisabled,
                    ]}>
                      {day}
                    </Text>
                    {isToday && !isSelected && <View style={styles.todayDot} />}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    </Modal>
  );
}

const CELL_SIZE = 42;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    backgroundColor: colors.screenBg,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  handle: {
    alignSelf: 'center',
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: 16,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 4,
  },
  dayHeader: {
    width: CELL_SIZE,
    textAlign: 'center',
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.muted,
    paddingBottom: 6,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellSelected: { backgroundColor: colors.purple },
  dayText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.text,
  },
  dayTextSelected: { color: colors.white, fontFamily: fonts.semibold },
  dayTextToday: { color: colors.purple },
  dayTextDisabled: { color: colors.tabInactive },
  todayDot: {
    position: 'absolute',
    bottom: 5,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.purple,
  },
});
