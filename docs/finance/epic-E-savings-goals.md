# Epic E — Mục tiêu Tiết kiệm (Savings Goals in Finance)

> Scope: Theo dõi các mục tiêu tích luỹ tiền trong Finance tab — tách biệt hoàn toàn với Goals tab (task/habit goals). Finance Goals = accumulation targets với deadline và contribution timeline.

**Status:** Planned · chưa implement  
**Phụ thuộc:** financeStore, epic-D (optional — có thể implement độc lập)

---

## 1. Tại sao không dùng Goals tab hiện tại?

Goals tab hiện tại theo dõi **habit/task goals** (tiến độ theo %). Savings Goals là **tích luỹ tiền** — có unit rõ ràng (VND), target cụ thể, contribution history. Domain khác nhau nên tách riêng trong Finance để:
- Hiển thị cùng ngữ cảnh tài chính (tiết kiệm bao nhiêu, còn thiếu bao nhiêu)
- Cho phép link contribution với transaction income
- Giữ Goals tab đơn giản (không bị finance làm phức tạp)

---

## 2. Data Model

### `SavingsGoal`

```typescript
interface SavingsGoal {
  id: string;
  userId?: string;
  name: string;               // "Mua xe", "Du lịch Nhật", "Quỹ khẩn cấp"
  targetAmount: number;       // số tiền mục tiêu (VND)
  currentAmount: number;      // tổng đã tích luỹ (= sum of contributions)
  deadline?: number;          // epoch ms (optional)
  icon: string;               // MCI icon name
  color: string;              // hex
  note?: string;
  status: 'active' | 'achieved' | 'cancelled';
  createdAt: number;
}

interface SavingsContribution {
  id: string;
  goalId: string;
  amount: number;             // VND đóng góp lần này
  date: number;               // epoch ms
  note?: string;
  linkedTransactionId?: string; // nếu gắn với transaction
  createdAt: number;
}
```

**Tại sao `currentAmount` lưu cả trong `SavingsGoal` lẫn tính từ contributions?**  
`currentAmount` trong entity là cache để sort/filter nhanh mà không cần join. Khi add contribution, update cả hai (contribution record + goal.currentAmount). Khi cần audit thì dùng contributions.

---

## 3. SQLite Schema

```sql
CREATE TABLE IF NOT EXISTS savings_goals (
  id             TEXT PRIMARY KEY,
  user_id        TEXT,
  name           TEXT NOT NULL,
  target_amount  INTEGER NOT NULL,
  current_amount INTEGER NOT NULL DEFAULT 0,
  deadline       INTEGER,
  icon           TEXT NOT NULL,
  color          TEXT NOT NULL,
  note           TEXT,
  status         TEXT NOT NULL DEFAULT 'active',
  created_at     INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS savings_contributions (
  id                   TEXT PRIMARY KEY,
  goal_id              TEXT NOT NULL REFERENCES savings_goals(id) ON DELETE CASCADE,
  amount               INTEGER NOT NULL,
  date                 INTEGER NOT NULL,
  note                 TEXT,
  linked_transaction_id TEXT,
  created_at           INTEGER NOT NULL
);
```

---

## 4. Store Interface (`savingsStore.ts`)

```typescript
interface SavingsState {
  goals: SavingsGoal[];
  contributions: SavingsContribution[];
  ready: boolean;

  init: () => Promise<void>;

  addGoal: (input: Omit<SavingsGoal, 'id' | 'currentAmount' | 'status' | 'createdAt'>) => Promise<void>;
  updateGoal: (id: string, patch: Partial<SavingsGoal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;

  addContribution: (goalId: string, amount: number, date: number, note?: string, linkTxn?: boolean) => Promise<void>;
  // linkTxn=true → tạo expense transaction "Tiết kiệm [goal name]"

  markAchieved: (id: string) => Promise<void>;

  // selectors
  getGoalView: (id: string) => SavingsGoalView | null;
  getActiveGoals: () => SavingsGoalView[];
}

interface SavingsGoalView extends SavingsGoal {
  contributions: SavingsContribution[];
  progressPct: number;           // 0–1
  remaining: number;             // targetAmount - currentAmount
  monthlyNeeded: number | null;  // nếu có deadline: remaining / monthsLeft
  isAchieved: boolean;
  daysUntilDeadline: number | null;
  isOverdue: boolean;            // deadline qua mà chưa đạt
}
```

---

## 5. UI Components

### 5.1 Vị trí trong Finance tab

Thêm tab thứ 3 hoặc section dưới Sổ nợ widget:

