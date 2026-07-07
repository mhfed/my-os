import { useMemo, useState } from 'react';
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

import { base3D, colors, elevation, radius, resolveAccent } from '@/theme/colors';
import { fonts, textShadow } from '@/theme/typography';
import { Icon } from '@/theme/icons';
import { GameButton } from '@/components/game';
import { PressableScale } from '@/components/motion';
import { useFinanceStore } from '@/store/financeStore';
import { monthLabel } from '@/utils/date';

interface SetBudgetModalProps {
  visible: boolean;
  onClose: () => void;
  period?: 'weekly' | 'monthly';
  periodKey?: string;
}

/** Bottom-sheet modal to set a monthly/weekly budget cap for a category. */
export function SetBudgetModal({ visible, onClose, period = 'monthly', periodKey }: SetBudgetModalProps) {
  const allCategories = useFinanceStore((s) => s.categories);
  const setBudget = useFinanceStore((s) => s.setBudget);
  const activeMonth = useFinanceStore((s) => s.activeMonth);

  const targetPeriodKey = periodKey || activeMonth;

  const categories = useMemo(
    () => allCategories.filter((c) => c.type === 'expense'),
    [allCategories],
  );
  const insets = useSafeAreaInsets();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [amountStr, setAmountStr] = useState('');

  const canSave = selectedCategoryId !== null && parseInt(amountStr, 10) > 0;

  function reset() {
    setSelectedCategoryId(null);
    setAmountStr('');
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSave() {
    if (!canSave) return;
    await setBudget(selectedCategoryId, parseInt(amountStr, 10), targetPeriodKey);
    handleClose();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType='slide'
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.backdrop}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />

        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]}> 
          <BlurView tint='dark' intensity={28} style={StyleSheet.absoluteFill} />
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>Set Budget</Text>
            <Text style={styles.subtitle}>for {period === 'weekly' ? targetPeriodKey : monthLabel(targetPeriodKey)}</Text>
          </View>

          <Text style={styles.fieldLabel}>CATEGORY</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
            contentContainerStyle={styles.categoryScrollContent}
          >
            {categories.map((c) => {
              const isActive = c.id === selectedCategoryId;
              const { face, deep } = resolveAccent(c.color);
              return (
                <PressableScale
                  key={c.id}
                  onPress={() => setSelectedCategoryId(c.id)}
                  haptic='selection'
                  style={[
                    styles.categoryPill,
                    isActive && {
                      backgroundColor: face,
                      borderColor: deep,
                      ...base3D(deep, 3),
                    },
                  ]}
                >
                  <Icon
                    name={c.icon as any}
                    size={14}
                    color={isActive ? colors.white : colors.text}
                  />
                  <Text
                    style={[
                      styles.categoryText,
                      isActive && styles.categoryTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {c.name}
                  </Text>
                </PressableScale>
              );
            })}
          </ScrollView>

          <Text style={styles.fieldLabel}>BUDGET LIMIT (VND)</Text>
          <TextInput
            style={styles.input}
            value={amountStr}
            onChangeText={setAmountStr}
            placeholder='e.g. 500000'
            placeholderTextColor={colors.tabInactive}
            keyboardType='number-pad'
            returnKeyType='done'
          />

          <View style={styles.actions}>
            <PressableScale
              style={styles.cancelButton}
              onPress={handleClose}
              haptic='light'
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </PressableScale>
            <GameButton
              label='Save'
              variant='purple'
              size='md'
              onPress={handleSave}
              disabled={!canSave}
              style={{
                ...styles.saveButton,
                ...(!canSave ? styles.saveButtonDisabled : null),
              }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(20,29,48,0.34)',
  },
  sheet: {
    backgroundColor: colors.cardAlt,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 22,
    paddingTop: 12,
    ...elevation.panel,
    overflow: 'hidden',
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'center',
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 4,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
    color: colors.text,
    ...textShadow.emboss,
  },
  subtitle: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.muted,
  },
  fieldLabel: {
    fontFamily: fonts.monoSemibold,
    fontSize: 11,
    color: colors.muted,
    letterSpacing: 0.5,
    marginTop: 18,
    marginBottom: 10,
  },
  categoryScroll: {
    maxHeight: 44,
  },
  categoryScrollContent: {
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.track,
    backgroundColor: colors.cardAlt,
  },
  categoryText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.text,
  },
  categoryTextActive: {
    color: colors.white,
    ...textShadow.button,
  },
  input: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.track,
    backgroundColor: colors.card,
    paddingVertical: 13,
    paddingHorizontal: 20,
    fontFamily: fonts.monoSemibold,
    fontSize: 18,
    color: colors.text,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.track,
    backgroundColor: colors.cardAlt,
  },
  cancelText: {
    fontFamily: fonts.displayBold,
    fontSize: 15,
    color: colors.muted,
  },
  saveButton: {
    flex: 1,
  },
  saveButtonDisabled: {
    opacity: 0.45,
  },
});
