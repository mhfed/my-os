# Finance — Improvement Backlog & Implementation Specs

> Audit date: 2026-07-01  
> Based on full review of Epic D (Debt Ledger), Epic E (Savings Goals), and Finance UX phases A–C.

---

## Gap Analysis

### Critical (implemented in store but no UI)

| Gap | Store method | Missing UI |
|-----|-------------|-----------|
| Edit transaction | `updateTransaction` MISSING in store | No EditTransactionSheet |
| Edit debt | `updateDebt()` ✅ in debtStore | No edit form in DebtDetailSheet |
| Edit savings goal | `updateGoal()` ✅ in savingsStore | No edit form in GoalDetailSheet |

### Data computed but not displayed

| Gap | Data available | Missing display |
|-----|---------------|----------------|
| Budget per category row | `budgets` in financeStore state | `CategorySpend` type has no `budget`/`budgetUsed`; CategoryBreakdown shows % only |
| Debt due soon badge | `upcomingCount` in `getSummary()` | DebtSummaryWidget doesn't highlight upcoming |

### New widgets (not in plan, high value)

| Feature | Rationale |
|---------|-----------|
| Net worth widget | Single number: savings − debt = net worth. Ties Epic D + E together |

---

## Feature Specs

---

### F1 — Edit Transaction

**Files to change:**
- `src/store/financeStore.ts` — add `updateTransaction`
- `src/types/finance.ts` — add `updateTransaction` to `FinanceState`
- `src/features/finance/components/EditTransactionSheet.tsx` — **NEW**
- `src/features/finance/components/TransactionHistorySheet.tsx` — add `onEdit` wire
- `src/features/finance/components/TransactionRow.tsx` — add optional `onEdit` prop

**Store method to add (financeStore.ts):**
```ts
updateTransaction: async (id: string, patch: Partial<Pick<Transaction, 'amount' | 'type' | 'categoryId' | 'note' | 'date'>>) => {
  const { runSql } = await import('@/db/database');
  const existing = get().transactions.find((t) => t.id === id);
  if (!existing) return;
  const updated = { ...existing, ...patch };
  await runSql(
    'UPDATE transactions SET type=?, amount=?, category_id=?, note=?, date=? WHERE id=?;',
    [updated.type, updated.amount, updated.categoryId, updated.note ?? null, updated.date, id],
  );
  set((s) => ({ transactions: s.transactions.map((t) => (t.id === id ? updated : t)) }));
},
```

**EditTransactionSheet:**
- Props: `txn: TransactionView | null; onClose: () => void`
- Same bottom-sheet style as AddTransactionSheet (transparent Modal, backdrop, KeyboardAvoidingView)
- Pre-filled fields: amount, type (income/expense toggle), category chip, date, note
- Submit calls `updateTransaction(txn.id, patch)` then `onClose()`
- Do NOT show category creation inline — just pick from existing categories
- Date field uses `DatePickerModal` (same as AddTransactionSheet)
- Title: "Sửa giao dịch"

**TransactionRow changes:**
- Add optional `onEdit?: () => void` prop
- Swipeable: add a blue "Sửa" action on the RIGHT side (left swipe reveals Delete on left, Edit on right)
  - Or: tap the row body to open edit

**TransactionHistorySheet changes:**
- Add `const [editTxn, setEditTxn] = useState<TransactionView | null>(null)`
- Pass `onEdit={() => setEditTxn(txn)}` to each `TransactionRow`
- Render `<EditTransactionSheet txn={editTxn} onClose={() => setEditTxn(null)} />` inside the `<Modal>`

---

### F2 — Budget per Category Row

**Files to change:**
- `src/types/finance.ts` — extend `CategorySpend`
- `src/store/financeStore.ts` — extend `getCategorySpend()`
- `src/features/finance/components/CategoryBreakdown.tsx` — show budget info per row

