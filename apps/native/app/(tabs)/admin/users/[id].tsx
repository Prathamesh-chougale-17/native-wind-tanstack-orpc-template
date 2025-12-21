import { View, Text, Pressable, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { Container } from "@/components/container";
import { orpcClient, queryClient } from "@/utils/orpc";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";

export default function EditUserScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const userId = Array.isArray(id) ? id[0] : id;

  const foregroundColor = useThemeColor("foreground");
  const accentColor = useThemeColor("accent");
  const mutedColor = useThemeColor("muted");
  const backgroundColor = useThemeColor("background");
  const successColor = useThemeColor("success");

  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedOrg, setSelectedOrg] = useState<string>("");

  // Fetch all users to find this user
  const { data: usersData, isLoading: usersLoading } = useQuery({
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
  const user = users.find((u: any) => u.id === userId);

  // Initialize selected values when user data is loaded
  if (user && !selectedRole) {
    setSelectedRole(user.role || "user");
    setSelectedOrg(user.organizationId || "none");
  }

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: (role: string) =>
      orpcClient.admin.updateUserRole({ userId: userId!, role: role as any }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      Alert.alert("Success", "User role updated successfully");
    },
    onError: (error) => {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to update user role");
    },
  });

  // Assign user to organization mutation
  const assignOrgMutation = useMutation({
    mutationFn: (data: { organizationId: string; role?: string }) =>
      orpcClient.admin.assignUserToOrganization({
        userId: userId!,
        organizationId: data.organizationId,
        role: data.role as any,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      Alert.alert("Success", "User assigned to organization successfully");
    },
    onError: (error) => {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to assign user");
    },
  });

  // Remove user from organization mutation
  const removeOrgMutation = useMutation({
    mutationFn: () =>
      orpcClient.admin.removeUserFromOrganization({ userId: userId! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      Alert.alert("Success", "User removed from organization successfully");
    },
    onError: (error) => {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to remove user");
    },
  });

  const handleSaveChanges = () => {
    if (!user || !userId) return;

    const roleChanged = selectedRole !== (user.role || "user");
    const orgChanged = selectedOrg !== (user.organizationId || "none");

    if (!roleChanged && !orgChanged) {
      Alert.alert("No Changes", "No changes were made");
      return;
    }

    Alert.alert(
      "Confirm Changes",
      `Are you sure you want to update this user's settings?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Save",
          onPress: async () => {
            try {
              if (roleChanged && orgChanged) {
                // Update both role and organization
                if (selectedOrg === "none") {
                  await updateRoleMutation.mutateAsync(selectedRole);
                  await removeOrgMutation.mutateAsync();
                } else {
                  await assignOrgMutation.mutateAsync({
                    organizationId: selectedOrg,
                    role: selectedRole,
                  });
                }
              } else if (roleChanged) {
                await updateRoleMutation.mutateAsync(selectedRole);
              } else if (orgChanged) {
                if (selectedOrg === "none") {
                  await removeOrgMutation.mutateAsync();
                } else {
                  await assignOrgMutation.mutateAsync({
                    organizationId: selectedOrg,
                  });
                }
              }
            } catch (error) {
              console.error("Error updating user:", error);
            }
          },
        },
      ]
    );
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

  if (usersLoading) {
    return (
      <Container showHeader={true}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={accentColor} />
          <Text className="text-muted mt-4">Loading user data...</Text>
        </View>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container showHeader={true}>
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 bg-muted/20 rounded-2xl items-center justify-center mb-4">
            <Ionicons name="person-outline" size={40} color={mutedColor} />
          </View>
          <Text className="text-2xl font-bold text-foreground mb-2">User Not Found</Text>
          <Text className="text-muted text-center mb-6">
            The user you're looking for doesn't exist
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="bg-accent rounded-xl px-6 py-3 active:opacity-90"
          >
            <Text className="text-background font-semibold">Go Back</Text>
          </Pressable>
        </View>
      </Container>
    );
  }

  const roles = [
    { value: "user", label: "User", icon: "person", color: accentColor },
    { value: "org", label: "Organization", icon: "briefcase", color: "#3b82f6" },
    { value: "admin", label: "Admin", icon: "shield-checkmark", color: "#a855f7" },
  ];

  const hasChanges =
    selectedRole !== (user.role || "user") ||
    selectedOrg !== (user.organizationId || "none");

  const isPending =
    updateRoleMutation.isPending ||
    assignOrgMutation.isPending ||
    removeOrgMutation.isPending;

  return (
    <Container showHeader={true}>
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="mt-2 mb-6 px-2">
          <View className="flex-row items-center mb-4">
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 bg-surface rounded-xl items-center justify-center active:opacity-70 mr-3"
            >
              <Ionicons name="arrow-back" size={20} color={foregroundColor} />
            </Pressable>
            <View className="flex-1">
              <Text className="text-3xl font-bold text-foreground">Edit User</Text>
            </View>
          </View>
        </View>

        {/* User Info Card */}
        <View className="mb-6 px-2">
          <View className="bg-surface rounded-2xl p-5 border border-divider">
            <View className="flex-row items-center mb-4">
              <View className={`w-16 h-16 ${getRoleBadgeColor(user.role)} rounded-2xl items-center justify-center mr-4 border`}>
                <Text
                  className="text-2xl font-bold"
                  style={{ color: getRoleTextColor(user.role) }}
                >
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-foreground font-bold text-xl mb-1">
                  {user.name}
                </Text>
                <Text className="text-muted text-sm" numberOfLines={1}>
                  {user.email}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-2">
              <View className={`${getRoleBadgeColor(user.role)} px-3 py-1.5 rounded-lg border`}>
                <Text
                  className="font-semibold text-xs capitalize"
                  style={{ color: getRoleTextColor(user.role) }}
                >
                  {user.role || "user"}
                </Text>
              </View>

              {user.emailVerified && (
                <View className="bg-green-500/20 px-3 py-1.5 rounded-lg border border-green-500/40 flex-row items-center">
                  <Ionicons name="checkmark-circle" size={14} color="#22c55e" style={{ marginRight: 4 }} />
                  <Text className="text-green-500 text-xs font-medium">Verified</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Change Detection Banner */}
        {hasChanges && (
          <View className="mb-4 px-2">
            <View className="bg-orange-500/10 rounded-xl p-4 border border-orange-500/20 flex-row items-center">
              <Ionicons name="warning" size={20} color="#f97316" style={{ marginRight: 8 }} />
              <Text className="text-orange-500 flex-1 text-sm font-medium">
                You have unsaved changes
              </Text>
            </View>
          </View>
        )}

        {/* Role Selection */}
        <View className="mb-6 px-2">
          <Text className="text-foreground font-bold text-lg mb-3">Select Role</Text>

          <View className="gap-3">
            {roles.map((role) => (
              <Pressable
                key={role.value}
                onPress={() => setSelectedRole(role.value)}
                disabled={isPending}
                className={`${
                  selectedRole === role.value
                    ? "bg-accent/10 border-accent"
                    : "bg-surface border-divider"
                } rounded-2xl p-4 border-2 active:opacity-70`}
              >
                <View className="flex-row items-center">
                  <View
                    className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                    style={{ backgroundColor: role.color + "33" }}
                  >
                    <Ionicons name={role.icon as any} size={24} color={role.color} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-foreground font-semibold text-base mb-1">
                      {role.label}
                    </Text>
                    <Text className="text-muted text-xs">
                      {role.value === "admin"
                        ? "Full system access and management"
                        : role.value === "org"
                        ? "Organization member access"
                        : "Basic user access"}
                    </Text>
                  </View>
                  {selectedRole === role.value && (
                    <View className="w-6 h-6 bg-accent rounded-full items-center justify-center">
                      <Ionicons name="checkmark" size={16} color={backgroundColor} />
                    </View>
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Organization Assignment */}
        <View className="mb-6 px-2">
          <Text className="text-foreground font-bold text-lg mb-3">
            Assign Organization
          </Text>

          <View className="gap-3">
            {/* No Organization Option */}
            <Pressable
              onPress={() => setSelectedOrg("none")}
              disabled={isPending}
              className={`${
                selectedOrg === "none"
                  ? "bg-accent/10 border-accent"
                  : "bg-surface border-divider"
              } rounded-2xl p-4 border-2 active:opacity-70`}
            >
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-muted/20 rounded-xl items-center justify-center mr-3">
                  <Ionicons name="close-circle" size={24} color={mutedColor} />
                </View>
                <View className="flex-1">
                  <Text className="text-foreground font-semibold text-base">
                    No Organization
                  </Text>
                  <Text className="text-muted text-xs">User not assigned to any organization</Text>
                </View>
                {selectedOrg === "none" && (
                  <View className="w-6 h-6 bg-accent rounded-full items-center justify-center">
                    <Ionicons name="checkmark" size={16} color={backgroundColor} />
                  </View>
                )}
              </View>
            </Pressable>

            {/* Organization Options */}
            {organizations.map((org: any) => (
              <Pressable
                key={org.id}
                onPress={() => setSelectedOrg(org.id)}
                disabled={isPending}
                className={`${
                  selectedOrg === org.id
                    ? "bg-accent/10 border-accent"
                    : "bg-surface border-divider"
                } rounded-2xl p-4 border-2 active:opacity-70`}
              >
                <View className="flex-row items-center">
                  <View className="w-12 h-12 bg-blue-500/20 rounded-xl items-center justify-center mr-3">
                    <Ionicons name="business" size={24} color="#3b82f6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-foreground font-semibold text-base mb-1">
                      {org.name}
                    </Text>
                    {org.description && (
                      <Text className="text-muted text-xs" numberOfLines={1}>
                        {org.description}
                      </Text>
                    )}
                  </View>
                  {selectedOrg === org.id && (
                    <View className="w-6 h-6 bg-accent rounded-full items-center justify-center">
                      <Ionicons name="checkmark" size={16} color={backgroundColor} />
                    </View>
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View className="gap-3 mb-6 px-2">
          <Pressable
            onPress={handleSaveChanges}
            disabled={!hasChanges || isPending}
            className={`${
              !hasChanges || isPending ? "opacity-50" : "active:opacity-90"
            } bg-accent rounded-xl py-4 flex-row justify-center items-center`}
          >
            {isPending ? (
              <ActivityIndicator size="small" color={backgroundColor} />
            ) : (
              <>
                <Ionicons
                  name="save"
                  size={20}
                  color={backgroundColor}
                  style={{ marginRight: 8 }}
                />
                <Text className="text-background font-bold text-lg">Save Changes</Text>
              </>
            )}
          </Pressable>

          <Pressable
            onPress={() => router.back()}
            disabled={isPending}
            className="bg-surface border border-divider rounded-xl py-4 flex-row justify-center items-center active:opacity-70"
          >
            <Ionicons
              name="close-circle-outline"
              size={20}
              color={foregroundColor}
              style={{ marginRight: 8 }}
            />
            <Text className="text-foreground font-semibold text-base">Cancel</Text>
          </Pressable>
        </View>

        {/* Footer */}
        <View className="border-t border-divider pt-6 pb-12 px-2">
          <Text className="text-muted text-xs text-center">
            Changes will be applied immediately after saving
          </Text>
        </View>
      </ScrollView>
    </Container>
  );
}
