# 🚀 Quick Start Guide

## Bước 1: Cài đặt Dependencies

```bash
npm install
```

## Bước 2: Cấu hình API Key

Tạo file `.env.local` trong thư mục gốc:

```bash
GEMINI_API_KEY=your_actual_api_key_here
```

**Lấy API key:**
1. Truy cập: https://makersuite.google.com/app/apikey
2. Tạo API key mới
3. Copy và paste vào file `.env.local`

## Bước 3: Chạy App

```bash
npm run dev
```

## Bước 4: Mở Browser

Truy cập: **http://localhost:3000**

## ✅ Kiểm tra App hoạt động

1. **Kiểm tra Console (F12):**
   - Không có errors màu đỏ
   - Có thể có warning về API key (nếu chưa set)

2. **Test tính năng:**
   - Click "Cầu nguyện" để tạo lời cầu nguyện
   - Kiểm tra API call trong Network tab

## 🐛 Nếu gặp lỗi

Xem [DEBUG_GUIDE.md](./DEBUG_GUIDE.md) để biết cách debug chi tiết.

### Lỗi thường gặp:

**"GEMINI_API_KEY is not set"**
- Kiểm tra file `.env.local` tồn tại
- Restart dev server: `Ctrl+C` rồi `npm run dev` lại

**"Port 3000 already in use"**
- Đóng app khác đang dùng port 3000
- Hoặc đổi port trong `vite.config.ts`

**"Cannot find module"**
```bash
rm -rf node_modules
npm install
```

## 📱 Test trên Mobile

1. Tìm IP máy tính:
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux  
   ifconfig
   ```

2. Trên mobile, truy cập: `http://YOUR_IP:3000`

## 🎯 Next Steps

- Đọc [DEBUG_GUIDE.md](./DEBUG_GUIDE.md) để học debug
- Xem [FOLLOW_FEATURE.md](./FOLLOW_FEATURE.md) để hiểu tính năng Follow
- Check [ENHANCEMENTS.md](./ENHANCEMENTS.md) để xem các cải tiến