**Type extension (types/finance.ts):**
```ts
export interface CategorySpend {
  categoryId: string;
  name: string;
  color: string;
  icon: string;
  amount: number;
  pct: number; // 0–100, share of total expense
  // NEW:
  budget: number;      // 0 if no budget set for this category this month
  budgetUsed: number;  // 0–∞ fraction (>1 = over budget). 0 if no budget.
}
```

**getCategorySpend() changes (financeStore.ts):**
```ts
// Inside getCategorySpend, change the destructure to include budgets:
const { activeMonth, transactions, categories, budgets } = get();

// And in the result.push(...):
const catBudget = budgets.find(
  (b) => b.categoryId === category.id && b.month === activeMonth,
)?.amount ?? 0;

result.push({
  ...existingFields,
  budget: catBudget,
  budgetUsed: catBudget > 0 ? amount / catBudget : 0,
});
```

**CategoryBreakdown.tsx changes:**
Each legend row should show:
- Color dot + name (flex: 1)
- If `budget > 0`: small progress bar (width ~60px) + "₫800K / ₫1M" amount text
  - Bar color: green if <80%, orange if 80–99%, red if ≥100%
  - Text color: red if `budgetUsed >= 1`
- If `budget === 0`: just show `₫amount` + `pct%`

Example layout per row:
```
● Ăn uống        [████░░] ₫800K / ₫1M
● Di chuyển                ₫300K · 18%
```

---

### F3 — Net Worth Widget + Debt Due-date Badge

**Files to change:**
- `src/features/finance/components/NetWorthWidget.tsx` — **NEW**
- `src/features/finance/components/DebtSummaryWidget.tsx` — add upcoming badge
- `src/features/finance/FinanceScreen.tsx` — add `<NetWorthWidget />` between StatCards and SavingsGoalsSection

**NetWorthWidget:**
```ts
import { useDebtStore } from '@/store/debtStore';
import { useSavingsStore } from '@/store/savingsStore';

export function NetWorthWidget() {
  const getSummary = useDebtStore((s) => s.getSummary);
  const goals = useSavingsStore((s) => s.goals);

  const { totalReceivable, totalPayable } = getSummary();
  const totalSavings = goals
    .filter((g) => g.status === 'active')
    .reduce((sum, g) => sum + g.currentAmount, 0);

  const netWorth = totalSavings + totalReceivable - totalPayable;
  const isPositive = netWorth >= 0;

  // UI: card with 3 sub-rows
  // Row 1: "Tài sản ròng" label + netWorth amount (green if positive, red if negative)
  // Row 2: 3 columns: Tiết kiệm (teal) | Sẽ thu (purple) | Phải trả (red)
  // Only render if any of the 3 has a non-zero value
}
```

Visual design:
- Card with subtle gradient or border
- Large center number: net worth in green/red
- Below: 3 chip-style items — "💰 Tiết kiệm ₫X" | "📥 Sẽ thu ₫X" | "📤 Phải trả ₫X"
- If all zeros (new user): render nothing / `return null`

**DebtSummaryWidget badge:**
`getSummary()` already returns `upcomingCount` (due within 7 days) and `overdueCount`.

Changes to DebtSummaryWidget:
- If `overdueCount > 0`: show red badge "🔴 {n} quá hạn" on the card
- If `upcomingCount > 0` (and no overdue): show orange badge "⚠️ {n} đến hạn tuần này"
- Position badge in top-right corner of the card (absolute positioned)

---

### F4 — Edit Debt

**File to change:** `src/features/finance/components/DebtDetailSheet.tsx`

`updateDebt` in debtStore signature:
```ts
updateDebt: async (id: string, patch: Partial<Pick<DebtEntry, 'party' | 'originalAmount' | 'note' | 'startDate' | 'dueDate' | 'interestType' | 'interestRate' | 'interestPeriod'>>) => void
```

