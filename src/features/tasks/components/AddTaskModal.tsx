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

import { Icon } from '@/theme/icons';
import { colors, radius, tint } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fonts } from '@/theme/typography';
import { PressableScale } from '@/components/motion';
import { startOfToday } from '@/utils/day';
import { useTasksStore } from '@/store/tasksStore';
import { useGoalStore } from '@/store/goalStore';
import type { Priority } from '@/types/task';

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
}

const PRIORITIES: Priority[] = ['P0', 'P1', 'P2', 'P3'];
const DAY_MS = 86_400_000;

type DueChoice = 'Today' | 'Tomorrow' | 'None';
const DUE_CHOICES: DueChoice[] = ['Today', 'Tomorrow', 'None'];

function priorityColor(priority: Priority): string {
  switch (priority) {
    case 'P0': return colors.red;
    case 'P1': return colors.orange;
    default: return colors.teal;
  }
}

function priorityIcon(
  priority: Priority,
):
  | 'signal-cellular-3'
  | 'signal-cellular-2'
  | 'signal-cellular-1'
  | 'signal-cellular-outline' {
  switch (priority) {
    case 'P0': return 'signal-cellular-3';
    case 'P1': return 'signal-cellular-2';
    case 'P2': return 'signal-cellular-1';
    case 'P3': return 'signal-cellular-outline';
  }
}

function dueDateFor(choice: DueChoice): number | undefined {
  switch (choice) {
    case 'Today': return startOfToday();
    case 'Tomorrow': return startOfToday() + DAY_MS;
    default: return undefined;
  }
}

