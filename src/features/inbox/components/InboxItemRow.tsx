import { StyleSheet, Text, View } from 'react-native';

import { colors, glass, radius, tint } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { Icon, type IconName } from '@/theme/icons';
import { IconBadge } from '@/components/game';
import { PressableScale } from '@/components/motion';
import { useInboxStore } from '@/store/inboxStore';
import type { InboxItem, TriageTarget } from '@/types/inbox';

/** Relative "captured" label in Vietnamese, e.g. "vừa xong", "12 phút trước". */
function capturedLabel(createdAt: number): string {
  const diff = Date.now() - createdAt;
  const min = Math.floor(diff / 60_000);
  if (min < 1) return 'vừa xong';
  if (min < 60) return `${min} phút trước`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} giờ trước`;
  const days = Math.floor(hr / 24);
  return `${days} ngày trước`;
}

/** Convert actions — turn the capture into the right domain object (accent = purple). */
interface ConvertChip {
  label: string;
  icon: IconName;
  target: TriageTarget;
}

const CONVERT_CHIPS: ConvertChip[] = [
  { label: 'Công việc', icon: 'checkbox-marked-circle-outline', target: 'task' },
  { label: 'Ghi chú', icon: 'note-text-outline', target: 'note' },
  { label: 'Mục tiêu', icon: 'flag-outline', target: 'goal' },
];

// ---------------------------------------------------------------------------
// Quick-triage chip — one 44px tap target with icon + label.
// ---------------------------------------------------------------------------

interface ChipProps {
  label: string;
  icon: IconName;
  color: string;
  onPress: () => void;
}

function TriageChip({ label, icon, color, onPress }: ChipProps) {
  return (
    <PressableScale
      onPress={onPress}
      haptic='selection'
      accessibilityRole='button'
      accessibilityLabel={label}
      hitSlop={4}
      style={[styles.chip, { borderColor: tint(color, '55') }]}
    >
      <Icon name={icon} size={15} color={color} />
      <Text style={[styles.chipLabel, { color }]}>{label}</Text>
    </PressableScale>
  );
}

interface Props {
  item: InboxItem;
}

/**
 * A single captured item — source glyph + text, then a row of quick-triage
 * chips. "Chuyển thành…" chips route the item into the matching domain object;
 * Xong archives it, Xoá deletes it (DESIGN_SPEC §5.9).
 */
export function InboxItemRow({ item }: Props) {
  const triage = useInboxStore((s) => s.triage);
  const archive = useInboxStore((s) => s.archive);
  const remove = useInboxStore((s) => s.remove);

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <IconBadge icon='lightning-bolt' color={colors.purple} size={38} />
        <View style={styles.mid}>
          <Text style={styles.text} numberOfLines={4}>
            {item.text}
          </Text>
          <Text style={styles.time}>Ghi {capturedLabel(item.createdAt)}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.chips}>
        {CONVERT_CHIPS.map((chip) => (
          <TriageChip
            key={chip.target}
            label={chip.label}
            icon={chip.icon}
            color={colors.purple}
            onPress={() => triage(item.id, chip.target)}
          />
        ))}
        <View style={styles.spacer} />
        <TriageChip
          label='Xong'
          icon='check'
          color={colors.green}
          onPress={() => archive(item.id)}
        />
        <TriageChip
          label='Xoá'
          icon='trash-can-outline'
          color={colors.error}
          onPress={() => remove(item.id)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: glass.fill,
    borderWidth: 1,
    borderColor: glass.rim,
    borderRadius: radius.xl,
    padding: spacing.md,
    gap: spacing.sm,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  mid: {
    flex: 1,
    gap: spacing.unit,
    paddingTop: 2,
  },
  text: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  time: {
    fontFamily: fonts.monoRegular,
    fontSize: 11,
    color: colors.muted,
  },
  divider: {
    height: 1,
    backgroundColor: glass.rim,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
  },
  spacer: {
    flex: 1,
    minWidth: spacing.unit,
  },
  chip: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    backgroundColor: glass.fillSoft,
  },
  chipLabel: {
    fontFamily: fonts.display,
    fontSize: 13,
    letterSpacing: 0.2,
  },
});