**UI pattern:**
- Add a pencil icon button in the header row of DebtDetailSheet (next to the close button)
- Tapping it shows an inline edit panel (NOT a new modal — just expand a section below the header with editable fields)
- Fields to edit: `party` (tên người/tổ chức), `originalAmount`, `dueDate`, `note`
- Interest fields (interestType, rate, period) — show if the debt already has interest
- "Lưu" button calls `updateDebt(view.id, patch)` then collapses the panel
- "Huỷ" collapses without saving

State to add:
```ts
const [editOpen, setEditOpen] = useState(false);
const [editParty, setEditParty] = useState('');
const [editAmountText, setEditAmountText] = useState('');
const [editNote, setEditNote] = useState('');
const [editDueDate, setEditDueDate] = useState<number | undefined>(undefined);
const [dueDatePickerOpen, setDueDatePickerOpen] = useState(false);
```

When user taps pencil → populate edit fields from current `view` values → show panel.

---

### F5 — Edit Savings Goal

**File to change:** `src/features/finance/components/GoalDetailSheet.tsx`

`updateGoal` in savingsStore signature:
```ts
updateGoal: async (id: string, patch: Partial<Pick<SavingsGoal, 'name' | 'targetAmount' | 'deadline' | 'icon' | 'color' | 'note'>>) => void
```

**UI pattern (same as F4 — inline edit panel):**
- Add pencil icon button in GoalDetailSheet header
- Fields to edit: `name`, `targetAmount`, `deadline` (with toggle), `icon`, `color`, `note`
- Reuse the same icon picker / color palette from AddGoalSheet
- "Lưu" calls `updateGoal(view.id, patch)` then collapses

State to add:
```ts
const [editOpen, setEditOpen] = useState(false);
// + edit field states matching AddGoalSheet fields
```

---

## Implementation Order (for parallel agents)

These 5 features can be implemented in parallel — file boundaries don't overlap except:

| Agent | Features | Files touched |
|-------|----------|---------------|
| A | F1 (Edit transaction) | financeStore.ts, types/finance.ts, TransactionHistorySheet, TransactionRow, NEW EditTransactionSheet |
| B | F2 (Budget per category) | financeStore.ts*, types/finance.ts*, CategoryBreakdown |
| C | F3 (Net worth + debt badge) | NEW NetWorthWidget, DebtSummaryWidget, FinanceScreen |
| D | F4 (Edit debt) | DebtDetailSheet |
| E | F5 (Edit savings goal) | GoalDetailSheet |

> ⚠️ Agents A and B both touch `financeStore.ts` and `types/finance.ts` — run them as ONE agent or in strict sequence.

---

## Coding conventions (from codebase)

- Store: Zustand with SQLite persistence via `runSql`/`allRows`. Pattern: SQL first → `set()`.
- UI: all sheets use `Modal` with `presentationStyle='pageSheet'` OR `transparent` bottom-sheet style.
- Sub-modals that appear over a pageSheet MUST be rendered INSIDE the parent `<Modal>` JSX.
- Colors: `colors.purple` (primary), `colors.teal` (income/savings), `colors.red` (danger/over-budget), `colors.orange` (warning).
- Typography: `fonts.semibold` for titles, `fonts.medium` for labels, `fonts.regular` for body.
- Currency: `formatVND(n)`, `formatCompactVND(n)`, `formatSignedVND(n)` from `@/utils/currency`.
- Dates: epoch ms (midnight UTC+0). `dayLabel(epochMs)` pattern used in AddDebtSheet/AddGoalSheet.
- DatePickerModal: `import { DatePickerModal } from '@/components/DatePickerModal'` — must render INSIDE parent Modal.
- Import aliases: `@/store/*`, `@/components/*`, `@/types/*`, `@/theme/*`, `@/utils/*`.

---

## Done checklist

- [ ] F1 Edit transaction
- [ ] F2 Budget per category row
- [ ] F3 Net worth widget
- [ ] F3b Debt due-date badge
- [ ] F4 Edit debt (inline panel)
- [ ] F5 Edit savings goal (inline panel)
