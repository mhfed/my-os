# Personal OS - Project Memory

## Tóm tắt dự án & Triết lý

- Personal OS là app cá nhân all-in-one cho iOS: quản lý công việc, sức khoẻ, tài chính, kiến thức và thói quen.
- Điểm khác biệt: Các module liên kết dữ liệu với nhau tạo thành một dashboard bao quát tại màn hình `Today`.
- Triết lý quan trọng: Capture trong 3 giây, offline-first. Tất cả data lưu local trước, phải cho phép export bất cứ lúc nào.

## Tech Stack & Kiến trúc

- **Framework:** React Native + Expo (SDK 54), Expo Router (tab-based navigation).
- **Ngôn ngữ:** TypeScript, code thuần tuý strict.
- **UI & Style:** Dark theme mặc định. Hệ thống component dùng chung nằm rải rác thư mục, icon Tabler map sang MaterialCommunityIcons.
- **State Management:** Zustand (dùng rải rác tại `src/store/*`).
- **Database:** SQLite local qua thư viện `expo-sqlite`.
- **Kiến trúc dữ liệu:** Data schema (src/db/schema.ts) đều hỗ trợ `userId` nullable, sẵn sàng mở rộng multi-user sau này chứ hiện chưa có Authentication. Đã có script seed data.
- **Tiến độ tham chiếu:** Mọi thay đổi và roadmap chi tiết nằm ở `PROGRESS.md`.

## Trạng thái hiện tại

Theo PRD và PROGRESS.md thì app đã pass Phase 1 & một phần Phase 2 dạng "dùng được căn bản":

- ✅ **Đã hoàn thành**: Nền tảng router/SQLite/Zustand. Dashboard `Today`. Chức năng cơ bản của Task (Tạo/List/Due), Habit (Grid/Streak), Journal (Mood/Entry), Finance (Add transaction/Overview). Capture Inbox ở màn Today. Xử lý bundle type/error sạch.
- ⚠️ **Đang làm dở**: Finance (Budget, Recurring transaction thiếu UI; Categories chưa cho sửa/xóa); Quick Capture chưa toàn cục; Time Capsule tĩnh; Triage từ inbox bằng nút, chưa có swipe. Chưa có form thêm habit trong màn Habits.
- ❌ **Chưa bắt đầu**: Persistent data cho Gym Tracker (đang dùng data tạm); Running tracker; Báo cáo phân tích nâng cao (Trend, Dashboard phase 4); Notifications; Task phức tạp (Projects, Subtasks, Recurring); Phase 3 chuyên sâu (Notes, Goals); Data Export (CSV/JSON); Authentication.
