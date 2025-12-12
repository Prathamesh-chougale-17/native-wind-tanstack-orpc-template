import { View, Text, Pressable, ScrollView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { authClient } from "@/lib/auth-client";
import { useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Container } from "@/components/container";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const backgroundColor = useThemeColor("background");
  const foregroundColor = useThemeColor("foreground");
  const accentColor = useThemeColor("accent");
  const mutedColor = useThemeColor("muted");
  const surfaceColor = useThemeColor("surface");
  const successColor = useThemeColor("success");

  const getInitials = (name: string | undefined): string => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleBack = () => {
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  return (
    <Container>
      <View className="flex-1 bg-background px-2">
        {/* Profile Avatar Section */}
        <View className="items-center mt-4 mb-8">
          <View className="w-24 h-24 bg-linear-to-br from-accent to-accent/60 rounded-2xl items-center justify-center mb-4 shadow-lg">
            <Text className="text-4xl font-bold text-background">
              {getInitials(session?.user?.name)}
            </Text>
          </View>
          <Text className="text-3xl font-bold text-foreground mb-1">
            {session?.user?.name}
          </Text>
          <View className="flex-row items-center gap-1 bg-success/10 px-3 py-1 rounded-full border border-success/20">
            <View className="w-2 h-2 bg-success rounded-full" />
            <Text className="text-xs font-medium text-success">Active</Text>
          </View>
        </View>

        {/* Basic Information Card */}
        <View className="bg-surface rounded-2xl border border-divider overflow-hidden mb-6">
          <View className="px-4 py-4 border-b border-divider">
            <Text className="text-lg font-bold text-foreground">
              Basic Information
            </Text>
          </View>

          {/* Full Name */}
          <View className="px-4 py-4 border-b border-divider flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 bg-accent/20 rounded-lg items-center justify-center mr-3">
                <Ionicons name="person" size={20} color={accentColor} />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-muted mb-1">Full Name</Text>
                <Text className="text-base font-semibold text-foreground">
                  {session?.user?.name}
                </Text>
              </View>
            </View>
            <Ionicons name="pencil" size={18} color={mutedColor} />
          </View>

          {/* Email */}
          <View className="px-4 py-4 border-b border-divider flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 bg-blue-500/20 rounded-lg items-center justify-center mr-3">
                <Ionicons name="mail" size={20} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-muted mb-1">Email Address</Text>
                <Text className="text-base font-semibold text-foreground wrap-break-word">
                  {session?.user?.email}
                </Text>
              </View>
            </View>
            <Ionicons name="checkmark-circle" size={18} color={successColor} />
          </View>

          {/* Email Verified */}
          <View className="px-4 py-4 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 bg-success/20 rounded-lg items-center justify-center mr-3">
                <Ionicons
                  name="shield-checkmark"
                  size={20}
                  color={successColor}
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-muted mb-1">
                  Email Verification
                </Text>
                <Text className="text-base font-semibold text-success">
                  Verified
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Account Stats */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-foreground mb-4">
            Account Stats
          </Text>
          <View className="flex-row gap-3">
            <View className="flex-1 bg-surface rounded-2xl p-4 border border-divider items-center">
              <Ionicons name="calendar" size={24} color={accentColor} />
              <Text className="text-xs text-muted mt-2 mb-1">Member Since</Text>
              <Text className="text-sm font-bold text-foreground">
                {session?.user?.createdAt
                  ? new Date(session.user.createdAt as any).toLocaleDateString()
                  : "N/A"}
              </Text>
            </View>

            <View className="flex-1 bg-surface rounded-2xl p-4 border border-divider items-center">
              <Ionicons
                name="shield-checkmark"
                size={24}
                color={successColor}
              />
              <Text className="text-xs text-muted mt-2 mb-1">Status</Text>
              <Text className="text-sm font-bold text-foreground">Active</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-foreground mb-4">
            Quick Actions
          </Text>

          <View className="gap-3">
            {/* Change Password */}
            <Pressable className="bg-surface rounded-2xl p-4 border border-divider flex-row items-center active:opacity-70">
              <View className="w-10 h-10 bg-purple-500/20 rounded-lg items-center justify-center mr-3">
                <Ionicons name="key" size={20} color="#a855f7" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">
                  Change Password
                </Text>
                <Text className="text-xs text-muted">Update your security</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={mutedColor} />
            </Pressable>

            {/* Privacy Settings */}
            <Pressable className="bg-surface rounded-2xl p-4 border border-divider flex-row items-center active:opacity-70">
              <View className="w-10 h-10 bg-orange-500/20 rounded-lg items-center justify-center mr-3">
                <Ionicons name="lock-closed" size={20} color="#f97316" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">
                  Privacy Settings
                </Text>
                <Text className="text-xs text-muted">Control your data</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={mutedColor} />
            </Pressable>

            {/* Notifications */}
            <Pressable className="bg-surface rounded-2xl p-4 border border-divider flex-row items-center active:opacity-70">
              <View className="w-10 h-10 bg-cyan-500/20 rounded-lg items-center justify-center mr-3">
                <Ionicons name="notifications" size={20} color="#06b6d4" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">
                  Notification Settings
                </Text>
                <Text className="text-xs text-muted">Manage preferences</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={mutedColor} />
            </Pressable>
          </View>
        </View>

        {/* Danger Zone */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-red-500 mb-4">
            Danger Zone
          </Text>

          <Pressable className="bg-red-500/10 rounded-2xl p-4 border border-red-500/20 flex-row items-center active:opacity-70">
            <View className="w-10 h-10 bg-red-500/20 rounded-lg items-center justify-center mr-3">
              <Ionicons name="trash" size={20} color="#ef4444" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-red-500">
                Delete Account
              </Text>
              <Text className="text-xs text-red-400">
                Permanently delete your account
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ef4444" />
          </Pressable>
        </View>

        {/* Footer */}
        <View className="items-center py-6 border-t border-divider">
          <Text className="text-xs text-muted text-center">
            Last updated: {new Date().toLocaleDateString()}
          </Text>
        </View>
      </View>
    </Container>
  );
}
