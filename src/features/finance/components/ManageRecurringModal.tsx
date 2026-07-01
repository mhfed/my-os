import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';

import { base3D, colors, elevation, radius, tint } from '@/theme/colors';
import { fonts, textShadow } from '@/theme/typography';
import { useFinanceStore } from '@/store/financeStore';
import { Icon } from '@/theme/icons';
import { GameButton, GameIconButton } from '@/components/game';
import { AnimatedCard, PressableScale } from '@/components/motion';

interface ManageRecurringModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ManageRecurringModal({
  visible,
  onClose,
}: ManageRecurringModalProps) {
  const recurring = useFinanceStore((s) => s.recurring);
  const categories = useFinanceStore((s) => s.categories);
  const addRecurring = useFinanceStore((s) => s.addRecurring);
  const deleteRecurring = useFinanceStore((s) => s.deleteRecurring);

  const [mode, setMode] = useState<'list' | 'add'>('list');

  // Add form state
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [amountStr, setAmountStr] = useState('');
  const [note, setNote] = useState('');
  const [dayOfMonthStr, setDayOfMonthStr] = useState('1');

  const canSave =
    selectedCategoryId !== null &&
    parseInt(amountStr, 10) > 0 &&
    parseInt(dayOfMonthStr, 10) >= 1 &&
    parseInt(dayOfMonthStr, 10) <= 28;

  function resetForm() {
    setSelectedCategoryId(null);
    setAmountStr('');
    setNote('');
    setDayOfMonthStr('1');
    setMode('list');
  }

  function handleClose() {
    setMode('list');
    onClose();
  }

  async function handleSave() {
    if (!canSave) return;
    const cat = categories.find((c) => c.id === selectedCategoryId);
    if (!cat) return;
    await addRecurring({
      type: cat.type,
      categoryId: selectedCategoryId,
      amount: parseInt(amountStr, 10),
      note: note.trim() || undefined,
      dayOfMonth: parseInt(dayOfMonthStr, 10),
    });
    resetForm();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType='slide'
      onRequestClose={handleClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropFill} onPress={handleClose} />
        <View style={styles.sheet}>
          <BlurView tint='light' intensity={46} style={StyleSheet.absoluteFill} />
          <View style={styles.handle} />

          <View style={styles.header}>
            {mode === 'add' ? (
              <Pressable
                onPress={() => setMode('list')}
                style={styles.backBtn}
                hitSlop={8}
              >
                <Icon name='arrow-left' size={20} color={colors.text} />
              </Pressable>
            ) : (
              <View style={styles.backBtnSpacer} />
            )}
            <Text style={styles.title}>
              {mode === 'list' ? 'Recurring' : 'Add Recurring'}
            </Text>
            <GameIconButton
              icon='close'
              variant='red'
              size={36}
              iconSize={17}
              onPress={handleClose}
            />
          </View>

          {mode === 'list' && (
            <View style={styles.listWrap}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              >
                {recurring.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyEmoji}>🔁</Text>
                    <Text style={styles.emptyText}>
                      No recurring transactions configured.
                    </Text>
                  </View>
                ) : (
                  recurring.map((item, index) => {
                    const cat = categories.find(
                      (c) => c.id === item.categoryId,
                    );
                    if (!cat) return null;
                    return (
                      <AnimatedCard key={item.id} index={index}>
                        <View style={styles.itemRow}>
                          <View
                            style={[
                              styles.itemIconWrap,
                              base3D(colors.purpleDeep, 2),
                            ]}
                          >
                            <View
                              style={[
                                styles.itemIcon,
                                { backgroundColor: tint(cat.color, '33') },
                              ]}
                            >
                              <Icon
                                name={cat.icon as any}
                                size={17}
                                color={cat.color}
                              />
                            </View>
                          </View>
                          <View style={styles.itemInfo}>
                            <Text style={styles.itemTitle} numberOfLines={1}>
                              {item.note || cat.name}
                            </Text>
                            <Text style={styles.itemSub}>
                              Day {item.dayOfMonth} ·{' '}
                              {item.type === 'income' ? '+' : '-'}
                              {item.amount.toLocaleString()}đ
                            </Text>
                          </View>
                          <GameIconButton
                            icon='trash-can-outline'
                            variant='red'
                            size={34}
                            iconSize={16}
                            onPress={() => deleteRecurring(item.id)}
                          />
                        </View>
                      </AnimatedCard>
                    );
                  })
                )}
              </ScrollView>
              <GameButton
                label='Add recurring'
                variant='purple'
                size='md'
                icon='plus'
                fullWidth
                onPress={() => setMode('add')}
                style={styles.addButton}
              />
            </View>
          )}

          {mode === 'add' && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.formContent}
            >
              <Text style={styles.fieldLabel}>CATEGORY</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryScroll}
                style={styles.categoryScrollWrap}
              >
                {categories.map((c) => {
                  const isActive = c.id === selectedCategoryId;
                  return (
                    <PressableScale
                      key={c.id}
                      onPress={() => setSelectedCategoryId(c.id)}
                      haptic='selection'
                    >
                      <View
                        style={[
                          styles.categoryPill,
                          isActive && {
                            backgroundColor: tint(c.color, '33'),
                            borderColor: c.color,
                          },
                        ]}
                      >
                        <Icon
                          name={c.icon as any}
                          size={14}
                          color={isActive ? c.color : colors.text}
                        />
                        <Text
                          style={[
                            styles.categoryText,
                            isActive && { color: c.color },
                          ]}
                        >
                          {c.name}
                        </Text>
                      </View>
                    </PressableScale>
                  );
                })}
              </ScrollView>

              <Text style={styles.fieldLabel}>AMOUNT (VND)</Text>
              <TextInput
                style={styles.input}
                value={amountStr}
                onChangeText={setAmountStr}
                placeholder='e.g. 1000000'
                placeholderTextColor={colors.tabInactive}
                keyboardType='number-pad'
              />

              <Text style={styles.fieldLabel}>NOTE (OPTIONAL)</Text>
              <TextInput
                style={[styles.input, styles.inputText]}
                value={note}
                onChangeText={setNote}
                placeholder='e.g. Netflix Subscription'
                placeholderTextColor={colors.tabInactive}
              />

              <Text style={styles.fieldLabel}>DAY OF MONTH (1-28)</Text>
              <TextInput
                style={[styles.input, styles.inputText]}
                value={dayOfMonthStr}
                onChangeText={setDayOfMonthStr}
                keyboardType='number-pad'
                maxLength={2}
              />

              <GameButton
                label='Save template'
                variant='green'
                size='md'
                icon='check-bold'
                fullWidth
                disabled={!canSave}
                onPress={handleSave}
                style={{
                  ...styles.saveButton,
                  ...(canSave ? null : styles.saveButtonDisabled),
                }}
              />
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(20,29,48,0.34)',
  },
  backdropFill: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: 'rgba(244,248,255,0.92)',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.96)',
    ...elevation.panel,
    paddingHorizontal: 20,
    paddingTop: 10,
    height: '68%',
    overflow: 'hidden',
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(110,122,150,0.45)',
    alignSelf: 'center',
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(200,213,238,0.8)',
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnSpacer: {
    width: 36,
    height: 36,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: colors.text,
    ...textShadow.emboss,
  },
  listWrap: {
    flex: 1,
  },
  listContent: {
    gap: 10,
    paddingBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  emptyEmoji: {
    fontSize: 30,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
    ...elevation.card,
  },
  itemIconWrap: {
    borderRadius: radius.sm,
  },
  itemIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontFamily: fonts.display,
    fontSize: 15,
    color: colors.text,
  },
  itemSub: {
    fontFamily: fonts.monoRegular,
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  addButton: {
    marginTop: 12,
    marginBottom: 8,
    alignSelf: 'stretch',
  },
  formContent: {
    paddingBottom: 40,
  },
  fieldLabel: {
    fontFamily: fonts.displayBold,
    fontSize: 11,
    color: colors.muted,
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 8,
  },
  categoryScrollWrap: {
    maxHeight: 40,
  },
  categoryScroll: {
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  categoryText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.text,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 13,
    paddingHorizontal: 14,
    fontFamily: fonts.monoSemibold,
    fontSize: 18,
    color: colors.purple,
  },
  inputText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
  },
  saveButton: {
    marginTop: 24,
    alignSelf: 'stretch',
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
});
