import { inputPadding } from "@/constants/const_styles";
import {
	DEFAULT_DIAL_CODE,
	digitsOnly,
	joinPhone,
	parsePastedPhone,
	PHONE_COUNTRIES,
	splitPhone,
} from "@/utils/phone";
import { ChevronDownIcon } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Controller } from "react-hook-form";
import { Text, TextInput, View } from "react-native";
import { AppPicker } from "./AppPicker";

type Props = {
	name: string;
	label: string;
	control: any;
	rules?: any;
	errors?: any;
	placeholder?: string;
	disabled?: boolean;
	onBlur?: Function;
	onChangeText?: Function;
	options?: unknown;
};

const countryOptions = PHONE_COUNTRIES.map((country) => ({
	label: `${country.name} (+${country.dialCode})`,
	value: country.dialCode,
}));

export const PhoneFormField = ({
	name,
	label,
	control,
	rules = {},
	errors = {},
	placeholder = "Mobile number",
	disabled = false,
	onBlur: onBlurCallback,
	onChangeText: onChangeTextCallback,
}: Props) => (
	<View>
		<Text className="text-sm font-medium text-text pl-1 mb-2">
			{label} {disabled ? "(not editable)" : ""}
		</Text>
		<Controller
			control={control}
			name={name}
			rules={rules}
			render={({ field: { onChange, onBlur, value } }) => (
				<PhoneControl
					value={value}
					disabled={disabled}
					placeholder={placeholder}
					onChange={(next) => {
						onChange(next);
						onChangeTextCallback?.(next);
					}}
					onBlur={(next) => {
						onBlur();
						onBlurCallback?.(next);
					}}
				/>
			)}
		/>
		{errors[name] && (
			<Text className="text-primary-500 text-sm pl-1 mt-1">
				{errors[name]?.message}
			</Text>
		)}
	</View>
);

function PhoneControl({
	value,
	disabled,
	placeholder,
	onChange,
	onBlur,
}: {
	value: unknown;
	disabled: boolean;
	placeholder: string;
	onChange: (value: string) => void;
	onBlur: (value: string) => void;
}) {
	const initial = splitPhone(typeof value === "string" ? value : "");
	const [dialCode, setDialCode] = useState(initial.dialCode);
	const [national, setNational] = useState(initial.national);
	const dialRef = useRef(dialCode);
	const nationalRef = useRef(national);

	useEffect(() => {
		const incoming = digitsOnly(typeof value === "string" ? value : "");
		const current = joinPhone(dialRef.current, nationalRef.current);
		if (current === incoming) return;

		const parsed = splitPhone(typeof value === "string" ? value : "");
		dialRef.current = parsed.dialCode;
		nationalRef.current = parsed.national;
		setDialCode(parsed.dialCode);
		setNational(parsed.national);
	}, [value]);

	const commit = (code: string, local: string) => {
		dialRef.current = code;
		nationalRef.current = local;
		setDialCode(code);
		setNational(local);
		onChange(joinPhone(code, local));
	};

	return (
		<View
			className={`h-12 flex-row items-center border border-border rounded-[15px] overflow-hidden ${disabled ? "bg-gray-100" : "bg-white"}`}
		>
			<View className="h-full justify-center border-r border-border pl-3 pr-1 min-w-[92px]">
				<AppPicker
					value={dialCode || DEFAULT_DIAL_CODE}
					options={countryOptions}
					disabled={disabled}
					showPlaceholder={false}
					placeholder="Country"
					onChange={(code) => {
						if (!code) return;
						commit(String(code), nationalRef.current);
					}}
					renderTrigger={() => (
						<View className="flex-row items-center justify-between pr-2">
							<Text
								className={`font-regular text-sm ${disabled ? "text-gray-400" : "text-gray-600"}`}
							>
								+{dialCode || DEFAULT_DIAL_CODE}
							</Text>
							<ChevronDownIcon size={16} color="#6b7280" />
						</View>
					)}
				/>
			</View>
			<TextInput
				style={inputPadding}
				className={`font-regular flex-1 px-3 ${disabled ? "text-gray-400" : "text-gray-600"}`}
				placeholder={placeholder}
				placeholderTextColor="#9ca3af"
				keyboardType="phone-pad"
				readOnly={disabled}
				value={national}
				onChangeText={(text) => {
					const pasted = parsePastedPhone(text);
					if (pasted) {
						commit(pasted.dialCode, pasted.national);
						return;
					}
					commit(dialRef.current, text.replace(/[^\d]/g, ""));
				}}
				onBlur={() => {
					const joined = joinPhone(dialRef.current, nationalRef.current);
					const parsed = splitPhone(joined);
					nationalRef.current = parsed.national;
					setNational(parsed.national);
					onChange(joined);
					onBlur(joined);
				}}
			/>
		</View>
	);
}
