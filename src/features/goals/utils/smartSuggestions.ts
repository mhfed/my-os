export interface Suggestion {
  milestones: string[];
  habits: { name: string; sub: string; icon: string; color: string }[];
}

const DICTIONARY: { keywords: string[]; suggestion: Suggestion }[] = [
  {
    keywords: ['ielts', 'english', 'tiếng anh', 'anh văn'],
    suggestion: {
      milestones: [
        'Học 500 từ vựng mới',
        'Thi thử đạt mục tiêu trung gian',
        'Luyện 10 đề Listening/Reading',
        'Hoàn thành 5 bài viết Writing task 2',
        'Thi thật chính thức',
      ],
      habits: [
        { name: 'Học tiếng Anh', sub: '20 phút mỗi ngày', icon: 'book-open-variant', color: '#7C6EF5' },
        { name: 'Nghe podcast tiếng Anh', sub: '15 phút', icon: 'headphones', color: '#4ECDC4' },
      ],
    },
  },
  {
    keywords: ['chạy', 'marathon', 'chạy bộ', 'run'],
    suggestion: {
      milestones: [
        'Chạy liên tục 5km đầu tiên',
        'Chạy liên tục 10km',
        'Chạy liên tục 15km',
        'Hoàn thành cự ly mục tiêu chính thức',
      ],
      habits: [
        { name: 'Chạy bộ', sub: '3-5km nhẹ nhàng', icon: 'run', color: '#FF6B6B' },
        { name: 'Đi bộ', sub: '10,000 bước chân', icon: 'walk', color: '#F5B16E' },
      ],
    },
  },
  {
    keywords: ['gym', 'giảm cân', 'sức khỏe', 'workout', 'tập thể dục', 'tập luyện', 'cân nặng'],
    suggestion: {
      milestones: [
        'Giảm 2kg đầu tiên (hoặc tăng cơ)',
        'Duy trì tập luyện đều đặn 4 tuần',
        'Đạt mốc cân nặng / số đo mục tiêu',
      ],
      habits: [
        { name: 'Tập thể dục/Gym', sub: '45 phút mỗi ngày', icon: 'dumbbell', color: '#FF6B6B' },
        { name: 'Uống đủ nước', sub: '2 lít nước mỗi ngày', icon: 'water', color: '#4ECDC4' },
      ],
    },
  },
  {
    keywords: ['tiết kiệm', 'mua', 'tài chính', 'tiền', 'tích lũy', 'mua xe', 'mua nhà'],
    suggestion: {
      milestones: [
        'Tiết kiệm được 30% chặng đường',
        'Tiết kiệm được 60% chặng đường',
        'Tích lũy đủ 100% mục tiêu tài chính',
      ],
      habits: [
        { name: 'Ghi chép chi tiêu', sub: 'Ngay khi phát sinh giao dịch', icon: 'notebook-outline', color: '#7C6EF5' },
        { name: 'Tự nấu ăn tại nhà', sub: 'Tiết kiệm chi phí ăn ngoài', icon: 'silverware-fork-knife', color: '#F5B16E' },
      ],
    },
  },
  {
    keywords: ['học', 'lập trình', 'ui', 'ux', 'code', 'thiết kế', 'dev', 'developer', 'khoá học', 'online'],
    suggestion: {
      milestones: [
        'Hoàn thành 50% khóa học/tài liệu',
        'Hoàn thành 100% khóa học',
        'Xây dựng 1 dự án thực tế (Side Project)',
        'Hoàn thiện Portfolio giới thiệu bản thân',
      ],
      habits: [
        { name: 'Học lập trình / Thiết kế', sub: '30 phút tập trung', icon: 'laptop', color: '#7C6EF5' },
        { name: 'Đọc bài viết chuyên ngành', sub: '1 bài viết chất lượng', icon: 'newspaper-variant-outline', color: '#4ECDC4' },
      ],
    },
  },
  {
    keywords: ['đọc', 'sách', 'book', 'đọc sách'],
    suggestion: {
      milestones: [
        'Đọc xong cuốn sách đầu tiên',
        'Đọc xong 3 cuốn sách',
        'Đọc xong toàn bộ mục tiêu',
      ],
      habits: [
        { name: 'Đọc sách', sub: '15 trang sách mỗi ngày', icon: 'book-open-blank-variant', color: '#7C6EF5' },
      ],
    },
  },
];

export function getSmartSuggestions(title: string): Suggestion {
  const query = title.toLowerCase().trim();
  if (!query) {
    return { milestones: [], habits: [] };
  }

  // Find the first dictionary entry that matches one of the keywords
  const match = DICTIONARY.find((item) =>
    item.keywords.some((keyword) => query.includes(keyword))
  );

  return match
    ? match.suggestion
    : { milestones: [], habits: [] };
}
