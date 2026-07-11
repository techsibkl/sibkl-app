import React from 'react';
import DatePicker from 'react-native-date-picker';

type ConsistentPickerProps = {
  date: Date | null;
  onConfirm: (selectedDate: Date) => void;
  onCancel: () => void;
  open: boolean;
};

export default function ConsistentPicker({
  date,
  onConfirm,
  onCancel,
  open,
}: ConsistentPickerProps) {
  return (
    <DatePicker
      modal
      mode="date"
      open={open}
      date={date || new Date()}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
