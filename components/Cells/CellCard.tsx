import { useRouter } from "expo-router";
import { ChevronRight, Users } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type CellCardProps = {
  cell: any;
};

const CellCard = ({ cell }: CellCardProps) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      className="rounded-2xl p-5 mb-4"
      style={{ backgroundColor: cell.backgroundColor }}
      onPress={() => router.push(`/cells/profile/${cell.id}`)}
      activeOpacity={0.8}
    >
      <View className=" flex-row ">
        <View className="flex-1 space-y-3">
          <View className="flex-row items-center justify-center flex-1 ">
            <View
              className="w-12 h-12 rounded-full justify-center items-center mr-4"
              style={{ backgroundColor: cell.iconColor }}
            >
              <Users size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-800 mb-1">
                {cell.name}
              </Text>
              <Text className="text-sm text-gray-600">{cell.subtitle}</Text>
            </View>
          </View>

          <View className=" py-1">
            <View className="">
              <View className="flex-row items-center ">
                {cell.members.slice(0, 4).map((member: any, index: any) => (
                  <View
                    key={index}
                    className="w-8 h-8 rounded-full bg-white justify-center items-center border-2 border-white"
                    style={{ marginLeft: index > 0 ? -8 : 0 }}
                  >
                    <Text className="text-base">{member}</Text>
                  </View>
                ))}
                <Text className="text-xs text-gray-600 font-medium ml-2">
                  {cell.memberCount}+
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View className="items-center justify-center">
          <TouchableOpacity className="w-10 h-10 rounded-full bg-white/30 justify-center items-center border border-white/20 border-dashed flex">
            <ChevronRight size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default CellCard;