**Option A** — Section trong scrollview FinanceScreen (đề xuất):
```
[SpendingOverview]
[StatCards]
[SavingsGoalsSection]   ← tóm tắt ngang, tap → full sheet
[DebtSummaryWidget]
[MonthlyTrendChart]
[CategoryBreakdown]
[RecentTransactions]
```

**Option B** — Tab riêng trong Finance (như Sổ nợ):
```
[Overview] [Tiết kiệm] [Sổ nợ]
```

→ **Recommend Option A** vì Savings Goals thường ít khoản hơn, không cần full tab. Nếu user có > 5 goals thì chuyển sang Option B.

### 5.2 SavingsGoalsSection (overview card)

```
┌──────────────────────────────────────────────┐
│  Mục tiêu tiết kiệm                  Xem tất cả→│
│                                              │
│  🚗 Mua xe        ████████░░  80%  ₫40M/₫50M │
│  ✈ Du lịch Nhật  ████░░░░░░  40%  ₫8M/₫20M  │
│  🏠 Quỹ khẩn cấp ██░░░░░░░░  20%  ₫6M/₫30M  │
│                                              │
│  [+ Thêm mục tiêu]                           │
└──────────────────────────────────────────────┘
```

Progress bar màu theo `goal.color`. Nếu deadline gần (< 30 ngày) hiện label "Còn X ngày".

### 5.3 SavingsGoalSheet (full-screen modal)

Hiện danh sách đầy đủ với:
- Sort: active → achieved → cancelled
- Mỗi card: tên, progress ring lớn hơn, ₫current/₫target, deadline, monthly needed
- FAB [+] → AddGoalSheet

### 5.4 AddGoalSheet

Fields:
- Goal name
- Target amount (number pad)
- Deadline (optional, date picker)
- Icon picker (từ bộ MCI icons có sẵn)
- Color picker (palette)
- Note

### 5.5 GoalDetailSheet

```
[Icon] Mua xe  ●─────────────── 80%

₫40,000,000 / ₫50,000,000
Còn thiếu: ₫10,000,000
Deadline: 31/12/2026 (còn 183 ngày)
Cần tiết kiệm: ~₫1,667,000/tháng

Timeline contributions:
  01/6  +₫5,000,000  "lương tháng 6"
  15/5  +₫3,000,000
  01/5  +₫5,000,000

[+ Đóng góp thêm]   [Đạt mục tiêu]   [Sửa]   [Xoá]
```

### 5.6 AddContributionSheet

- Amount (number pad)
- Date (default hôm nay)
- Note
- Toggle: "Ghi vào chi tiêu" (tạo expense transaction "Tiết kiệm Mua xe")

---

## 6. Link với Finance Transaction

Khi đóng góp vào savings goal và toggle "Ghi vào chi tiêu":

```typescript
addContribution(goalId, amount, date, note, linkTxn = true) {
  // 1. Tạo SavingsContribution record
  // 2. Update goal.currentAmount
  // 3. if linkTxn:
  //    financeStore.addTransaction({
  //      type: 'expense',
  //      amount,
  //      categoryId: SAVINGS_CAT_ID,  // "Tiết kiệm" category
  //      note: `Tiết kiệm: ${goal.name}`,
  //      date
  //    })
  //    contribution.linkedTransactionId = newTxn.id
}
```

Cần thêm system category: `Tiết kiệm` (expense, icon: `piggy-bank`, color: purple)

---

## 7. Monthly Needed Calculation

```typescript
function monthlyNeeded(goal: SavingsGoalView): number | null {
  if (!goal.deadline) return null;
  const now = Date.now();
  if (now >= goal.deadline) return null; // quá hạn
  const monthsLeft = (goal.deadline - now) / (30 * 24 * 3600 * 1000);
  if (monthsLeft < 0.5) return goal.remaining; // < 2 tuần, show total remaining
  return Math.ceil(goal.remaining / monthsLeft);
}
```

---

## 8. Thứ tự implement

```
E1  savingsStore.ts — types, SQLite, CRUD, selectors
E2  SavingsGoalsSection — overview section trong FinanceScreen
E3  AddGoalSheet — create form
E4  GoalDetailSheet — detail + contribution timeline
E5  AddContributionSheet — add contribution + link txn
E6  SavingsGoalSheet — full list modal
```

---

## 9. Edge cases

- **Đóng góp vượt target**: tự động check `currentAmount >= targetAmount` → prompt "Đã đạt mục tiêu! Đánh dấu hoàn thành?".
- **Xoá goal có contributions**: cascade delete, huỷ linked transactions không xoá (chỉ unlink `linkedTransactionId`).
- **No deadline**: không hiện "monthly needed", không hiện days countdown.
- **Multiple goals cùng màu**: OK, màu chỉ dùng để distinguish trong list.
