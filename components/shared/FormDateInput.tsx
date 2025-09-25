import { DateTimePicker } from "@expo/ui/jetpack-compose";
import React, { useState } from "react";
import { Controller } from "react-hook-form";
import { Text, TouchableOpacity, View } from "react-native";

export const FormDateInput = ({
  name,
  label,
  control,
  rules,
  errors,
  disabled = false,
}: {
  name: string;
  label: string;
  control: any;
  rules?: any;
  errors: any;
  disabled?: boolean;
}) => {
  const [show, setShow] = useState(false);

  return (
    <View className="mb-6">
      <Text className="text-sm font-medium text-gray-700 mb-2">{label}</Text>

      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field: { onChange, value } }) => (
          <>
            {/* Input-like touch area */}
            <TouchableOpacity
              disabled={disabled}
              className={`border border-gray-200 rounded-[15px] p-3 bg-gray-50 ${
                disabled ? "opacity-50" : ""
              }`}
              onPress={() => setShow(true)}
            >
              <Text className={value ? "text-gray-900" : "text-gray-400"}>
                {value ? new Date(value).toLocaleDateString() : "Select a date"}
              </Text>
            </TouchableOpacity>

            {show && (
              <DateTimePicker
                initialDate={
                    value
                      ? new Date(value).toISOString()
                      : new Date().toISOString()
                  }
                  onDateSelected={(date) => {
                    onChange(date); // update react-hook-form value
                    setShow(false); // close after picking
                  }}
                displayedComponents="date"
                variant="picker"
              />
            )}
          </>
        )}
      />

      {errors[name] && (
        <Text className="text-red-500 text-sm mt-1">
          {errors[name]?.message}
        </Text>
      )}
    </View>
  );
};
