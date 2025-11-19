import React from "react";
import { Image, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SibklText from "../../assets/images/sibkl-text-white.png";

const Page = () => {
	return (
		<SafeAreaView className="flex-1 bg-red-700">
			<View className="w-full h-full px-20 flex items-center justify-center">
				<Image
					source={SibklText}
					className="w-full h-full opacity-90"
					resizeMode="contain"
				/>
			</View>
		</SafeAreaView>
	);
};

export default Page;
