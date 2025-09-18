import React from "react";
import { SafeAreaView, Text } from "react-native";

const otp = () => {
  return (
    <SafeAreaView>
      <Text>OTP Verification Page</Text>
      <Text>We Sent an One Time Pin to {} Please Enter the OTP</Text>
      <Text>Did not receive? Send Again</Text>
    </SafeAreaView>
  );
};

export default otp;
