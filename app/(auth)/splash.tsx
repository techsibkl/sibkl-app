import React from "react";
import {
	ActivityIndicator,
	Image,
	ImageSourcePropType,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SibklText from "../../assets/images/sibkl-text-white.png";

const Page = () => {
	return (
		<SafeAreaView className="flex h-full w-full bg-red-700">
			<View className="w-full h-[85%] px-20 py-20 items-center justify-center">
				<Image
					source={SibklText as ImageSourcePropType}
					className="w-full h-full opacity-90"
					resizeMode="contain"
				/>
			</View>
			<ActivityIndicator color="white" size="small" />
		</SafeAreaView>
	);
};

export default Page;
