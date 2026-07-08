import { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { colors, radius, tint } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fonts } from '@/theme/typography';
import { Icon } from '@/theme/icons';
import { useGoalStore } from '@/store/goalStore';
import { useSavingsStore } from '@/store/savingsStore';
import { useHabitsStore } from '@/store/habitsStore';
import { PressableScale } from '@/components/motion';
import { DatePickerModal } from '@/components/DatePickerModal';
import { getSmartSuggestions } from '../utils/smartSuggestions';

interface GoalCreatorModalProps {
  visible: boolean;
  onClose: () => void;
  editGoalId?: string | null;
}

export function GoalCreatorModal({
  visible,
  onClose,
  editGoalId,
}: GoalCreatorModalProps) {
  const goals = useGoalStore((s) => s.goals);
  const createGoal = useGoalStore((s) => s.createGoal);
  const updateGoal = useGoalStore((s) => s.updateGoal);

  const savingsGoals = useSavingsStore((s) => s.goals.filter((g) => g.status === 'active'));
  const habits = useHabitsStore((s) => s.habits);

  const isEditing = !!editGoalId;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [milestones, setMilestones] = useState<string[]>([]);
  const [newMilestone, setNewMilestone] = useState('');
  const [deadline, setDeadline] = useState(Date.now() + 86400000 * 30);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [savingsGoalId, setSavingsGoalId] = useState('');
  const [habitId, setHabitId] = useState('');

  // Prefill and fetch related stores when modal opens
  useEffect(() => {
    if (visible) {
      useSavingsStore.getState().init();
      useHabitsStore.getState().init();

      if (editGoalId) {
        const goal = goals.find((g) => g.id === editGoalId);
        if (goal) {
          setTitle(goal.title);
          setDescription(goal.description || '');
          setMilestones([]); // Only hold NEW milestones when editing
          setNewMilestone('');
          setDeadline(goal.deadline ?? Date.now() + 86400000 * 30);
          setSavingsGoalId(goal.savingsGoalId || '');
          setHabitId(goal.habitId || '');
        }
      } else {
        setTitle('');
        setDescription('');
        setMilestones([]);
        setNewMilestone('');
        setDeadline(Date.now() + 86400000 * 30);
        setSavingsGoalId('');
        setHabitId('');
      }
    }
  }, [visible, editGoalId, goals]);

  const canSave = title.trim().length > 0;

  // Auto-suggestions based on title
  const suggestions = useMemo(() => getSmartSuggestions(title), [title]);

  function handleClose() {
    setTitle('');
    setDescription('');
    setMilestones([]);
    setNewMilestone('');
    setSavingsGoalId('');
    setHabitId('');
    onClose();
  }

  async function handleSave() {
    if (!canSave) return;

    const draft = newMilestone.trim();
    const finalMilestones = draft ? [...milestones, draft] : milestones;

    const saveParams = {
      title: title.trim(),
      description: description.trim() || undefined,
      deadline,
      savingsGoalId: savingsGoalId || undefined,
      habitId: habitId || undefined,
    };

    if (isEditing && editGoalId) {
      await updateGoal(editGoalId, {
        ...saveParams,
        newMilestones: finalMilestones,
      });
    } else {
      await createGoal({
        ...saveParams,
        milestones: finalMilestones,
      });
    }
    handleClose();
  }

  // Preset Date Handlers
  const setPresetDeadline = (days: number) => {
    setDeadline(Date.now() + 86400000 * days);
  };

  const formattedDeadline = useMemo(() => {
    const d = new Date(deadline);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  }, [deadline]);

  // Dynamic creation/linking of habits from suggestions
  const handleAddSuggestedHabit = async (sHabit: { name: string; sub: string; icon: string; color: string }) => {
    // Check if habit already exists
    const existing = habits.find((h) => h.name.toLowerCase() === sHabit.name.toLowerCase());
    if (existing) {
      setHabitId(existing.id);
      return;
    }

    // Create dynamically
    const newH = await useHabitsStore.getState().addHabit({
      name: sHabit.name,
      sub: sHabit.sub,
      icon: sHabit.icon,
      color: sHabit.color,
    });
    setHabitId(newH.id);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType='slide'
      onRequestClose={handleClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropFill} onPress={handleClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ width: '100%' }}
        >
          <View style={styles.sheet}>
            <View style={styles.grabber} />
            <Text style={styles.heading}>
              {isEditing ? 'Sửa mục tiêu' : 'Mục tiêu mới'}
            </Text>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              <Text style={styles.fieldLabel}>TIÊU ĐỀ MỤC TIÊU</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder='Ví dụ: Học xong khoá thiết kế UI/UX'
                placeholderTextColor={colors.tabInactive}
              />

              <Text style={styles.fieldLabel}>MÔ TẢ CHI TIẾT</Text>
              <TextInput
                style={[styles.input, { minHeight: 60 }]}
                value={description}
                onChangeText={setDescription}
                placeholder='Tại sao bạn muốn thực hiện mục tiêu này?'
                placeholderTextColor={colors.tabInactive}
                multiline
              />

              {/* Deadline Section */}
              <Text style={styles.fieldLabel}>HẠN HOÀN THÀNH</Text>
              <View style={styles.deadlineRow}>
                <PressableScale
                  style={styles.dateSelector}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Icon name='calendar' size={16} color={colors.gold} />
                  <Text style={styles.dateText}>{formattedDeadline}</Text>
                </PressableScale>

                <View style={styles.presetContainer}>
                  <PressableScale style={styles.presetChip} onPress={() => setPresetDeadline(30)}>
                    <Text style={styles.presetText}>1T</Text>
                  </PressableScale>
                  <PressableScale style={styles.presetChip} onPress={() => setPresetDeadline(90)}>
                    <Text style={styles.presetText}>3T</Text>
                  </PressableScale>
                  <PressableScale style={styles.presetChip} onPress={() => setPresetDeadline(180)}>
                    <Text style={styles.presetText}>6T</Text>
                  </PressableScale>
                  <PressableScale style={styles.presetChip} onPress={() => setPresetDeadline(365)}>
                    <Text style={styles.presetText}>1N</Text>
                  </PressableScale>
                </View>
              </View>

              {/* Smart Suggestions for Milestones & Habits */}
              {suggestions.milestones.length > 0 && (
                <View style={styles.suggestionBlock}>
                  <Text style={styles.suggestionTitle}>💡 GỢI Ý CỘT MỐC</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionChips}>
                    {suggestions.milestones
                      .filter((m) => !milestones.includes(m))
                      .map((m, idx) => (
                        <PressableScale
                          key={idx}
                          style={styles.suggestionChip}
                          onPress={() => setMilestones([...milestones, m])}
                        >
                          <Text style={styles.suggestionText}>+ {m}</Text>
                        </PressableScale>
                      ))}
                  </ScrollView>
                </View>
              )}

              <Text style={styles.fieldLabel}>
                {isEditing
                  ? 'THÊM CỘT MỐC MỚI (Tự sinh Task)'
                  : 'CỘT MỐC QUAN TRỌNG (Hệ thống tự tạo Task)'}
              </Text>
              <View style={styles.mContainer}>
                {milestones.map((m, i) => (
                  <View key={i} style={styles.mItem}>
                    <Icon
                      name='check-circle-outline'
                      size={16}
                      color={colors.muted}
                    />
                    <Text style={styles.mText}>{m}</Text>
                    <PressableScale
                      onPress={() =>
                        setMilestones(milestones.filter((_, idx) => idx !== i))
                      }
                      hitSlop={8}
                    >
                      <Icon name='close' size={16} color={colors.muted} />
                    </PressableScale>
                  </View>
                ))}

                <View style={styles.mInputRow}>
                  <Icon name='plus' size={16} color={colors.muted} />
                  <TextInput
                    style={styles.mInput}
                    value={newMilestone}
                    onChangeText={setNewMilestone}
                    placeholder='Thêm cột mốc mới...'
                    placeholderTextColor={colors.tabInactive}
                    returnKeyType='done'
                    onSubmitEditing={() => {
                      if (newMilestone.trim()) {
                        setMilestones([...milestones, newMilestone.trim()]);
                        setNewMilestone('');
                      }
                    }}
                  />
                </View>
              </View>

              {/* Link Savings Goal */}
              <Text style={styles.fieldLabel}>🔗 LIÊN KẾT HEO ĐẤT (SAVINGS GOAL)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.linkChips}>
                <PressableScale
                  style={[styles.linkChip, savingsGoalId === '' && styles.linkChipSelected]}
                  onPress={() => setSavingsGoalId('')}
                >
                  <Text style={[styles.linkChipText, savingsGoalId === '' && styles.linkChipTextSelected]}>Không liên kết</Text>
                </PressableScale>
                {savingsGoals.map((sg) => (
                  <PressableScale
                    key={sg.id}
                    style={[styles.linkChip, savingsGoalId === sg.id && styles.linkChipSelected]}
                    onPress={() => setSavingsGoalId(sg.id)}
                  >
                    <Text style={[styles.linkChipText, savingsGoalId === sg.id && styles.linkChipTextSelected]}>
                      {sg.icon} {sg.name}
                    </Text>
                  </PressableScale>
                ))}
              </ScrollView>

              {/* Link Habits & Suggested Habits */}
              <Text style={styles.fieldLabel}>🔁 LIÊN KẾT THÓI QUEN (HABIT)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.linkChips}>
                <PressableScale
                  style={[styles.linkChip, habitId === '' && styles.linkChipSelected]}
                  onPress={() => setHabitId('')}
                >
                  <Text style={[styles.linkChipText, habitId === '' && styles.linkChipTextSelected]}>Không liên kết</Text>
                </PressableScale>
                {habits.map((h) => (
                  <PressableScale
                    key={h.id}
                    style={[styles.linkChip, habitId === h.id && styles.linkChipSelected]}
                    onPress={() => setHabitId(h.id)}
                  >
                    <Text style={[styles.linkChipText, habitId === h.id && styles.linkChipTextSelected]}>
                      {h.name}
                    </Text>
                  </PressableScale>
                ))}
              </ScrollView>

              {/* Suggested Habits Creation */}
              {suggestions.habits.length > 0 && (
                <View style={styles.suggestionBlock}>
                  <Text style={styles.suggestionTitle}>💡 THÓI QUEN ĐỀ XUẤT</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionChips}>
                    {suggestions.habits.map((sh, idx) => {
                      const isLinked = habits.some((h) => h.name.toLowerCase() === sh.name.toLowerCase() && h.id === habitId);
                      return (
                        <PressableScale
                          key={idx}
                          style={[styles.suggestionChip, isLinked && styles.suggestionChipLinked]}
                          onPress={() => handleAddSuggestedHabit(sh)}
                        >
                          <Text style={[styles.suggestionText, isLinked && styles.suggestionTextLinked]}>
                            {isLinked ? '✓ ' : '+ '} {sh.name}
                          </Text>
                        </PressableScale>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              <View style={styles.actions}>
                <PressableScale
                  style={styles.cancelButton}
                  onPress={handleClose}
                  scaleTo={0.97}
                  haptic='light'
                >
                  <Text style={styles.cancelText}>Hủy</Text>
                </PressableScale>
                <PressableScale
                  style={[
                    styles.saveButton,
                    !canSave && styles.saveButtonDisabled,
                  ]}
                  onPress={handleSave}
                  disabled={!canSave}
                  scaleTo={canSave ? 0.97 : 1}
                  haptic={canSave ? 'medium' : undefined}
                >
                  <Text style={styles.saveText}>
                    {isEditing ? 'Lưu thay đổi' : 'Tạo mục tiêu'}
                  </Text>
                </PressableScale>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>

      <DatePickerModal
        visible={showDatePicker}
        value={deadline}
        onSelect={setDeadline}
        onClose={() => setShowDatePicker(false)}
        minDate={Date.now()}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(5,8,15,0.65)',
  },
  backdropFill: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: colors.screenBg,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.tabClear,
    maxHeight: '90%',
  },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginBottom: spacing.md,
  },
  heading: {
    fontFamily: fonts.semibold,
    fontSize: 18,
    color: colors.text,
    letterSpacing: -0.3,
    marginBottom: spacing.md,
  },
  fieldLabel: {
    fontFamily: fonts.monoSemibold,
    fontSize: 10,
    color: colors.muted,
    letterSpacing: 0.8,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: spacing.sm,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dateSelector: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: spacing.sm,
  },
  dateText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.text,
  },
  presetContainer: {
    flex: 1.8,
    flexDirection: 'row',
    gap: 6,
  },
  presetChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: radius.md,
    paddingVertical: 10,
  },
  presetText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.muted,
  },
  suggestionBlock: {
    marginTop: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.01)',
    borderRadius: radius.md,
    paddingVertical: 6,
  },
  suggestionTitle: {
    fontFamily: fonts.monoSemibold,
    fontSize: 9,
    color: colors.gold,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  suggestionChips: {
    gap: 6,
    paddingVertical: 4,
  },
  suggestionChip: {
    backgroundColor: 'rgba(212,175,55,0.08)',
    borderColor: 'rgba(212,175,55,0.15)',
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  suggestionChipLinked: {
    backgroundColor: 'rgba(78,205,196,0.15)',
    borderColor: 'rgba(78,205,196,0.3)',
  },
  suggestionText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.gold,
  },
  suggestionTextLinked: {
    color: '#4ECDC4',
  },
  linkChips: {
    gap: 8,
    paddingVertical: 4,
  },
  linkChip: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  linkChipSelected: {
    backgroundColor: 'rgba(212,175,55,0.12)',
    borderColor: colors.gold,
  },
  linkChipText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.muted,
  },
  linkChipTextSelected: {
    color: colors.gold,
    fontFamily: fonts.semibold,
  },
  mContainer: {
    backgroundColor: 'rgba(255,255,255,0.01)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
    padding: 12,
    gap: 10,
  },
  mItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.text,
  },
  mInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  mInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  cancelText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.muted,
  },
  saveButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.gold,
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveText: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.black,
  },
});
