import { secureFetch } from "@/utils/secureFetch";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import DateTimePicker from "@react-native-community/datetimepicker";
import { forwardRef, useMemo, useState } from "react";
import { Button, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

type CreateSessionSheetProps = {
  onCreated?: (result: any) => void;
};

const CreateSessionSheet = forwardRef<
  BottomSheetModal,
  CreateSessionSheetProps
>(({ onCreated }, ref) => {
  const snapPoints = useMemo(() => ["100%"], []);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [qrCodeValue, setQrCodeValue] = useState<string | null>(null);

  const handleCreateSession = async () => {
    try {
      const response = await secureFetch(
        `http://192.168.1.102:5001/leafy-loader-444703-d0/us-central1/cells/1/create-cell-session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cell_id: "1",
            meeting_date: date.toISOString().split("T")[0],
          }),
        }
      );

      const result = await response.json();
      console.log("Session created:", result);

      // Show QR code after creation
      const sessionId = result?.data?.session_id ?? "default-session-id";
      setQrCodeValue(sessionId);

      // Notify parent
      onCreated?.(result);
    } catch (err) {
      console.error("Error creating session:", err);
    }
  };

  const handleDateChange = (_: any, selectedDate?: Date) => {
    if (selectedDate) setDate(selectedDate);
    setShowPicker(false);
  };

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      enablePanDownToClose
      index={1}
    >
      <BottomSheetView className="flex-1 p-4">
        <Text className="text-lg font-bold mb-2">📅 Create New Session</Text>

        <Button title="Pick Date" onPress={() => setShowPicker(true)} />
        {showPicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="spinner"
            onChange={handleDateChange}
          />
        )}

        <Text className="text-gray-500 mt-2 mb-4">
          Selected date: {`📅 ${date.toDateString()}`}
        </Text>

        {!qrCodeValue ? (
          <Button title="Create Session" onPress={handleCreateSession} />
        ) : (
          <View className="items-center mt-4">
            <Text className="mb-2 text-center font-semibold">
              ✅ Session Created! Members can scan this QR:
            </Text>
            <QRCode value={qrCodeValue} size={180} />
          </View>
        )}
      </BottomSheetView>
    </BottomSheetModal>
  );
});

CreateSessionSheet.displayName = "CreateSessionSheet";

export default CreateSessionSheet;
