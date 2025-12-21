import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Alert, RefreshControl } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { Container } from "@/components/container";
import { client as orpcClient, queryClient } from "@/utils/orpc";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export default function OrganizationDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const orgId = Array.isArray(id) ? id[0] : id;

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const foregroundColor = useThemeColor("foreground");
  const accentColor = useThemeColor("accent");
  const mutedColor = useThemeColor("muted");
  const backgroundColor = useThemeColor("background");
  const dangerColor = useThemeColor("danger");
  const successColor = useThemeColor("success");

  // Fetch all organizations to find this one
  const { data: orgsData, isLoading: orgsLoading, refetch: refetchOrgs } = useQuery({
    queryKey: ["admin-organizations"],
    queryFn: () => orpcClient.admin.getAllOrganizations(),
  });

  // Fetch organization members
  const { data: membersData, isLoading: membersLoading, refetch: refetchMembers } = useQuery({
    queryKey: ["admin-organization-users", orgId],
    queryFn: () => orpcClient.admin.getOrganizationUsers({ organizationId: orgId! }),
    enabled: !!orgId,
  });

  const organizations = orgsData?.organizations || [];
  const organization = organizations.find((org: any) => org.id === orgId);
  const members = membersData?.users || [];

  // Initialize edit values when organization data loads
  useEffect(() => {
    if (organization && !isEditing) {
      setEditedName(organization.name || "");
      setEditedDescription(organization.description || "");
    }
  }, [organization, isEditing]);

  // Update organization mutation
  const updateMutation = useMutation({
    mutationFn: (data: { id: string; name?: string; description?: string; isActive?: boolean }) =>
      orpcClient.admin.updateOrganization(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-organizations"] });
      setIsEditing(false);
      Alert.alert("Success", "Organization updated successfully");
    },
    onError: (error) => {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to update organization"
      );
    },
  });

  // Delete organization mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => orpcClient.admin.deleteOrganization({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-organizations"] });
      Alert.alert("Success", "Organization deleted successfully", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    },
    onError: (error) => {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to delete organization");
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchOrgs(), refetchMembers()]);
    setRefreshing(false);
  };

  const handleSave = () => {
    if (!editedName.trim()) {
      Alert.alert("Validation Error", "Organization name cannot be empty");
      return;
    }

    updateMutation.mutate({
      id: orgId!,
      name: editedName.trim(),
      description: editedDescription.trim() || undefined,
    });
  };

  const handleCancelEdit = () => {
    setEditedName(organization?.name || "");
    setEditedDescription(organization?.description || "");
    setIsEditing(false);
    updateMutation.reset();
  };

  const handleToggleActive = () => {
    if (!organization) return;

    Alert.alert(
      organization.isActive ? "Deactivate Organization" : "Activate Organization",
      `Are you sure you want to ${organization.isActive ? "deactivate" : "activate"} this organization?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: organization.isActive ? "Deactivate" : "Activate",
          onPress: () => {
            updateMutation.mutate({
              id: orgId!,
              isActive: !organization.isActive,
            });
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    if (!organization) return;

    Alert.alert(
      "Delete Organization",
      `Are you sure you want to delete "${organization.name}"? This action cannot be undone and will affect ${members.length} member(s).`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMutation.mutate(orgId!),
        },
      ]
    );
  };

  const handleViewUser = (userId: string) => {
    router.push(`/(tabs)/admin-panel/users/${userId}` as any);
  };

  if (orgsLoading) {
    return (
      <Container showHeader={true}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={accentColor} />
          <Text className="text-muted mt-4">Loading organization...</Text>
        </View>
      </Container>
    );
  }

  if (!organization) {
    return (
      <Container showHeader={true}>
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 bg-red-500/20 rounded-full items-center justify-center mb-4">
            <Ionicons name="alert-circle" size={40} color="#ef4444" />
          </View>
          <Text className="text-foreground font-bold text-xl mb-2">
            Organization Not Found
          </Text>
          <Text className="text-muted text-center mb-6">
            The organization you're looking for doesn't exist or has been deleted.
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
          <View className="flex-row items-center justify-between mb-4">
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 bg-surface rounded-xl items-center justify-center active:opacity-70"
            >
              <Ionicons name="arrow-back" size={20} color={foregroundColor} />
            </Pressable>

            {!isEditing && (
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => setIsEditing(true)}
                  className="bg-accent/10 rounded-xl px-4 py-2 flex-row items-center active:opacity-70"
                >
                  <Ionicons name="create" size={18} color={accentColor} style={{ marginRight: 4 }} />
                  <Text className="text-accent font-semibold">Edit</Text>
                </Pressable>
              </View>
            )}
          </View>

          <View className="flex-row items-center mb-2">
            <View className="w-14 h-14 bg-purple-500/20 rounded-xl items-center justify-center mr-3">
              <Ionicons name="business" size={28} color="#a855f7" />
            </View>
            <View className="flex-1">
              <Text className="text-3xl font-bold text-foreground">
                {organization.name}
              </Text>
              <View className="flex-row items-center mt-1">
                <View className={`w-2 h-2 ${organization.isActive ? 'bg-green-500' : 'bg-red-500'} rounded-full mr-2`} />
                <Text className={`${organization.isActive ? 'text-green-500' : 'text-red-500'} text-xs font-medium`}>
                  {organization.isActive ? "Active" : "Inactive"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Edit Form / View Mode */}
        {isEditing ? (
          <View className="px-2 mb-6">
            {/* Edit Mode */}
            <View className="bg-accent/10 rounded-2xl p-4 border border-accent/20 mb-4">
              <Text className="text-accent font-semibold text-sm">Edit Mode</Text>
              <Text className="text-muted text-xs mt-1">
                Make changes to the organization details below
              </Text>
            </View>

            {/* Organization Name */}
            <View className="mb-4">
              <Text className="text-foreground font-semibold mb-2 ml-1">
                Organization Name <Text className="text-red-500">*</Text>
              </Text>
              <View className="bg-surface border border-divider rounded-xl px-4 py-1 flex-row items-center">
                <Ionicons
                  name="business-outline"
                  size={20}
                  color={mutedColor}
                  style={{ marginRight: 8 }}
                />
                <TextInput
                  className="flex-1 text-foreground py-4"
                  placeholder="Enter organization name"
                  placeholderTextColor={mutedColor}
                  value={editedName}
                  onChangeText={setEditedName}
                  editable={!updateMutation.isPending}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Description */}
            <View className="mb-4">
              <Text className="text-foreground font-semibold mb-2 ml-1">
                Description
              </Text>
              <View className="bg-surface border border-divider rounded-xl px-4 py-3">
                <TextInput
                  className="text-foreground min-h-[100px]"
                  placeholder="Enter organization description"
                  placeholderTextColor={mutedColor}
                  value={editedDescription}
                  onChangeText={setEditedDescription}
                  editable={!updateMutation.isPending}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3 mb-4">
              <Pressable
                onPress={handleSave}
                disabled={updateMutation.isPending || !editedName.trim()}
                className={`flex-1 bg-accent rounded-xl py-4 flex-row justify-center items-center ${
                  updateMutation.isPending || !editedName.trim() ? "opacity-50" : "active:opacity-90"
                }`}
              >
                {updateMutation.isPending ? (
                  <ActivityIndicator size="small" color={backgroundColor} />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color={backgroundColor} style={{ marginRight: 6 }} />
                    <Text className="text-background font-bold">Save Changes</Text>
                  </>
                )}
              </Pressable>

              <Pressable
                onPress={handleCancelEdit}
                disabled={updateMutation.isPending}
                className="flex-1 bg-surface border border-divider rounded-xl py-4 flex-row justify-center items-center active:opacity-70"
              >
                <Ionicons name="close-circle" size={20} color={foregroundColor} style={{ marginRight: 6 }} />
                <Text className="text-foreground font-semibold">Cancel</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View className="px-2 mb-6">
            {/* View Mode */}
            <View className="bg-surface rounded-2xl p-4 border border-divider mb-4">
              <Text className="text-muted text-xs font-semibold mb-2">DESCRIPTION</Text>
              <Text className="text-foreground text-base">
                {organization.description || "No description provided"}
              </Text>
            </View>

            {/* Metadata */}
            <View className="bg-surface rounded-2xl p-4 border border-divider mb-4">
              <Text className="text-muted text-xs font-semibold mb-3">DETAILS</Text>

              <View className="flex-row items-center mb-3">
                <Ionicons name="calendar-outline" size={18} color={mutedColor} />
                <Text className="text-muted text-sm ml-2 flex-1">Created</Text>
                <Text className="text-foreground font-semibold">
                  {new Date(organization.createdAt).toLocaleDateString()}
                </Text>
              </View>

              <View className="flex-row items-center">
                <Ionicons name="people-outline" size={18} color={mutedColor} />
                <Text className="text-muted text-sm ml-2 flex-1">Members</Text>
                <Text className="text-foreground font-semibold">
                  {members.length}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Members Section */}
        <View className="px-2 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-foreground">
              Members ({members.length})
            </Text>
          </View>

          {membersLoading ? (
            <View className="bg-surface rounded-2xl p-8 border border-divider items-center">
              <ActivityIndicator size="small" color={accentColor} />
              <Text className="text-muted mt-2">Loading members...</Text>
            </View>
          ) : members.length === 0 ? (
            <View className="bg-surface rounded-2xl p-8 border border-divider items-center">
              <View className="w-16 h-16 bg-muted/20 rounded-2xl items-center justify-center mb-4">
                <Ionicons name="people-outline" size={32} color={mutedColor} />
              </View>
              <Text className="text-foreground font-semibold text-base mb-2">
                No Members Yet
              </Text>
              <Text className="text-muted text-center text-sm">
                No users are assigned to this organization
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {members.map((member: any, index: number) => (
                <Pressable
                  key={member.id || index}
                  onPress={() => handleViewUser(member.id)}
                  className="bg-surface rounded-2xl border border-divider p-4 active:opacity-70"
                >
                  <View className="flex-row items-center">
                    <View className="w-12 h-12 bg-accent/20 rounded-xl items-center justify-center mr-3">
                      <Text className="text-accent font-bold text-lg">
                        {member.name?.charAt(0).toUpperCase() || "U"}
                      </Text>
                    </View>

                    <View className="flex-1">
                      <Text className="text-foreground font-bold text-base mb-1">
                        {member.name}
                      </Text>
                      <Text className="text-muted text-sm" numberOfLines={1}>
                        {member.email}
                      </Text>
                    </View>

                    <View className="flex-row items-center gap-2">
                      <View className={`px-3 py-1 rounded-lg ${
                        member.role === "admin" ? "bg-purple-500/20" :
                        member.role === "org" ? "bg-blue-500/20" : "bg-accent/20"
                      }`}>
                        <Text className={`text-xs font-semibold capitalize ${
                          member.role === "admin" ? "text-purple-400" :
                          member.role === "org" ? "text-blue-400" : "text-accent"
                        }`}>
                          {member.role || "user"}
                        </Text>
                      </View>

                      <Ionicons name="chevron-forward" size={20} color={mutedColor} />
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Danger Zone */}
        {!isEditing && (
          <View className="px-2 mb-6">
            <Text className="text-xl font-bold text-foreground mb-4">
              Danger Zone
            </Text>

            <View className="bg-surface rounded-2xl border border-red-500/20 overflow-hidden">
              {/* Toggle Active Status */}
              <Pressable
                onPress={handleToggleActive}
                disabled={updateMutation.isPending}
                className="p-4 border-b border-red-500/20 active:opacity-70"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 mr-3">
                    <Text className="text-foreground font-semibold mb-1">
                      {organization.isActive ? "Deactivate Organization" : "Activate Organization"}
                    </Text>
                    <Text className="text-muted text-sm">
                      {organization.isActive
                        ? "Deactivate this organization temporarily"
                        : "Reactivate this organization"}
                    </Text>
                  </View>
                  <Ionicons
                    name={organization.isActive ? "pause-circle" : "play-circle"}
                    size={24}
                    color={organization.isActive ? "#f59e0b" : successColor}
                  />
                </View>
              </Pressable>

              {/* Delete Organization */}
              <Pressable
                onPress={handleDelete}
                disabled={deleteMutation.isPending}
                className="p-4 active:opacity-70"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 mr-3">
                    <Text className="text-red-500 font-semibold mb-1">
                      Delete Organization
                    </Text>
                    <Text className="text-muted text-sm">
                      Permanently delete this organization and remove all member assignments
                    </Text>
                  </View>
                  {deleteMutation.isPending ? (
                    <ActivityIndicator size="small" color="#ef4444" />
                  ) : (
                    <Ionicons name="trash" size={24} color="#ef4444" />
                  )}
                </View>
              </Pressable>
            </View>
          </View>
        )}

        {/* Footer */}
        <View className="border-t border-divider pt-6 pb-12 px-2">
          <Text className="text-muted text-xs text-center">
            Organization ID: {organization.id}
          </Text>
        </View>
      </ScrollView>
    </Container>
  );
}
