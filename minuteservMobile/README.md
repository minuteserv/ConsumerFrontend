# Minuteserv Mobile App

React Native Expo app that displays the Minuteserv website (https://minuteserv.com/) in a WebView.

## Features

- ✅ WebView integration to display minuteserv.com
- ✅ Loading indicator while page loads
- ✅ Error handling for network issues
- ✅ Full website functionality within the app
- ✅ Supports iOS and Android

## Setup

1. Install dependencies:
```bash
cd minuteservMobile
npm install
```

## Running the App

### Start Expo Development Server
```bash
npm start
```

### Run on iOS Simulator
```bash
npm run ios
```

### Run on Android Emulator
```bash
npm run android
```

### Run on Web Browser
```bash
npm run web
```

## App Configuration

The app is configured to:
- Display https://minuteserv.com/ in a WebView
- Show a loading indicator while the page loads
- Handle errors gracefully
- Support all website features (JavaScript, cookies, etc.)

## Requirements

- Node.js (v18 or higher recommended)
- Expo CLI (installed globally or via npx)
- iOS Simulator (for iOS) or Android Emulator (for Android)
- Or use Expo Go app on your physical device

## Notes

- The app requires an internet connection to load the website
- All website features should work within the WebView
- The app uses SafeAreaView to respect device safe areas

