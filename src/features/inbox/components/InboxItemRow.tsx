import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { Icon } from '@/theme/icons';
import { useInboxStore } from '@/store/inboxStore';
import type { InboxItem, TriageTarget } from '@/types/inbox';

/** Relative "captured" label, e.g. "just now", "12m ago", "3h ago", "2d ago". */
function capturedLabel(createdAt: number): string {
  const diff = Date.now() - createdAt;
  const min = Math.floor(diff / 60_000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  return `${days}d ago`;
}

interface TriagePill {
  label: string;
  target: TriageTarget;
  color: string;
}

const PILLS: TriagePill[] = [
  { label: '→ Task', target: 'task', color: colors.purple },
  { label: '→ Journal', target: 'journal', color: colors.teal },
  { label: '→ Habit', target: 'habit', color: colors.orange },
];

interface Props {
  item: InboxItem;
}

export function InboxItemRow({ item }: Props) {
  const triage = useInboxStore((s) => s.triage);
  const remove = useInboxStore((s) => s.remove);

  return (
    <View style={styles.card}>
      <Text style={styles.text}>{item.text}</Text>
      <Text style={styles.time}>captured {capturedLabel(item.createdAt)}</Text>

      <View style={styles.actions}>
        {PILLS.map((pill) => (
          <Pressable
            key={pill.target}
            onPress={() => triage(item.id, pill.target)}
            style={({ pressed }) => [
              styles.pill,
              { borderColor: pill.color },
              pressed ? styles.pillPressed : null,
            ]}
          >
            <Text style={[styles.pillText, { color: pill.color }]}>
              {pill.label}
            </Text>
          </Pressable>
        ))}

        <View style={styles.spacer} />

        <Pressable
          onPress={() => remove(item.id)}
          hitSlop={8}
          style={({ pressed }) => [
            styles.trash,
            pressed ? styles.pillPressed : null,
          ]}
        >
          <Icon name="trash-can-outline" size={18} color={colors.muted} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  text: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 21,
    color: colors.text,
  },
  time: {
    fontFamily: fonts.monoRegular,
    fontSize: 11,
    color: colors.muted,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillPressed: {
    opacity: 0.6,
  },
  pillText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
  },
  spacer: {
    flex: 1,
  },
  trash: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
