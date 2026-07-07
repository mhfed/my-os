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
import { BlurView } from 'expo-blur';

import { colors, elevation, radius, tint } from '@/theme/colors';
import { Icon } from '@/theme/icons';
import { useFinanceStore } from '@/store/financeStore';
import { fonts, textShadow } from '@/theme/typography';
import { PressableScale } from '@/components/motion';
import { GameButton, GameIconButton } from '@/components/game';

import type { Category, Transaction } from '@/types/finance';

interface QuickPettyCashModalProps {
  visible: boolean;
  onClose: () => void;
  onSwitchToDetailed?: () => void;
}

interface SmartPreset {
  label: string;
  value: number;
  categoryId: string;
  note: string;
}

function getSmartPresets(transactions: Transaction[], categories: Category[]): SmartPreset[] {
  const expenseTxns = transactions.filter((t) => t.type === 'expense');
  
  // Count frequency of combinations of (amount, categoryId, note)
  const counts = new Map<string, { count: number; amount: number; categoryId: string; note: string }>();
  
  for (const t of expenseTxns) {
    const noteClean = (t.note || '').trim();
    if (!noteClean) continue;
    
    const key = `${t.amount}-${t.categoryId}-${noteClean.toLowerCase()}`;
    const existing = counts.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(key, { count: 1, amount: t.amount, categoryId: t.categoryId, note: noteClean });
    }
  }
  
  // Sort by frequency
  const sorted = Array.from(counts.values()).sort((a, b) => b.count - a.count);
  
  const results: SmartPreset[] = sorted.slice(0, 5).map((item) => {
    const amtLabel = item.amount >= 1000000 
      ? `${(item.amount / 1000000).toFixed(1).replace('.0', '')}M` 
      : `${item.amount / 1000}k`;
    return {
      label: `${amtLabel} ${item.note}`,
      value: item.amount,
      categoryId: item.categoryId,
      note: item.note,
    };
  });
  
  // Pad with default presets
  const defaults = [
    { label: '5k gửi xe', value: 5000, categoryId: '', note: 'Gửi xe' },
    { label: '15k bánh mì', value: 15000, categoryId: '', note: 'Bánh mì' },
    { label: '35k cà phê', value: 35000, categoryId: '', note: 'Cà phê' },
    { label: '50k ăn trưa', value: 50000, categoryId: '', note: 'Ăn trưa' },
    { label: '100k mua sắm', value: 100000, categoryId: '', note: 'Mua sắm' },
  ];
  
  const firstExpenseCat = categories.find(c => c.type === 'expense')?.id || '';
  
  let idx = 0;
  while (results.length < 5 && idx < defaults.length) {
    const d = defaults[idx++];
    const exists = results.some(r => r.value === d.value && r.note.toLowerCase() === d.note.toLowerCase());
    if (!exists) {
      results.push({
        label: d.label,
        value: d.value,
        categoryId: d.categoryId || firstExpenseCat,
        note: d.note,
      });
    }
  }
  
  return results;
}

