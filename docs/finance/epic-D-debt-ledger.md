# Epic D — Sổ Nợ (Debt Ledger)

> Scope: Theo dõi các khoản cho vay và đi vay, lịch sử thanh toán từng phần, cảnh báo đến hạn, và liên kết tự động với transaction khi tất toán.

**Status:** Planned · chưa implement  
**Phụ thuộc:** financeStore (SQLite helpers, `newId`), notification permission

---

## 1. Bài toán & lý do

Luồng tiền hiện tại (income/expense) không đủ để mô tả khoản vay: khi cho bạn vay ₫5M, đây **không phải expense** — đó là tài sản (receivable). Khi bạn vay ai đó, đó là liability. Trộn lẫn vào transaction thường khiến báo cáo sai và khó theo dõi.

Sổ nợ là **module riêng biệt** (data model + store riêng), không làm ô nhiễm `financeStore`.

---

## 2. Data Model

### `DebtEntry` — mỗi khoản vay/cho vay

```typescript
interface DebtEntry {
  id: string;
  userId?: string;
  type: 'lend' | 'borrow';  // 'lend' = tôi cho vay, 'borrow' = tôi đi vay
  party: string;             // tên người/tổ chức (vd: "Nguyễn A", "VPBank")
  originalAmount: number;    // số tiền gốc (VND, positive integer)
  note?: string;             // ghi chú chi tiết (lý do, điều kiện, mã hợp đồng)
  startDate: number;         // epoch ms — ngày phát sinh khoản
  dueDate?: number;          // epoch ms — deadline trả (optional)
  interestType: 'none' | 'simple' | 'compound';
  interestRate?: number;     // % mỗi kỳ (null nếu interestType === 'none')
  interestPeriod?: 'month' | 'year'; // kỳ tính lãi
  status: 'open' | 'partial' | 'settled';
  linkedTransactionId?: string; // transaction được tạo khi tất toán
  createdAt: number;
}
```

**Tại sao tách `interestType`:**
- `none` — vay bạn bè, không lãi (phổ biến nhất)
- `simple` — lãi đơn: `interest = principal × rate × time`. Phù hợp vay tay.
- `compound` — lãi kép: ngân hàng/tín dụng. App tính tự động dư nợ hiện tại.

### `DebtPayment` — mỗi lần thanh toán một phần

```typescript
interface DebtPayment {
  id: string;
  debtId: string;
  amount: number;    // số tiền trả lần này
  date: number;      // epoch ms
  note?: string;     // "trả qua chuyển khoản MB", "nhận tiền mặt tại nhà"
  createdAt: number;
}
```

**Tại sao không chỉ lưu `paidAmount` trong `DebtEntry`:**  
Timeline thanh toán từng phần rất quan trọng cho tranh chấp và kiểm tra lại. Bạn cần biết "ngày 5/3 trả ₫1M, ngày 20/3 trả ₫2M" chứ không chỉ "đã trả ₫3M".

### Derived values (tính runtime, không lưu DB)

```typescript
// Số tiền đã trả (tổng payments)
paidAmount = sum(payments.amount)

// Số tiền còn lại (không kể lãi)
remainingPrincipal = originalAmount - paidAmount

// Lãi phát sinh (nếu có)
accruedInterest =
  type 'none'     → 0
  type 'simple'   → principal × rate × elapsed_periods
  type 'compound' → principal × (1 + rate)^elapsed_periods - principal

// Tổng còn phải trả
totalOwed = remainingPrincipal + accruedInterest
```

---

## 3. SQLite Schema

```sql
CREATE TABLE IF NOT EXISTS debt_entries (
  id          TEXT PRIMARY KEY,
  user_id     TEXT,
  type        TEXT NOT NULL,          -- 'lend' | 'borrow'
  party       TEXT NOT NULL,
  original_amount INTEGER NOT NULL,
  note        TEXT,
  start_date  INTEGER NOT NULL,
  due_date    INTEGER,
  interest_type TEXT NOT NULL DEFAULT 'none',
  interest_rate REAL,
  interest_period TEXT,
  status      TEXT NOT NULL DEFAULT 'open',
  linked_transaction_id TEXT,
  created_at  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS debt_payments (
  id         TEXT PRIMARY KEY,
  debt_id    TEXT NOT NULL REFERENCES debt_entries(id) ON DELETE CASCADE,
  amount     INTEGER NOT NULL,
  date       INTEGER NOT NULL,
  note       TEXT,
  created_at INTEGER NOT NULL
);
```

