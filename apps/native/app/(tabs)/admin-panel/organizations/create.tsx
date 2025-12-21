import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { Container } from "@/components/container";
import { client as orpcClient, queryClient } from "@/utils/orpc";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

export default function CreateOrganizationScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const foregroundColor = useThemeColor("foreground");
  const accentColor = useThemeColor("accent");
  const mutedColor = useThemeColor("muted");
  const backgroundColor = useThemeColor("background");
  const dangerColor = useThemeColor("danger");

  // Create organization mutation
  const createMutation = useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      orpcClient.admin.createOrganization(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-organizations"] });
      Alert.alert("Success", "Organization created successfully", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    },
    onError: (error) => {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to create organization"
      );
    },
  });

  const handleCreate = () => {
    if (!name.trim()) {
      Alert.alert("Validation Error", "Please enter organization name");
      return;
    }

    createMutation.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
    });
  };

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
              <Text className="text-3xl font-bold text-foreground">
                Create Organization
              </Text>
            </View>
          </View>
          <Text className="text-muted text-base">
            Add a new organization to the system
          </Text>
        </View>

        {/* Info Card */}
        <View className="mb-6 px-2">
          <View className="bg-accent/10 rounded-2xl p-4 border border-accent/20 flex-row items-start">
            <View className="w-10 h-10 bg-accent/20 rounded-lg items-center justify-center mr-3 mt-0.5">
              <Ionicons name="information-circle" size={20} color={accentColor} />
            </View>
            <View className="flex-1">
              <Text className="text-foreground font-semibold text-sm mb-1">
                Organization Setup
              </Text>
              <Text className="text-muted text-xs leading-5">
                Organizations help you group users together. You can assign users to organizations and manage their access.
              </Text>
            </View>
          </View>
        </View>

        {/* Form */}
        <View className="px-2">
          {/* Error Display */}
          {createMutation.isError && (
            <View className="mb-4 p-4 bg-danger/10 rounded-xl border border-danger/20 flex-row items-center">
              <Ionicons name="alert-circle" size={20} color={dangerColor} />
              <Text className="text-danger ml-2 flex-1 text-sm font-medium">
                {createMutation.error instanceof Error
                  ? createMutation.error.message
                  : String(createMutation.error)}
              </Text>
            </View>
          )}

          {/* Organization Name */}
          <View className="mb-5">
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
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  createMutation.reset();
                }}
                editable={!createMutation.isPending}
                autoCapitalize="words"
              />
            </View>
            <Text className="text-muted text-xs mt-1 ml-1">
              A unique name for the organization
            </Text>
          </View>

          {/* Description */}
          <View className="mb-6">
            <Text className="text-foreground font-semibold mb-2 ml-1">
              Description
            </Text>
            <View className="bg-surface border border-divider rounded-xl px-4 py-3">
              <TextInput
                className="text-foreground min-h-[100px]"
                placeholder="Enter organization description (optional)"
                placeholderTextColor={mutedColor}
                value={description}
                onChangeText={(text) => {
                  setDescription(text);
                  createMutation.reset();
                }}
                editable={!createMutation.isPending}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
            <Text className="text-muted text-xs mt-1 ml-1">
              Brief description about the organization
            </Text>
          </View>

          {/* Preview Card */}
          <View className="mb-6">
            <Text className="text-foreground font-semibold mb-3 ml-1">
              Preview
            </Text>
            <View className="bg-surface rounded-2xl p-4 border border-divider">
              <View className="flex-row items-start">
                <View className="w-12 h-12 bg-purple-500/20 rounded-xl items-center justify-center mr-3">
                  <Ionicons name="business" size={24} color="#a855f7" />
                </View>
                <View className="flex-1">
                  <Text className="text-foreground font-bold text-base mb-1">
                    {name || "Organization Name"}
                  </Text>
                  <Text className="text-muted text-sm">
                    {description || "No description provided"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="gap-3 mb-6">
            {/* Create Button */}
            <Pressable
              onPress={handleCreate}
              disabled={createMutation.isPending || !name.trim()}
              className={`${
                createMutation.isPending || !name.trim()
                  ? "opacity-50"
                  : "active:opacity-90"
              } bg-accent rounded-xl py-4 flex-row justify-center items-center`}
            >
              {createMutation.isPending ? (
                <ActivityIndicator size="small" color={backgroundColor} />
              ) : (
                <>
                  <Ionicons
                    name="add-circle"
                    size={20}
                    color={backgroundColor}
                    style={{ marginRight: 8 }}
                  />
                  <Text className="text-background font-bold text-lg">
                    Create Organization
                  </Text>
                </>
              )}
            </Pressable>

            {/* Cancel Button */}
            <Pressable
              onPress={() => router.back()}
              disabled={createMutation.isPending}
              className="bg-surface border border-divider rounded-xl py-4 flex-row justify-center items-center active:opacity-70"
            >
              <Ionicons
                name="close-circle-outline"
                size={20}
                color={foregroundColor}
                style={{ marginRight: 8 }}
              />
              <Text className="text-foreground font-semibold text-base">
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Footer */}
        <View className="border-t border-divider pt-6 pb-12 px-2">
          <Text className="text-muted text-xs text-center">
            Organizations can be edited or deleted later from the management panel
          </Text>
        </View>
      </ScrollView>
    </Container>
  );
}
