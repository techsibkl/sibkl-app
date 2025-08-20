import { useRouter } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';

export default function Index() {
  const router = useRouter();

 

  // Show loading spinner while determining auth state
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Inside Index.tsx</Text>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}