import { View, Text, ScrollView, RefreshControl, Pressable } from "react-native";
import { authClient } from "@/lib/auth-client";
import { useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { Container } from "@/components/container";
import { client as orpcClient } from "@/utils/orpc";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function OrganizationTab() {
  const { data: session } = authClient.useSession();
  const [refreshing, setRefreshing] = useState(false);

  const foregroundColor = useThemeColor("foreground");
  const accentColor = useThemeColor("accent");
  const mutedColor = useThemeColor("muted");
  const successColor = useThemeColor("success");

  // Fetch user profile to get organization
  const { data: profileData, refetch: refetchProfile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: () => orpcClient.user.getProfile(),
    enabled: !!session?.user,
  });

  // Fetch organization members
  const { data: membersData, refetch: refetchMembers } = useQuery({
    queryKey: ["organization-members"],
    queryFn: () => orpcClient.user.getOrganizationMembers(),
    enabled: !!session?.user && (profileData?.user?.role === "org" || profileData?.user?.role === "admin"),
  });

  const organization = profileData?.organization;
  const members = membersData?.members || [];

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchProfile(), refetchMembers()]);
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

  if (!organization) {
    return (
      <Container showHeader={true}>
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 bg-muted/20 rounded-2xl items-center justify-center mb-4">
            <Ionicons name="business-outline" size={40} color={mutedColor} />
          </View>
          <Text className="text-2xl font-bold text-foreground mb-2 text-center">
            No Organization
          </Text>
          <Text className="text-muted text-center text-base">
            You are not assigned to any organization yet.
          </Text>
        </View>
      </Container>
    );
  }

  return (
    <Container showHeader={true}>
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Organization Header */}
        <View className="mt-2 mb-6 px-2">
          <View className="flex-row items-center mb-6">
            <View className="w-16 h-16 bg-blue-500/20 rounded-2xl items-center justify-center mr-4">
              <Ionicons name="business" size={32} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-muted mb-1">Organization</Text>
              <Text className="text-3xl font-bold text-foreground">
                {organization.name}
              </Text>
            </View>
          </View>

          {organization.description && (
            <View className="bg-surface rounded-2xl p-4 border border-divider mb-4">
              <Text className="text-muted text-sm leading-5">
                {organization.description}
              </Text>
            </View>
          )}
        </View>

        {/* Organization Stats */}
        <View className="mb-6 px-2">
          <Text className="text-xl font-bold text-foreground mb-4">
            Organization Stats
          </Text>

          <View className="flex-row gap-3 mb-4">
            <View className="flex-1 bg-surface rounded-2xl p-4 border border-divider items-center">
              <Ionicons name="people" size={28} color={accentColor} />
              <Text className="text-xs text-muted mt-2 mb-1">Members</Text>
              <Text className="text-xl font-bold text-foreground">
                {members.length}
              </Text>
            </View>

            <View className="flex-1 bg-surface rounded-2xl p-4 border border-divider items-center">
              <Ionicons name="shield-checkmark" size={28} color={successColor} />
              <Text className="text-xs text-muted mt-2 mb-1">Status</Text>
              <Text className="text-sm font-bold text-success">Active</Text>
            </View>
          </View>
        </View>

        {/* Members List */}
        <View className="mb-6 px-2">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-foreground">
              Team Members
            </Text>
            <View className="bg-accent/10 px-3 py-1 rounded-full">
              <Text className="text-accent font-semibold text-xs">
                {members.length} {members.length === 1 ? "Member" : "Members"}
              </Text>
            </View>
          </View>

          {members.length === 0 ? (
            <View className="bg-surface rounded-2xl p-6 border border-divider items-center">
              <Ionicons name="people-outline" size={40} color={mutedColor} />
              <Text className="text-muted mt-3 text-center">
                No members found in this organization
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {members.map((member: any, index: number) => (
                <View
                  key={member.id || index}
                  className="bg-surface rounded-2xl p-4 border border-divider"
                >
                  <View className="flex-row items-center">
                    {/* Avatar */}
                    <View className="w-12 h-12 bg-accent/20 rounded-xl items-center justify-center mr-3">
                      <Text className="text-accent font-bold text-lg">
                        {member.name?.charAt(0).toUpperCase() || "U"}
                      </Text>
                    </View>

                    {/* Member Info */}
                    <View className="flex-1">
                      <Text className="text-foreground font-semibold text-base mb-1">
                        {member.name}
                      </Text>
                      <Text className="text-muted text-sm" numberOfLines={1}>
                        {member.email}
                      </Text>
                    </View>

                    {/* Role Badge */}
                    <View className={`${getRoleBadgeColor(member.role)} px-3 py-1.5 rounded-lg`}>
                      <Text
                        className="font-semibold text-xs capitalize"
                        style={{ color: getRoleTextColor(member.role) }}
                      >
                        {member.role}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Organization Info Card */}
        <View className="mb-6 px-2">
          <Text className="text-xl font-bold text-foreground mb-4">
            Details
          </Text>

          <View className="bg-surface rounded-2xl border border-divider overflow-hidden">
            <View className="px-4 py-4 border-b border-divider flex-row items-center">
              <View className="w-10 h-10 bg-blue-500/20 rounded-lg items-center justify-center mr-3">
                <Ionicons name="business" size={20} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-muted mb-1">Organization Name</Text>
                <Text className="text-base font-semibold text-foreground">
                  {organization.name}
                </Text>
              </View>
            </View>

            <View className="px-4 py-4 flex-row items-center">
              <View className="w-10 h-10 bg-success/20 rounded-lg items-center justify-center mr-3">
                <Ionicons name="checkmark-circle" size={20} color={successColor} />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-muted mb-1">Status</Text>
                <Text className="text-base font-semibold text-success">
                  Active & Verified
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mb-6 px-2">
          <Text className="text-xl font-bold text-foreground mb-4">
            Quick Actions
          </Text>

          <View className="gap-3">
            <Pressable className="bg-surface rounded-2xl p-4 border border-divider flex-row items-center active:opacity-70">
              <View className="w-10 h-10 bg-accent/20 rounded-lg items-center justify-center mr-3">
                <Ionicons name="mail" size={20} color={accentColor} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">
                  Contact Organization
                </Text>
                <Text className="text-xs text-muted">Send a message</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={mutedColor} />
            </Pressable>

            <Pressable className="bg-surface rounded-2xl p-4 border border-divider flex-row items-center active:opacity-70">
              <View className="w-10 h-10 bg-orange-500/20 rounded-lg items-center justify-center mr-3">
                <Ionicons name="document-text" size={20} color="#f97316" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">
                  View Reports
                </Text>
                <Text className="text-xs text-muted">Organization reports</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={mutedColor} />
            </Pressable>
          </View>
        </View>

        {/* Footer */}
        <View className="border-t border-divider pt-6 pb-12 px-2">
          <Text className="text-muted text-xs text-center">
            Organization managed by {profileData?.user?.role === "admin" ? "Admin" : "Organization"}
          </Text>
        </View>
      </ScrollView>
    </Container>
  );
}
