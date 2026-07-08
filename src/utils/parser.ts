export interface ParsedResult {
  type: 'transaction' | 'goal' | 'habit' | 'task';
  text: string; // The cleaned up descriptive text
  raw: string;  // The original raw text
  metadata?: {
    amount?: number;
    transactionType?: 'income' | 'expense';
    matchedSuffix?: string;
  };
}

const BUILTIN_SLANG: Record<string, number> = {
  'm': 1000000,
  'tr': 1000000,
  'triệu': 1000000,
  'củ': 1000000,
  'cu': 1000000,
  'k': 1000,
  'nghìn': 1000,
  'ngàn': 1000,
  'lít': 100000,
  'xị': 100000,
  'tỷ': 1000000000,
  'tỏi': 1000000000,
};

export function parseQuickCapture(text: string, customSlang?: Record<string, number>): ParsedResult {
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

  // 4. Finance Match supporting Vietnamese slang and custom learned slang
  const suffixPattern = '[a-zA-Z\\u00C0-\\u1EF9]+';
  const startMatch = trimmed.match(new RegExp(`^([+-]?\\d+(?:\\.\\d+)?)\\s*(${suffixPattern})?\\s+(.+)$`, 'i'));
  const endMatch = trimmed.match(new RegExp(`^(.+?)\\s+([+-]?\\d+(?:\\.\\d+)?)\\s*(${suffixPattern})?$`, 'i'));

  if (startMatch) {
    const amountStr = startMatch[1];
    const suffix = (startMatch[2] || '').toLowerCase();
    const note = startMatch[3].trim();
    const parsedAmount = parseAmount(amountStr, suffix, customSlang);
    if (parsedAmount !== null) {
      return {
        type: 'transaction',
        text: note,
        raw,
        metadata: {
          amount: Math.abs(parsedAmount),
          transactionType: parsedAmount < 0 ? 'expense' : 'income',
          matchedSuffix: suffix || undefined,
        },
      };
    }
  } else if (endMatch) {
    const note = endMatch[1].trim();
    const amountStr = endMatch[2];
    const suffix = (endMatch[3] || '').toLowerCase();
    const parsedAmount = parseAmount(amountStr, suffix, customSlang);
    if (parsedAmount !== null) {
      return {
        type: 'transaction',
        text: note,
        raw,
        metadata: {
          amount: Math.abs(parsedAmount),
          transactionType: parsedAmount < 0 ? 'expense' : 'income',
          matchedSuffix: suffix || undefined,
        },
      };
    }
  }

  // Try matching plain amount without note (e.g. "50k", "1 củ")
  const plainMatch = trimmed.match(new RegExp(`^([+-]?\\d+(?:\\.\\d+)?)\\s*(${suffixPattern})?$`, 'i'));
  if (plainMatch) {
    const amountStr = plainMatch[1];
    const suffix = (plainMatch[2] || '').toLowerCase();
    const parsedAmount = parseAmount(amountStr, suffix, customSlang);
    if (parsedAmount !== null) {
      return {
        type: 'transaction',
        text: 'Giao dịch',
        raw,
        metadata: {
          amount: Math.abs(parsedAmount),
          transactionType: parsedAmount < 0 ? 'expense' : 'income',
          matchedSuffix: suffix || undefined,
        },
      };
    }
  }

  // Fallback: Task
  return { type: 'task', text: trimmed, raw };
}

function parseAmount(amountStr: string, suffix: string, customSlang?: Record<string, number>): number | null {
  let val = parseFloat(amountStr);
  if (isNaN(val)) return null;

  const hasSign = amountStr.startsWith('+') || amountStr.startsWith('-');
  const isNegative = amountStr.startsWith('-');

  let multiplier = 1;
  if (suffix) {
    if (customSlang && suffix in customSlang) {
      multiplier = customSlang[suffix];
    } else if (suffix in BUILTIN_SLANG) {
      multiplier = BUILTIN_SLANG[suffix];
    } else {
      return null;
    }
  } else {
    if (Math.abs(val) < 1000) {
      multiplier = 1000;
    }
  }

  val *= multiplier;

  if (!hasSign) {
    return -Math.abs(val);
  }

  return isNegative ? -Math.abs(val) : Math.abs(val);
}

/**
 * Detects if a text and final amount can form a new slang mapping.
 * Returns the learned { word: multiplier } or null.
 */
export function learnSlangFromInput(text: string, confirmedAmount: number): { word: string; multiplier: number } | null {
  const trimmed = text.trim();
  const suffixPattern = '[a-zA-Z\\u00C0-\\u1EF9]+';
  
  const match = trimmed.match(new RegExp(`(?:^|\\s)([+-]?\\d+(?:\\.\\d+)?)\\s*(${suffixPattern})`, 'i'));
  if (!match) return null;

  const numVal = parseFloat(match[1]);
  const word = match[2].toLowerCase();

  if (numVal === 0 || isNaN(numVal)) return null;
  if (word in BUILTIN_SLANG) return null;

  const multiplier = Math.round(confirmedAmount / Math.abs(numVal));
  const log10 = Math.log10(multiplier);
  if (multiplier > 0 && Math.abs(log10 - Math.round(log10)) < 1e-9) {
    return { word, multiplier };
  }

  return null;
}
