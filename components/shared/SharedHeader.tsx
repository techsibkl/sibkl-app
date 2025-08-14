import React, { ReactElement } from "react";
import { Text, View } from "react-native";

export type SharedHeaderProps = {
  title: string;
  children?: ReactElement | ReactElement[];
};

const SharedHeader = ({ title, children }: SharedHeaderProps) => {
  return (
    <View className="pt-15 px-5 pb-5">
      <Text className="text-3xl font-bold text-text mb-5">{title}</Text>
      {children}
    </View>
  );
};

export default SharedHeader;
