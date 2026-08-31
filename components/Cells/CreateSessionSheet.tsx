import { useCreateCellSessionMutation } from "@/hooks/CellAttendance/useCellAttendanceQuery";
import { formatLocalDate } from "@/utils/helper";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
// import DateTimePicker from "@react-native-community/datetimepicker";
import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { forwardRef, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import CalendarPicker from "react-native-calendar-picker";
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
  const router = useRouter();
  const snapPoints = useMemo(() => ["100%"], []);
  const [selectedCellId, setSelectedCellId] = useState<number | null>(
    ledCells.length === 1 ? ledCells[0].id : null,
  );
  const [date, setDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [qrCodeValue, setQrCodeValue] = useState<string | null>(null);
  const [insertedSessionId, setInsertedSessionId] = useState<number | null>(
    null,
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [sharing, setSharing] = useState(false);
  const qrRef = useRef<any>(null);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);

  const { mutateAsync: createSession, isPending } =
    useCreateCellSessionMutation(selectedCellId ?? 0);

  const handleShareQR = async (download = false) => {
    if (!qrRef.current || !insertedSessionId) return;
    setSharing(true);
    try {
      qrRef.current.toDataURL(async (dataUrl: string) => {
        try {
          const path = `${FileSystem.cacheDirectory}session-${insertedSessionId}-qr.png`;
          await FileSystem.writeAsStringAsync(path, dataUrl, {
            encoding: FileSystem.EncodingType.Base64,
          });
          await Sharing.shareAsync(path, {
            mimeType: "image/png",
            dialogTitle: download ? "Save QR Code" : "Share QR Code",
            UTI: "public.png", // iOS hint to treat as image
          });
        } catch (inner) {
          console.error("Share inner error:", inner);
        } finally {
          setSharing(false);
        }
      });
    } catch (err) {
      console.error("Share error:", err);
      setSharing(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!selectedCellId) newErrors.cell = "Please select a cell.";
    if (!date) {
      newErrors.date = "Please select a date.";
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) newErrors.date = "Date cannot be in the past.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateSession = async (force = false) => {
    if (!validate() || !date) return;

    // If duplicate warning is showing and user hasn't confirmed, don't proceed
    if (showDuplicateWarning && !force) return;

    setShowDuplicateWarning(false);
    try {
      const result = await createSession({
        meetingDate: formatLocalDate(date),
        force,
      });
      setInsertedSessionId(result.insertedId);
      setQrCodeValue(String(result.insertedId));
      onCreated?.(result.insertedId);
    } catch (err: any) {
      if (err?.err_code === "DUPLICATE_SESSION") {
        setShowDuplicateWarning(true); // ← show inline warning instead of error
      } else {
        setErrors({
          cell: err?.message ?? "Failed to create session. Please try again.",
        });
      }
    }
  };

  const handleDateChange = (selectedDate: Date) => {
    // CalendarPicker passes the date directly as first arg, no event
    setDate(selectedDate);
    setShowPicker(false);
    setErrors((e) => ({ ...e, date: undefined }));
  };

  const handleReset = () => {
    setQrCodeValue(null);
    setInsertedSessionId(null);
    setErrors({});
    setDate(null);
    setShowDuplicateWarning(false);
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
      enableDynamicSizing={false}
    >
      <BottomSheetScrollView className="flex-1 bg-white">
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
                    {date ? date.toDateString() : "Select a date"}
                  </Text>
                  <Text className="text-lg">📅</Text>
                </Pressable>
                {errors.date && (
                  <Text className="text-xs text-red-600 mt-1">
                    {errors.date}
                  </Text>
                )}
                {showPicker && (
                  // <DateTimePicker
                  //   value={date}
                  //   mode="date"
                  //   display="spinner"
                  //   minimumDate={new Date()}
                  //   onChange={handleDateChange}
                  // />
                  // <CalendarPicker onDateChange={handleDateChange} />
                  <View className="gap-2">
                    <Text className="text-xs font-bold text-gray-400 tracking-widest">
                      DATE
                    </Text>
                    <Pressable
                      className="flex-row justify-between items-center border-2 border-gray-200 rounded-xl py-3.5 px-4"
                      onPress={() => setShowPicker((prev) => !prev)}
                    >
                      <Text
                        className={`text-base font-medium ${date ? "text-gray-800" : "text-gray-400"}`}
                      >
                        {date ? date.toDateString() : "Select a date"}
                      </Text>
                      <Text className="text-lg">📅</Text>
                    </Pressable>
                    {errors.date && (
                      <Text className="text-xs text-red-600 mt-1">
                        {errors.date}
                      </Text>
                    )}
                    {showPicker && (
                      <View className="border-2 border-gray-100 rounded-xl overflow-hidden mt-1">
                        <CalendarPicker
                          onDateChange={handleDateChange}
                          minDate={new Date()}
                          selectedDayColor="#d6361e"
                          selectedDayTextColor="#ffffff"
                          todayBackgroundColor="#fff5f3"
                          todayTextStyle={{ color: "#d6361e" }}
                          textStyle={{ color: "#222" }}
                          previousTitleStyle={{ color: "#d6361e" }}
                          nextTitleStyle={{ color: "#d6361e" }}
                          monthTitleStyle={{ fontWeight: "700", color: "#111" }}
                          yearTitleStyle={{ fontWeight: "700", color: "#111" }}
                          {...(date ? { selectedStartDate: date } : {})}
                        />
                      </View>
                    )}
                  </View>
                )}
              </View>

              {/* Duplicate session warning */}
              {showDuplicateWarning && (
                <View className="bg-amber-50 border-2 border-amber-400 rounded-xl p-4 gap-3">
                  <Text className="text-amber-700 font-bold text-sm">
                    ⚠️ Session Already Exists
                  </Text>
                  <Text className="text-amber-600 text-sm leading-5">
                    A session for this cell on {date?.toDateString()} already
                    exists. Do you still want to create another one?
                  </Text>
                  <View className="flex-row gap-2 mt-1">
                    <Pressable
                      className="flex-1 border-2 border-amber-400 rounded-lg py-2.5 items-center"
                      onPress={() => setShowDuplicateWarning(false)}
                    >
                      <Text className="text-amber-600 font-semibold text-sm">
                        Cancel
                      </Text>
                    </Pressable>
                    <Pressable
                      className="flex-1 bg-amber-400 rounded-lg py-2.5 items-center"
                      onPress={() => handleCreateSession(true)}
                    >
                      <Text className="text-white font-bold text-sm">
                        Create Anyway
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}

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
                {selectedCell?.name} ·{" "}
                {date ? date.toDateString() : "Select a date"}
              </Text>

              {/* QR Code */}
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
                <QRCode
                  value={qrCodeValue}
                  size={200}
                  getRef={(ref) => (qrRef.current = ref)}
                />
              </View>

              <Text className="text-xs text-gray-400 text-center">
                Members scan this to mark attendance
              </Text>

              {/* Share + Download */}
              <View className="flex-row gap-3 w-full mt-1">
                <Pressable
                  className={`flex-1 bg-red-600 rounded-xl py-3.5 items-center ${
                    sharing ? "opacity-50" : ""
                  }`}
                  onPress={() => handleShareQR(false)}
                  disabled={sharing}
                >
                  {sharing ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text className="text-white font-bold text-base">
                      Share QR
                    </Text>
                  )}
                </Pressable>

                <Pressable
                  className={`flex-1 border-2 border-red-600 rounded-xl py-3.5 items-center ${
                    sharing ? "opacity-50" : ""
                  }`}
                  onPress={() => handleShareQR(true)}
                  disabled={sharing}
                >
                  <Text className="text-red-600 font-bold text-base">
                    Download PNG
                  </Text>
                </Pressable>
              </View>

              <Pressable
                className="border border-gray-200 rounded-xl py-3.5 px-8 mt-1 w-full items-center"
                onPress={handleReset}
              >
                <Text className="text-gray-400 font-semibold text-base">
                  Create Another
                </Text>
              </Pressable>

              <Pressable
                className="w-full items-center py-3.5"
                onPress={() => {
                  (ref as any)?.current?.dismiss();
                  router.push({
                    pathname: "/(app)/cells/sessions",
                    params: { cell_id: selectedCellId },
                  });
                }}
              >
                <Text className="text-red-600 font-semibold text-base">
                  View Sessions →
                </Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

CreateSessionSheet.displayName = "CreateSessionSheet";
export default CreateSessionSheet;
