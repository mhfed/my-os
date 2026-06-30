# Personal OS — Tiến độ

Đối chiếu theo `PersonalOS_PRD.docx`. Cập nhật: 2026-06-30.

**Trạng thái build:** `tsc --noEmit` sạch · `expo export ios` bundle OK (~4.4 MB) ·
chưa chạy thử trên iPhone thật.

Chú thích: ✅ xong · ⚠️ làm một phần · ❌ chưa làm

---

## Nền tảng (hạ tầng dùng chung) — ✅

- App shell: Expo SDK 54 + Expo Router, TypeScript strict, dark theme.
- Navigation: 5 tab (Today / Tasks / Health / Finance / More); Journal, Habits,
  Inbox là route ẩn vào từ More; Health = màn Workout immersive (ẩn tab bar).
- Theme tokens (colors/typography), icon map Tabler→MaterialCommunityIcons.
- **Persistence SQLite** dùng chung: schema + helper (`runSql`/`allRows`/
  `firstRow`/`tableIsEmpty`), seed lần đầu, init mọi store lúc khởi động.
- **Multi-user ready**: mọi bảng có cột `userId` (nullable) — chưa có auth.
- 6 màn UI implement 1:1 theo Claude Design (`design/`).

---

## Phase 1 — Foundation

### 2.1 Quick Capture (Inbox)

| Tính năng             | Ưu tiên | Trạng thái                                                            |
| --------------------- | ------- | --------------------------------------------------------------------- |
| Global Capture Button | P0      | ✅ Nút nổi góc dưới bên phải trên tất cả các tab                      |
| Inbox view            | P0      | ✅ Màn Inbox (vào từ More + avatar Today), đếm số item                |
| Triage từ Inbox       | P0      | ✅ Convert → Task / Journal / Habit (nút; chưa swipe; chưa Note/Goal) |
| Voice capture         | P1      | ❌                                                                    |

### 2.2 Task Manager

| Tính năng       | Ưu tiên | Trạng thái                                                                            |
| --------------- | ------- | ------------------------------------------------------------------------------------- |
| Tạo task nhanh  | P0      | ✅ Form Add Task (title, priority, context, due)                                      |
| Today view      | P0      | ✅ (mục Today ở Tasks + tổng hợp ở Today)                                             |
| Subtasks        | P0      | ✅ Lưu array vào SQlite table `task_subtasks`, checklist trong form thêm và task card |
| Recurring tasks | P1      | ❌                                                                                    |
| Projects        | P1      | ❌ (có filter pill nhưng chưa có project thật)                                        |
| Widget iOS      | P2      | ❌                                                                                    |

### 2.3 Daily Journal

| Tính năng      | Ưu tiên | Trạng thái                                                     |
| -------------- | ------- | -------------------------------------------------------------- |
| Daily entry    | P0      | ✅ 1 entry/ngày, lưu SQLite (upsert)                           |
| Mood check-in  | P0      | ✅                                                             |
| Time Capsule   | P0      | ⚠️ Card UI tĩnh — chưa lookup entry cũ thật, chưa notification |
| Search         | P1      | ❌                                                             |
| Streak         | P1      | ✅ tính từ dữ liệu thật                                        |
| Photo đính kèm | P2      | ❌                                                             |

### 2.4 Habit Tracker

| Tính năng                          | Trạng thái                                              |
| ---------------------------------- | ------------------------------------------------------- |
| Theo dõi hàng ngày + streak        | ✅ `habit_logs` theo ngày; streak/%/grid tuần tính thật |
| Toggle hoàn thành (today + ô lưới) | ✅                                                      |
| Thêm habit                         | ✅ có form chọn icon/color trên màn Habits (+ triage)   |
| Kết nối Journal mood / Health      | ❌                                                      |

---

## Phase 2 — Health & Finance

### 3.1 Health (Gym + Run)

| Tính năng                                        | Trạng thái                                               |
| ------------------------------------------------ | -------------------------------------------------------- |
| Màn Workout (timer chạy, sets, PR badge, finish) | ✅ UI và state machine                                   |
| Lưu workout / lịch sử tập                        | ✅ Build `HealthDashboard` và persist vào SQLite         |
| Run / cardio tracker                             | ⚠️ Mock UI ở `HealthDashboard` (Connect to Strava later) |

### 3.2 Finance Tracker

| Tính năng                   | Ưu tiên | Trạng thái                                                     |
| --------------------------- | ------- | -------------------------------------------------------------- |
| Ghi giao dịch nhanh         | P0      | ✅ Form Add Transaction (persist SQLite)                       |
| Categories tùy chỉnh        | P0      | ⚠️ Tạo mới được; chưa sửa/xóa                                  |
| Ngân sách (Budget)          | P0      | ✅ Tính & hiển thị % budget + `setBudget` UI Modal ở Breakdown |
| Tổng quan tháng + breakdown | P0      | ✅ (overview + donut theo category)                            |
| Recurring transaction       | P1      | ✅ Modal quản lý và thiết lập                                  |
| Export CSV                  | P1      | ❌                                                             |
| Biểu đồ xu hướng 6–12 tháng | P1      | ❌ (mới có donut theo category, chưa có trend theo tháng)      |

---

## Phase 3 — Knowledge & Goals

| Module               | Trạng thái                                |
| -------------------- | ----------------------------------------- |
| Notes / Second Brain | ❌ (placeholder "coming soon" trong More) |
| Goals                | ❌ (placeholder)                          |

---

## Xuyên suốt / triết lý PRD

| Mục tiêu                               | Trạng thái                                                 |
| -------------------------------------- | ---------------------------------------------------------- |
| Capture nhanh ≤3 giây                  | ⚠️ Có capture ở Today; chưa nút nổi toàn cục + chưa voice  |
| Today là trung tâm, mọi module kết nối | ✅ Today tổng hợp Task+Habit+Journal, tự tính score        |
| Data export bất cứ lúc nào             | ❌ (chỉ có schema; chưa có export thật)                    |
| Multi-user (về sau)                    | ⚠️ Data model sẵn sàng (`userId`); chưa có auth/multi-user |

---

## Gợi ý việc tiếp theo

1. **Gym persistence** — lưu workout đã xong + màn lịch sử tập; Run tracker.
2. **Finance hoàn thiện** — UI đặt budget + cảnh báo, recurring UI, export CSV, biểu đồ xu hướng tháng.
3. **Quick Capture đầy đủ** — nút capture nổi toàn cục + voice; swipe để triage.
4. **Test trên iPhone + polish** — chạy thật, fix runtime, haptics, animation.
5. **Phase 3** — Notes/Second Brain, Goals.