export function AddTaskModal({ visible, onClose }: AddTaskModalProps) {
  const addTask = useTasksStore((s) => s.addTask);
  const goals = useGoalStore((s) => s.goals);
  const activeGoals = goals.filter((g) => g.status === 'active');

  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('P2');
  const [context, setContext] = useState('');
  const [due, setDue] = useState<DueChoice>('Today');
  const [goalId, setGoalId] = useState<string | undefined>(undefined);
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [recurrence, setRecurrence] = useState<'none' | 'daily'>('none');
  const [routineTime, setRoutineTime] = useState<string>('08:00');

  const canSave = title.trim().length > 0;

  function reset() {
    setTitle('');
    setPriority('P2');
    setContext('');
    setDue('Today');
    setGoalId(undefined);
    setSubtasks([]);
    setNewSubtask('');
    setRecurrence('none');
    setRoutineTime('08:00');
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSave() {
    if (!canSave) return;
    let dueDate = dueDateFor(due);
    if (recurrence === 'daily') {
      const todayBase = startOfToday();
      const [h, m] = routineTime.split(':').map(Number);
      dueDate = new Date(todayBase).setHours(h, m, 0, 0);
    }
    await addTask({
      title: title.trim(),
      context: context.trim() || undefined,
      priority,
      dueDate,
      goalId,
      subtasks,
      recurrence: recurrence === 'daily' ? 'daily' : 'none',
      routineTime: recurrence === 'daily' ? routineTime : undefined,
    });
    handleClose();
  }

  return (
    <Modal visible={visible} transparent animationType='slide' onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.backdrop}
      >
        <Pressable style={styles.backdropFill} onPress={handleClose}>
          <View style={StyleSheet.absoluteFill} />
        </Pressable>
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          <Text style={styles.heading}>Nhiệm vụ mới</Text>

          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder='Bạn cần làm gì?'
            placeholderTextColor={colors.tabInactive}
            autoFocus
            returnKeyType='done'
          />

          <Text style={styles.fieldLabel}>ĐỘ ƯU TIÊN</Text>
          <View style={styles.segments}>
            {PRIORITIES.map((p) => {
              const isActive = p === priority;
              const pColor = priorityColor(p);
              return (
                <PressableScale
                  key={p}
                  onPress={() => setPriority(p)}
                  scaleTo={0.95}
                  haptic='light'
                  style={[
                    styles.segment,
                    isActive
                      ? { backgroundColor: tint(pColor), borderColor: pColor }
                      : styles.segmentInactive,
                  ]}
                >
                  <Icon
                    name={priorityIcon(p)}
                    size={18}
                    color={isActive ? pColor : colors.muted}
                  />
                </PressableScale>
              );
            })}
          </View>

          <Text style={styles.fieldLabel}>BỐI CẢNH</Text>
          <TextInput
            style={styles.input}
            value={context}
            onChangeText={setContext}
            placeholder='Ví dụ: Công việc, Sức khỏe (tùy chọn)'
            placeholderTextColor={colors.tabInactive}
            returnKeyType='done'
          />

          <Text style={styles.fieldLabel}>
            NHIỆM VỤ PHỤ {subtasks.length > 0 ? `(${subtasks.length})` : ''}
          </Text>
          <View style={styles.subtasksList}>
            {subtasks.map((st, i) => (
              <View key={i} style={styles.subtaskItem}>
                <Icon name='check' size={14} color={colors.muted} />
                <Text style={styles.subtaskText}>{st}</Text>
                <PressableScale
                  onPress={() => setSubtasks(subtasks.filter((_, idx) => idx !== i))}
                  scaleTo={0.85}
                  haptic='light'
                  hitSlop={8}
                >
                  <Icon name='close' size={14} color={colors.muted} />
                </PressableScale>
              </View>
            ))}
            <View style={styles.subtaskInputRow}>
              <Icon name='plus' size={14} color={colors.muted} />
              <TextInput
                style={styles.subtaskInput}
                value={newSubtask}
                onChangeText={setNewSubtask}
                placeholder='Thêm nhiệm vụ phụ...'
                placeholderTextColor={colors.tabInactive}
                returnKeyType='done'
                onSubmitEditing={() => {
                  if (newSubtask.trim()) {
                    setSubtasks([...subtasks, newSubtask.trim()]);
                    setNewSubtask('');
                  }
                }}
              />
            </View>
          </View>

          <Text style={styles.fieldLabel}>LẶP LẠI (ROUTINE)</Text>
          <View style={styles.segments}>
            <PressableScale
              onPress={() => setRecurrence('none')}
              scaleTo={0.95}
              haptic='light'
              style={[
                styles.segment,
                recurrence === 'none'
                  ? { backgroundColor: tint(colors.purple), borderColor: colors.purple }
                  : styles.segmentInactive,
              ]}
            >
              <Text style={[styles.segmentText, { color: recurrence === 'none' ? colors.purple : colors.muted }]}>
                Không lặp
              </Text>
            </PressableScale>
            <PressableScale
              onPress={() => setRecurrence('daily')}
              scaleTo={0.95}
              haptic='light'
              style={[
                styles.segment,
                recurrence === 'daily'
                  ? { backgroundColor: tint(colors.purple), borderColor: colors.purple }
                  : styles.segmentInactive,
              ]}
            >
              <Text style={[styles.segmentText, { color: recurrence === 'daily' ? colors.purple : colors.muted }]}>
                Hàng ngày
              </Text>
            </PressableScale>
          </View>

          {recurrence === 'daily' ? (
            <>
              <Text style={styles.fieldLabel}>KHUNG GIỜ CỐ ĐỊNH</Text>
              <View style={[styles.segments, { marginBottom: 8 }]}>
                {[
                  { label: 'Sáng 08:00', value: '08:00' },
                  { label: 'Trưa 12:00', value: '12:00' },
                  { label: 'Chiều 15:00', value: '15:00' },
                  { label: 'Tối 20:00', value: '20:00' },
                ].map((p) => {
                  const isActive = routineTime === p.value;
                  return (
                    <PressableScale
                      key={p.value}
                      onPress={() => setRoutineTime(p.value)}
                      scaleTo={0.95}
                      haptic='light'
                      style={[
                        styles.segment,
                        isActive
                          ? { backgroundColor: tint(colors.teal), borderColor: colors.teal }
                          : styles.segmentInactive,
                        { paddingVertical: 8 }
                      ]}
                    >
                      <Text style={[styles.segmentText, { fontSize: 10, color: isActive ? colors.teal : colors.muted }]}>
                        {p.label}
                      </Text>
                    </PressableScale>
                  );
                })}
              </View>
              <View style={styles.customTimeRow}>
                <Text style={styles.customTimeLabel}>Giờ khác:</Text>
                <TextInput
                  style={styles.customTimeInput}
                  value={routineTime}
                  onChangeText={setRoutineTime}
                  placeholder='08:00'
                  placeholderTextColor={colors.tabInactive}
                  maxLength={5}
                />
              </View>
            </>
          ) : (
            <>
              <Text style={styles.fieldLabel}>HẠN CHÓT</Text>
              <View style={styles.segments}>
                {DUE_CHOICES.map((choice) => {
                  const isActive = choice === due;
                  const vietLabel = choice === 'Today' ? 'Hôm nay' : choice === 'Tomorrow' ? 'Ngày mai' : 'Không có';
                  return (
                    <PressableScale
                      key={choice}
                      onPress={() => setDue(choice)}
                      scaleTo={0.95}
                      haptic='light'
                      style={[
                        styles.segment,
                        isActive
                          ? {
                              backgroundColor: tint(colors.purple),
                              borderColor: colors.purple,
                            }
                          : styles.segmentInactive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.segmentText,
                          { color: isActive ? colors.purple : colors.muted },
                        ]}
                      >
                        {vietLabel}
                      </Text>
                    </PressableScale>
                  );
                })}
              </View>
            </>
          )}

          {activeGoals.length > 0 ? (
            <>
              <Text style={styles.fieldLabel}>MỤC TIÊU</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.goalRow}
                keyboardShouldPersistTaps='handled'
              >
                <PressableScale
                  onPress={() => setGoalId(undefined)}
                  scaleTo={0.95}
                  haptic='light'
                  style={[
                    styles.goalChip,
                    goalId === undefined
                      ? {
                          backgroundColor: tint(colors.purple),
                          borderColor: colors.purple,
                        }
                      : styles.segmentInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.goalChipText,
                      {
                        color: goalId === undefined ? colors.purple : colors.muted,
                      },
                    ]}
                  >
                    Không ghim
                  </Text>
                </PressableScale>
                {activeGoals.map((g) => {
                  const isActive = g.id === goalId;
                  return (
                    <PressableScale
                      key={g.id}
                      onPress={() => setGoalId(g.id)}
                      scaleTo={0.95}
                      haptic='light'
                      style={[
                        styles.goalChip,
                        isActive
                          ? {
                              backgroundColor: tint(colors.purple),
                              borderColor: colors.purple,
                            }
                          : styles.segmentInactive,
                      ]}
                    >
                      <Icon
                        name='target'
                        size={13}
                        color={isActive ? colors.purple : colors.muted}
                      />
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.goalChipText,
                          { color: isActive ? colors.purple : colors.muted },
                        ]}
                      >
                        {g.title}
                      </Text>
                    </PressableScale>
                  );
                })}
              </ScrollView>
            </>
          ) : null}

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
              style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={!canSave}
              scaleTo={canSave ? 0.97 : 1}
              haptic={canSave ? 'medium' : undefined}
            >
              <Text style={styles.saveText}>Lưu</Text>
            </PressableScale>
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
  fieldLabel: {
    fontFamily: fonts.monoSemibold,
    fontSize: 10,
    color: colors.muted,
    letterSpacing: 0.8,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  segments: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  goalRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingRight: 4,
  },
  goalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: 180,
    paddingVertical: 8,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  goalChipText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    flexShrink: 1,
  },
  subtasksList: {
    gap: spacing.xs,
    marginTop: 4,
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: 4,
  },
  subtaskText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
  },
  subtaskInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  subtaskInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
    paddingVertical: 4,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  segmentInactive: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderColor: 'rgba(255,255,255,0.05)',
  },
  segmentText: {
    fontFamily: fonts.monoSemibold,
    fontSize: 12,
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
  customTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 4,
  },
  customTimeLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.muted,
  },
  customTimeInput: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: radius.sm,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    fontFamily: fonts.monoRegular,
    fontSize: 14,
    color: colors.text,
    width: 80,
    textAlign: 'center',
  },
});
