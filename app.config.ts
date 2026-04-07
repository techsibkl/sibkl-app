import "dotenv/config";

export default ({ config }: { config: any }) => ({
	...config,
	expo: {
		...config.expo,

		name: "SIBKL App",
		slug: "sibkl-app",
		version: "1.0.0",
		orientation: "portrait",
		icon: "./assets/images/sibkl-app-icon.png",
		scheme: "sibklapp",
		userInterfaceStyle: "automatic",
		newArchEnabled: false,

		ios: {
			supportsTablet: true,
			bundleIdentifier: "com.sibkl.app",
			googleServicesFile: "./GoogleService-Info.plist",
			infoPlist: {
				UIBackgroundModes: ["remote-notification"], // ← allows background notifications
			},
		},

		android: {
			adaptiveIcon: {
				foregroundImage: "./assets/images/sibkl-app-icon.png",
				backgroundColor: "#ffffff",
			},
			googleServicesFile: "./google-services.json",
			edgeToEdgeEnabled: true,
			package: "com.sibkl.app",
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
				projectId: "dc1379b3-8fa8-4f9b-a2f5-87f7b8a4eb8b",
			},
		},
	},
});
