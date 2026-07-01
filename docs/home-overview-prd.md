# PRD: Home Overview — Widget-based Dashboard

> **Product Requirement Document** · v1.0  
> **Mục tiêu**: Thiết kế lại màn hình Home (Today) thành một dashboard dạng widget modules trực quan, giúp người dùng nắm bắt nhanh toàn bộ trạng thái cuộc sống từ một màn hình duy nhất.

---

## 1. Vấn đề hiện tại

- Màn hình `TodayScreen` đang là một scroll view dài với các section xếp chồng: avatar/HUD, hero ring (LifeRing), habits, tasks, quick capture — tất cả đều ở cùng một cấp độ hierarchy, gây ra cảm giác "quá rối" (information overload).
- Các module quan trọng khác (Finance, Health/Gym, Goals, Notes, Journal) không xuất hiện trên Today, buộc người dùng phải chuyển tab hoặc mở SuperApp để kiểm tra.
- Không có khả năng tuỳ chỉnh: người dùng không thể chọn widget nào họ muốn thấy, không thể sắp xếp thứ tự ưu tiên.
- Thiếu glanceable summaries: phải vào từng module riêng để xem chi tiết.

## 2. Mục tiêu

"**One-glance Home** — biết mọi thứ chỉ trong 3 giây."

1. **Tổng quan cá nhân hoá**: Cho phép người dùng chọn `SuperAppItemKey` làm widget trên Home.
2. **Glanceable summaries**: Mỗi widget hiển thị tóm tắt cấp cao nhất (ví dụ: "3/5 habits done", "Tiêu 12/20tr tháng này") kèm một nút/chạm để vào màn hình chi tiết.
3. **Giảm tải nhận thức**: Gom tất cả vào dạng widget card kích thước bằng nhau (grid 2 cột) thay vì section kiểu list dài.
4. **Consistent game UI**: Giữ nguyên ngôn ngữ thiết kế "Magic Academy" game hiện tại (colors, gradients, `GamePanel`, `AnimatedCard`, `base3D`).
5. **Scoring vẫn ở hero area**: Điểm số, level, streak vẫn hiển thị ở khu vực hero phía trên cùng.

## 3. Non-goals

- Không xoá/ sửa các màn hình module riêng (FinanceScreen, TasksScreen, v.v.).
- Không thay đổi cấu trúc tab bottom bar hay SuperAppSheet.
- Không thêm backend mới; vẫn dùng SQLite + Zustand hiện tại.
- Không thay đổi database schema nếu không cần thiết.
- Tối thiểu breaking changes cho code đang chạy.

## 4. Design concept

### 4.1 Layout tổng thể (ScrollView)

```
┌─────────────────────────────┐
│  [Avatar]  Greeting  [⚡🧪] │  ← HUD bar (giữ nguyên style)
│─────────────────────────────│
│         ◉ LIFE RING ◉      │  ← Hero area: ring, score, streak
│                            │
├──────────────┬──────────────┤
│  📋 Tasks    │  🔥 Habits   │  ← Widget Grid (2 cols)
│  3/5 done    │  2/4 done    │
│  [→ Tasks]   │  [→ Habits]  │
├──────────────┼──────────────┤
│  💰 Finance  │  🏋️ Health   │
│  Spent 12tr  │  Workout ✔   │
│  [→ Finance] │  [→ Health]  │
├──────────────┼──────────────┤
│  📓 Journal  │  🎯 Goals    │  ← Ẩn/hiện theo cấu hình
│  Today: ✔    │  3 active    │
│  [→ Journal] │  [→ Goals]   │
├──────────────┴──────────────┤
│  📥 Inbox: 5 items          │  ← Quick capture bar (full width)
│  [Type something...]        │
└─────────────────────────────┘
```

### 4.2 Thành phần UI

| Khu vực | Component | Ghi chú |
|----------|-----------|---------|
| **HUD bar** | `TodayHud` | Giữ nguyên: avatar, greeting, level badge, currency chips |
| **Hero area** | `TodayHero` | LifeRing + Score + StarRating + StreakIndicator |
| **Widget grid** | `WidgetGrid` | 2-column `FlatList`/`ScrollView`, mỗi item là `WidgetCard` |
| **Quick capture** | `QuickCapture` | Giữ nguyên, đặt dưới grid |

### 4.3 WidgetCard component

Mỗi widget là một `AnimatedCard` + `GamePanel` với cấu trúc:

```
┌──────────────────────┐
│  🔤 [Tên Widget]     │  ← headerLeft: Unicon3D + label
│──────────────────────│
│                      │
│   [Glance content]   │  ← Tuỳ theo module (text, progress bar, số liệu)
│                      │
│──────────────────────│
│  [→ Go to detail]    │  ← footer: PressableScale dẫn đến route
└──────────────────────┘
```

Các widget có sẵn (tương ứng với `SuperAppItemKey`):

