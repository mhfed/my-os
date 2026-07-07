# Lumina OS — Design Specification (Professional & Minimalist)

Tài liệu này định nghĩa triết lý thiết kế, bảng màu, typography và các mẫu cấu trúc giao diện (patterns) cho toàn bộ ứng dụng **Lumina OS**. Mọi AI agent hoặc developer khi đụng vào giao diện phải đọc file này trước và tuân thủ nghiêm ngặt.

---

## 1. Triết Lý Thiết Kế (Design Philosophy)

Mục tiêu cốt lõi là **loại bỏ sự vụn vặt từ các thẻ hộp riêng lẻ** để hướng tới dòng chảy thông tin tự nhiên, scannability cao, và trải nghiệm tối giản sang trọng.

- **Answer-first:** Đưa chỉ số quan trọng nhất lên vị trí đắc địa nhất, font lớn, không bị đóng hộp.
- **Whitespace làm chủ đạo:** Khoảng trống phân tách thông tin thay vì viền dày hay bóng đổ.
- **Phẳng hoàn toàn (Absolute Flatness):** Không sử dụng hiệu ứng nổi khối 3D giả lập, bóng đổ 3D, hay clay-render icon.
- **Gom nhóm logic:** Thông tin liên quan được đặt cùng nhau trong một bảng phẳng thay vì nhiều thẻ nhỏ lẻ.
- **Đường kẻ mảnh & Tinh tế:** Viền ngăn cách dùng nét `1px` với độ mờ cao (`rgba(255,255,255,0.03)`–`0.05`).

---

## 2. Design Tokens — Nguồn Sự Thật Duy Nhất

Mọi giá trị màu sắc, spacing, radius phải lấy từ token, không được hardcode số tuỳ tiện.

### 2.1 Colors — `@/theme/colors`

```typescript
import { colors, radius, gradients, domains } from '@/theme/colors';
```

| Token | Giá trị | Dùng cho |
|---|---|---|
| `colors.screenBg` | `#090A0F` | Nền màn hình toàn bộ app |
| `colors.text` | `#F1F5F9` | Text chính |
| `colors.muted` | `#94A3B8` | Text phụ, nhãn, placeholder |
| `colors.tabInactive` | `#475569` | Icon/text không được chọn |
| `colors.track` | `rgba(255,255,255,0.06)` | Nền thanh tiến trình |
| `colors.gold` | `#FBBF24` | Tài chính, warning |
| `colors.teal` | `#06B6D4` | Thu nhập, action chính |
| `colors.blue` | `#3B82F6` | Tasks, productivity |
| `colors.pink` | `#EC4899` | Health, activity |
| `colors.green` | `#10B981` | Success, savings |
| `colors.red` | `#EF4444` | Chi tiêu, danger |
| `colors.purple` | `#8B5CF6` | Goals, journal |

### 2.2 Spacing — `@/theme/spacing`

```typescript
import { spacing } from '@/theme/spacing';
```

| Token | Giá trị | Dùng cho |
|---|---|---|
| `spacing.unit` | 4px | Điều chỉnh tinh |
| `spacing.xs` | 8px | Gap nhỏ giữa item |
| `spacing.sm` | 12px | Gap card, margin nhỏ |
| `spacing.md` | 16px | Padding ngang màn hình, card padding mặc định |
| `spacing.lg` | 20px | Padding screen rộng rãi |
| `spacing.xl` | 24px | Card padding generous |
| `spacing.tabClear` | 110px | paddingBottom để nội dung không bị tab bar che |

### 2.3 Border Radius — `@/theme/colors`

```typescript
import { radius } from '@/theme/colors';
```

| Token | Giá trị | Dùng cho |
|---|---|---|
| `radius.sm` | 8px | Icon wrap nhỏ, checkbox |
| `radius.md` | 16px | Sub-container trong card, input |
| `radius.lg` | 24px | **Card chính (primary cards)** ← tiêu chuẩn |
| `radius.xl` | 32px | Chỉ dùng khi cần pill-card đặc biệt |
| `radius.pill` | 9999 | Badge, progress bar |

