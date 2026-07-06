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
import { colors, tint } from '@/theme/colors';
import { fonts } from '@/theme/typography';
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

/** Color matching a priority badge — P0 red, P1 orange, P2/P3 teal. */
function priorityColor(priority: Priority): string {
  switch (priority) {
    case 'P0':
      return colors.red;
    case 'P1':
      return colors.orange;
    default:
      return colors.teal;
  }
}

/** Icon name matching priority arrow semantics (Jira-style). */
function priorityIcon(
  priority: Priority,
):
  | 'signal-cellular-3'
  | 'signal-cellular-2'
  | 'signal-cellular-1'
  | 'signal-cellular-outline' {
  switch (priority) {
    case 'P0':
      return 'signal-cellular-3';
    case 'P1':
      return 'signal-cellular-2';
    case 'P2':
      return 'signal-cellular-1';
    case 'P3':
      return 'signal-cellular-outline';
  }
}

function dueDateFor(choice: DueChoice): number | undefined {
  switch (choice) {
    case 'Today':
      return startOfToday();
    case 'Tomorrow':
      return startOfToday() + DAY_MS;
    default:
      return undefined;
  }
}

/** Slide-up sheet to create a new task: title, priority, context, due. */
export function AddTaskModal({ visible, onClose }: AddTaskModalProps) {
  const addTask = useTasksStore((s) => s.addTask);
  // Only active goals are pickable — completed/dropped goals shouldn't gather
  // new work (my-os-8u7.4).
  const goals = useGoalStore((s) => s.goals);
  const activeGoals = goals.filter((g) => g.status === 'active');

  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('P2');
  const [context, setContext] = useState('');
  const [due, setDue] = useState<DueChoice>('Today');
  const [goalId, setGoalId] = useState<string | undefined>(undefined);
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [newSubtask, setNewSubtask] = useState('');

  const canSave = title.trim().length > 0;

  function reset() {
    setTitle('');
    setPriority('P2');
    setContext('');
    setDue('Today');
    setGoalId(undefined);
    setSubtasks([]);
    setNewSubtask('');
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSave() {
    if (!canSave) return;
    await addTask({
      title: title.trim(),
      context: context.trim() || undefined,
      priority,
      dueDate: dueDateFor(due),
      goalId,
      subtasks,
    });
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
        <Pressable style={styles.backdropFill} onPress={handleClose} />
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          <Text style={styles.heading}>New task</Text>

          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder='What needs doing?'
            placeholderTextColor={colors.tabInactive}
            autoFocus
            returnKeyType='done'
          />

          <Text style={styles.fieldLabel}>PRIORITY</Text>
          <View style={styles.segments}>
            {PRIORITIES.map((p) => {
              const isActive = p === priority;
              const pColor = priorityColor(p);
              return (
                <Pressable
                  key={p}
                  onPress={() => setPriority(p)}
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
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.fieldLabel}>CONTEXT</Text>
          <TextInput
            style={styles.input}
            value={context}
            onChangeText={setContext}
            placeholder='e.g. Work, Health (optional)'
            placeholderTextColor={colors.tabInactive}
            returnKeyType='done'
          />

          <Text style={styles.fieldLabel}>
            SUBTASKS {subtasks.length > 0 ? `(${subtasks.length})` : ''}
          </Text>
          <View style={styles.subtasksList}>
            {subtasks.map((st, i) => (
              <View key={i} style={styles.subtaskItem}>
                <Icon name='check' size={14} color={colors.muted} />
                <Text style={styles.subtaskText}>{st}</Text>
                <Pressable
                  onPress={() =>
                    setSubtasks(subtasks.filter((_, idx) => idx !== i))
                  }
                >
                  <Icon name='close' size={14} color={colors.muted} />
                </Pressable>
              </View>
            ))}
            <View style={styles.subtaskInputRow}>
              <Icon name='plus' size={14} color={colors.muted} />
              <TextInput
                style={styles.subtaskInput}
                value={newSubtask}
                onChangeText={setNewSubtask}
                placeholder='Add subtask...'
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

          <Text style={styles.fieldLabel}>DUE</Text>
          <View style={styles.segments}>
            {DUE_CHOICES.map((choice) => {
              const isActive = choice === due;
              return (
                <Pressable
                  key={choice}
                  onPress={() => setDue(choice)}
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
                    {choice}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {activeGoals.length > 0 ? (
            <>
              <Text style={styles.fieldLabel}>GOAL</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.goalRow}
                keyboardShouldPersistTaps='handled'
              >
                <Pressable
                  onPress={() => setGoalId(undefined)}
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
                        color:
                          goalId === undefined ? colors.purple : colors.muted,
                      },
                    ]}
                  >
                    None
                  </Text>
                </Pressable>
                {activeGoals.map((g) => {
                  const isActive = g.id === goalId;
                  return (
                    <Pressable
                      key={g.id}
                      onPress={() => setGoalId(g.id)}
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
                    </Pressable>
                  );
                })}
              </ScrollView>
            </>
          ) : null}

          <View style={styles.actions}>
            <Pressable style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={!canSave}
            >
              <Text style={styles.saveText}>Save</Text>
            </Pressable>
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
    paddingBottom: 34,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: 16,
  },
  heading: {
    fontFamily: fonts.semibold,
    fontSize: 20,
    color: colors.text,
    letterSpacing: -0.3,
    marginBottom: 16,
  },
  input: {
    backgroundColor: colors.screenBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
  },
  fieldLabel: {
    fontFamily: fonts.monoSemibold,
    fontSize: 11,
    color: colors.muted,
    letterSpacing: 0.5,
    marginTop: 18,
    marginBottom: 8,
  },
  segments: {
    flexDirection: 'row',
    gap: 8,
  },
  goalRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 4,
  },
  goalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: 180,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 11,
    borderWidth: 1,
  },
  goalChipText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    flexShrink: 1,
  },
  subtasksList: {
    gap: 8,
    marginTop: 4,
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    gap: 8,
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
    paddingVertical: 11,
    borderRadius: 11,
    borderWidth: 1,
  },
  segmentInactive: {
    backgroundColor: colors.screenBg,
    borderColor: colors.border,
  },
  segmentText: {
    fontFamily: fonts.monoSemibold,
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 26,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.screenBg,
  },
  cancelText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.muted,
  },
  saveButton: {
    flex: 1,
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
