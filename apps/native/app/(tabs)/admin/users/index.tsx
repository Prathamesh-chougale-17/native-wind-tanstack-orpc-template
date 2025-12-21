import { View, Text, Pressable, ScrollView, RefreshControl, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { Container } from "@/components/container";
import { orpcClient, queryClient } from "@/utils/orpc";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";

export default function UsersManagementScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const foregroundColor = useThemeColor("foreground");
  const accentColor = useThemeColor("accent");
  const mutedColor = useThemeColor("muted");

  // Fetch all users
  const { data: usersData, refetch: refetchUsers } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => orpcClient.admin.getAllUsers(),
  });

  // Fetch all organizations
  const { data: orgsData } = useQuery({
    queryKey: ["admin-organizations"],
    queryFn: () => orpcClient.admin.getAllOrganizations(),
  });

  const users = usersData?.users || [];
  const organizations = orgsData?.organizations || [];

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchUsers();
    setRefreshing(false);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-500/20";
      case "org":
        return "bg-blue-500/20";
      default:
        return "bg-accent/20";
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
        return "briefcase";
      default:
        return "person";
    }
  };

  const getOrganizationName = (orgId?: string) => {
    if (!orgId) return "No Organization";
    const org = organizations.find((o: any) => o.id === orgId);
    return org?.name || "Unknown Organization";
  };

  const roleStats = {
    total: users.length,
    admins: users.filter((u: any) => u.role === "admin").length,
    orgs: users.filter((u: any) => u.role === "org").length,
    users: users.filter((u: any) => u.role === "user" || !u.role).length,
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
          <View className="flex-row items-center mb-4">
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 bg-surface rounded-xl items-center justify-center active:opacity-70"
            >
              <Ionicons name="arrow-back" size={20} color={foregroundColor} />
            </Pressable>
          </View>

          <Text className="text-4xl font-bold text-foreground mb-2">
            User Management
          </Text>
          <Text className="text-muted text-base">
            Manage user roles and organization assignments
          </Text>
        </View>

        {/* Stats Grid */}
        <View className="mb-6 px-2">
          <Text className="text-xl font-bold text-foreground mb-4">
            User Statistics
          </Text>

          <View className="flex-row flex-wrap gap-3">
            <View
              className="bg-surface rounded-2xl p-4 border border-divider"
              style={{ width: "48%" }}
            >
              <View className="flex-row items-center justify-between mb-2">
                <Ionicons name="people" size={24} color={accentColor} />
                <Text className="text-2xl font-bold text-foreground">
                  {roleStats.total}
                </Text>
              </View>
              <Text className="text-muted text-xs">Total Users</Text>
            </View>

            <View
              className="bg-purple-500/10 rounded-2xl p-4 border border-purple-500/20"
              style={{ width: "48%" }}
            >
              <View className="flex-row items-center justify-between mb-2">
                <Ionicons name="shield-checkmark" size={24} color="#a855f7" />
                <Text className="text-2xl font-bold" style={{ color: "#a855f7" }}>
                  {roleStats.admins}
                </Text>
              </View>
              <Text className="text-purple-400 text-xs">Admins</Text>
            </View>

            <View
              className="bg-blue-500/10 rounded-2xl p-4 border border-blue-500/20"
              style={{ width: "48%" }}
            >
              <View className="flex-row items-center justify-between mb-2">
                <Ionicons name="briefcase" size={24} color="#3b82f6" />
                <Text className="text-2xl font-bold" style={{ color: "#3b82f6" }}>
                  {roleStats.orgs}
                </Text>
              </View>
              <Text className="text-blue-400 text-xs">Org Members</Text>
            </View>

            <View
              className="bg-accent/10 rounded-2xl p-4 border border-accent/20"
              style={{ width: "48%" }}
            >
              <View className="flex-row items-center justify-between mb-2">
                <Ionicons name="person" size={24} color={accentColor} />
                <Text className="text-2xl font-bold text-accent">
                  {roleStats.users}
                </Text>
              </View>
              <Text className="text-accent text-xs">Regular Users</Text>
            </View>
          </View>
        </View>

        {/* Users List */}
        <View className="mb-6 px-2">
          <Text className="text-xl font-bold text-foreground mb-4">
            All Users
          </Text>

          {users.length === 0 ? (
            <View className="bg-surface rounded-2xl p-8 border border-divider items-center">
              <View className="w-16 h-16 bg-muted/20 rounded-2xl items-center justify-center mb-4">
                <Ionicons name="people-outline" size={32} color={mutedColor} />
              </View>
              <Text className="text-foreground font-semibold text-lg mb-2">
                No Users Found
              </Text>
              <Text className="text-muted text-center">
                No users are registered in the system yet
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {users.map((user: any, index: number) => (
                <Pressable
                  key={user.id || index}
                  onPress={() => router.push(`/(tabs)/admin/users/${user.id}`)}
                  className="bg-surface rounded-2xl border border-divider overflow-hidden active:opacity-70"
                >
                  <View className="p-4">
                    <View className="flex-row items-start mb-3">
                      {/* Avatar */}
                      <View className={`w-14 h-14 ${getRoleBadgeColor(user.role)} rounded-xl items-center justify-center mr-3`}>
                        <Text className="font-bold text-xl" style={{ color: getRoleTextColor(user.role) }}>
                          {user.name?.charAt(0).toUpperCase() || "U"}
                        </Text>
                      </View>

                      {/* User Info */}
                      <View className="flex-1">
                        <Text className="text-foreground font-bold text-base mb-1">
                          {user.name}
                        </Text>
                        <Text className="text-muted text-sm mb-2" numberOfLines={1}>
                          {user.email}
                        </Text>

                        {/* Role Badge */}
                        <View className="flex-row items-center gap-2">
                          <View className={`${getRoleBadgeColor(user.role)} px-3 py-1 rounded-lg flex-row items-center`}>
                            <Ionicons
                              name={getRoleIcon(user.role) as any}
                              size={14}
                              color={getRoleTextColor(user.role)}
                              style={{ marginRight: 4 }}
                            />
                            <Text
                              className="font-semibold text-xs capitalize"
                              style={{ color: getRoleTextColor(user.role) }}
                            >
                              {user.role || "user"}
                            </Text>
                          </View>

                          {user.emailVerified && (
                            <View className="bg-green-500/20 px-2 py-1 rounded-lg flex-row items-center">
                              <Ionicons name="checkmark-circle" size={12} color="#22c55e" style={{ marginRight: 3 }} />
                              <Text className="text-green-500 text-xs font-medium">
                                Verified
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>

                      <Ionicons name="chevron-forward" size={20} color={mutedColor} />
                    </View>

                    {/* Organization Info */}
                    {user.organizationId && (
                      <View className="bg-blue-500/10 rounded-lg p-3 flex-row items-center">
                        <Ionicons name="business" size={16} color="#3b82f6" style={{ marginRight: 6 }} />
                        <Text className="text-blue-400 text-xs flex-1">
                          {getOrganizationName(user.organizationId)}
                        </Text>
                      </View>
                    )}

                    {/* Member Since */}
                    <View className="mt-3 flex-row items-center">
                      <Ionicons name="calendar-outline" size={14} color={mutedColor} />
                      <Text className="text-muted text-xs ml-1">
                        Member since {new Date(user.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Footer */}
        <View className="border-t border-divider pt-6 pb-12 px-2">
          <Text className="text-muted text-xs text-center">
            Click on a user to manage their role and organization
          </Text>
        </View>
      </ScrollView>
    </Container>
  );
}