> ⚠️ **Quy tắc cứng:** Card chính ở các màn hình Home / Feature Screen dùng `radius.lg = 24px`, KHÔNG dùng `radius.xl = 32px` vì quá tròn và làm mất tính trang trọng.

---

## 3. Screen Background — Áp dụng Đồng Nhất

**Tất cả màn hình** trong app phải có cấu trúc nền như sau:

```tsx
<View style={styles.screen}>
  <LinearGradient
    colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0)']}
    start={{ x: 0.5, y: 0 }}
    end={{ x: 0.5, y: 1 }}
    style={styles.screenGlow}
    pointerEvents='none'
  />
  {/* content */}
</View>

// styles:
screen: {
  flex: 1,
  backgroundColor: colors.screenBg,  // #090A0F
},
screenGlow: {
  ...StyleSheet.absoluteFillObject,
},
```

> ✅ Đây là cấu hình chuẩn được thiết lập từ `FinanceScreen.tsx` và áp dụng sang tất cả màn hình khác.

---

## 4. Card Anatomy — Giải Phẫu Thẻ Nội Dung

### 4.1 Primary Card (Card Chính)

Dùng cho các phần tổng quan lớn trên màn hình (Finance, Productivity, Health dashboard cards).

```tsx
// StyleSheet
card: {
  backgroundColor: 'rgba(255, 255, 255, 0.02)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: radius.lg,   // 24px — KHÔNG dùng radius.xl
  padding: 14,
  marginBottom: 10,
},
```

- **Nền:** `rgba(255,255,255,0.02)` — đủ tạo depth mà không gây nổi.
- **Viền:** `rgba(255,255,255,0.05)` — mỏng và tinh tế.
- **Padding:** `14px` — cân đối, không quá rộng không quá hẹp.
- **Khoảng cách giữa cards:** `marginBottom: 10px`.

### 4.2 Sub-container / Spark Chart Container

Dùng cho khung nhỏ nằm bên trong card (ví dụ: khung chứa biểu đồ chart bên phải của split layout).

```tsx
subContainer: {
  backgroundColor: 'rgba(255, 255, 255, 0.01)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.02)',
  borderRadius: radius.md,   // 16px
  paddingVertical: 8,
  paddingHorizontal: 6,
},
```

### 4.3 Card Header

Mỗi card có header gồm `icon + title` bên trái, action (hoặc badge + chevron) bên phải.

```tsx
// JSX
<View style={styles.header}>
  <View style={styles.headerTitleWrap}>
    <View style={[styles.iconWrap, { backgroundColor: palette.accent + '12' }]}>
      <Icon name={mod.icon} size={16} color={palette.accent} />
    </View>
    <Text style={styles.headerTitle}>Tên phần</Text>
  </View>
  <Icon name='chevron-right' size={14} color={colors.tabInactive} />
</View>

// styles
header: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 8,
},
headerTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
iconWrap: {
  width: 26, height: 26,
  borderRadius: radius.sm,
  alignItems: 'center', justifyContent: 'center',
},
headerTitle: { fontFamily: fonts.displayBold, fontSize: 14, color: colors.text },
```

- Icon wrap background: `palette.accent + '12'` (8% opacity) — màu nhạt, không chói.
- Chevron: `colors.tabInactive` — không thu hút sự chú ý, chỉ hint navigable.

---

## 5. Split-Column Layout (Dashboard Cards)

Các Dashboard card trên màn hình Home áp dụng **bố cục chia đôi cột** (split layout) thay vì xếp chồng dọc. Đây là pattern đặc trưng của app này.

```
┌─────────────────────────────────────────────┐
│ [Icon] Tiêu đề card          badge [>]       │
│─────────────────────────────────────────────│
│  Cột Trái (flex: 1.25)  │  Cột Phải (flex:1) │
│  - Chỉ số chính         │  ┌───────────────┐ │
│  - Progress bar         │  │  Spark Chart  │ │
│  - Summary rows         │  │  (SVG nhỏ)   │ │
│                         │  └───────────────┘ │
└─────────────────────────────────────────────┘
```

