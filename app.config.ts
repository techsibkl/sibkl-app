import "dotenv/config";

export default ({ config }: { config: any }) => ({
	...config,
	expo: {
		...config.expo,

		name:
			process.env.APP_ENV === "production"
				? "SIBKL App"
				: "SIBKL (Staging)",
		slug:
			process.env.APP_ENV === "production"
				? "sibkl-app"
				: "sibkl-app-staging",
		version: "2.0.0",
		orientation: "portrait",
		icon: "./assets/images/sibkl-app-icon.png",
		scheme: "sibklapp",
		userInterfaceStyle: "automatic",
		newArchEnabled: false,

		ios: {
			supportsTablet: true,
			bundleIdentifier:
				process.env.APP_ENV === "production"
					? "com.sibkl.app"
					: "com.sibkl.app.staging",
			googleServicesFile:
				process.env.APP_ENV === "production"
					? "./GoogleService-Info.plist"
					: "./GoogleService-Info.staging.plist",
			infoPlist: {
				UIBackgroundModes: ["remote-notification"], // ← allows background notifications
				ITSAppUsesNonExemptEncryption: false, // required for Apple Store submission if you use any service that uses encryption (this app does not)
			},
		},

		android: {
			adaptiveIcon: {
				foregroundImage: "./assets/images/sibkl-app-icon.png",
				backgroundColor: "#ffffff",
			},
			googleServicesFile:
				process.env.APP_ENV === "production"
					? "./google-services.json"
					: "./google-services.staging.json",
			edgeToEdgeEnabled: true,
			package:
				process.env.APP_ENV === "production"
					? "com.sibkl.app"
					: "com.sibkl.app.staging",
			softwareKeyboardLayoutMode: "resize",
		},

		web: {
			bundler: "metro",
			output: "static",
			favicon: "./assets/images/favicon.png",
		},

		plugins: [
			"expo-router",
			"expo-notifications",
			"@react-native-firebase/app",
			"@react-native-firebase/auth",
			"@react-native-firebase/messaging",
			[
				"expo-build-properties",
				{
					ios: {
						useFrameworks: "static",
					},
				},
			],
			[
				"expo-splash-screen",
				{
					image: "./assets/images/sibkl-app-icon.png",
					imageWidth: 200,
					resizeMode: "contain",
					backgroundColor: "#ffffff",
				},
			],
		],

		experiments: {
			typedRoutes: true,
		},

		extra: {
			...config.expo?.extra,

			ENV: process.env.APP_ENV,
			API_URL: process.env.API_URL,
			eas: {
				// Production
				// projectId: "c415449d-f4d9-408f-854f-e26f86e8e7ad",

				// Staging
				projectId: "383a6cf5-4697-493c-8d20-98564cc6daaf",
			},
		},
	},
});
