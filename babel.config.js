module.exports = function (api) {
	api.cache(true);
	return {
		presets: [
			["babel-preset-expo", { jsxImportSource: "nativewind" }],
			"nativewind/babel",
		],
		plugins: [
			"react-native-reanimated/plugin", // MUST BE LAST
			"react-native-worklets/plugin", // 👈 THIS is the missing piece
		],
	};
};
