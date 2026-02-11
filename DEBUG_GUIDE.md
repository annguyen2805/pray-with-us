# Hướng dẫn Debug và Xem App

## 🚀 Chạy App

### 1. Cài đặt Dependencies

```bash
npm install
```

### 2. Cấu hình Environment Variables

Tạo file `.env.local` trong thư mục gốc:

```bash
# .env.local
GEMINI_API_KEY=your_actual_api_key_here
```

**Lưu ý:** 
- Lấy API key từ: https://makersuite.google.com/app/apikey
- File `.env.local` đã được gitignore, không lo lộ thông tin

### 3. Chạy Development Server

```bash
npm run dev
```

App sẽ chạy tại: **http://localhost:3000**

### 4. Build Production

```bash
npm run build
```

### 5. Preview Production Build

```bash
npm run preview
```

## 🐛 Debugging

### Browser DevTools

#### 1. **Console Logs**
Mở DevTools (F12) và xem Console tab:
- API errors sẽ hiển thị ở đây
- Environment warnings
- Component errors

#### 2. **React DevTools**
Cài đặt extension:
- Chrome: [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- Firefox: [React Developer Tools](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

Sau khi cài, bạn sẽ thấy tab "Components" và "Profiler" trong DevTools.

#### 3. **Network Tab**
Kiểm tra API calls:
- Xem requests đến Gemini API
- Kiểm tra response/errors
- Xem request headers và payload

### Debug trong Code

#### 1. **Console Logging**
```typescript
// Thêm vào code để debug
console.log('Debug value:', someVariable);
console.error('Error:', error);
console.warn('Warning:', warning);
```

#### 2. **Debug API Calls**
File: `services/geminiService.ts`
```typescript
// Đã có error logging sẵn
console.error('Error generating prayer:', error);
```

#### 3. **Debug State Changes**
Thêm vào components:
```typescript
useEffect(() => {
  console.log('State changed:', stateVariable);
}, [stateVariable]);
```

### Common Issues & Solutions

#### ❌ **API Key không hoạt động**
**Triệu chứng:** 
- Console warning: "GEMINI_API_KEY is not set"
- API calls fail

**Giải pháp:**
1. Kiểm tra file `.env.local` tồn tại
2. Đảm bảo key đúng format: `GEMINI_API_KEY=your_key_here`
3. Restart dev server sau khi thay đổi .env
4. Kiểm tra không có khoảng trắng thừa

#### ❌ **Port 3000 đã được sử dụng**
**Giải pháp:**
```bash
# Tìm process đang dùng port 3000
netstat -ano | findstr :3000

# Hoặc thay đổi port trong vite.config.ts
server: {
  port: 3001, // Đổi sang port khác
}
```

#### ❌ **Module không tìm thấy**
**Triệu chứng:**
- Error: "Cannot find module '@google/genai'"

**Giải pháp:**
```bash
# Xóa node_modules và cài lại
rm -rf node_modules package-lock.json
npm install
```

#### ❌ **TypeScript Errors**
**Triệu chứng:**
- Type errors trong IDE

**Giải pháp:**
```bash
# Kiểm tra types
npm run build

# Hoặc trong VS Code, mở Command Palette (Ctrl+Shift+P)
# Chọn "TypeScript: Restart TS Server"
```

### Debugging Tools

#### 1. **Vite DevTools**
Vite có built-in HMR (Hot Module Replacement):
- Thay đổi code sẽ tự động reload
- Preserve state trong development

#### 2. **React Error Boundary**
App đã có ErrorBoundary component:
- Tự động catch component errors
- Hiển thị error UI thay vì crash app
- Check console để xem error details

#### 3. **LocalStorage Debugging**
App sử dụng localStorage, xem trong DevTools:
- Application tab > Local Storage > http://localhost:3000
- Keys: `lumina_*` (lang, theme, profile, history, etc.)

### Performance Debugging

#### 1. **React Profiler**
1. Mở React DevTools
2. Chọn tab "Profiler"
3. Click "Record" và tương tác với app
4. Xem component render times

#### 2. **Network Performance**
- DevTools > Network tab
- Xem API call timing
- Check for slow requests

#### 3. **Console Performance**
```javascript
// Measure function execution time
console.time('functionName');
// ... your code ...
console.timeEnd('functionName');
```

## 📱 Testing trên Mobile

### 1. **Local Network Access**
Vite config đã set `host: '0.0.0.0'`, nên có thể truy cập từ mobile:

1. Tìm IP máy tính:
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```

2. Trên mobile, truy cập: `http://YOUR_IP:3000`

### 2. **Chrome DevTools Mobile Emulation**
1. Mở DevTools (F12)
2. Click icon mobile/tablet (Ctrl+Shift+M)
3. Chọn device để test responsive

## 🔍 Debug Checklist

Khi gặp lỗi, kiểm tra:

- [ ] `.env.local` file tồn tại và có API key
- [ ] Dev server đang chạy (`npm run dev`)
- [ ] Browser console không có errors
- [ ] Network tab - API calls thành công
- [ ] localStorage có data (nếu cần)
- [ ] React DevTools - component state đúng
- [ ] TypeScript compilation không có errors

## 📝 Debug Commands

```bash
# Chạy với verbose logging
npm run dev -- --debug

# Build và xem errors
npm run build

# Check TypeScript errors
npx tsc --noEmit

# Clear cache và rebuild
rm -rf node_modules .vite dist
npm install
npm run dev
```

## 🛠️ Useful Browser Shortcuts

- **F12** - Mở DevTools
- **Ctrl+Shift+C** - Inspect element
- **Ctrl+R** - Hard refresh (clear cache)
- **Ctrl+Shift+R** - Hard refresh
- **Ctrl+Shift+J** - Mở Console (Chrome)
- **Ctrl+Shift+K** - Mở Console (Firefox)

## 💡 Tips

1. **Enable Source Maps**: Đã enabled mặc định trong Vite
2. **Breakpoints**: Đặt breakpoint trong code, DevTools sẽ pause
3. **Watch Mode**: Vite tự động reload khi file thay đổi
4. **Error Overlay**: Vite hiển thị error overlay trong browser
5. **Network Throttling**: Test slow connections trong DevTools > Network
