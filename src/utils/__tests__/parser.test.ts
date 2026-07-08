import { parseQuickCapture, learnSlangFromInput } from '../parser';

describe('parseQuickCapture', () => {
  test('should parse goals correctly', () => {
    expect(parseQuickCapture('g/Learn React Native')).toEqual({
      type: 'goal',
      text: 'Learn React Native',
      raw: 'g/Learn React Native',
    });
  });

  test('should parse habits correctly', () => {
    expect(parseQuickCapture('h/Drink water')).toEqual({
      type: 'habit',
      text: 'Drink water',
      raw: 'h/Drink water',
    });
  });

  test('should parse tasks with explicit prefix', () => {
    expect(parseQuickCapture('t/Buy milk')).toEqual({
      type: 'task',
      text: 'Buy milk',
      raw: 't/Buy milk',
    });
  });

  test('should parse transactions with various formats', () => {
    expect(parseQuickCapture('-50k cafe')).toEqual({
      type: 'transaction',
      text: 'cafe',
      raw: '-50k cafe',
      metadata: { amount: 50000, transactionType: 'expense', matchedSuffix: 'k' },
    });
  });

  test('should parse Vietnamese slang units', () => {
    expect(parseQuickCapture('1 củ ăn trưa')).toEqual({
      type: 'transaction',
      text: 'ăn trưa',
      raw: '1 củ ăn trưa',
      metadata: { amount: 1000000, transactionType: 'expense', matchedSuffix: 'củ' },
    });

    expect(parseQuickCapture('mua sách 2 lít')).toEqual({
      type: 'transaction',
      text: 'mua sách',
      raw: 'mua sách 2 lít',
      metadata: { amount: 200000000 / 1000, transactionType: 'expense', matchedSuffix: 'lít' }, // 2 lít = 200,000đ
    });

    expect(parseQuickCapture('đất 3 tỏi')).toEqual({
      type: 'transaction',
      text: 'đất',
      raw: 'đất 3 tỏi',
      metadata: { amount: 3000000000, transactionType: 'expense', matchedSuffix: 'tỏi' },
    });

    expect(parseQuickCapture('uống nước 3 xị')).toEqual({
      type: 'transaction',
      text: 'uống nước',
      raw: 'uống nước 3 xị',
      metadata: { amount: 300000, transactionType: 'expense', matchedSuffix: 'xị' },
    });
  });

  test('should support custom learned slang', () => {
    const customSlang = { 'chục': 10000 };
    expect(parseQuickCapture('5 chục ăn sáng', customSlang)).toEqual({
      type: 'transaction',
      text: 'ăn sáng',
      raw: '5 chục ăn sáng',
      metadata: { amount: 50000, transactionType: 'expense', matchedSuffix: 'chục' },
    });
  });
});

describe('learnSlangFromInput', () => {
  test('should learn new slang multipliers', () => {
    expect(learnSlangFromInput('5 chục ăn sáng', 50000)).toEqual({
      word: 'chục',
      multiplier: 10000,
    });

    expect(learnSlangFromInput('com bui 4 chục', 400000)).toEqual({
      word: 'chục',
      multiplier: 100000, // 4 chục = 400k (multiplier = 100,000)
    });
  });

  test('should ignore already registered slang words', () => {
    expect(learnSlangFromInput('5k cafe', 5000)).toBeNull(); // k is built-in
  });

  test('should ignore non-power-of-10 multipliers', () => {
    expect(learnSlangFromInput('3 chục cafe', 12000)).toBeNull(); // multiplier is 4000 (not power of 10)
  });
});
