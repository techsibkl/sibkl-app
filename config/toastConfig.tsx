import { AlertCircle, CheckCircle, XCircle } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";
import { BaseToastProps } from "react-native-toast-message";

interface CustomToastProps extends BaseToastProps {
	text1?: string;
	text2?: string;
}

const toastConfig = {
	error: ({ text1, text2 }: CustomToastProps) => (
		<View className=" min-h-[70px] bg-red-100 p-4 rounded-[15px]">
			<View className="flex-row items-center mb-2">
				<XCircle size={20} color="#991B1B" style={{ marginRight: 8 }} />
				{text1 && (
					<Text className="text-red-800 text-[14px] font-bold flex-1">
						{text1}
					</Text>
				)}
			</View>
			{text2 && (
				<Text className="text-red-600 text-[12px] ml-7">{text2}</Text>
			)}
		</View>
	),
	success: ({ text1, text2 }: CustomToastProps) => (
		<View className="min-h-[70px] bg-green-100 p-4 rounded-[15px]">
			<View className="flex-row items-center mb-2">
				<CheckCircle
					size={20}
					color="#065F46"
					style={{ marginRight: 8 }}
				/>
				{text1 && (
					<Text className="text-green-800 text-[14px] font-bold flex-1">
						{text1}
					</Text>
				)}
			</View>
			{text2 && (
				<Text className="text-green-600 text-[12px] ml-7">{text2}</Text>
			)}
		</View>
	),
	delete: ({ text1, text2 }: CustomToastProps) => (
		<View className="min-h-[70px] bg-orange-100 p-4 rounded-[15px]">
			<View className="flex-row items-center mb-2">
				<AlertCircle
					size={20}
					color="#9A3412"
					style={{ marginRight: 8 }}
				/>
				{text1 && (
					<Text className="text-orange-800 text-[14px] font-bold flex-1">
						{text1}
					</Text>
				)}
			</View>
			{text2 && (
				<Text className="text-orange-600 text-[12px] ml-7">
					{text2}
				</Text>
			)}
		</View>
	),
};

export default toastConfig;