| Key | Label | Glance content | Route | Domain palette |
|-----|-------|---------------|-------|----------------|
| `tasks` | Tasks | `doneCount/totalCount` + 1-2 task đầu | `/tasks` | `domains.tasks` |
| `habits` | Habits | `doneToday/total` + streak | `/habits` | `domains.habits` |
| `health` | Health | Workout active? + workout count today | `/health` | `domains.health` |
| `finance` | Finance | Spent this month / budget + income | `/finance` | `domains.finance` |
| `inbox` | Inbox | Open item count + latest item preview | `/inbox` | `domains.inbox` |
| `journal` | Journal | Today entry status + mood | `/journal` | `domains.journal` |
| `notes` | Notes | Recent note count + last updated time | `/notes` | `domains.notes` |
| `goals` | Goals | Active goal count + progress | `/goals` | `domains.goals` |

## 5. Tính năng chi tiết

### 5.1 Widget selection (tuỳ chỉnh)

- **Nguồn dữ liệu**: Dùng lại `useSettingsStore.pinnedItems` — danh sách `SuperAppItemKey[]` đã có sẵn.
- **Cơ chế**: Home đọc `pinnedItems` và render widget tương ứng theo thứ tự đó.
- **Hành vi mặc định**: `['tasks', 'habits', 'finance', 'health', 'journal', 'inbox']`.
- **Cách người dùng thay đổi**: Vào More → Super App settings (đã có) để bật/tắt module. Nếu modul được pin, nó xuất hiện trên Home; nếu unpin, nó ẩn khỏi grid.
- **Giới hạn**: Grid tối đa 8 widget (4 hàng × 2 cột). Nếu pinned > 8, chỉ lấy 8 cái đầu.

### 5.2 Scroll position memory

- **Hành vi**: Khi người dùng navigate sang tab khác rồi quay lại Home, scroll position được giữ nguyên.
- **Implementation**: Dùng `useRef` lưu `scrollOffset` hoặc dùng `ScrollView#onScroll` với `useState`.

### 5.3 Pull-to-refresh

- **Hành vi**: Kéo xuống để refresh tất cả store (gọi lại `init()` mỗi store).
- **Implementation**: Dùng `RefreshControl` trên `ScrollView`.

### 5.4 Widget data flow

Mỗi widget sử dụng Zustand store của module tương ứng:

| Widget | Store | Selector |
|--------|-------|----------|
| Tasks | `useTasksStore` | `s.tasks.filter(t => sectionOf(t) === 'today')`, `s.tasks.length` |
| Habits | `useHabitsStore` | `s.doneTodayCount()`, `s.views()` |
| Finance | `useFinanceStore` | `s.getOverview()` (spent, income, budget) |
| Health | `useGymStore` | `s.isWorkoutActive`, `s.history` |
| Inbox | `useInboxStore` | `s.openCount()`, `s.items` |
| Journal | `useJournalStore` | `s.entryFor(todayKey())` |
| Notes | `useNoteStore` | `s.notes.length`, `s.notes` |
| Goals | `useGoalStore` | `s.goals.filter(g => g.status === 'active')` |

### 5.5 Widget content details

#### 5.5.1 Tasks Widget
- Hiển thị: `doneCount/totalCount` (ví dụ "3/5")
- Progress bar (dùng `StarRating` hoặc custom `ProgressBar`)
- Danh sách tối đa 2 task đầu tiên chưa hoàn thành (dùng `TaskRow` component)
- Footer: `→ Go to Tasks`

#### 5.5.2 Habits Widget
- Hiển thị: `doneToday/total` (ví dụ "2/4")
- Hàng ngang tối đa 4 `HabitPill` hoặc mini dot indicators
- Streak: dùng `StreakIndicator`
- Footer: `→ Go to Habits`

#### 5.5.3 Finance Widget
- Hiển thị: spent this month / budget (ví dụ "12.5tr / 20tr")
- Progress bar % budget used (màu xanh nếu < 80%, vàng nếu 80-100%, đỏ nếu > 100%)
- Income nếu có
- Footer: `→ Go to Finance`

#### 5.5.4 Health Widget
- Hiển thị: workout active? (nếu active: "🏋️ Workout in progress")
- Hôm nay đã tập? (số lượng exercise đã log)
- Footer: `→ Go to Health`

#### 5.5.5 Inbox Widget
- Hiển thị: open item count + preview text của item mới nhất
- Nếu empty: "All clear ✨"
- Footer: `→ Open Inbox`

#### 5.5.6 Journal Widget
- Hiển thị: hôm nay đã viết journal chưa? (check mark / X)
- Nếu có: mood emoji + preview text ngắn
- Footer: `→ Go to Journal`

#### 5.5.7 Notes Widget
- Hiển thị: total note count + note mới nhất updatedAt
- Footer: `→ Go to Notes`

#### 5.5.8 Goals Widget
- Hiển thị: active goal count + milestone progress
- Footer: `→ Go to Goals`

### 5.6 Hero area chi tiết

Khu vực hero giữ nguyên concept hiện tại nhưng tinh gọn hơn:

```
┌──────────────────────────────────────┐
│          ◉  (LifeRing)               │
│                                      │
│   ⭐ Score: 78/100                   │
│   🔥 Streak: 5 days                  │
│   🏆 Level: 4                        │
└──────────────────────────────────────┘
```

