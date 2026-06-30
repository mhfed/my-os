import { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
} from 'react-native';

import { colors, tint } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { useFinanceStore } from '@/store/financeStore';
import { Icon } from '@/theme/icons';

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
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.grabber} />

          <View style={styles.header}>
            {mode === 'add' && (
              <Pressable
                onPress={() => setMode('list')}
                style={{ position: 'absolute', left: 0 }}
              >
                <Icon name='arrow-left' size={20} color={colors.text} />
              </Pressable>
            )}
            <Text style={styles.heading}>
              {mode === 'list' ? 'Recurring Transactions' : 'Add Recurring'}
            </Text>
          </View>

          {mode === 'list' && (
            <View style={{ flex: 1 }}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ gap: 12, paddingBottom: 40 }}
              >
                {recurring.length === 0 ? (
                  <Text style={styles.emptyText}>
                    No recurring transactions configured.
                  </Text>
                ) : (
                  recurring.map((item) => {
                    const cat = categories.find(
                      (c) => c.id === item.categoryId,
                    );
                    if (!cat) return null;
                    return (
                      <View key={item.id} style={styles.itemRow}>
                        <View
                          style={[
                            styles.itemIcon,
                            { backgroundColor: tint(cat.color) },
                          ]}
                        >
                          <Icon
                            name={cat.icon as any}
                            size={16}
                            color={cat.color}
                          />
                        </View>
                        <View style={styles.itemInfo}>
                          <Text style={styles.itemTitle}>
                            {item.note || cat.name}
                          </Text>
                          <Text style={styles.itemSub}>
                            Day {item.dayOfMonth} ·{' '}
                            {item.type === 'income' ? '+' : '-'}
                            {item.amount.toLocaleString()}đ
                          </Text>
                        </View>
                        <Pressable onPress={() => deleteRecurring(item.id)}>
                          <Icon
                            name='trash-can-outline'
                            size={18}
                            color={colors.red}
                          />
                        </Pressable>
                      </View>
                    );
                  })
                )}
              </ScrollView>
              <Pressable
                style={styles.addButton}
                onPress={() => setMode('add')}
              >
                <Text style={styles.addButtonText}>Add new</Text>
              </Pressable>
            </View>
          )}

          {mode === 'add' && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              <Text style={styles.fieldLabel}>CATEGORY</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
                style={{ maxHeight: 40 }}
              >
                {categories.map((c) => {
                  const isActive = c.id === selectedCategoryId;
                  return (
                    <Pressable
                      key={c.id}
                      onPress={() => setSelectedCategoryId(c.id)}
                      style={[
                        styles.categoryPill,
                        isActive && {
                          backgroundColor: tint(c.color),
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
                    </Pressable>
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
                style={[
                  styles.input,
                  { fontFamily: fonts.regular, color: colors.text },
                ]}
                value={note}
                onChangeText={setNote}
                placeholder='e.g. Netflix Subscription'
                placeholderTextColor={colors.tabInactive}
              />

              <Text style={styles.fieldLabel}>DAY OF MONTH (1-28)</Text>
              <TextInput
                style={[
                  styles.input,
                  { fontFamily: fonts.regular, color: colors.text },
                ]}
                value={dayOfMonthStr}
                onChangeText={setDayOfMonthStr}
                keyboardType='number-pad'
                maxLength={2}
              />

              <Pressable
                style={[
                  styles.saveButton,
                  !canSave && styles.saveButtonDisabled,
                  { marginTop: 24 },
                ]}
                onPress={handleSave}
                disabled={!canSave}
              >
                <Text style={styles.saveText}>Save Template</Text>
              </Pressable>
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
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  backdropFill: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderColor: colors.border,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 12,
    height: '65%',
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  heading: {
    fontFamily: fonts.semibold,
    fontSize: 18,
    color: colors.text,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 20,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.screenBg,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.text,
  },
  itemSub: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  addButton: {
    backgroundColor: tint(colors.purple),
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 34,
  },
  addButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.purple,
  },
  fieldLabel: {
    fontFamily: fonts.monoSemibold,
    fontSize: 11,
    color: colors.muted,
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.screenBg,
  },
  categoryText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.text,
  },
  input: {
    backgroundColor: colors.screenBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    fontFamily: fonts.monoSemibold,
    fontSize: 18,
    color: colors.purple,
  },
  saveButton: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: colors.purple,
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveText: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.white,
  },
});
