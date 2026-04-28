import { useCreateCellSessionMutation } from "@/hooks/CellAttendance/useCellAttendanceQuery";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import DateTimePicker from "@react-native-community/datetimepicker";
import { forwardRef, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";

type CellOption = { id: number; name: string };

type CreateSessionSheetProps = {
  ledCells: CellOption[];
  onCreated?: (insertedId: number) => void;
};

type FormErrors = { cell?: string; date?: string };

const CreateSessionSheet = forwardRef<
  BottomSheetModal,
  CreateSessionSheetProps
>(({ ledCells, onCreated }, ref) => {
  const snapPoints = useMemo(() => ["100%"], []);
  const [selectedCellId, setSelectedCellId] = useState<number | null>(
    ledCells.length === 1 ? ledCells[0].id : null,
  );
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [qrCodeValue, setQrCodeValue] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const { mutateAsync: createSession, isPending } =
    useCreateCellSessionMutation(selectedCellId ?? 0);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!selectedCellId) newErrors.cell = "Please select a cell.";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) newErrors.date = "Date cannot be in the past.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateSession = async () => {
    if (!validate()) return;
    try {
      const result = await createSession(date.toISOString().split("T")[0]);
      setQrCodeValue(String(result.insertedId));
      onCreated?.(result.insertedId);
    } catch (err: any) {
      setErrors({
        cell: err?.message ?? "Failed to create session. Please try again.",
      });
    }
  };

  const handleDateChange = (_: any, selectedDate?: Date) => {
    if (selectedDate) setDate(selectedDate);
    setShowPicker(false);
    setErrors((e) => ({ ...e, date: undefined }));
  };

  const handleReset = () => {
    setQrCodeValue(null);
    setErrors({});
    setDate(new Date());
    if (ledCells.length !== 1) setSelectedCellId(null);
  };

  const selectedCell = ledCells.find((c) => c.id === selectedCellId);

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      enablePanDownToClose
      index={0}
      topInset={0}
      handleComponent={null}
      backgroundStyle={{ borderRadius: 0 }}
    >
      <BottomSheetView className="flex-1 bg-white">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="px-6 pt-7 pb-5">
            <View className="w-9 h-1 bg-red-600 rounded-full mb-3" />
            <Text className="text-3xl font-bold text-gray-900 tracking-tight">
              New Session
            </Text>
            <Text className="text-sm text-gray-400 mt-1">
              Create an attendance session for your cell
            </Text>
          </View>

          {!qrCodeValue ? (
            <View className="px-6 pb-10 gap-6">
              {/* Cell selector */}
              <View className="gap-2">
                <Text className="text-xs font-bold text-gray-400 tracking-widest">
                  CELL
                </Text>
                {ledCells.length === 0 ? (
                  <View className="p-4 bg-gray-100 rounded-xl items-center">
                    <Text className="text-gray-400 text-sm">
                      You are not leading any cells.
                    </Text>
                  </View>
                ) : ledCells.length === 1 ? (
                  <View className="bg-red-50 border-2 border-red-600 rounded-xl py-3 px-4">
                    <Text className="text-red-600 font-semibold text-base">
                      {ledCells[0].name}
                    </Text>
                  </View>
                ) : (
                  <View className="flex-row flex-wrap gap-2">
                    {ledCells.map((cell) => (
                      <Pressable
                        key={cell.id}
                        className={`py-2.5 px-4 rounded-lg border-2 ${
                          selectedCellId === cell.id
                            ? "border-red-600 bg-red-50"
                            : "border-gray-200 bg-gray-50"
                        }`}
                        onPress={() => {
                          setSelectedCellId(cell.id);
                          setErrors((e) => ({ ...e, cell: undefined }));
                        }}
                      >
                        <Text
                          className={`text-sm font-semibold ${
                            selectedCellId === cell.id
                              ? "text-red-600"
                              : "text-gray-500"
                          }`}
                        >
                          {cell.name}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
                {errors.cell && (
                  <Text className="text-xs text-red-600 mt-1">
                    {errors.cell}
                  </Text>
                )}
              </View>

              {/* Date picker */}
              <View className="gap-2">
                <Text className="text-xs font-bold text-gray-400 tracking-widest">
                  DATE
                </Text>
                <Pressable
                  className="flex-row justify-between items-center border-2 border-gray-200 rounded-xl py-3.5 px-4"
                  onPress={() => setShowPicker(true)}
                >
                  <Text className="text-base text-gray-800 font-medium">
                    {date.toDateString()}
                  </Text>
                  <Text className="text-lg">📅</Text>
                </Pressable>
                {errors.date && (
                  <Text className="text-xs text-red-600 mt-1">
                    {errors.date}
                  </Text>
                )}
                {showPicker && (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="spinner"
                    minimumDate={new Date()}
                    onChange={handleDateChange}
                  />
                )}
              </View>

              {/* Submit */}
              <Pressable
                className={`bg-red-600 rounded-xl py-4 items-center mt-2 ${
                  isPending || ledCells.length === 0 ? "opacity-50" : ""
                }`}
                onPress={handleCreateSession}
                disabled={isPending || ledCells.length === 0}
              >
                {isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-bold text-base">
                    Create Session
                  </Text>
                )}
              </Pressable>
            </View>
          ) : (
            /* Success state */
            <View className="items-center px-6 pt-4 pb-10 gap-4">
              <View className="w-16 h-16 rounded-full bg-red-50 border-2 border-red-600 items-center justify-center">
                <Text className="text-3xl text-red-600">✓</Text>
              </View>
              <Text className="text-2xl font-bold text-gray-900">
                Session Created
              </Text>
              <Text className="text-sm text-gray-400">
                {selectedCell?.name} · {date.toDateString()}
              </Text>

              <View
                className="p-5 bg-white rounded-3xl mt-2"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.08,
                  shadowRadius: 12,
                  elevation: 4,
                }}
              >
                <QRCode value={qrCodeValue} size={200} />
              </View>

              <Text className="text-xs text-gray-400 text-center mt-1">
                Members scan this to mark attendance
              </Text>

              <Pressable
                className="border-2 border-red-600 rounded-xl py-3.5 px-8 mt-3"
                onPress={handleReset}
              >
                <Text className="text-red-600 font-bold text-base">
                  Create Another
                </Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

CreateSessionSheet.displayName = "CreateSessionSheet";
export default CreateSessionSheet;
