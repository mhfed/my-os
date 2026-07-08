export interface ParsedResult {
  type: 'transaction' | 'goal' | 'habit' | 'task';
  text: string; // The cleaned up descriptive text
  raw: string;  // The original raw text
  metadata?: {
    amount?: number;
    transactionType?: 'income' | 'expense';
  };
}

export function parseQuickCapture(text: string): ParsedResult {
  const trimmed = text.trim();
  const raw = trimmed;

  if (!trimmed) {
    return { type: 'task', text: '', raw: '' };
  }

  // 1. Goal Match (e.g., g/Học React Native, goal: Learn React Native)
  if (/^(g\/|g:|goal:)/i.test(trimmed)) {
    const content = trimmed.replace(/^(g\/|g:|goal:)\s*/i, '').trim();
    return { type: 'goal', text: content, raw };
  }

  // 2. Habit Match (e.g., h/Uống nước, habit: Drink water)
  if (/^(h\/|h:|habit:)/i.test(trimmed)) {
    const content = trimmed.replace(/^(h\/|h:|habit:)\s*/i, '').trim();
    return { type: 'habit', text: content, raw };
  }

  // 3. Explicit Task prefix (e.g. t/Buy milk, task: Walk dog)
  if (/^(t\/|t:|task:)/i.test(trimmed)) {
    const content = trimmed.replace(/^(t\/|t:|task:)\s*/i, '').trim();
    return { type: 'task', text: content, raw };
  }

  // 4. Finance Match (e.g. +100k lương, ăn trưa -50k, cafe 20k)
  const startMatch = trimmed.match(/^([+-]?\d+(?:\.\d+)?)\s*(k|m|tr)?\b\s+(.+)$/i);
  const endMatch = trimmed.match(/^(.+?)\s+([+-]?\d+(?:\.\d+)?)\s*(k|m|tr)?$/i);

  if (startMatch) {
    const amountStr = startMatch[1];
    const suffix = (startMatch[2] || '').toLowerCase();
    const note = startMatch[3].trim();
    const parsedAmount = parseAmount(amountStr, suffix);
    if (parsedAmount !== null) {
      return {
        type: 'transaction',
        text: note,
        raw,
        metadata: {
          amount: Math.abs(parsedAmount),
          transactionType: parsedAmount < 0 ? 'expense' : 'income',
        },
      };
    }
  } else if (endMatch) {
    const note = endMatch[1].trim();
    const amountStr = endMatch[2];
    const suffix = (endMatch[3] || '').toLowerCase();
    const parsedAmount = parseAmount(amountStr, suffix);
    if (parsedAmount !== null) {
      return {
        type: 'transaction',
        text: note,
        raw,
        metadata: {
          amount: Math.abs(parsedAmount),
          transactionType: parsedAmount < 0 ? 'expense' : 'income',
        },
      };
    }
  }

  // Fallback: Task
  return { type: 'task', text: trimmed, raw };
}

function parseAmount(amountStr: string, suffix: string): number | null {
  let val = parseFloat(amountStr);
  if (isNaN(val)) return null;

  const hasSign = amountStr.startsWith('+') || amountStr.startsWith('-');
  const isNegative = amountStr.startsWith('-');

  if (suffix === 'k') {
    val *= 1000;
  } else if (suffix === 'm' || suffix === 'tr') {
    val *= 1000000;
  } else {
    // If no unit suffix, default to thousands if small (e.g. 50 -> 50000), but if it's already >= 1000, keep it.
    if (Math.abs(val) < 1000) {
      val *= 1000;
    }
  }

  // Default to expense if no sign is explicitly provided
  if (!hasSign) {
    return -Math.abs(val); // default is expense
  }

  return isNegative ? -Math.abs(val) : Math.abs(val);
}
