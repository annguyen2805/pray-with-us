# 🔑 Hướng dẫn Lấy Gemini API Key

## Cách 1: Google AI Studio (Khuyên dùng)

### Bước 1: Truy cập Google AI Studio
1. Mở browser và truy cập: **https://aistudio.google.com/**
2. Đăng nhập bằng tài khoản Google của bạn

### Bước 2: Tạo API Key
1. Click vào menu **"Get API Key"** (góc trên bên phải)
   - Hoặc truy cập trực tiếp: **https://aistudio.google.com/app/apikey**

2. Chọn một trong các options:
   - **Create API key in new project** - Tạo project mới
   - **Create API key in existing project** - Dùng project có sẵn

3. Chọn project (nếu có nhiều project)

4. **Copy API Key** được tạo ra

### Bước 3: Lưu API Key vào project
1. Tạo file `.env.local` trong thư mục gốc của project
2. Thêm dòng sau:
   ```
   GEMINI_API_KEY=paste_your_api_key_here
   ```
3. **Lưu ý:** Thay `paste_your_api_key_here` bằng API key bạn vừa copy

### Bước 4: Restart Dev Server
```bash
# Dừng server (Ctrl+C) và chạy lại
npm run dev
```

## Cách 2: Google Cloud Console

### Bước 1: Truy cập Google Cloud Console
1. Mở: **https://console.cloud.google.com/**
2. Đăng nhập bằng Google account

### Bước 2: Tạo Project (nếu chưa có)
1. Click dropdown project ở trên cùng
2. Click **"New Project"**
3. Đặt tên project (ví dụ: "Pray with God")
4. Click **"Create"**

### Bước 3: Enable Gemini API
1. Vào **APIs & Services** > **Library**
2. Tìm "Gemini API" hoặc "Generative Language API"
3. Click **"Enable"**

### Bước 4: Tạo API Key
1. Vào **APIs & Services** > **Credentials**
2. Click **"Create Credentials"** > **"API Key"**
3. Copy API key được tạo
4. (Tùy chọn) Click **"Restrict Key"** để giới hạn sử dụng

### Bước 5: Lưu vào project
Tương tự như Cách 1, tạo file `.env.local` và thêm API key

## ✅ Kiểm tra API Key hoạt động

### Cách 1: Chạy app và test
1. Chạy `npm run dev`
2. Mở browser console (F12)
3. Nếu không thấy warning về API key → OK ✅
4. Test tính năng "Cầu nguyện" - nếu hoạt động → API key đúng ✅

### Cách 2: Test bằng curl (Terminal)
```bash
# Thay YOUR_API_KEY bằng API key của bạn
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

Nếu trả về JSON response → API key hoạt động ✅

## 🔒 Bảo mật API Key

### ⚠️ QUAN TRỌNG:
1. **KHÔNG commit `.env.local` lên Git**
   - File này đã được thêm vào `.gitignore`
   - Kiểm tra lại để chắc chắn

2. **KHÔNG chia sẻ API key công khai**
   - Không post lên GitHub, forum, chat
   - Mỗi người nên có API key riêng

3. **Giới hạn API Key (khuyến nghị)**
   - Vào Google Cloud Console
   - Vào **APIs & Services** > **Credentials**
   - Click vào API key của bạn
   - Click **"Restrict Key"**
   - Chọn:
     - **Application restrictions**: HTTP referrers (web) hoặc IP addresses
     - **API restrictions**: Chỉ chọn "Generative Language API"

4. **Monitor Usage**
   - Vào Google Cloud Console
   - Xem **APIs & Services** > **Dashboard**
   - Theo dõi số lượng requests và chi phí (nếu có)

## 💰 Chi phí

### Free Tier:
- Google cung cấp **free tier** cho Gemini API
- Giới hạn: ~60 requests/phút
- Đủ cho development và testing

### Pricing (nếu vượt free tier):
- Xem chi tiết: https://ai.google.dev/pricing
- Gemini Flash: Rất rẻ, phù hợp cho app này
- Gemini Pro: Đắt hơn, mạnh hơn

## 🐛 Troubleshooting

### Lỗi: "API key not valid"
**Nguyên nhân:**
- API key sai hoặc chưa được copy đầy đủ
- API key chưa được enable cho Gemini API

**Giải pháp:**
1. Kiểm tra lại API key trong `.env.local`
2. Đảm bảo không có khoảng trắng thừa
3. Enable Gemini API trong Google Cloud Console

### Lỗi: "API key not found"
**Nguyên nhân:**
- File `.env.local` không tồn tại
- Tên biến sai

**Giải pháp:**
1. Tạo file `.env.local` trong thư mục gốc
2. Đảm bảo format đúng: `GEMINI_API_KEY=your_key_here`
3. Restart dev server

### Lỗi: "Quota exceeded"
**Nguyên nhân:**
- Vượt quá giới hạn free tier
- Quá nhiều requests

**Giải pháp:**
1. Đợi một chút rồi thử lại
2. Kiểm tra usage trong Google Cloud Console
3. Nếu cần, upgrade plan

### Lỗi: "Permission denied"
**Nguyên nhân:**
- API key bị restrict quá chặt
- Chưa enable Gemini API

**Giải pháp:**
1. Vào Google Cloud Console
2. Kiểm tra API restrictions của key
3. Đảm bảo Gemini API được enable

## 📝 Template .env.local

Tạo file `.env.local` với nội dung:

```bash
# Gemini API Key
# Lấy từ: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_api_key_here

# Lưu ý:
# - Thay your_api_key_here bằng API key thực tế
# - KHÔNG commit file này lên Git
# - File này đã được thêm vào .gitignore
```

## 🔗 Links hữu ích

- **Google AI Studio**: https://aistudio.google.com/
- **Get API Key**: https://aistudio.google.com/app/apikey
- **Google Cloud Console**: https://console.cloud.google.com/
- **Gemini API Docs**: https://ai.google.dev/docs
- **Pricing**: https://ai.google.dev/pricing

## ⚡ Quick Steps (Tóm tắt)

1. ✅ Truy cập: https://aistudio.google.com/app/apikey
2. ✅ Đăng nhập Google
3. ✅ Tạo API key mới
4. ✅ Copy API key
5. ✅ Tạo file `.env.local` trong project
6. ✅ Thêm: `GEMINI_API_KEY=paste_key_here`
7. ✅ Restart dev server: `npm run dev`
8. ✅ Test app - nếu hoạt động → Done! 🎉