- **Score**: Giữ nguyên công thức (50% tasks + 40% habits + 10% journal).
- **LifeRing**: Component `LifeRing` hiện tại.
- **StarRating**: 3 sao dựa trên score.
- **StreakIndicator**: Streak hiện tại.

### 5.7 Quick capture

Giữ nguyên component `QuickCapture` hiện tại, đặt dưới widget grid.

## 6. File structure changes

```
src/features/today/
├── TodayScreen.tsx          ← Refactor: layout mới
├── components/
│   ├── LifeRing.tsx         ← Giữ nguyên
│   ├── TaskRow.tsx          ← Giữ nguyên
│   ├── QuickCapture.tsx     ← Giữ nguyên
│   ├── HabitPill.tsx        ← Giữ nguyên
│   ├── StreakIndicator.tsx  ← Giữ nguyên
│   ├── TodayHud.tsx         ← Tách từ TodayScreen
│   ├── TodayHero.tsx        ← Tách từ TodayScreen
│   ├── WidgetGrid.tsx       ← Mới: grid container
│   ├── WidgetCard.tsx       ← Mới: generic widget card
│   └── widgets/             ← Mới: mỗi widget 1 file
│       ├── TasksWidget.tsx
│       ├── HabitsWidget.tsx
│       ├── FinanceWidget.tsx
│       ├── HealthWidget.tsx
│       ├── InboxWidget.tsx
│       ├── JournalWidget.tsx
│       ├── NotesWidget.tsx
│       └── GoalsWidget.tsx
```

## 7. Data flow & state management

```
SettingsStore.pinnedItems
        │
        ▼
WidgetGrid reads pinnedItems
        │
        ▼
forEach(key => render <WidgetCard key={key} />)
        │
        ▼
WidgetCard -> creates the corresponding <XxxWidget />
        │
        ▼
XxxWidget reads its module store (useTasksStore, useHabitsStore, ...)
```

Không cần store mới. Mỗi widget là pure component nhận dữ liệu từ store tương ứng.

## 8. Acceptance criteria

| # | Tiêu chí | Ghi chú kiểm tra |
|---|----------|-----------------|
| 1 | Home hiển thị đúng grid 2 cột với các widget được pin trong Settings | 
| 2 | Mỗi widget hiển thị glance summary chính xác từ store |
| 3 | Nhấn vào widget navigate đúng route |
| 4 | Unpin module trong More → Super App → widget biến mất khỏi Home |
| 5 | Hero area hiển thị đúng score, level, streak, life ring |
| 6 | Pull-to-refresh hoạt động |
| 7 | Scroll position được nhớ khi chuyển tab quay lại |
| 8 | Quick capture vẫn hoạt động bình thường |
| 9 | `npm run typecheck` pass |
| 10 | Không break màn hình module riêng |

## 9. Migration plan

### Phase 1 (core)
1. Tách `TodayHud` và `TodayHero` từ `TodayScreen` thành components riêng
2. Tạo `WidgetCard` component base
3. Tạo `WidgetGrid` với logic đọc `pinnedItems` từ `useSettingsStore`
4. Viết `TasksWidget` và `HabitsWidget` (2 cái đã có sẵn dữ liệu trên Today hiện tại)

### Phase 2 (widgets còn lại)
5. Viết `FinanceWidget` — dùng `useFinanceStore.getOverview()`
6. Viết `HealthWidget` — dùng `useGymStore`
7. Viết `InboxWidget` — dùng `useInboxStore`
8. Viết `JournalWidget` — dùng `useJournalStore`
9. Viết `NotesWidget` — dùng `useNoteStore`
10. Viết `GoalsWidget` — dùng `useGoalStore`

### Phase 3 (polish)
11. Thêm pull-to-refresh
12. Thêm scroll position memory
13. Kiểm tra performance (re-render)
14. Typecheck + smoke test

## 10. Risks & mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Re-render toàn bộ grid khi một store thay đổi | Cao | Dùng `useShallow` selector + `React.memo` cho mỗi widget |
| Finance store heavy (nhiều transactions) | Trung bình | Widget chỉ gọi `getOverview()` — là derived value nhẹ |
| Settings store chưa ready khi Home render | Thấp | WidgetGrid kiểm tra `settingsStore.ready` trước khi render |
| pinnedItems thay đổi trong session | Thấp | Settings store persist real-time; grid re-render tự nhiên |
| Gym store không persist (chỉ in-memory) | Trung bình | Health widget check `ready` state; fallback nếu chưa init |

## 11. Design references

- **Design system**: `.claude/skills/design-system/SKILL.md`
- **Theme tokens**: `src/theme/colors.ts`
- **Existing components**: `src/components/game/GamePanel.tsx`, `src/components/motion/AnimatedCard.tsx`
- **Current screen**: `src/features/today/TodayScreen.tsx`
- **Settings / pinning**: `src/store/settingsStore.ts`
- **SuperAppSheet**: `src/components/SuperAppSheet.tsx`
