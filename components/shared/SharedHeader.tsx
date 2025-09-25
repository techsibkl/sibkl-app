import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { ReactElement } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export type SharedHeaderProps = {
	title?: string;
	isPop?: boolean;
	backFunc?: Function;
	child?: ReactElement;
};

/**
 *
 * @param child component will override default header
 * @returns
 */
const SharedHeader = ({ title, isPop, backFunc, child }: SharedHeaderProps) => {
	const router = useRouter();
	return (
		<SafeAreaView
			edges={{ bottom: "off", top: "additive" }}
			className="py-4 px-4 bg-background z-10"
		>
			{child ? (
				<>{child}</>
			) : (
				<View className="flex flex-row gap-x-2 items-center">
					{/* If no pop & no back function given, won't display */}
					{(isPop || backFunc) && (
						<TouchableOpacity
							onPress={() =>
								backFunc ? backFunc() : router.back()
							}
						>
							<ChevronLeft size={30} />
						</TouchableOpacity>
					)}
					<Text className="text-3xl font-bold">{title}</Text>
				</View>
			)}
		</SafeAreaView>
	);
};

export default SharedHeader;
