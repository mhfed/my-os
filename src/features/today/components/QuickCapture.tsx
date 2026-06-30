import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors } from '@/theme/colors';
import { Icon } from '@/theme/icons';
import { fonts } from '@/theme/typography';

interface QuickCaptureProps {
  onCapture: (text: string) => void;
  /** Number of open inbox items — shows a pressable shortcut when > 0. */
  openCount: number;
  onOpenInbox: () => void;
}

export function QuickCapture({ onCapture, openCount, onOpenInbox }: QuickCaptureProps) {
  const [text, setText] = useState('');

  const submit = () => {
    if (text.trim().length === 0) {
      return;
    }
    onCapture(text);
    setText('');
  };

  return (
    <View>
      <View style={styles.row}>
        <Icon name="star-four-points" size={18} color={colors.purple} />
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Capture anything..."
          placeholderTextColor={colors.muted}
          onSubmitEditing={submit}
          returnKeyType="done"
        />
        <Pressable style={styles.button} onPress={submit}>
          <Icon name="arrow-up" size={18} color="#0A0A0F" />
        </Pressable>
      </View>

      {openCount > 0 ? (
        <Pressable style={styles.inboxLink} onPress={onOpenInbox}>
          <Text style={styles.inboxText}>{openCount} in inbox</Text>
          <Icon name="arrow-right" size={13} color={colors.muted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 16,
    paddingRight: 6,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 14,
    paddingVertical: 0,
  },
  button: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inboxLink: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 4,
    marginTop: 10,
    paddingVertical: 2,
  },
  inboxText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.muted,
  },
});
