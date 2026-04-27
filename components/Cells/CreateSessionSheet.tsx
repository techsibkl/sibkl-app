import { secureFetch } from "@/utils/secureFetch";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import DateTimePicker from "@react-native-community/datetimepicker";
import { forwardRef, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";

type CellOption = {
  id: number;
  name: string;
};

type CreateSessionSheetProps = {
  ledCells: CellOption[];
  onCreated?: (result: any) => void;
};

type FormErrors = {
  cell?: string;
  date?: string;
};

const CreateSessionSheet = forwardRef<
  BottomSheetModal,
  CreateSessionSheetProps
>(({ onCreated, ledCells }, ref) => {
  const snapPoints = useMemo(() => ["100%"], []);

  const [selectedCellId, setSelectedCellId] = useState<number | null>(
    ledCells.length === 1 ? ledCells[0].id : null,
  );
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [qrCodeValue, setQrCodeValue] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

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
    setIsLoading(true);
    try {
      const response = await secureFetch(
        `http://192.168.1.104:5001/leafy-loader-444703-d0/us-central1/cells/${selectedCellId}/create-cell-session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cell_id: selectedCellId,
            meeting_date: date.toISOString().split("T")[0],
          }),
        },
      );
      const result = await response.json();
      const sessionId = result?.data?.session_id ?? "default-session-id";
      setQrCodeValue(sessionId);
      onCreated?.(result);
    } catch (err) {
      console.error("Error creating session:", err);
      setErrors({ cell: "Failed to create session. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (_: any, selectedDate?: Date) => {
    if (selectedDate) setDate(selectedDate);
    setShowPicker(false);
    // Clear date error on change
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
    >
      <BottomSheetView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.accent} />
            <Text style={styles.title}>New Session</Text>
            <Text style={styles.subtitle}>
              Create an attendance session for your cell
            </Text>
          </View>

          {!qrCodeValue ? (
            <View style={styles.form}>
              {/* Cell Selector */}
              <View style={styles.field}>
                <Text style={styles.label}>CELL</Text>
                {ledCells.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>
                      You are not leading any cells.
                    </Text>
                  </View>
                ) : ledCells.length === 1 ? (
                  <View style={styles.singleCell}>
                    <Text style={styles.singleCellText}>
                      {ledCells[0].name}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.cellGrid}>
                    {ledCells.map((cell) => (
                      <Pressable
                        key={cell.id}
                        style={[
                          styles.cellChip,
                          selectedCellId === cell.id && styles.cellChipSelected,
                        ]}
                        onPress={() => {
                          setSelectedCellId(cell.id);
                          setErrors((e) => ({ ...e, cell: undefined }));
                        }}
                      >
                        <Text
                          style={[
                            styles.cellChipText,
                            selectedCellId === cell.id &&
                              styles.cellChipTextSelected,
                          ]}
                        >
                          {cell.name}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
                {errors.cell && (
                  <Text style={styles.errorText}>{errors.cell}</Text>
                )}
              </View>

              {/* Date Picker */}
              <View style={styles.field}>
                <Text style={styles.label}>DATE</Text>
                <Pressable
                  style={styles.dateButton}
                  onPress={() => setShowPicker(true)}
                >
                  <Text style={styles.dateButtonText}>
                    {date.toDateString()}
                  </Text>
                  <Text style={styles.dateIcon}>📅</Text>
                </Pressable>
                {errors.date && (
                  <Text style={styles.errorText}>{errors.date}</Text>
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
                style={[
                  styles.submitBtn,
                  (isLoading || ledCells.length === 0) &&
                    styles.submitBtnDisabled,
                ]}
                onPress={handleCreateSession}
                disabled={isLoading || ledCells.length === 0}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitText}>Create Session</Text>
                )}
              </Pressable>
            </View>
          ) : (
            /* Success State */
            <ScrollView style={styles.successContainer}>
              <View style={styles.successBadge}>
                <Text style={styles.successIcon}>✓</Text>
              </View>
              <Text style={styles.successTitle}>Session Created</Text>
              <Text style={styles.successSub}>
                {selectedCell?.name} · {date.toDateString()}
              </Text>

              <View style={styles.qrWrapper}>
                <QRCode value={qrCodeValue} size={200} />
              </View>

              <Text style={styles.qrHint}>
                Members scan this to mark attendance
              </Text>

              <Pressable style={styles.resetBtn} onPress={handleReset}>
                <Text style={styles.resetText}>Create Another</Text>
              </Pressable>
            </ScrollView>
          )}
        </ScrollView>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

CreateSessionSheet.displayName = "CreateSessionSheet";

export default CreateSessionSheet;

const RED = "#d6361e";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 20 },
  accent: {
    width: 36,
    height: 4,
    backgroundColor: RED,
    borderRadius: 2,
    marginBottom: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111",
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 14, color: "#888", marginTop: 4 },

  form: { paddingHorizontal: 24, paddingBottom: 40, gap: 24 },
  field: { gap: 8 },
  label: { fontSize: 11, fontWeight: "700", color: "#aaa", letterSpacing: 1.2 },

  singleCell: {
    backgroundColor: "#fff5f3",
    borderWidth: 1.5,
    borderColor: RED,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  singleCellText: { color: RED, fontWeight: "600", fontSize: 15 },

  cellGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  cellChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    backgroundColor: "#fafafa",
  },
  cellChipSelected: { borderColor: RED, backgroundColor: "#fff5f3" },
  cellChipText: { fontSize: 14, color: "#555", fontWeight: "500" },
  cellChipTextSelected: { color: RED, fontWeight: "700" },

  dateButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  dateButtonText: { fontSize: 15, color: "#222", fontWeight: "500" },
  dateIcon: { fontSize: 18 },

  errorText: { fontSize: 12, color: RED, marginTop: 2 },

  submitBtn: {
    backgroundColor: RED,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  emptyState: {
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    alignItems: "center",
  },
  emptyText: { color: "#999", fontSize: 14 },

  successContainer: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  successBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fff5f3",
    borderWidth: 2,
    borderColor: RED,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  successIcon: { fontSize: 28, color: RED },
  successTitle: { fontSize: 22, fontWeight: "700", color: "#111" },
  successSub: { fontSize: 14, color: "#888", marginTop: 4, marginBottom: 28 },
  qrWrapper: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  qrHint: { fontSize: 13, color: "#aaa", marginTop: 16, marginBottom: 28 },
  resetBtn: {
    borderWidth: 1.5,
    borderColor: RED,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  resetText: { color: RED, fontWeight: "700", fontSize: 15 },
});
