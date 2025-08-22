import React from "react";
import { Controller } from "react-hook-form";
import { Text, TextInput, View } from "react-native";

export const FormField = ({
  name,
  label,
  control,
  rules,
  errors,
  placeholder,
  icon,
  rightIcon,
  ...rest
}: any) => (
  <View className="mb-6">
    <Text className="text-sm font-medium text-gray-700 mb-2">{label}</Text>
    <View className="relative">
      {icon && <View className="absolute left-3 top-3 z-10">{icon}</View>}
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            className={`pl-12 pr-12 h-12 ${rest.editable === false ? `text-gray-300` : `text-gray-800`} bg-gray-50 border border-gray-200 rounded-lg `}
            placeholder={placeholder}
            placeholderTextColor="#9ca3af"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            {...rest}
          />
        )}
      />
      {rightIcon && <View className="absolute right-3 top-3">{rightIcon}</View>}
      {errors[name] && (
        <Text className="text-red-500 text-sm mt-1">
          {errors[name]?.message}
        </Text>
      )}
    </View>
  </View>
);
