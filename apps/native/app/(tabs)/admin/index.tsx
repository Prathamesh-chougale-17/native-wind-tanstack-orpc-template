import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { Container } from "@/components/container";
import { authClient } from "@/lib/auth-client";
import { orpcClient } from "@/utils/orpc";
import { useQuery } from "@tanstack/react-query";

export default function AdminTab() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const foregroundColor = useThemeColor("foreground");
  const accentColor = useThemeColor("accent");
  const mutedColor = useThemeColor("muted");

  // Fetch all organizations
  const { data: orgsData } = useQuery({
    queryKey: ["admin-organizations"],
    queryFn: () => orpcClient.admin.getAllOrganizations(),
    enabled: !!session?.user,
  });

  // Fetch all users
  const { data: usersData } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => orpcClient.admin.getAllUsers(),
    enabled: !!session?.user,
  });

  const organizations = orgsData?.organizations || [];
  const users = usersData?.users || [];

  const adminStats = [
    {
      id: 1,
      title: "Total Users",
      value: users.length,
      icon: "people" as const,
      color: "#3b82f6",
      bgColor: "bg-blue-500/20",
    },
    {
      id: 2,
      title: "Organizations",
      value: organizations.length,
      icon: "business" as const,
      color: "#a855f7",
      bgColor: "bg-purple-500/20",
    },
    {
      id: 3,
      title: "Admins",
      value: users.filter((u: any) => u.role === "admin").length,
      icon: "shield-checkmark" as const,
      color: "#f59e0b",
      bgColor: "bg-amber-500/20",
    },
    {
      id: 4,
      title: "Org Members",
      value: users.filter((u: any) => u.role === "org").length,
      icon: "briefcase" as const,
      color: "#10b981",
      bgColor: "bg-emerald-500/20",
    },
  ];

  return (
    <Container showHeader={true}>
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="mt-2 mb-6 px-2">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1">
              <Text className="text-4xl font-bold text-foreground mb-2">
                Admin Panel
              </Text>
              <Text className="text-muted text-base">
                Manage users and organizations
              </Text>
            </View>
            <View className="w-16 h-16 bg-purple-500/20 rounded-2xl items-center justify-center">
              <Ionicons name="shield-checkmark" size={32} color="#a855f7" />
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View className="mb-6 px-2">
          <Text className="text-xl font-bold text-foreground mb-4">
            Overview
          </Text>

          <View className="flex-row flex-wrap gap-3">
            {adminStats.map((stat) => (
              <View
                key={stat.id}
                className={`${stat.bgColor} rounded-2xl p-4 border border-white/10`}
                style={{ width: "48%" }}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Ionicons name={stat.icon} size={24} color={stat.color} />
                  <Text
                    className="text-2xl font-bold"
                    style={{ color: stat.color }}
                  >
                    {stat.value}
                  </Text>
                </View>
                <Text className="text-foreground font-semibold text-sm">
                  {stat.title}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Management Cards */}
        <View className="mb-6 px-2">
          <Text className="text-xl font-bold text-foreground mb-4">
            Management
          </Text>

          <View className="gap-3">
            {/* Organization Management */}
            <Pressable
              onPress={() => router.push("/(tabs)/admin/organizations")}
              className="bg-surface rounded-2xl p-5 border border-divider active:opacity-70"
            >
              <View className="flex-row items-center mb-3">
                <View className="w-14 h-14 bg-purple-500/20 rounded-xl items-center justify-center mr-4">
                  <Ionicons name="business" size={28} color="#a855f7" />
                </View>
                <View className="flex-1">
                  <Text className="text-foreground font-bold text-lg mb-1">
                    Organizations
                  </Text>
                  <Text className="text-muted text-sm">
                    {organizations.length} organizations
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={mutedColor} />
              </View>
              <View className="bg-purple-500/10 rounded-lg p-3">
                <Text className="text-purple-400 text-xs">
                  Create, edit, and manage organizations
                </Text>
              </View>
            </Pressable>

            {/* User Management */}
            <Pressable
              onPress={() => router.push("/(tabs)/admin/users")}
              className="bg-surface rounded-2xl p-5 border border-divider active:opacity-70"
            >
              <View className="flex-row items-center mb-3">
                <View className="w-14 h-14 bg-blue-500/20 rounded-xl items-center justify-center mr-4">
                  <Ionicons name="people" size={28} color="#3b82f6" />
                </View>
                <View className="flex-1">
                  <Text className="text-foreground font-bold text-lg mb-1">
                    Users
                  </Text>
                  <Text className="text-muted text-sm">
                    {users.length} total users
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={mutedColor} />
              </View>
              <View className="bg-blue-500/10 rounded-lg p-3">
                <Text className="text-blue-400 text-xs">
                  Manage user roles and organization assignments
                </Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mb-6 px-2">
          <Text className="text-xl font-bold text-foreground mb-4">
            Quick Actions
          </Text>

          <View className="gap-3">
            <Pressable
              onPress={() => router.push("/(tabs)/admin/organizations/create")}
              className="bg-accent/10 rounded-2xl p-4 border border-accent/20 flex-row items-center active:opacity-70"
            >
              <View className="w-12 h-12 bg-accent/20 rounded-xl items-center justify-center mr-3">
                <Ionicons name="add-circle" size={24} color={accentColor} />
              </View>
              <View className="flex-1">
                <Text className="text-foreground font-semibold text-base">
                  Create Organization
                </Text>
                <Text className="text-muted text-sm">
                  Add a new organization
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={accentColor} />
            </Pressable>

            <Pressable className="bg-surface rounded-2xl p-4 border border-divider flex-row items-center active:opacity-70">
              <View className="w-12 h-12 bg-orange-500/20 rounded-xl items-center justify-center mr-3">
                <Ionicons name="analytics" size={24} color="#f97316" />
              </View>
              <View className="flex-1">
                <Text className="text-foreground font-semibold text-base">
                  View Analytics
                </Text>
                <Text className="text-muted text-sm">
                  System usage statistics
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={mutedColor} />
            </Pressable>

            <Pressable className="bg-surface rounded-2xl p-4 border border-divider flex-row items-center active:opacity-70">
              <View className="w-12 h-12 bg-cyan-500/20 rounded-xl items-center justify-center mr-3">
                <Ionicons name="settings" size={24} color="#06b6d4" />
              </View>
              <View className="flex-1">
                <Text className="text-foreground font-semibold text-base">
                  System Settings
                </Text>
                <Text className="text-muted text-sm">
                  Configure system options
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={mutedColor} />
            </Pressable>
          </View>
        </View>

        {/* Recent Activity */}
        <View className="mb-6 px-2">
          <Text className="text-xl font-bold text-foreground mb-4">
            Recent Activity
          </Text>

          <View className="bg-surface rounded-2xl border border-divider p-4">
            <View className="items-center py-6">
              <Ionicons name="time-outline" size={40} color={mutedColor} />
              <Text className="text-muted text-center mt-3">
                Activity tracking coming soon
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View className="border-t border-divider pt-6 pb-12 px-2">
          <Text className="text-muted text-xs text-center">
            Admin Dashboard v1.0
          </Text>
          <Text className="text-muted text-xs text-center mt-2">
            Manage your platform with ease
          </Text>
        </View>
      </ScrollView>
    </Container>
  );
}