---

## 4. Store Interface (`debtStore.ts`)

```typescript
interface DebtState {
  entries: DebtEntry[];
  payments: DebtPayment[];   // all payments, filtered per entry in selectors
  ready: boolean;

  // lifecycle
  init: () => Promise<void>;

  // mutations
  addDebt: (input: Omit<DebtEntry, 'id' | 'status' | 'createdAt'>) => Promise<void>;
  updateDebt: (id: string, patch: Partial<DebtEntry>) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
  addPayment: (debtId: string, amount: number, date: number, note?: string) => Promise<void>;
  settleDebt: (id: string, linkToFinance: boolean) => Promise<void>;
  // settleDebt: marks status='settled', optionally creates transaction in financeStore

  // selectors
  getDebtView: (id: string) => DebtView | null;
  getSummary: () => DebtSummary;
  getOverdueEntries: () => DebtEntry[];
  getUpcomingEntries: (withinDays: number) => DebtEntry[];
}

interface DebtView extends DebtEntry {
  payments: DebtPayment[];
  paidAmount: number;
  accruedInterest: number;
  totalOwed: number;          // còn phải trả (principal + interest)
  remainingPrincipal: number;
  progressPct: number;        // 0–1 (paid / original)
  isOverdue: boolean;
  daysUntilDue: number | null;
}

interface DebtSummary {
  totalReceivable: number;   // tổng tôi cho vay còn chưa thu (lend + open/partial)
  totalPayable: number;      // tổng tôi đang nợ (borrow + open/partial)
  overdueCount: number;
  upcomingCount: number;     // due trong 7 ngày
}
```

---

## 5. UI Components

### 5.1 DebtSummaryWidget (trong FinanceScreen)

Hiển thị sau StatCards, trước MonthlyTrendChart.

```
┌──────────────────────────────────────────────┐
│  Sổ nợ                              3 khoản → │
│  Thu về: +₫8.5M    Phải trả: -₫2M           │
│  ⚠ 1 quá hạn · 2 sắp đến hạn               │
└──────────────────────────────────────────────┘
```

Tap → mở `DebtLedgerSheet`.

### 5.2 DebtLedgerSheet (full-screen modal)

```
Header: "Sổ nợ"
Tab chips: [Tôi cho vay] [Tôi đang nợ]

Summary bar:
  Lend view: "Người ta nợ bạn: ₫8.5M"
  Borrow view: "Bạn đang nợ: ₫2M"

Filter chips: [Tất cả] [Đang mở] [Đã tất toán]

List — mỗi row:
  [Avatar initials] Nguyễn A
                    ₫3M / ₫5M  (đã trả / gốc)
                    15/7/2026
  Status badge: 🔴 Quá hạn | 🟡 Còn 5 ngày | ✅ Tất toán

[+] FAB → AddDebtSheet
```

**Sort order:** Overdue → Upcoming → Active → Settled

### 5.3 AddDebtSheet

Fields:
- Type toggle: [Cho vay] [Đi vay]
- Party name (TextInput, autocomplete từ entries cũ)
- Amount (number pad)
- Start date (default hôm nay, arrow ← →)
- Due date (optional — có toggle, nếu bật thì hiện date picker)
- Lãi suất section (collapsed by default):
  - Toggle: Không lãi / Lãi đơn / Lãi kép
  - Rate % (TextInput numeric)
  - Kỳ: [Tháng] [Năm]
- Note (TextInput multiline)

### 5.4 DebtDetailSheet

