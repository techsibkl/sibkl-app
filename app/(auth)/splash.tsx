import PulsingLogo from "@/components/shared/PulsingLogo";
import React from "react";
import { ActivityIndicator, ImageSourcePropType, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SibklText from "../../assets/images/sibkl-text-white.png";

const Page = () => {
	return (
		<SafeAreaView className="flex h-full w-full bg-red-700">
			<View className="w-full h-[85%] px-20 py-20 items-center justify-center">
				<PulsingLogo
					source={SibklText as ImageSourcePropType}
					className="w-full"
				/>
			</View>
			<ActivityIndicator color="white" size="small" />
		</SafeAreaView>
	);
};

export default Page;
