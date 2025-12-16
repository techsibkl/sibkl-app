import fs from "fs";
export default ({ config }: { config: Record<string, any> }) => {
	// const isProd = process.env.EAS_BUILD_PROFILE === "production";
	const profile = process.env.EAS_BUILD_PROFILE || "development";
	const androidJson =
		profile === "production"
			? "./google-services-prod.json"
			: "./google-services-dev.json";

	if (!fs.existsSync(androidJson)) {
		throw new Error(`Missing Firebase JSON: ${androidJson}`);
	}

	return {
		...config,
		ios: {
			...config.ios,
			googleServicesFile: "./GoogleService-Info.plist",
		},
		android: {
			...config.android,
			googleServicesFile: androidJson,
		},
	};
};
