import { memo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, glass, radius } from '@/theme/colors';
import { Icon } from '@/theme/icons';
import { fonts } from '@/theme/typography';

interface QuickCaptureProps {
  onCapture: (text: string) => void;
  /** Number of open inbox items — shows a pressable shortcut when > 0. */
  openCount: number;
  onOpenInbox: () => void;
}

export const QuickCapture = memo(function QuickCapture({
  onCapture,
  openCount,
  onOpenInbox,
}: QuickCaptureProps) {
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
        <Icon name='star-four-points' size={18} color={colors.gold} />
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder='Capture anything...'
          placeholderTextColor={colors.muted}
          onSubmitEditing={submit}
          returnKeyType='done'
        />
        <Pressable style={styles.button} onPress={submit}>
          <Icon name='arrow-up-bold' size={18} color={colors.black} />
        </Pressable>
      </View>

      {openCount > 0 ? (
        <Pressable style={styles.inboxLink} onPress={onOpenInbox}>
          <Text style={styles.inboxText}>{openCount} in inbox</Text>
          <Icon name='arrow-right' size={13} color={colors.gold} />
        </Pressable>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: glass.fillStrong,
    borderWidth: 1,
    borderColor: glass.rim,
    borderRadius: radius.xl,
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 16,
    paddingRight: 6,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 14,
    paddingVertical: 0,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.gold,
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
    fontFamily: fonts.display,
    fontSize: 12,
    color: colors.muted,
  },
});
