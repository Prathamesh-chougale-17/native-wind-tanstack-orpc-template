import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { authClient } from "@/lib/auth-client";
import { useThemeColor } from "heroui-native";

export default function RootIndex() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const accentColor = useThemeColor("accent");

  useEffect(() => {
    if (!isPending) {
      if (session) {
        // Redirect authenticated users to tabs
        router.replace("/(tabs)");
      } else {
        // Redirect unauthenticated users to sign in
        router.replace("/(auth)/sign-in");
      }
    }
  }, [session, isPending, router]);

  return (
    <View className="flex-1 bg-background items-center justify-center">
      <ActivityIndicator size="large" color={accentColor} />
    </View>
  );
}
