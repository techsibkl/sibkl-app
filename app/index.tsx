import { Redirect} from 'expo-router';

export default function Index() {

   return <Redirect href="/(auth)/sign-in" />;


  // Show loading spinner while determining auth state
  // return (
  //   <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
  //     <Text>Inside Index.tsx</Text>
  //     <ActivityIndicator size="large" color="#007AFF" />
  //   </View>
  // );
}