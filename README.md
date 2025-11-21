# Welcome to SIBKL Mobile App

## Setup
- `npm install`
- Ensure `tempEnv` is connected to backend server
- `rm -rf android ios` (reset platform folders)
- `npx expo run:android --device` (for development mode)

## Resources
1. Android signing for Google Playstore 
- https://developer.android.com/studio/publish/app-signing

2. Android build .aab
- Run `npx expo prebuild`
- `cd android`
- `./gradlew bundleRelease` for .aab
- `./gradlew assembleRelease` for .apk