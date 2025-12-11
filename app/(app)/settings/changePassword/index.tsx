import auth from "@react-native-firebase/auth";
import React, { useState } from "react";
import { Alert, Button, Text, TextInput, View } from "react-native";
import ReauthModal from "./components/ReauthModel";

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showReauth, setShowReauth] = useState(false);

  const user = auth().currentUser;

  const handleSave = async () => {
    if (!user) return;

    // Basic validation
    if (newPassword !== confirmPassword) {
      return Alert.alert("Error", "New passwords do not match.");
    }

    try {
      // Try updating password first (may throw requires-recent-login)
      await user.updatePassword(newPassword);

      Alert.alert("Success", "Password updated successfully!");
    } catch (err: any) {
      if (err.code === "auth/requires-recent-login") {
        setShowReauth(true); // show re-auth modal
      } else {
        Alert.alert("Error", err.message);
      }
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 20 }}>
        Change Password
      </Text>

      <Text>Current Password</Text>
      <TextInput
        secureTextEntry
        value={currentPassword}
        onChangeText={setCurrentPassword}
        style={styles.input}
      />

      <Text>New Password</Text>
      <TextInput
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
        style={styles.input}
      />

      <Text>Confirm New Password</Text>
      <TextInput
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={styles.input}
      />

      <Button title="Save" onPress={handleSave} />

      {/* Re-authenticate modal */}
      {showReauth && (
        <ReauthModal
          onClose={() => setShowReauth(false)}
          onSuccess={async () => {
            setShowReauth(false);
            // After re-authenticate, retry password update
            try {
              await user.updatePassword(newPassword);
              Alert.alert("Success", "Password updated successfully!");
            } catch (e: any) {
              Alert.alert("Error", e.message);
            }
          }}
        />
      )}
    </View>
  );
}

const styles = {
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
};
