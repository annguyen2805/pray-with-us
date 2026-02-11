#!/bin/bash

# Script tự động setup Capacitor cho project

echo "🚀 Setting up Capacitor for Pray with God..."

# Install Capacitor packages
echo "📦 Installing Capacitor packages..."
npm install @capacitor/core @capacitor/cli @capacitor/android

# Initialize Capacitor
echo "🔧 Initializing Capacitor..."
npx cap init "Pray with God" "com.praywithgod.app" --web-dir=dist

# Add Android platform
echo "📱 Adding Android platform..."
npx cap add android

# Build the app
echo "🏗️ Building the app..."
npm run build

# Sync with Capacitor
echo "🔄 Syncing with Capacitor..."
npx cap sync

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Open Android Studio: npx cap open android"
echo "2. Wait for Gradle sync"
echo "3. Build APK: Build > Build Bundle(s) / APK(s) > Build APK(s)"
