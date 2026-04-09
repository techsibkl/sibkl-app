# Welcome to SIBKL Mobile App

## Setup

- `npm install`
- Ensure `tempEnv` is connected to backend server
- `rm -rf android ios` (reset platform folders)
- `npx expo run:android --device` (for development mode)

## Resources

#### 1. Android signing for Google Playstore

- https://developer.android.com/studio/publish/app-signing

#### 2. Android build .aab

- Run `npx expo prebuild`
- `cd android`
- `./gradlew bundleRelease` for .aab
- `./gradlew assembleRelease` for .apk

#### 3. Managed services by EAS (paid)

- https://docs.expo.dev/build/setup/
- Just configure signing certificates online EAS
- `eas build --platform android`

<br>

## Android deployment

1. Build

<br>

## IOS deployment

#### 1. Login and initialize EAS project

- `npm install -g eas-cli`
- `eas login`
- Manually configure `app.config.ts` EAS project ID
    - Note whether it's EAS `staging` or `prod` project (different IDs)

```ts
export default {
	expo: {
		ios: {
			bundleIdentifier: "your.bundle.id",
			infoPlist: {
				ITSAppUsesNonExemptEncryption: false,
			},
		},
		extra: {
			eas: {
				projectId: "YOUR_PROJECT_ID",
			},
		},
	},
};
```

- Configure `eas.json` - get app id from App Store Connect > General > App Information

```json
{
	"build": {
		"staging": {
			"distribution": "internal"
		},
		"production": {
			"distribution": "app-store"
		}
	},
	"submit": {
		"staging": {
			"ios": {
				"appleId": "your@email.com",
				"ascAppId": "APP_STORE_CONNECT_APP_ID",
				"appleTeamId": "TEAM_ID"
			}
		}
	}
}
```

#### 2. Build the app

- `eas build --platform ios --profile staging`

- What happens:
    - App is built on Expo servers
    - Certificates & provisioning handled automatically
    - Outputs a .ipa file

#### 4. Upload APN auth key to Firebase > Project Settings > Cloud Messaging (One-time only)

#### 3. Submit to TestFlight

- Get build ID `eas build:list`
- `eas submit --platform ios --id <BUILD_ID>`
- What happens:
    - Uploads .ipa to App Store Connect
    - Uses API key (auto-created by Expo)

### ✅ DONE: Apple will process 5-30mins to be approved in TestFlight
