import { useState } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import { authClient } from "@/lib/auth-client";
import { useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ProfileDrawer } from "./profile-drawer";

export function Header() {
  const { data: session } = authClient.useSession();
  const [profileDrawerVisible, setProfileDrawerVisible] = useState(false);

  const foregroundColor = useThemeColor("foreground");
  const mutedColor = useThemeColor("muted");
  const accentColor = useThemeColor("accent");
  const backgroundColor = useThemeColor("background");

  return (
    <>
      <View className="bg-surface border-b border-divider">
        <View className="p-2 flex-row items-center justify-between">
          {/* Left Section - Logo/Branding */}
          <View className="flex-row items-center gap-3 flex-1">
            <View className="w-10 h-10 bg-linear-to-br from-accent to-accent/60 rounded-lg items-center justify-center">
              <Ionicons name="sparkles" size={22} color={backgroundColor} />
            </View>
            <View>
              <Text className="text-lg font-bold text-foreground">
                NativeApp
              </Text>
              <Text className="text-xs text-muted">Premium Experience</Text>
            </View>
          </View>

          {/* Right Section - Notification and Profile */}
          <View className="flex-row items-center gap-2">
            {/* Notification Button */}
            <Pressable
              className="w-10 h-10 rounded-lg bg-background/50 items-center justify-center active:opacity-70"
              onPress={() => {
                if (Platform.OS === "ios") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
            >
              <Ionicons
                name="notifications-outline"
                size={20}
                color={foregroundColor}
              />
              <View className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Pressable>

            {/* Profile Button */}
            <Pressable
              className="flex-row items-center gap-2 pl-2 pr-1 h-10 rounded-lg bg-background/50 active:opacity-70"
              onPress={() => {
                if (Platform.OS === "ios") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setProfileDrawerVisible(true);
              }}
            >
              <View className="w-7 h-7 bg-linear-to-br from-accent/80 to-accent/40 rounded-full items-center justify-center">
                <Text className="text-xs font-bold text-background">
                  {session?.user?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() || "U"}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={16} color={mutedColor} />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Profile Drawer */}
      <ProfileDrawer
        visible={profileDrawerVisible}
        onClose={() => setProfileDrawerVisible(false)}
      />
    </>
  );
}
