import { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { authClient } from "@/lib/auth-client";
import { View } from "react-native";

export default function AuthLayout() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    // Redirect authenticated users to home
    if (!isPending && session) {
      router.replace("/");
    }
  }, [session, isPending, router]);

  // Show loading state while checking auth
  if (isPending) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <View className="w-12 h-12 rounded-full border-4 border-accent border-t-transparent animate-spin" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
    </Stack>
  );
}
