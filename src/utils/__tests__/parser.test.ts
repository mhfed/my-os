import { parseQuickCapture } from '../parser';

describe('parseQuickCapture', () => {
  test('should parse goals correctly', () => {
    expect(parseQuickCapture('g/Learn React Native')).toEqual({
      type: 'goal',
      text: 'Learn React Native',
      raw: 'g/Learn React Native',
    });
    expect(parseQuickCapture('goal: Build an app')).toEqual({
      type: 'goal',
      text: 'Build an app',
      raw: 'goal: Build an app',
    });
    expect(parseQuickCapture('G: Hieu')).toEqual({
      type: 'goal',
      text: 'Hieu',
      raw: 'G: Hieu',
    });
  });

  test('should parse habits correctly', () => {
    expect(parseQuickCapture('h/Drink water')).toEqual({
      type: 'habit',
      text: 'Drink water',
      raw: 'h/Drink water',
    });
    expect(parseQuickCapture('habit: Study English')).toEqual({
      type: 'habit',
      text: 'Study English',
      raw: 'habit: Study English',
    });
  });

  test('should parse tasks with explicit prefix', () => {
    expect(parseQuickCapture('t/Buy milk')).toEqual({
      type: 'task',
      text: 'Buy milk',
      raw: 't/Buy milk',
    });
    expect(parseQuickCapture('task: Do homework')).toEqual({
      type: 'task',
      text: 'Do homework',
      raw: 'task: Do homework',
    });
  });

  test('should parse transactions with various formats', () => {
    // Start match
    expect(parseQuickCapture('-50k cafe')).toEqual({
      type: 'transaction',
      text: 'cafe',
      raw: '-50k cafe',
      metadata: { amount: 50000, transactionType: 'expense' },
    });
    expect(parseQuickCapture('+100k salary')).toEqual({
      type: 'transaction',
      text: 'salary',
      raw: '+100k salary',
      metadata: { amount: 100000, transactionType: 'income' },
    });

    // End match
    expect(parseQuickCapture('cafe -50k')).toEqual({
      type: 'transaction',
      text: 'cafe',
      raw: 'cafe -50k',
      metadata: { amount: 50000, transactionType: 'expense' },
    });
    expect(parseQuickCapture('salary +100k')).toEqual({
      type: 'transaction',
      text: 'salary',
      raw: 'salary +100k',
      metadata: { amount: 100000, transactionType: 'income' },
    });

    // No sign (defaults to expense)
    expect(parseQuickCapture('50k cafe')).toEqual({
      type: 'transaction',
      text: 'cafe',
      raw: '50k cafe',
      metadata: { amount: 50000, transactionType: 'expense' },
    });
    expect(parseQuickCapture('cafe 50k')).toEqual({
      type: 'transaction',
      text: 'cafe',
      raw: 'cafe 50k',
      metadata: { amount: 50000, transactionType: 'expense' },
    });

    // Million units
    expect(parseQuickCapture('-1.5m rent')).toEqual({
      type: 'transaction',
      text: 'rent',
      raw: '-1.5m rent',
      metadata: { amount: 1500000, transactionType: 'expense' },
    });
    expect(parseQuickCapture('phone 2tr')).toEqual({
      type: 'transaction',
      text: 'phone',
      raw: 'phone 2tr',
      metadata: { amount: 2000000, transactionType: 'expense' },
    });
  });

  test('should fallback to task for generic texts', () => {
    expect(parseQuickCapture('Buy a birthday gift for Mom')).toEqual({
      type: 'task',
      text: 'Buy a birthday gift for Mom',
      raw: 'Buy a birthday gift for Mom',
    });
  });
});
