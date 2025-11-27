# 📱 How to Build APK for Android

Follow these steps to create an APK file that you can share with your friends:

## Prerequisites

1. **Expo Account**: You need a free Expo account
   - Sign up at: https://expo.dev/signup
   - Or use: `eas login` command

## Step-by-Step Instructions

### Step 1: Login to Expo
```bash
cd minuteservMobile
eas login
```
Enter your Expo account email and password when prompted.

### Step 2: Configure EAS Build (First time only)
```bash
eas build:configure
```
This will set up the build configuration (already done - eas.json exists).

### Step 3: Build the APK
```bash
eas build --platform android --profile preview
```

**What happens:**
- EAS will upload your code to Expo's servers
- Build the APK in the cloud
- This takes about 10-20 minutes

### Step 4: Download the APK
- After the build completes, you'll get a download link
- Or check: https://expo.dev/accounts/[your-username]/builds
- Download the `.apk` file

### Step 5: Share with Friends
- Send them the `.apk` file
- They need to enable "Install from Unknown Sources" on Android
- They can then install and use the app!

## Alternative: Quick Build Command

If you're already logged in, just run:
```bash
eas build --platform android --profile preview
```

## Build Profiles Explained

- **preview**: Builds an APK (easy to share)
- **production**: Builds an APK optimized for Play Store

## Troubleshooting

### If build fails:
1. Make sure you're logged in: `eas whoami`
2. Check your app.json is valid
3. Ensure Logo.png exists in assets folder

### If you want to build locally (advanced):
```bash
eas build --platform android --profile preview --local
```
(Requires Android SDK setup)

## Notes

- **Free tier**: Expo provides free builds, but with some limitations
- **Build time**: Usually 10-20 minutes
- **APK size**: Will be around 20-50 MB depending on dependencies
- **Validity**: APK works on Android 5.0+ devices

---

**Ready to build?** Run: `eas build --platform android --profile preview`

