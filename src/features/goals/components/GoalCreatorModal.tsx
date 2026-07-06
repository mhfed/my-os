import { useState, useEffect } from 'react';
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

import { colors, tint } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { Icon } from '@/theme/icons';
import { useGoalStore } from '@/store/goalStore';

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

  const isEditing = !!editGoalId;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  // For creation, milestones are strings. For editing, showing existing ones is read-only (for now)
  // so we separate new milestones vs existing milestones.
  const [milestones, setMilestones] = useState<string[]>([]);
  const [newMilestone, setNewMilestone] = useState('');

  // Prefill when editing
  useEffect(() => {
    if (visible && editGoalId) {
      const goal = goals.find((g) => g.id === editGoalId);
      if (goal) {
        setTitle(goal.title);
        setDescription(goal.description || '');
        setMilestones([]); // Only hold NEW milestones
        setNewMilestone('');
      }
    } else if (visible && !editGoalId) {
      setTitle('');
      setDescription('');
      setMilestones([]);
      setNewMilestone('');
    }
  }, [visible, editGoalId, goals]);

  const canSave = title.trim().length > 0;

  function handleClose() {
    setTitle('');
    setDescription('');
    setMilestones([]);
    setNewMilestone('');
    onClose();
  }

  async function handleSave() {
    if (!canSave) return;

    // Nếu user đang gõ dở cột mốc nhưng chưa ấn Enter thì gom vào luôn
    const draft = newMilestone.trim();
    const finalMilestones = draft ? [...milestones, draft] : milestones;

    if (isEditing && editGoalId) {
      await updateGoal(editGoalId, {
        title: title.trim(),
        description: description.trim() || undefined,
        newMilestones: finalMilestones,
      });
    } else {
      await createGoal({
        title: title.trim(),
        description: description.trim() || undefined,
        milestones: finalMilestones,
        deadline: Date.now() + 86400000 * 30, // Mock deadline 30 days for now
      });
    }
    handleClose();
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
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
              <Text style={styles.fieldLabel}>GOAL TITLE</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder='e.g. Build Personal OS app'
                placeholderTextColor={colors.tabInactive}
              />

              <Text style={styles.fieldLabel}>DESCRIPTION</Text>
              <TextInput
                style={[styles.input, { minHeight: 60 }]}
                value={description}
                onChangeText={setDescription}
                placeholder='Why are you doing this?'
                placeholderTextColor={colors.tabInactive}
                multiline
              />

              <Text style={styles.fieldLabel}>
                {isEditing
                  ? 'THÊM MỐC THỜI GIAN MỚI (Tự sinh Task)'
                  : 'MILESTONES (Tasks will be generated)'}
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
                    <Pressable
                      onPress={() =>
                        setMilestones(milestones.filter((_, idx) => idx !== i))
                      }
                    >
                      <Icon name='close' size={16} color={colors.muted} />
                    </Pressable>
                  </View>
                ))}

                <View style={styles.mInputRow}>
                  <Icon name='plus' size={16} color={colors.muted} />
                  <TextInput
                    style={styles.mInput}
                    value={newMilestone}
                    onChangeText={setNewMilestone}
                    placeholder='Add a milestone...'
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

              <View style={styles.actions}>
                <Pressable style={styles.cancelButton} onPress={handleClose}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.saveButton,
                    !canSave && styles.saveButtonDisabled,
                  ]}
                  onPress={handleSave}
                  disabled={!canSave}
                >
                  <Text style={styles.saveText}>
                    {isEditing ? 'Lưu thay đổi' : 'Lưu mục tiêu'}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
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
    height: 500,
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
    marginBottom: 8,
  },
  fieldLabel: {
    fontFamily: fonts.monoSemibold,
    fontSize: 11,
    color: colors.muted,
    letterSpacing: 0.5,
    marginTop: 18,
    marginBottom: 8,
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
  mContainer: {
    backgroundColor: colors.screenBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
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
    backgroundColor: colors.red,
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