export function QuickPettyCashModal({ visible, onClose, onSwitchToDetailed }: QuickPettyCashModalProps) {
  const insets = useSafeAreaInsets();
  const allCategories = useFinanceStore((s) => s.categories);
  const transactions = useFinanceStore((s) => s.transactions);
  const addTransaction = useFinanceStore((s) => s.addTransaction);

  const [amountText, setAmountText] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const expenseCategories = allCategories.filter((c) => c.type === 'expense');

  // Set default category to the first one available
  if (!categoryId && expenseCategories.length > 0) {
    setCategoryId(expenseCategories[0].id);
  }

  function handleNumberPress(num: string) {
    setAmountText((prev) => {
      // Prevent multiple leading zeros
      if (prev === '0' && num === '0') return prev;
      if (prev === '0') return num;
      return prev + num;
    });
  }

  function handleBackspace() {
    setAmountText((prev) => (prev.length > 1 ? prev.slice(0, -1) : ''));
  }

  function handleClear() {
    setAmountText('');
  }

  const amount = amountText ? parseInt(amountText, 10) : 0;

  async function handleSave(addMore = false) {
    if (amount <= 0 || !categoryId) return;

    // Use noon of today
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    
    await addTransaction({
      type: 'expense',
      amount,
      categoryId,
      note: note.trim() || undefined,
      date: d.getTime(),
    });

    setAmountText('');
    setNote('');

    if (!addMore) {
      onClose();
    }
  }

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
            <BlurView tint='dark' intensity={28} style={StyleSheet.absoluteFill} />
            <View style={styles.handle} />

            <View style={styles.headerRow}>
              <Text style={styles.title}>Chi tiêu nhanh</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                {onSwitchToDetailed && (
                  <PressableScale
                    onPress={onSwitchToDetailed}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: radius.pill,
                      backgroundColor: tint(colors.purple, '1A'),
                      borderWidth: 1,
                      borderColor: colors.purple,
                    }}
                    haptic='light'
                  >
                    <Icon name='pencil-plus-outline' size={13} color={colors.purple} />
                    <Text style={{ fontFamily: fonts.semibold, fontSize: 11, color: colors.purple }}>Nhập chi tiết</Text>
                  </PressableScale>
                )}
                <GameIconButton
                  icon='close'
                  variant='red'
                  size={36}
                  iconSize={16}
                  onPress={onClose}
                />
              </View>
            </View>

            {/* Display screen */}
            <View style={styles.display}>
              <Text style={styles.displaySymbol}>₫</Text>
              <Text style={styles.displayAmount} numberOfLines={1}>
                {amount > 0 ? amount.toLocaleString('vi-VN') : '0'}
              </Text>
            </View>

            {/* Presets */}
            <View style={styles.presets}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsScroll}>
                {getSmartPresets(transactions, allCategories).map((p) => {
                  const isActive = amount === p.value && note === p.note;
                  return (
                    <PressableScale
                      key={p.label}
                      onPress={() => {
                        setAmountText(String(p.value));
                        setNote(p.note);
                        if (p.categoryId) {
                          setCategoryId(p.categoryId);
                        }
                      }}
                      style={[
                        styles.presetChip,
                        isActive && styles.presetChipActive
                      ]}
                      haptic='light'
                    >
                      <Text style={[styles.presetText, isActive && styles.presetTextActive]}>
                        {p.label}
                      </Text>
                    </PressableScale>
                  );
                })}
              </ScrollView>
            </View>

            {/* Categories horizontal scroll */}
            <Text style={styles.sectionLabel}>Danh mục</Text>
            <View style={styles.categoriesWrap}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
                {expenseCategories.map((c) => {
                  const active = categoryId === c.id;
                  return (
                    <PressableScale
                      key={c.id}
                      onPress={() => setCategoryId(c.id)}
                      style={[
                        styles.catChip,
                        active && { borderColor: c.color, backgroundColor: tint(c.color, '1F') }
                      ]}
                      haptic='light'
                    >
                      <Icon name={c.icon as any} size={15} color={active ? c.color : colors.muted} />
                      <Text style={[styles.catChipText, active && { color: c.color, fontFamily: fonts.semibold }]}>
                        {c.name}
                      </Text>
                    </PressableScale>
                  );
                })}
              </ScrollView>
            </View>

            {/* Quick Note input */}
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder='Ghi chú nhanh (ví dụ: bún chả, gửi xe cơ quan...)'
              placeholderTextColor={colors.tabInactive}
              style={styles.noteInput}
              autoCorrect={false}
            />

            {/* Custom Numpad Grid */}
            <View style={styles.numpad}>
              <View style={styles.numpadRow}>
                {['1', '2', '3'].map((n) => (
                  <PressableScale key={n} onPress={() => handleNumberPress(n)} style={styles.numBtn} haptic='light'>
                    <Text style={styles.numBtnText}>{n}</Text>
                  </PressableScale>
                ))}
              </View>
              <View style={styles.numpadRow}>
                {['4', '5', '6'].map((n) => (
                  <PressableScale key={n} onPress={() => handleNumberPress(n)} style={styles.numBtn} haptic='light'>
                    <Text style={styles.numBtnText}>{n}</Text>
                  </PressableScale>
                ))}
              </View>
              <View style={styles.numpadRow}>
                {['7', '8', '9'].map((n) => (
                  <PressableScale key={n} onPress={() => handleNumberPress(n)} style={styles.numBtn} haptic='light'>
                    <Text style={styles.numBtnText}>{n}</Text>
                  </PressableScale>
                ))}
              </View>
              <View style={styles.numpadRow}>
                <PressableScale onPress={handleClear} style={styles.numBtn} haptic='light'>
                  <Text style={[styles.numBtnText, { color: colors.red }]}>C</Text>
                </PressableScale>
                <PressableScale onPress={() => handleNumberPress('0')} style={styles.numBtn} haptic='light'>
                  <Text style={styles.numBtnText}>0</Text>
                </PressableScale>
                <PressableScale onPress={handleBackspace} style={styles.numBtn} haptic='light'>
                  <Icon name='backspace-outline' size={20} color={colors.text} />
                </PressableScale>
              </View>
            </View>

            {/* Submit Action Buttons */}
            <View style={styles.actionRow}>
              <View style={styles.btn}>
                <GameButton
                  label='Lưu & Thêm tiếp'
                  variant='blue'
                  size='md'
                  fullWidth
                  disabled={amount <= 0 || !categoryId}
                  style={(amount <= 0 || !categoryId) ? styles.disabled : undefined}
                  onPress={() => handleSave(true)}
                />
              </View>
              <View style={styles.btn}>
                <GameButton
                  label='Hoàn tất'
                  variant='gold'
                  size='md'
                  fullWidth
                  disabled={amount <= 0 || !categoryId}
                  style={(amount <= 0 || !categoryId) ? styles.disabled : undefined}
                  onPress={() => handleSave(false)}
                />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  kav: {
    width: '100%',
  },
  sheet: {
    backgroundColor: 'rgba(18,20,28,0.92)',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 20,
    paddingTop: 8,
    overflow: 'hidden',
    ...elevation.panel,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    color: colors.text,
    ...textShadow.emboss,
  },
  display: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    gap: 8,
  },
  displaySymbol: {
    fontFamily: fonts.monoMedium,
    fontSize: 24,
    color: colors.gold,
  },
  displayAmount: {
    fontFamily: fonts.monoSemibold,
    fontSize: 28,
    color: colors.text,
  },
  presets: {
    marginBottom: 12,
  },
  presetsScroll: {
    gap: 8,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  presetChipActive: {
    backgroundColor: tint(colors.gold, '22'),
    borderColor: colors.gold,
  },
  presetText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.muted,
  },
  presetTextActive: {
    color: colors.gold,
    fontFamily: fonts.semibold,
  },
  sectionLabel: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.muted,
    marginBottom: 6,
  },
  categoriesWrap: {
    marginBottom: 12,
  },
  categoriesScroll: {
    gap: 8,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  catChipText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
  },
  noteInput: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.text,
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
  },
  numpad: {
    gap: 8,
    marginBottom: 18,
    alignSelf: 'stretch',
  },
  numpadRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  numBtn: {
    flex: 1,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numBtnText: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: colors.text,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  btn: {
    flex: 1,
  },
  disabled: {
    opacity: 0.4,
  },
});
