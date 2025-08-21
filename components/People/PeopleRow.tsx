import { Person } from "@/services/Person/person.type";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type PeopleRowProps = {
  person: Person;
};

const PeopleRowComponent = ({ person }: PeopleRowProps) => {
  const router = useRouter();

  const handlePress = useCallback(() => {
    console.log("supposed to redirect");
    router.push(`/people/profile/${person.id}`);
  }, []);

  return (
    <TouchableOpacity
      key={person.id}
      // style={styles.row}
      className="flex-row items-center py-6 border-b border-border-secondary 0"
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <View
        // style={styles.avatar}
        className="w-12 h-12 rounded-full bg-background mr-4 overflow-hidden"
      >
        <Image
          source={require("../../assets/images/person.png")}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>

      {/* Person Info */}
      <View className="flex-1">
        <Text
          // style={styles.name}
          className="text-text dark:text-text-dark-primary text-base font-medium mb-1"
        >
          {person.full_name}
        </Text>
        <Text
          // style={styles.phone}
          className="text-text-secondary text-sm"
        >
          {person.phone}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const PeopleRow = React.memo(PeopleRowComponent);
export default PeopleRow;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderColor: "#e5e5e5",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
    overflow: "hidden",
  },
  name: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  phone: {
    fontSize: 14,
    color: "#666",
  },
});
