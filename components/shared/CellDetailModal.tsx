import React, { useRef, useState, useEffect } from "react";
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
  GestureResponderEvent,
  PanResponderGestureState,
} from "react-native";
import { Clock, MapPin, Users, Calendar, Tag } from "lucide-react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

const ACCENT = "#d6361e";

const PEEK_HEIGHT = SCREEN_HEIGHT * 0.42;
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.85;
const CLOSE_THRESHOLD = PEEK_HEIGHT * 0.55;
const SIDE_MARGIN = 10;
const BOTTOM_MARGIN = 16;
const DRAG_CAPTURE_SLOP = 6;

interface CellDetailModalProps {
  visible: boolean;
  onClose: () => void;
  cell: any;
  isJoined?: boolean;
  isLeader?: boolean;
  onManage?: () => void;
}

const StatItem = ({
  icon,
  label,
  value,
  caption,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  caption?: string;
}) => {
  if (!value) return null;
  return (
    <View style={styles.statItem}>
      {icon}
      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
      {caption && (
        <Text style={styles.statCaption} numberOfLines={1}>
          {caption}
        </Text>
      )}
    </View>
  );
};

const CellDetailModal: React.FC<CellDetailModalProps> = ({
  visible,
  onClose,
  cell,
  isJoined = false,
  isLeader = false,
  onManage,
}) => {
  const heightAnim = useRef(new Animated.Value(0)).current;
  const stickyHeaderAnim = useRef(new Animated.Value(0)).current;

  // Refs for gesture logic — always fresh, never stale
  const currentHeightRef = useRef(0);
  const dragStartHeight = useRef(PEEK_HEIGHT);
  const scrollOffsetRef = useRef(0);
  const isExpandedRef = useRef(false);
  const lastScrollOffsetRef = useRef(0);
  const lastScrollTimeRef = useRef(0);

  // State only for cosmetic updates (sticky header display)
  const [isExpanded, setIsExpanded] = useState(false);
  const [showStickyHeader, setShowStickyHeader] = useState(false);

  useEffect(() => {
    const id = heightAnim.addListener(({ value }) => {
      currentHeightRef.current = value;
    });
    return () => heightAnim.removeListener(id);
  }, [heightAnim]);

  useEffect(() => {
    if (visible) {
      heightAnim.setValue(0);
      currentHeightRef.current = 0;
      scrollOffsetRef.current = 0;
      lastScrollOffsetRef.current = 0;
      lastScrollTimeRef.current = 0;
      dragStartHeight.current = PEEK_HEIGHT;
      isExpandedRef.current = false;
      setIsExpanded(false);
      setShowStickyHeader(false);
      stickyHeaderAnim.setValue(0);
      requestAnimationFrame(() => snapTo(PEEK_HEIGHT));
    }
  }, [visible]);

  const markExpanded = (val: boolean) => {
    isExpandedRef.current = val;
    setIsExpanded(val);
  };

  const snapTo = (target: number) => {
    Animated.spring(heightAnim, {
      toValue: target,
      useNativeDriver: false,
      bounciness: 4,
      speed: 14,
    }).start(() => {
      dragStartHeight.current = target;
      currentHeightRef.current = target;
      markExpanded(target >= EXPANDED_HEIGHT * 0.99);
    });
  };

  const closeSheet = () => {
    Animated.timing(heightAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => onClose());
  };

  const onDragMove = (
    _: GestureResponderEvent,
    gesture: PanResponderGestureState
  ) => {
    const newHeight = dragStartHeight.current - gesture.dy;
    const clamped = Math.max(
      CLOSE_THRESHOLD * 0.6,
      Math.min(EXPANDED_HEIGHT, newHeight)
    );
    heightAnim.setValue(clamped);
  };

  const onDragRelease = (
    _: GestureResponderEvent,
    gesture: PanResponderGestureState
  ) => {
    const released = dragStartHeight.current - gesture.dy;
    const midpoint = (PEEK_HEIGHT + EXPANDED_HEIGHT) / 2;

    if (released < CLOSE_THRESHOLD) {
      closeSheet();
    } else if (released > midpoint) {
      snapTo(EXPANDED_HEIGHT);
    } else {
      snapTo(PEEK_HEIGHT);
    }
  };

  const headerPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dy) > Math.abs(g.dx) && Math.abs(g.dy) > DRAG_CAPTURE_SLOP,
      onPanResponderGrant: () => {
        dragStartHeight.current = currentHeightRef.current;
      },
      onPanResponderMove: onDragMove,
      onPanResponderRelease: onDragRelease,
      onPanResponderTerminate: onDragRelease,
    })
  ).current;

  // Capture-phase responder for content area — intercepts gestures
  // BEFORE ScrollView claims them, allowing sheet to collapse
  const contentPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponderCapture: (_, g) => {
        const draggingDown = g.dy > DRAG_CAPTURE_SLOP;
        const draggingUp = g.dy < -DRAG_CAPTURE_SLOP;
        const atTop = scrollOffsetRef.current <= 0;

        if (!isExpandedRef.current && (draggingDown || draggingUp)) {
          return true;
        }
        // When fully expanded, dragging down while at top allows closing
        if (isExpandedRef.current && draggingDown && atTop) {
          return true;
        }
        return false;
      },
      onPanResponderGrant: () => {
        dragStartHeight.current = currentHeightRef.current;
      },
      onPanResponderMove: onDragMove,
      onPanResponderRelease: onDragRelease,
      onPanResponderTerminate: onDragRelease,
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
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={closeSheet}
        >
          <Animated.View
            style={[styles.backdrop, { opacity: backdropOpacity }]}
          />
        </TouchableOpacity>

        <Animated.View style={[styles.sheet, { height: heightAnim }]}>
          {/* Header — always draggable */}
          <View
            {...headerPanResponder.panHandlers}
            style={styles.headerContainer}
          >
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
              {!isJoined && (
                <TouchableOpacity style={styles.joinButton}>
                  <Text style={styles.joinButtonText}>Join +</Text>
                </TouchableOpacity>
              )}
              {isJoined && isLeader && (
                <TouchableOpacity style={styles.joinButton} onPress={onManage}>
                  <Text style={styles.joinButtonText}>Manage</Text>
                </TouchableOpacity>
              )}
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
                icon={<Users size={16} color={ACCENT} strokeWidth={2} />}
                label="AGE GROUP"
                value={cell.age_group}
              />
            </View>
          </View>

          {/* Content — wrapped in capture-phase responder */}
          <View style={styles.scroll} {...contentPanResponder.panHandlers}>
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              scrollEnabled
              bounces={isExpanded}
              onScroll={(e) => {
                const currentOffset = e.nativeEvent.contentOffset.y;
                const now = Date.now();
                scrollOffsetRef.current = currentOffset;

                // Calculate scroll velocity
                const timeDiff = now - lastScrollTimeRef.current;
                if (timeDiff > 0) {
                  const offsetDiff = currentOffset - lastScrollOffsetRef.current;
                  const velocity = offsetDiff / timeDiff; // pixels per ms

                  // Only allow momentum snap at the very top of the list
                  if (currentOffset <= 0 && Math.abs(velocity) > 0.5) {
                    if (velocity > 0.5 && !isExpandedRef.current) {
                      // Scrolling down hard while NOT expanded -> expand
                      snapTo(EXPANDED_HEIGHT);
                    } else if (velocity < -0.5 && isExpandedRef.current) {
                      // Scrolling up hard while expanded -> close
                      snapTo(PEEK_HEIGHT);
                    }
                  }
                }

                lastScrollOffsetRef.current = currentOffset;
                lastScrollTimeRef.current = now;

                // Show sticky header when scrolled down
                if (currentOffset > 10) {
                  setShowStickyHeader(true);
                } else {
                  setShowStickyHeader(false);
                }
              }}
              scrollEventThrottle={16}
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

              {(cell.cell_description || cell.frequency) && (
                <View style={styles.summaryCard}>
                  {cell.cell_description && (
                    <View style={styles.summarySection}>
                      <Text style={styles.summaryLabel}>About</Text>
                      <Text style={styles.summaryContent}>
                        {cell.cell_description}
                      </Text>
                    </View>
                  )}

                  {cell.cell_description && cell.frequency && (
                    <View style={styles.summaryDivider} />
                  )}

                  {cell.frequency && (
                    <View style={styles.summarySection}>
                      <Text style={styles.summaryLabel}>Frequency</Text>
                      <Text style={styles.summaryContent}>
                        {cell.frequency}
                      </Text>
                    </View>
                  )}
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
          </View>

          {/* Sticky header — appears when scrolling content */}
          {showStickyHeader && (
            <Animated.View
              style={[styles.stickyHeader, { opacity: stickyHeaderAnim }]}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 18,
                  paddingVertical: 12,
                }}
              >
                <View>
                  <Text style={styles.stickyTitle} numberOfLines={1}>
                    {cell?.cell_name}
                  </Text>
                </View>
                {!isJoined && (
                  <TouchableOpacity style={styles.joinButton}>
                    <Text style={styles.joinButtonText}>Join +</Text>
                  </TouchableOpacity>
                )}
                {isJoined && isLeader && (
                  <TouchableOpacity style={styles.joinButton} onPress={onManage}>
                    <Text style={styles.joinButtonText}>Manage</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View
                style={{
                  height: 1,
                  backgroundColor: "#f0f0f1",
                }}
              />
            </Animated.View>
          )}
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
  headerContainer: {
    backgroundColor: "#ffffff",
    zIndex: 10,
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
  statCaption: {
    fontSize: 9,
    color: "#c2c2c6",
    fontStyle: "italic",
    marginTop: 1,
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
  summaryCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
    paddingHorizontal: 16,
    marginTop: 4,
  },
  summarySection: {
    paddingVertical: 14,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  summaryContent: {
    fontSize: 14,
    color: "#3c3c43",
    lineHeight: 20,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#e5e5ea",
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
  stickyHeader: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    zIndex: 5,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f1",
  },
  stickyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1c1c1e",
    maxWidth: SCREEN_WIDTH * 0.7,
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