```tsx
splitContent: {
  flexDirection: 'row',
  gap: 16,
  alignItems: 'center',
},
leftCol: {
  flex: 1.25,
  gap: 10,
},
rightCol: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.01)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.02)',
  borderRadius: radius.md,
  paddingVertical: 8,
  paddingHorizontal: 6,
},
```

**Khi nào dùng split layout:**
- Khi card vừa có số liệu vừa có biểu đồ nhỏ (spark chart).
- Khi cần tránh chart bị dư khoảng trống trục X.
- Khi muốn nội dung phong phú mà không tốn chiều cao.

---

## 6. SVG Spark Charts

### 6.1 Quy tắc SVG trong React Native

> 🚨 **CRITICAL:** Trong React Native SVG, tất cả component tags phải viết HOA chữ đầu:
> - ✅ `<G>`, `<Rect>`, `<Path>`, `<Circle>`, `<Defs>`, `<LinearGradient>`, `<Stop>`
> - ❌ `<g>`, `<rect>`, `<path>` — Crash: `View config getter callback for component 'g' must be a function`

```tsx
import Svg, { Defs, G, LinearGradient, Rect, Stop } from 'react-native-svg';
```

### 6.2 Chart Height Tiêu Chuẩn

| Loại chart | chartHeight | Ghi chú |
|---|---|---|
| Bar chart đôi (income/spent) | `56px` | 2 cột song song mỗi tháng |
| Bar chart đơn (productivity) | `56px` | 1 cột mỗi ngày |
| Activity indicator (health) | `32px` | Chỉ hi/lo bars |

- **Không dùng chartHeight > 60px** trong dashboard card — quá cao làm tốn chiều cao thẻ.
- Bar tối thiểu: `Math.max(3, calculatedHeight)` — không để bar bằng 0 (không thấy được).

### 6.3 Bar Gradient Chuẩn

```tsx
// Income/Positive
<LinearGradient id='incGrad' x1='0' y1='0' x2='0' y2='1'>
  <Stop offset='0' stopColor={colors.teal} />
  <Stop offset='1' stopColor={colors.tealDeep} />
</LinearGradient>

// Expense/Negative
<LinearGradient id='expGrad' x1='0' y1='0' x2='0' y2='1'>
  <Stop offset='0' stopColor={colors.red} />
  <Stop offset='1' stopColor={colors.redDeep} />
</LinearGradient>

// Productivity
<LinearGradient id='prodGrad' x1='0' y1='0' x2='0' y2='1'>
  <Stop offset='0' stopColor={colors.blue} />
  <Stop offset='1' stopColor={colors.blueDeep} />
</LinearGradient>

// Health
<LinearGradient id='healthGrad' x1='0' y1='0' x2='0' y2='1'>
  <Stop offset='0' stopColor={colors.pink} />
  <Stop offset='1' stopColor={colors.pinkDeep} />
</LinearGradient>
```

---

## 7. Typography Rules

| Loại nội dung | Font | Size | Color |
|---|---|---|---|
| Số liệu chính (Net Worth, tiêu đề lớn) | `fonts.displayBold` | 20–28px | `colors.text` |
| Tiêu đề card | `fonts.displayBold` | 14px | `colors.text` |
| Nhãn section | `fonts.medium` | 11–12px | `colors.text` hoặc `colors.muted` |
| Số liệu phụ (compact, mono) | `fonts.monoSemibold` | 11–13px | Màu accent domain |
| Nhãn phụ / caption | `fonts.regular` | 8–10px | `colors.muted` |
| Nhãn chart trục X | `fonts.monoRegular` | 8px | `colors.muted` |

> **Quy tắc:** Không dùng fontSize < 8px. Không dùng font system default (phải import từ `@/theme/typography`).

---

## 8. Module Shortcuts (Navigation Grid)

4 phím tắt module đầu trang Home hiển thị theo phong cách **borderless flat launcher** (không có card bao quanh từng ô).

