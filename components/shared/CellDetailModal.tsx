import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  Image,
  Animated,
  PanResponder,
} from "react-native";
import {
  ChevronUp,
  Clock,
  MapPin,
  Users,
  Calendar,
  Tag,
} from "lucide-react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

const ACCENT = "#d6361e";

// Sheet sizing — these three numbers define the whole feel of the gesture.
const PEEK_HEIGHT = SCREEN_HEIGHT * 0.4;
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.82;
const CLOSE_THRESHOLD = PEEK_HEIGHT * 0.55;
const SIDE_MARGIN = 10;
const BOTTOM_MARGIN = 16;

interface CellDetailModalProps {
  visible: boolean;
  onClose: () => void;
  cell: any;
}

const StatItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
}) => {
  if (!value) return null;
  return (
    <View style={styles.statItem}>
      {icon}
      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
};

const CellDetailModal: React.FC<CellDetailModalProps> = ({
  visible,
  onClose,
  cell,
}) => {
  const heightAnim = useRef(new Animated.Value(0)).current;
  const currentHeightRef = useRef(0);
  const dragStartHeight = useRef(PEEK_HEIGHT);

  useEffect(() => {
    const id = heightAnim.addListener(({ value }) => {
      currentHeightRef.current = value;
    });
    return () => heightAnim.removeListener(id);
  }, [heightAnim]);

  useEffect(() => {
    if (visible) {
      heightAnim.setValue(0);
      requestAnimationFrame(() => snapTo(PEEK_HEIGHT));
    }
  }, [visible]);

  const snapTo = (target: number) => {
    Animated.spring(heightAnim, {
      toValue: target,
      useNativeDriver: false,
      bounciness: 4,
      speed: 14,
    }).start();
  };

  const closeSheet = () => {
    Animated.timing(heightAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => onClose());
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dy) > Math.abs(g.dx) && Math.abs(g.dy) > 4,
      onPanResponderGrant: () => {
        dragStartHeight.current = currentHeightRef.current;
      },
      onPanResponderMove: (_, gesture) => {
        const newHeight = dragStartHeight.current - gesture.dy;
        const clamped = Math.max(
          CLOSE_THRESHOLD * 0.6,
          Math.min(EXPANDED_HEIGHT, newHeight)
        );
        heightAnim.setValue(clamped);
      },
      onPanResponderRelease: (_, gesture) => {
        const released = dragStartHeight.current - gesture.dy;
        if (released < CLOSE_THRESHOLD) {
          closeSheet();
        } else if (released > (PEEK_HEIGHT + EXPANDED_HEIGHT) / 2) {
          snapTo(EXPANDED_HEIGHT);
        } else {
          snapTo(PEEK_HEIGHT);
        }
      },
    })
  ).current;

  if (!cell) return null;

  const gallery: string[] = cell.images?.length
    ? cell.images
    : cell.image_url
    ? [cell.image_url]
    : [];

  const backdropOpacity = heightAnim.interpolate({
    inputRange: [0, PEEK_HEIGHT],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  return (
    <Modal
      animationType="none"
      transparent
      visible={visible}
      onRequestClose={closeSheet}
    >
      <View style={styles.overlay}>
        {/* Backdrop — tap to dismiss */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={closeSheet}
        >
          <Animated.View
            style={[styles.backdrop, { opacity: backdropOpacity }]}
          />
        </TouchableOpacity>

        {/* Floating sheet */}
        <Animated.View style={[styles.sheet, { height: heightAnim }]}>
          {/* Drag zone — handle, compact header, stat row. Always visible. */}
          <View {...panResponder.panHandlers}>
            <View style={styles.handleBar} />

            <View style={styles.headerRow}>
              {gallery.length > 0 ? (
                <Image source={{ uri: gallery[0] }} style={styles.thumb} />
              ) : (
                <View style={[styles.thumb, styles.thumbFallback]}>
                  <Users size={20} color="#ffffff" strokeWidth={1.5} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.title} numberOfLines={1}>
                  {cell?.cell_name || "Cell Details"}
                </Text>
                {cell.cell_character && (
                  <Text style={styles.subtitle} numberOfLines={1}>
                    {cell.cell_character}
                  </Text>
                )}
              </View>
              <TouchableOpacity style={styles.joinButton}>
                <Text style={styles.joinButtonText}>Join +</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.statRow}>
              <StatItem
                icon={<Calendar size={16} color={ACCENT} strokeWidth={2} />}
                label="DAY"
                value={cell.meeting_day}
              />
              <View style={styles.statDivider} />
              <StatItem
                icon={<Clock size={16} color={ACCENT} strokeWidth={2} />}
                label="TIME"
                value={cell.meeting_time}
              />
              <View style={styles.statDivider} />
              <StatItem
                icon={<Tag size={16} color={ACCENT} strokeWidth={2} />}
                label="AGE GROUP"
                value={cell.age_group}
              />
            </View>
          </View>

          {/* Scrollable detail content — fills in as the sheet expands */}
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {gallery.length > 1 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.gallery}
                contentContainerStyle={{ paddingRight: 20 }}
              >
                {gallery.slice(1).map((uri, i) => (
                  <Image
                    key={i}
                    source={{ uri }}
                    style={styles.galleryImage}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            )}

            {cell.cell_description && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>About</Text>
                <Text style={styles.sectionContent}>
                  {cell.cell_description}
                </Text>
              </View>
            )}

            {cell.frequency && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Frequency</Text>
                <Text style={styles.sectionContent}>{cell.frequency}</Text>
              </View>
            )}

            {cell.address && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Location</Text>
                <View style={styles.infoRow}>
                  <MapPin size={16} color={ACCENT} strokeWidth={2} />
                  <Text style={[styles.sectionContent, { flex: 1 }]}>
                    {cell.address}
                  </Text>
                </View>
              </View>
            )}

            {(cell.cell_leader_1_name || cell.cell_leader_2_name) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Leaders</Text>
                {[cell.cell_leader_1_name, cell.cell_leader_2_name]
                  .filter(Boolean)
                  .map((name, i) => (
                    <View key={i} style={styles.leaderRow}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarInitial}>
                          {name?.charAt(0)}
                        </Text>
                      </View>
                      <Text style={styles.leaderName}>{name}</Text>
                    </View>
                  ))}
              </View>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    marginHorizontal: SIDE_MARGIN,
    marginBottom: BOTTOM_MARGIN,
    backgroundColor: "#ffffff",
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#e0e0e3",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 18,
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  thumbFallback: {
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1c1c1e",
  },
  subtitle: {
    fontSize: 13,
    color: "#8e8e93",
    marginTop: 1,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderColor: "#f0f0f1",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: "#f0f0f1",
  },
  statValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1c1c1e",
    marginTop: 2,
  },
  statLabel: {
    fontSize: 10,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  gallery: {
    marginBottom: 8,
  },
  galleryImage: {
    width: SCREEN_WIDTH * 0.55,
    height: 130,
    borderRadius: 12,
    marginRight: 12,
  },
  section: {
    marginTop: 22,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1c1c1e",
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 14,
    color: "#3c3c43",
    lineHeight: 21,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  leaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#fde8e4",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 14,
    fontWeight: "700",
    color: ACCENT,
  },
  leaderName: {
    fontSize: 14,
    color: "#1c1c1e",
    fontWeight: "500",
  },
  joinButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  joinButtonText: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
  },
});

export default CellDetailModal;