```
Header: Nguyễn A · Cho vay ₫5,000,000

Progress section:
  Đã trả: ₫3,000,000 (60%)
  ████████████░░░░░░  60%
  Còn lại: ₫2,000,000
  Lãi phát sinh: ₫0 (không lãi)
  Đến hạn: 15/7/2026 (còn 14 ngày)

Note (nếu có):
  "Vay để sửa xe, trả theo tháng"

Timeline payments:
  01/5  +₫1,000,000  "gặp quán cà phê"
  15/5  +₫1,000,000
  03/6  +₫1,000,000

[+ Ghi nhận thanh toán]   [Tất toán]   [Sửa]   [Xoá]
```

**"Tất toán" flow:**
1. Confirm modal: "Đánh dấu tất toán?"
2. Toggle: "Ghi vào lịch sử giao dịch (income/expense)?" — default ON
3. Nếu ON → call `financeStore.addTransaction({ type: 'income'/'expense', amount: totalOwed, ... })`
4. Set `status = 'settled'`, store `linkedTransactionId`

---

## 6. Push Notification Strategy

**Khi nào gửi:**
- T-3 ngày: "⏰ Nguyễn A còn nợ bạn ₫2M, đến hạn 15/7"
- T-0 (ngày đến hạn): "📅 Hôm nay là hạn trả ₫2M từ Nguyễn A"
- Cho khoản bạn **đang nợ**: "⚠ Bạn đang nợ VPBank ₫3M, đến hạn hôm nay"

**Trigger:** Scheduled via `expo-notifications` local notification, không cần server.

**Implementation:**
```typescript
// Sau khi addDebt() hoặc updateDebt() có dueDate:
async function scheduleDebtNotification(entry: DebtEntry) {
  if (!entry.dueDate) return;
  const who = entry.type === 'lend' ? `${entry.party} còn nợ bạn` : `Bạn nợ ${entry.party}`;

  // T-3
  await Notifications.scheduleNotificationAsync({
    content: { title: '⏰ Nhắc nợ', body: `${who} ${formatVND(entry.originalAmount)}, đến hạn sau 3 ngày` },
    trigger: { date: new Date(entry.dueDate - 3 * 86_400_000) },
  });
  // T-0
  await Notifications.scheduleNotificationAsync({
    content: { title: '📅 Đến hạn hôm nay', body: `${who} ${formatVND(entry.originalAmount)}` },
    trigger: { date: new Date(entry.dueDate) },
  });
}
```

Cancel notification khi settle hoặc update due date.

---

## 7. Luồng liên kết Transaction

```
settleDebt(id, linkToFinance = true)
  ├── debtStore: status → 'settled'
  ├── if linkToFinance:
  │   ├── type 'lend' → financeStore.addTransaction({ type: 'income', amount: totalOwed, categoryId: DEBT_REPAYMENT_CAT, note: `Thu nợ từ ${party}` })
  │   └── type 'borrow' → financeStore.addTransaction({ type: 'expense', amount: totalOwed, categoryId: DEBT_REPAYMENT_CAT, note: `Trả nợ ${party}` })
  └── debtStore: linkedTransactionId = newTxn.id
```

Cần thêm 2 system categories mặc định trong seed:
- `Thu nợ` (income, icon: `cash-plus`, color: teal)
- `Trả nợ` (expense, icon: `cash-minus`, color: orange)

---

## 8. Thứ tự implement

```
D1  debtStore.ts — types, SQLite schema, CRUD, selectors
D2  DebtLedgerSheet — list view + filter
D3  AddDebtSheet — create form
D4  DebtDetailSheet — detail + payments timeline
D5  DebtSummaryWidget — widget trên FinanceScreen
D6  Push notifications — schedule khi add/update/settle
D7  settleDebt + linkToFinance integration
```

---

## 9. Edge cases

- **Trả dư** (paidAmount > originalAmount): trường hợp lãi làm tổng lớn hơn — UI show "Đã trả đủ" thay vì âm.
- **Partial settle**: cho phép mark settled mà không cần trả đủ 100% (xoá/tha nợ).
- **Xoá entry có payments**: cascade delete payments, cancel scheduled notifications.
- **Đổi due date**: cancel old notifications, schedule new ones.
- **Không có due date**: không schedule notification, không show badge hạn.