```tsx
// Cell — KHÔNG có background, border, borderRadius
cell: {
  flex: 1,
  paddingVertical: 6,
  paddingHorizontal: 4,
  alignItems: 'center',
  gap: 8,
},

// Icon wrap — có màu nền nhạt theo domain
iconWrap: {
  width: 44, height: 44,
  borderRadius: 14,
  alignItems: 'center', justifyContent: 'center',
  position: 'relative',    // để đặt badge absolute
},

// Badge số lượng — góc trên phải icon
badge: {
  position: 'absolute',
  top: -4, right: -4,
  minWidth: 16, height: 16,
  borderRadius: 8,
  alignItems: 'center', justifyContent: 'center',
  paddingHorizontal: 3,
  borderWidth: 1.5,
  borderColor: colors.screenBg,   // viền nền để badge "nổi" khỏi icon
},
```

**Nguyên tắc:**
- Badge chỉ xuất hiện khi count > 0.
- Màu badge khớp với `palette.accent` của domain.
- Text badge dùng `fonts.monoSemibold`, size 8px, màu `colors.white`.
- KHÔNG hiển thị text stat dưới icon — badge đã đủ thông tin.

---

## 9. Dividers & Separators

```tsx
// Horizontal divider — giữa các section trong card
divider: {
  height: 1,
  backgroundColor: 'rgba(255, 255, 255, 0.03)',
  marginVertical: 8,
},

// Vertical divider — giữa 2 cột số liệu
verticalDivider: {
  width: 1,
  height: '80%',
  backgroundColor: 'rgba(255, 255, 255, 0.03)',
  alignSelf: 'center',
},

// Row divider — giữa các hàng trong danh sách phẳng
rowDivider: {
  borderBottomWidth: 1,
  borderBottomColor: 'rgba(255, 255, 255, 0.02)',
},
```

---

## 10. Progress Bars (Micro Bars)

```tsx
progressTrack: {
  height: 4,
  borderRadius: radius.pill,
  backgroundColor: colors.track,
  overflow: 'hidden',
},
progressFill: {
  height: '100%',
  borderRadius: radius.pill,
  // dùng LinearGradient từ expo-linear-gradient
},
```

- Chiều cao cố định `4px` — không dùng value khác.
- Fill dùng gradient từ `gradients.*` trong theme.
- Gradient màu: `gradients.gem` (bình thường), `gradients.gold` (cảnh báo >80%), `gradients.red` (vượt ngưỡng >100%).

---

## 11. Interaction — PressableScale

Mọi element bấm được đều wrap bằng `PressableScale`, không dùng RN `Pressable` hay `TouchableOpacity` thuần.

```tsx
<PressableScale
  onPress={handler}
  scaleTo={0.98}   // Card lớn: 0.98 / Item nhỏ: 0.95–0.96
  haptic='light'
/>
```

---

## 12. Các Màn Hình Tham Chiếu (Reference Screens)

| Màn hình | File | Ghi chú |
|---|---|---|
| Home Dashboard | `src/features/today/TodayScreen.tsx` | Chuẩn gốc layout Home |
| Finance | `src/features/finance/FinanceScreen.tsx` | Chuẩn gốc screen glow, flat card |
| Dashboard Finance Card | `src/features/today/components/DashboardFinance.tsx` | Chuẩn split layout + spark chart |
| Dashboard Productivity Card | `src/features/today/components/DashboardProductivity.tsx` | Chuẩn split layout + task list |
| Dashboard Health Card | `src/features/today/components/DashboardHealth.tsx` | Chuẩn split layout + activity chart |
| Module Shortcuts | `src/features/today/components/ModuleShortcuts.tsx` | Chuẩn borderless launcher + badge |

---

## 13. Checklist Trước Khi Submit UI

- [ ] Screen có LinearGradient glow `rgba(255,255,255,0.2)` → `transparent` ở đỉnh?
- [ ] Card dùng `radius.lg` (24px) thay vì `radius.xl` (32px)?
- [ ] Padding card trong khoảng `12–16px`?
- [ ] Không có hardcode màu sắc ngoài theme token?
- [ ] SVG tags đều viết HOA (`<G>`, `<Rect>`, không phải `<g>`, `<rect>`)?
- [ ] Không có `TouchableOpacity` — thay bằng `PressableScale`?
- [ ] Text dùng font từ `@/theme/typography`, không phải system font?
- [ ] Divider dùng `rgba(255,255,255,0.03)` — không phải màu cứng?
