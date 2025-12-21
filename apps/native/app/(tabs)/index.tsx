import { View, Text, Pressable, ScrollView, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { authClient } from "@/lib/auth-client";
import { useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { Container } from "@/components/container";
import { orpcClient } from "@/utils/orpc";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function HomeTab() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [refreshing, setRefreshing] = useState(false);

  const backgroundColor = useThemeColor("background");
  const foregroundColor = useThemeColor("foreground");
  const accentColor = useThemeColor("accent");
  const mutedColor = useThemeColor("muted");
  const successColor = useThemeColor("success");

  // Fetch user profile with role and organization
  const { data: profileData, refetch } = useQuery({
    queryKey: ["user-profile"],
    queryFn: () => orpcClient.user.getProfile(),
    enabled: !!session?.user,
  });

  const userRole = profileData?.user?.role || "user";
  const organization = profileData?.organization;

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-500/20 border-purple-500/40";
      case "org":
        return "bg-blue-500/20 border-blue-500/40";
      default:
        return "bg-accent/20 border-accent/40";
    }
  };

  const getRoleTextColor = (role: string) => {
    switch (role) {
      case "admin":
        return "#a855f7";
      case "org":
        return "#3b82f6";
      default:
        return accentColor;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return "shield-checkmark";
      case "org":
        return "business";
      default:
        return "person";
    }
  };

  return (
    <Container showHeader={true}>
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="mt-2 mb-6 px-2">
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-1">
              <Text className="text-4xl font-bold text-foreground mb-2">
                Welcome Back
              </Text>
              <Text className="text-accent font-semibold text-lg">
                {session?.user?.name}
              </Text>
            </View>
            <View className="w-16 h-16 bg-accent/20 rounded-2xl items-center justify-center">
              <Ionicons name="sparkles" size={32} color={accentColor} />
            </View>
          </View>

          {/* Role Badge */}
          <View
            className={`${getRoleBadgeColor(userRole)} rounded-xl p-4 border flex-row items-center mb-4`}
          >
            <View className="w-12 h-12 bg-white/10 rounded-xl items-center justify-center mr-3">
              <Ionicons
                name={getRoleIcon(userRole) as any}
                size={24}
                color={getRoleTextColor(userRole)}
              />
            </View>
            <View className="flex-1">
              <Text className="text-muted text-xs mb-1">Your Role</Text>
              <Text
                className="font-bold text-lg capitalize"
                style={{ color: getRoleTextColor(userRole) }}
              >
                {userRole}
              </Text>
            </View>
          </View>

          {/* Organization Info */}
          {organization && (
            <View className="bg-surface rounded-2xl p-4 border border-divider mb-4">
              <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 bg-blue-500/20 rounded-lg items-center justify-center mr-3">
                  <Ionicons name="business" size={20} color="#3b82f6" />
                </View>
                <View className="flex-1">
                  <Text className="text-muted text-xs mb-1">Organization</Text>
                  <Text className="text-foreground font-bold text-base">
                    {organization.name}
                  </Text>
                </View>
              </View>
              {organization.description && (
                <Text className="text-muted text-sm">
                  {organization.description}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View className="mb-6 px-2">
          <Text className="text-2xl font-bold text-foreground mb-4">
            Quick Actions
          </Text>

          <View className="gap-3">
            {/* Profile */}
            <Pressable
              onPress={() => router.push("/(tabs)/profile")}
              className="bg-surface rounded-2xl p-4 border border-divider flex-row items-center active:opacity-70"
            >
              <View className="w-12 h-12 bg-accent/20 rounded-xl items-center justify-center mr-4">
                <Ionicons name="person" size={24} color={accentColor} />
              </View>
              <View className="flex-1">
                <Text className="text-foreground font-semibold text-base">
                  My Profile
                </Text>
                <Text className="text-muted text-sm">
                  View and edit your profile
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={mutedColor} />
            </Pressable>

            {/* Organization (for org and admin) */}
            {(userRole === "org" || userRole === "admin") && (
              <Pressable
                onPress={() => router.push("/(tabs)/organization")}
                className="bg-surface rounded-2xl p-4 border border-divider flex-row items-center active:opacity-70"
              >
                <View className="w-12 h-12 bg-blue-500/20 rounded-xl items-center justify-center mr-4">
                  <Ionicons name="business" size={24} color="#3b82f6" />
                </View>
                <View className="flex-1">
                  <Text className="text-foreground font-semibold text-base">
                    Organization
                  </Text>
                  <Text className="text-muted text-sm">
                    View organization details
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={mutedColor} />
              </Pressable>
            )}

            {/* Admin Panel (for admin only) */}
            {userRole === "admin" && (
              <Pressable
                onPress={() => router.push("/(tabs)/admin")}
                className="bg-purple-500/10 rounded-2xl p-4 border border-purple-500/20 flex-row items-center active:opacity-70"
              >
                <View className="w-12 h-12 bg-purple-500/20 rounded-xl items-center justify-center mr-4">
                  <Ionicons name="settings" size={24} color="#a855f7" />
                </View>
                <View className="flex-1">
                  <Text className="text-foreground font-semibold text-base">
                    Admin Panel
                  </Text>
                  <Text className="text-muted text-sm">
                    Manage users and organizations
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#a855f7" />
              </Pressable>
            )}
          </View>
        </View>

        {/* Features */}
        <View className="mb-6 px-2">
          <Text className="text-2xl font-bold text-foreground mb-4">
            Features
          </Text>

          <View className="gap-4">
            <View className="bg-surface rounded-2xl p-4 border border-divider flex-row items-center">
              <View className="w-12 h-12 bg-success/20 rounded-xl items-center justify-center mr-4">
                <Ionicons
                  name="shield-checkmark"
                  size={24}
                  color={successColor}
                />
              </View>
              <View className="flex-1">
                <Text className="text-foreground font-semibold">
                  Role-Based Access
                </Text>
                <Text className="text-muted text-sm">
                  Secure access control system
                </Text>
              </View>
            </View>

            <View className="bg-surface rounded-2xl p-4 border border-divider flex-row items-center">
              <View className="w-12 h-12 bg-blue-500/20 rounded-xl items-center justify-center mr-4">
                <Ionicons name="people" size={24} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <Text className="text-foreground font-semibold">
                  Organization Management
                </Text>
                <Text className="text-muted text-sm">
                  Manage teams and members
                </Text>
              </View>
            </View>

            <View className="bg-surface rounded-2xl p-4 border border-divider flex-row items-center">
              <View className="w-12 h-12 bg-orange-500/20 rounded-xl items-center justify-center mr-4">
                <Ionicons name="flash" size={24} color="#f97316" />
              </View>
              <View className="flex-1">
                <Text className="text-foreground font-semibold">
                  Real-time Updates
                </Text>
                <Text className="text-muted text-sm">
                  Stay synced with your team
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View className="mb-6 px-2">
          <Text className="text-2xl font-bold text-foreground mb-4">
            Account Stats
          </Text>

          <View className="flex-row gap-3">
            <View className="flex-1 bg-surface rounded-2xl p-4 border border-divider items-center">
              <Ionicons name="shield-checkmark" size={28} color={successColor} />
              <Text className="text-xs text-muted mt-2 mb-1">Status</Text>
              <Text className="text-sm font-bold text-success">Active</Text>
            </View>

            <View className="flex-1 bg-surface rounded-2xl p-4 border border-divider items-center">
              <Ionicons name="calendar" size={28} color={accentColor} />
              <Text className="text-xs text-muted mt-2 mb-1">Member Since</Text>
              <Text className="text-sm font-bold text-foreground">
                {session?.user?.createdAt
                  ? new Date(session.user.createdAt as any).toLocaleDateString(
                      "en-US",
                      { month: "short", year: "numeric" }
                    )
                  : "N/A"}
              </Text>
            </View>

            <View className="flex-1 bg-surface rounded-2xl p-4 border border-divider items-center">
              <Ionicons
                name={getRoleIcon(userRole) as any}
                size={28}
                color={getRoleTextColor(userRole)}
              />
              <Text className="text-xs text-muted mt-2 mb-1">Role</Text>
              <Text
                className="text-sm font-bold capitalize"
                style={{ color: getRoleTextColor(userRole) }}
              >
                {userRole}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View className="border-t border-divider pt-6 pb-12 px-2">
          <Text className="text-muted text-xs text-center">
            🎉 Powered by Role-Based Authentication
          </Text>
          <Text className="text-muted text-xs text-center mt-2">
            Built with ORPC, Better Auth & TanStack Query
          </Text>
        </View>
      </ScrollView>
    </Container>
  );
}
