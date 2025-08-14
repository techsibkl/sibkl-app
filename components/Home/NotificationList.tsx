import { View, Text } from "react-native";
import React from "react";
import { FlashList } from "@shopify/flash-list";

type NotificationListProps = {
  notifications: any[];
};

const NotificationList = ({ notifications }: NotificationListProps) => {
  return (
    <FlashList
      data={notifications}
      renderItem={({ item: notification }) => (
        <View
          key={notification.id}
          className="flex-row justify-between notifications-center py-4 border-border dark:border-border-dark border-b"
        >
          <View className="flex-1">
            <Text className="mb-0.5 text-text-tertiary text-xs">
              {notification.type}
            </Text>
            <Text className="mb-1 text-text-tertiary text-xs">
              {notification.timeAgo}
            </Text>
            <Text className="font-semibold text-text">
              {notification.title}
            </Text>
          </View>
        </View>
      )}
    />
  );
};

export default NotificationList;
