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
				<View className="flex flex-row items-center">
					{/* If no pop & no back function given, won't display */}
					{(isPop || backFunc) && (
						<TouchableOpacity
							className="absolute left-0 top-0 bottom-0 justify-center z-10 pr-6" // Absolute position so it doesn't push the title
							hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
							onPress={() => {
								if (backFunc) {
									console.log(
										"Using custom back function",
										backFunc,
									);
									backFunc();
								} else {
									console.log("Using router.back()");
									router.back();
								}
								// backFunc ? backFunc() : router.back()
							}}
						>
							<ChevronLeft size={30} />
						</TouchableOpacity>
					)}
					{!!title && (
						<Text 
                            className={`text-2xl text-black font-bold ${(isPop || backFunc) ? "ml-10" : ""}`}
                        >
							{title}
						</Text>
					)}
				</View>
			)}
		</SafeAreaView>
	);
};

export default SharedHeader;
