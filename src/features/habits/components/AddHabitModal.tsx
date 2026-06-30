import { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors, tint } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { useHabitsStore } from '@/store/habitsStore';

interface AddHabitModalProps {
  visible: boolean;
  onClose: () => void;
}

const COMMON_ICONS = [
  'book-open-page-variant',
  'dumbbell',
  'glass-water',
  'meditation',
  'shoe-sneaker',
  'bed',
  'pill',
  'food-apple',
];
const COMMON_COLORS = [
  colors.purple,
  colors.teal,
  colors.orange,
  colors.red,
  colors.tabInactive,
];

export function AddHabitModal({ visible, onClose }: AddHabitModalProps) {
  const addHabit = useHabitsStore((s) => s.addHabit);

  const [name, setName] = useState('');
  const [sub, setSub] = useState('');
  const [icon, setIcon] = useState(COMMON_ICONS[0]);
  const [color, setColor] = useState(COMMON_COLORS[0]);

  const canSave = name.trim().length > 0;

  function reset() {
    setName('');
    setSub('');
    setIcon(COMMON_ICONS[0]);
    setColor(COMMON_COLORS[0]);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSave() {
    if (!canSave) return;
    await addHabit({
      name: name.trim(),
      sub: sub.trim() || undefined,
      icon,
      color,
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
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropFill} onPress={handleClose} />
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          <Text style={styles.heading}>New habit</Text>

          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder='Habit name (e.g. Read 10 pages)'
            placeholderTextColor={colors.tabInactive}
            autoFocus
            returnKeyType='next'
          />

          <TextInput
            style={[styles.input, { marginTop: 10 }]}
            value={sub}
            onChangeText={setSub}
            placeholder='Subtitle / Frequency details'
            placeholderTextColor={colors.tabInactive}
            returnKeyType='done'
          />

          <Text style={styles.fieldLabel}>COLOR</Text>
          <View style={styles.segments}>
            {COMMON_COLORS.map((c) => {
              const isActive = c === color;
              return (
                <Pressable
                  key={c}
                  onPress={() => setColor(c)}
                  style={[
                    styles.colorOption,
                    { backgroundColor: c },
                    isActive && styles.colorOptionActive,
                  ]}
                />
              );
            })}
          </View>

          <View style={styles.actions}>
            <Pressable style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[
                styles.saveButton,
                !canSave && styles.saveButtonDisabled,
                { backgroundColor: color },
              ]}
              onPress={handleSave}
              disabled={!canSave}
            >
              <Text style={styles.saveText}>Save</Text>
            </Pressable>
          </View>
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
    gap: 12,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionActive: {
    borderColor: colors.text,
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
