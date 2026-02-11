# Tính năng Follow (Theo dõi)

## Tổng quan

Tính năng Follow cho phép người dùng theo dõi các ý nguyện, chủ đề cầu nguyện, lời cầu nguyện và các mục khác để dễ dàng truy cập lại sau này.

## Tính năng

### 1. **Theo dõi các loại mục**
- ✅ **Ý nguyện (Intentions)**: Theo dõi các ý nguyện cầu nguyện
- ✅ **Chủ đề (Themes)**: Theo dõi các chủ đề cầu nguyện
- ✅ **Lời cầu nguyện (Prayers)**: Lưu các lời cầu nguyện yêu thích
- ✅ **Suy niệm (Devotionals)**: Theo dõi các bài suy niệm
- ✅ **Thánh (Saints)**: Theo dõi các vị thánh

### 2. **Giao diện Follow**
- Màn hình Follow riêng với tab điều hướng
- Lọc theo loại mục
- Thêm mục mới để theo dõi
- Xóa mục đã theo dõi
- Sử dụng nhanh mục đã theo dõi

### 3. **Tích hợp**
- Nút Follow trên các chủ đề cầu nguyện
- Lưu trữ trong localStorage
- Đếm số lần sử dụng
- Theo dõi ngày thêm và lần sử dụng cuối

## Cách sử dụng

### Thêm mục theo dõi
1. Vào màn hình **Follow** (biểu tượng bookmark ở navigation bar)
2. Nhấn nút **+** ở góc trên bên phải
3. Chọn loại mục và nhập tên
4. Nhấn **Thêm**

### Theo dõi từ chủ đề
1. Vào màn hình **Cầu nguyện** (Prayer)
2. Hover vào một chủ đề
3. Nhấn nút bookmark xuất hiện
4. Chủ đề sẽ được thêm vào danh sách theo dõi

### Sử dụng mục đã theo dõi
1. Vào màn hình **Follow**
2. Tìm mục muốn sử dụng
3. Nhấn nút **Play** (▶️) để sử dụng ngay

### Bỏ theo dõi
1. Vào màn hình **Follow**
2. Hover vào mục muốn bỏ theo dõi
3. Nhấn nút **X** (bookmark-slash)

## Cấu trúc dữ liệu

```typescript
interface FollowedItem {
  id: string;
  type: 'intention' | 'theme' | 'prayer' | 'devotional' | 'saint';
  title: string;
  description?: string;
  icon?: string;
  followedAt: string; // ISO timestamp
  lastUsed?: string; // ISO timestamp
  useCount?: number;
  metadata?: Record<string, any>;
}
```

## Lưu trữ

Dữ liệu được lưu trong `localStorage` với key `lumina_followed`.

## Components

### FollowView
Component chính hiển thị danh sách các mục đã theo dõi.

**Props:**
- `followedItems`: Danh sách mục đã theo dõi
- `lang`: Ngôn ngữ hiện tại
- `onUnfollow`: Callback khi bỏ theo dõi
- `onFollowItem`: Callback khi thêm mục mới
- `setView`: Function để chuyển view
- `onUseItem`: Callback khi sử dụng mục

### FollowButton
Component nút Follow có thể tái sử dụng.

**Props:**
- `isFollowing`: Trạng thái đang theo dõi
- `onToggle`: Callback khi toggle
- `size`: Kích thước ('sm' | 'md' | 'lg')
- `className`: CSS class tùy chỉnh

## Navigation

Màn hình Follow được thêm vào navigation bar với icon `fa-bookmark`, thay thế cho màn hình appointments trong navigation chính.

## Tương lai

Các tính năng có thể mở rộng:
- [ ] Đồng bộ với cloud
- [ ] Chia sẻ mục theo dõi với người khác
- [ ] Nhắc nhở định kỳ cho mục đã theo dõi
- [ ] Nhóm mục theo dõi thành thư mục
- [ ] Tìm kiếm trong danh sách theo dõi
- [ ] Sắp xếp theo nhiều tiêu chí
