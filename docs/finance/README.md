# Finance Module — Tài liệu

> Tổng quan tất cả epics của Finance tab trong PersonalOS.

---

## Epics

| Epic | Tên | Status | Phụ thuộc |
|------|-----|--------|-----------|
| [A–C](../../PROGRESS.md) | Quick wins, History, Trend chart | ✅ Done | — |
| [D](./epic-D-debt-ledger.md) | Sổ Nợ (Debt Ledger) | 📋 Planned | financeStore, expo-notifications |
| [E](./epic-E-savings-goals.md) | Mục tiêu Tiết kiệm (Savings Goals) | 📋 Planned | financeStore, Epic D (optional) |
| F | Net Worth Snapshot | 🔮 Future | Epic D + E |

---

## Thứ tự implement

```
Epic D (Debt Ledger)       ← implement trước vì đây là pain point lớn nhất
  D1 debtStore.ts
  D2 DebtLedgerSheet (list)
  D3 AddDebtSheet
  D4 DebtDetailSheet + payments
  D5 DebtSummaryWidget
  D6 Push notifications
  D7 settleDebt + transaction link

Epic E (Savings Goals)     ← implement sau D
  E1 savingsStore.ts
  E2 SavingsGoalsSection (overview trong Finance screen)
  E3 AddGoalSheet
  E4 GoalDetailSheet + contributions
  E5 AddContributionSheet + link txn
  E6 SavingsGoalSheet (full list)

Epic F (Net Worth)         ← sau khi D + E ổn định
  Snapshot assets = savings + debt receivable
  Liabilities = debt payable
  Monthly trend
```

---

## Cấu trúc files dự kiến

```
src/
  types/
    debt.ts           ← DebtEntry, DebtPayment, DebtView, DebtSummary
    savings.ts        ← SavingsGoal, SavingsContribution, SavingsGoalView
  store/
    debtStore.ts      ← Zustand + SQLite
    savingsStore.ts   ← Zustand + SQLite
  features/finance/
    components/
      DebtSummaryWidget.tsx
      DebtLedgerSheet.tsx
      AddDebtSheet.tsx
      DebtDetailSheet.tsx
      SavingsGoalsSection.tsx
      SavingsGoalSheet.tsx
      AddGoalSheet.tsx
      GoalDetailSheet.tsx
      AddContributionSheet.tsx
```

---

## Design decisions đã chốt

| Câu hỏi | Quyết định |
|---------|-----------|
| Push notification cho debt due date? | ✅ Có — T-3 ngày + T-0 (local notification) |
| Track lãi suất? | ✅ Optional field — 3 modes: none / simple / compound |
| Tất toán debt → tạo transaction? | ✅ Có — toggle, default ON |
| Savings Goals ở đâu? | Finance tab, section riêng (không dùng Goals tab) |
| Savings contribution → tạo transaction? | ✅ Có — toggle "Ghi vào chi tiêu" |

---

## System categories cần seed

Khi implement D + E, thêm vào seed data của `financeStore`:

| Category | Type | Icon | Color | Dùng cho |
|----------|------|------|-------|---------|
| Thu nợ | income | `cash-plus` | teal | Debt settle (lend) |
| Trả nợ | expense | `cash-minus` | orange | Debt settle (borrow) |
| Tiết kiệm | expense | `piggy-bank` | purple | Savings contribution |
