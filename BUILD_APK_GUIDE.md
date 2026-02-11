# 📱 Hướng dẫn Build APK cho Android

## Phương pháp: Sử dụng Capacitor

Capacitor là framework của Ionic để build native apps từ web apps.

## 🚀 Bước 1: Cài đặt Capacitor

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android
```

## 📝 Bước 2: Khởi tạo Capacitor

```bash
npx cap init
```

Khi được hỏi:
- **App name:** Pray with God
- **App ID:** com.praywithgod.app (hoặc tùy bạn đặt)
- **Web dir:** dist

## 🔧 Bước 3: Build Production

```bash
npm run build
```

Lệnh này sẽ tạo thư mục `dist/` chứa files đã build.

## 📦 Bước 4: Thêm Android Platform

```bash
npx cap add android
```

## 🔄 Bước 5: Sync Files

```bash
npx cap sync
```

Lệnh này sẽ copy files từ `dist/` vào Android project.

## 📱 Bước 6: Mở Android Studio

```bash
npx cap open android
```

Hoặc mở thủ công:
- Vào thư mục `android/`
- Mở bằng Android Studio

## 🏗️ Bước 7: Build APK trong Android Studio

1. **Mở Android Studio** (đã được mở từ bước 6)

2. **Chờ Gradle sync** hoàn tất (tự động hoặc click "Sync Now")

3. **Build APK:**
   - Menu: `Build` > `Build Bundle(s) / APK(s)` > `Build APK(s)`
   - Hoặc: `Build` > `Generate Signed Bundle / APK` (cho release)

4. **Chọn Build Variant:**
   - `Build` > `Select Build Variant`
   - Chọn `debug` (để test) hoặc `release` (để publish)

5. **APK Location:**
   - Sau khi build xong, Android Studio sẽ hiển thị notification
   - Click "locate" để mở thư mục
   - APK thường ở: `android/app/build/outputs/apk/debug/app-debug.apk`

## 🔐 Bước 8: Build Signed APK (Release)

Để publish lên Google Play Store, cần build signed APK:

### 8.1. Tạo Key Store:

```bash
keytool -genkey -v -keystore pray-with-god-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias pray-with-god
```

### 8.2. Cấu hình trong Android Studio:

1. `Build` > `Generate Signed Bundle / APK`
2. Chọn `APK`
3. Chọn key store vừa tạo
4. Chọn `release` build variant
5. Click `Finish`

## ⚙️ Cấu hình cần thiết

### 1. Cập nhật `vite.config.ts` để có base path:

```typescript
export default defineConfig({
  // ... existing config
  base: './', // Important for Capacitor
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
});
```

### 2. Cập nhật `index.html`:

Đảm bảo có meta viewport và các tags cần thiết (đã có sẵn).

### 3. Tạo file `capacitor.config.ts`:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.praywithgod.app',
  appName: 'Pray with God',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Geolocation: {
      permissions: {
        location: {
          description: 'Cần quyền vị trí để tìm nhà thờ gần đây.'
        }
      }
    }
  }
};

export default config;
```

### 4. Thêm Permissions (nếu cần):

File: `android/app/src/main/AndroidManifest.xml` (tự động tạo)

## 🔄 Workflow Build APK

Sau khi setup lần đầu, mỗi lần cần build APK mới:

```bash
# 1. Build web app
npm run build

# 2. Sync với Android
npx cap sync

# 3. Mở Android Studio
npx cap open android

# 4. Build APK trong Android Studio
```

## 📋 Yêu cầu hệ thống

- **Node.js** 18+ (đã có)
- **Android Studio** (cần cài)
  - Download: https://developer.android.com/studio
  - Cài đặt Android SDK
  - Cài đặt Android SDK Build Tools
- **Java JDK** 11+ (thường đi kèm Android Studio)

## 🐛 Troubleshooting

### Lỗi: "Gradle sync failed"
- Đảm bảo Android Studio đã cài đầy đủ SDK
- Mở `android/` folder trong Android Studio
- Để Gradle tự động download dependencies

### Lỗi: "Cannot find module"
- Chạy `npm install` trong project root
- Chạy `npx cap sync` lại

### Lỗi: Build failed
- Clean project: `Build` > `Clean Project`
- Rebuild: `Build` > `Rebuild Project`

### APK không cài được
- Kiểm tra Android version (thường cần Android 5.0+)
- Kiểm tra permission trong `AndroidManifest.xml`

## 📱 Test trên Device

### Cách 1: USB Debugging
1. Bật USB Debugging trên Android phone
2. Kết nối qua USB
3. Chạy app từ Android Studio (nút Run)

### Cách 2: Install APK
1. Copy APK file vào phone
2. Cho phép "Install from unknown sources"
3. Cài APK

## 🚀 Alternative: Build Online (Không cần Android Studio)

Nếu không muốn cài Android Studio, có thể dùng:

1. **GitHub Actions** - Build APK tự động
2. **EAS Build** (Expo) - Nếu migrate sang Expo
3. **Capacitor Cloud Build** (Ionic Appflow) - Paid service

## 📝 Checklist Build APK

- [ ] Cài đặt Android Studio
- [ ] Cài đặt Capacitor
- [ ] Chạy `npm run build`
- [ ] Chạy `npx cap add android`
- [ ] Chạy `npx cap sync`
- [ ] Mở Android Studio
- [ ] Build APK
- [ ] Test trên device
- [ ] Build signed APK (nếu cần publish)

## 🔗 Links hữu ích

- **Capacitor Docs**: https://capacitorjs.com/docs
- **Android Studio**: https://developer.android.com/studio
- **Capacitor Android Setup**: https://capacitorjs.com/docs/android
