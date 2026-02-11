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
    },
    Camera: {
      permissions: {
        camera: {
          description: 'Cần quyền camera để chụp ảnh check-in tại nhà thờ.'
        },
        photos: {
          description: 'Cần quyền truy cập ảnh để chọn ảnh check-in.'
        }
      }
    },
    Photos: {
      permissions: {
        photos: {
          description: 'Cần quyền truy cập ảnh để lưu và xem ảnh check-in.'
        }
      }
    }
  }
};

export default config;
