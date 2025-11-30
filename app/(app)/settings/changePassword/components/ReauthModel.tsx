// ReauthModal.tsx

import auth from "@react-native-firebase/auth";
import React, { useState } from "react";
import { Alert, Button, Modal, Text, TextInput, View } from "react-native";

export default function ReauthModal({ onClose, onSuccess }: any) {
  const [password, setPassword] = useState("");

  const handleReauth = async () => {
    const user = auth().currentUser;
    if (!user || !user.email) return;

    const credential = auth.EmailAuthProvider.credential(user.email, password);

    try {
      await user.reauthenticateWithCredential(credential);
      onSuccess();
    } catch (err: any) {
      Alert.alert("Re-authentication Failed", err.message);
    }
  };

  return (
    <Modal transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Verify Identity</Text>
          <Text style={{ marginBottom: 12 }}>
            Please enter your current password to continue.
          </Text>

          <TextInput
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            placeholder="Current password"
          />

          <Button title="Confirm" onPress={handleReauth} />
          <View style={{ height: 10 }} />
          <Button title="Cancel" color="red" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = {
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
};
