import { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, glass, radius, tint } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { Icon, type IconName } from '@/theme/icons';
import { IconBadge } from '@/components/game';
import { PressableScale } from '@/components/motion';
import { useInboxStore } from '@/store/inboxStore';
import type { InboxItem, TriageTarget } from '@/types/inbox';

import { parseQuickCapture } from '@/utils/parser';

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
  { label: 'Tài chính', icon: 'cash', target: 'transaction' },
  { label: 'Thói quen', icon: 'star-outline', target: 'habit' },
  { label: 'Mục tiêu', icon: 'flag-outline', target: 'goal' },
  { label: 'Ghi chú', icon: 'note-text-outline', target: 'note' },
];

// ---------------------------------------------------------------------------
// Quick-triage chip — one 44px tap target with icon + label.
// ---------------------------------------------------------------------------

interface ChipProps {
  label: string;
  icon: IconName;
  color: string;
  onPress: () => void;
  isSuggested?: boolean;
}

function TriageChip({ label, icon, color, onPress, isSuggested }: ChipProps) {
  return (
    <PressableScale
      onPress={onPress}
      haptic='selection'
      accessibilityRole='button'
      accessibilityLabel={label}
      hitSlop={4}
      style={[
        styles.chip,
        { borderColor: tint(color, '55') },
        isSuggested && { backgroundColor: tint(color, '15'), borderWidth: 2 }
      ]}
    >
      <Icon name={icon} size={15} color={color} />
      <Text style={[
        styles.chipLabel,
        { color },
        isSuggested && { fontFamily: fonts.displayBold }
      ]}>
        {label}
      </Text>
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
  const customSlang = useInboxStore((s) => s.customSlang);

  const parsed = parseQuickCapture(item.text, customSlang);
  const suggestedType = parsed.type;

  const [showPrompt, setShowPrompt] = useState(false);
  const [amountText, setAmountText] = useState('');

  const handleTriageTransaction = () => {
    if (parsed.type === 'transaction' && parsed.metadata?.amount && parsed.metadata.amount > 0) {
      triage(item.id, 'transaction');
    } else {
      setShowPrompt(true);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <IconBadge icon='lightning-bolt' color={colors.purple} size={38} />
        <View style={styles.mid}>
          <Text style={styles.text} numberOfLines={4}>
            {item.text}
          </Text>
          {parsed.type === 'transaction' && parsed.metadata?.amount !== undefined && (
            <Text style={[styles.time, { color: colors.purple, fontFamily: fonts.semibold }]}>
              Gợi ý Tài chính: {parsed.metadata.transactionType === 'income' ? '+' : '-'}{parsed.metadata.amount.toLocaleString('vi-VN')}đ ({parsed.text})
            </Text>
          )}
          <Text style={styles.time}>Ghi {capturedLabel(item.createdAt)}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.chips}>
        {CONVERT_CHIPS.map((chip) => {
          const isSuggested = chip.target === suggestedType;
          return (
            <TriageChip
              key={chip.target}
              label={isSuggested ? `${chip.label} ⭐` : chip.label}
              icon={chip.icon}
              color={isSuggested ? colors.purple : colors.muted}
              isSuggested={isSuggested}
              onPress={() => {
                if (chip.target === 'transaction') {
                  handleTriageTransaction();
                } else {
                  triage(item.id, chip.target);
                }
              }}
            />
          );
        })}
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

      {/* Manual Amount Input Modal */}
      <Modal visible={showPrompt} transparent animationType='fade' onRequestClose={() => setShowPrompt(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nhập số tiền</Text>
            <Text style={styles.modalSubtitle}>Không nhận diện được số tiền tự động từ: "{item.text}"</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ví dụ: 40000"
              placeholderTextColor={colors.tabInactive}
              keyboardType="number-pad"
              value={amountText}
              onChangeText={setAmountText}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <PressableScale
                style={[styles.modalButton, { borderColor: colors.muted }]}
                onPress={() => {
                  setShowPrompt(false);
                  setAmountText('');
                }}
              >
                <Text style={[styles.modalBtnText, { color: colors.muted }]}>Hủy</Text>
              </PressableScale>
              <PressableScale
                style={[styles.modalButton, { backgroundColor: colors.purple, borderColor: colors.purple }]}
                onPress={async () => {
                  const val = parseInt(amountText.replace(/[^0-9]/g, ''), 10);
                  if (val > 0) {
                    await triage(item.id, 'transaction', val);
                    setShowPrompt(false);
                    setAmountText('');
                  }
                }}
              >
                <Text style={[styles.modalBtnText, { color: colors.white }]}>Xác nhận</Text>
              </PressableScale>
            </View>
          </View>
        </View>
      </Modal>
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(20,29,48,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  modalContent: {
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 320,
    gap: spacing.md,
    alignItems: 'stretch',
  },
  modalTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.track,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.text,
    fontFamily: fonts.monoMedium,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnText: {
    fontFamily: fonts.semibold,
    fontSize: 14,
  },
});
