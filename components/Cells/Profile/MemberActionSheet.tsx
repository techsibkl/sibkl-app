import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  Animated,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
  Linking,
} from "react-native";
import { Phone, MessageCircle, Trash2 } from "lucide-react-native";
import { Person } from "@/services/Person/person.type";
import { useThemeColors } from "@/hooks/useThemeColor";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

const ACCENT = "#d6361e";
const PEEK_HEIGHT = SCREEN_HEIGHT * 0.28;
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.4;
const CLOSE_THRESHOLD = PEEK_HEIGHT * 0.5;
const SIDE_MARGIN = 10;
const BOTTOM_MARGIN = 16;
const DRAG_CAPTURE_SLOP = 6;

interface MemberActionSheetProps {
  visible: boolean;
  onClose: () => void;
  member: Person | null;
  cellId?: number;
  isLeader?: boolean;
  onRemove?: (memberId: number) => void;
}

const MemberActionSheet: React.FC<MemberActionSheetProps> = ({
  visible,
  onClose,
  member,
  cellId,
  isLeader = false,
  onRemove,
}) => {
  const { isDark } = useThemeColors();
  const heightAnim = useRef(new Animated.Value(0)).current;

  const currentHeightRef = useRef(0);
  const dragStartHeight = useRef(PEEK_HEIGHT);
  const isExpandedRef = useRef(false);

  const [isExpanded, setIsExpanded] = useState(false);

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
      dragStartHeight.current = PEEK_HEIGHT;
      isExpandedRef.current = false;
      setIsExpanded(false);
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
      markExpanded(target >= EXPANDED_HEIGHT * 0.95);
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

  if (!member) return null;

  const backdropOpacity = heightAnim.interpolate({
    inputRange: [0, PEEK_HEIGHT],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleCall = () => {
    if (member.phone) {
      Linking.openURL(`tel:${member.phone}`);
    }
  };

  const handleSMS = () => {
    if (member.phone) {
      Linking.openURL(`sms:${member.phone}`);
    }
  };

  const bgColor = isDark ? "#1f2937" : "#ffffff";
  const textColor = isDark ? "#f3f4f6" : "#1c1c1e";
  const secondaryTextColor = isDark ? "#d1d5db" : "#8e8e93";
  const actionBgColor = isDark ? "#374151" : "#f0f0f1";

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

        <Animated.View
          style={[
            styles.sheet,
            { height: heightAnim, backgroundColor: bgColor },
          ]}
        >
          {/* Header — draggable */}
          <View
            {...headerPanResponder.panHandlers}
            style={[styles.headerContainer, { backgroundColor: bgColor }]}
          >
            <View style={styles.handleBar} />

            {/* Avatar and Basic Info */}
            <View style={styles.content}>
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: ACCENT + "20" },
                ]}
              >
                <Text
                  style={[
                    styles.avatarText,
                    { color: ACCENT },
                  ]}
                >
                  {getInitials(member.full_legal_name || member.preferred_name || "?")}
                </Text>
              </View>

              <View style={styles.infoSection}>
                <Text
                  style={[styles.nameText, { color: textColor }]}
                  numberOfLines={1}
                >
                  {member.full_legal_name || member.preferred_name}
                </Text>
                {member.phone && (
                  <Text
                    style={[styles.phoneText, { color: secondaryTextColor }]}
                    numberOfLines={1}
                  >
                    {member.phone}
                  </Text>
                )}
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonsRow}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: actionBgColor }]}
                onPress={handleCall}
              >
                <Phone size={20} color={ACCENT} strokeWidth={2} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: actionBgColor }]}
                onPress={handleSMS}
              >
                <MessageCircle size={20} color={ACCENT} strokeWidth={2} />
              </TouchableOpacity>
              {isLeader && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: "#fee2e2" }]}
                  onPress={() => {
                    onRemove?.(member.id);
                    closeSheet();
                  }}
                >
                  <Trash2 size={20} color="#dc2626" strokeWidth={2} />
                </TouchableOpacity>
              )}
            </View>
          </View>
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
    marginBottom: 16,
  },
  headerContainer: {
    zIndex: 10,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingBottom: 16,
    gap: 14,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "700",
  },
  infoSection: {
    flex: 1,
  },
  nameText: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  phoneText: {
    fontSize: 13,
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 18,
    paddingBottom: 16,
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default MemberActionSheet;
