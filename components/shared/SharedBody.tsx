import React, { ReactElement } from "react";
import { View } from "react-native";

type Props = {
	children: ReactElement | ReactElement[];
};

const SharedBody = ({ children }: Props) => {
	return (
		<View className="flex-1 bg-background dark:bg-background-dark">
			{children}
		</View>
	);
};

export default SharedBody;
