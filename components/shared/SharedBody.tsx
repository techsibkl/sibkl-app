import React, { ReactElement } from "react";
import { Text, View } from "react-native";

type Props = {
	children: ReactElement | ReactElement[] | string;
};

const SharedBody = ({ children }: Props) => (
	<View className="flex-1 bg-background">
		{typeof children === "string" ? <Text>{children}</Text> : children}
	</View>
);

export default SharedBody;
