import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  Platform,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { authClient } from "@/lib/auth-client";
import { useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { SignOutConfirmDialog } from "./signout-dialog";
import { ThemeToggle } from "./theme-toggle";
import Animated, {
  FadeIn,
  SlideInRight,
  FadeOut,
  SlideOutRight,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

interface ProfileDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export function ProfileDrawer({ visible, onClose }: ProfileDrawerProps) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [signOutConfirm, setSignOutConfirm] = useState(false);

  const foregroundColor = useThemeColor("foreground");
  const mutedColor = useThemeColor("muted");
  const surfaceColor = useThemeColor("surface");
  const dangerColor = useThemeColor("danger");
  const backgroundColor = useThemeColor("background");
  const accentColor = useThemeColor("accent");

  const handleSignOut = async () => {
    setSignOutConfirm(false);
    await authClient.signOut();
    router.replace("/(auth)/sign-up");
  };

  const handleViewProfile = () => {
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onClose();
    router.push("/profile");
  };

  const getInitials = (name: string | undefined): string => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={onClose}
      >
        {/* Backdrop */}
        <Animated.View
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(300)}
          className="flex-1 bg-black/40"
        >
          <Pressable className="flex-1" onPress={onClose} />
        </Animated.View>

        {/* Drawer Panel */}
        <Animated.View
          entering={SlideInRight.duration(400)}
          exiting={SlideOutRight.duration(400)}
          className="absolute top-0 right-0 bottom-0 bg-surface w-80 border-l border-divider"
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            scrollEnabled={true}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            {/* Header */}
            <View className="px-6 py-6 border-b border-divider flex-row items-center justify-between">
              <Text className="text-2xl font-bold text-foreground">Menu</Text>
              <Pressable
                onPress={onClose}
                className="w-10 h-10 rounded-lg bg-background/50 items-center justify-center active:opacity-70"
              >
                <Ionicons name="close" size={24} color={foregroundColor} />
              </Pressable>
            </View>

            {/* User Profile Card */}
            <View className="px-6 py-6 border-b border-divider">
              <View className="flex-row items-center gap-4 mb-4">
                <View className="w-16 h-16 bg-linear-to-br from-accent/80 to-accent/40 rounded-full items-center justify-center">
                  <Text className="text-2xl font-bold text-background">
                    {getInitials(session?.user?.name)}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-foreground mb-1">
                    {session?.user?.name}
                  </Text>
                  <Text className="text-xs text-muted" numberOfLines={1}>
                    {session?.user?.email}
                  </Text>
                  <View className="flex-row items-center gap-1 bg-success/10 px-2 py-1 rounded-full border border-success/20 mt-2 w-fit">
                    <View className="w-2 h-2 bg-success rounded-full" />
                    <Text className="text-xs font-medium text-success">
                      Active
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Menu Items */}
            <View className="py-4">
              {/* View Profile */}
              <Pressable
                onPress={handleViewProfile}
                className="px-6 py-4 flex-row items-center active:bg-surface/80"
              >
                <View className="w-10 h-10 bg-accent/20 rounded-lg items-center justify-center mr-4">
                  <Ionicons name="person" size={20} color={accentColor} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground">
                    View Profile
                  </Text>
                  <Text className="text-xs text-muted">
                    Manage your information
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={mutedColor} />
              </Pressable>

              {/* Theme Selection */}
              <View className="px-6 py-4 border-t border-divider flex-row items-center gap-4 active:bg-surface/80">
                <View className="flex-row items-center gap-3 flex-1">
                  <View className="w-10 h-10 bg-purple-500/20 rounded-lg items-center justify-center">
                    <Ionicons name="moon" size={20} color="#a855f7" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground">
                      Theme
                    </Text>
                    <Text className="text-xs text-muted">Light / Dark</Text>
                  </View>
                </View>
                <ThemeToggle />
              </View>

              {/* Settings */}
              <Pressable className="px-6 py-4 flex-row items-center border-t border-divider active:bg-surface/80">
                <View className="w-10 h-10 bg-blue-500/20 rounded-lg items-center justify-center mr-4">
                  <Ionicons name="settings" size={20} color="#3b82f6" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground">
                    Settings
                  </Text>
                  <Text className="text-xs text-muted">App preferences</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={mutedColor} />
              </Pressable>

              {/* Help */}
              <Pressable className="px-6 py-4 flex-row items-center border-t border-divider active:bg-surface/80">
                <View className="w-10 h-10 bg-orange-500/20 rounded-lg items-center justify-center mr-4">
                  <Ionicons name="help-circle" size={20} color="#f97316" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground">
                    Help & Support
                  </Text>
                  <Text className="text-xs text-muted">FAQs & Contact</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={mutedColor} />
              </Pressable>

              {/* Notifications */}
              <Pressable className="px-6 py-4 flex-row items-center border-t border-divider active:bg-surface/80">
                <View className="w-10 h-10 bg-cyan-500/20 rounded-lg items-center justify-center mr-4">
                  <Ionicons name="notifications" size={20} color="#06b6d4" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground">
                    Notifications
                  </Text>
                  <Text className="text-xs text-muted">Manage alerts</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={mutedColor} />
              </Pressable>
            </View>

            {/* Divider */}
            <View className="h-px bg-divider" />

            {/* Sign Out */}
            <Pressable
              onPress={() => {
                if (Platform.OS === "ios") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }
                setSignOutConfirm(true);
              }}
              className="px-6 py-4 flex-row items-center active:bg-danger/10 border-t border-divider"
            >
              <View className="w-10 h-10 bg-danger/20 rounded-lg items-center justify-center mr-4">
                <Ionicons name="log-out" size={20} color={dangerColor} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-danger">
                  Sign Out
                </Text>
                <Text className="text-xs text-danger/70">
                  Exit your account
                </Text>
              </View>
            </Pressable>

            {/* Footer */}
            <View className="flex-1 justify-end px-6 py-6 border-t border-divider">
              <Text className="text-xs text-muted text-center mb-2">
                Version 1.0.0
              </Text>
              <Text className="text-xs text-muted text-center">
                © 2024 NativeApp. All rights reserved.
              </Text>
            </View>
          </ScrollView>
        </Animated.View>
      </Modal>

      {/* Sign Out Confirmation Dialog */}
      <SignOutConfirmDialog
        visible={signOutConfirm}
        onConfirm={handleSignOut}
        onCancel={() => setSignOutConfirm(false)}
      />
    </>
  );
}
