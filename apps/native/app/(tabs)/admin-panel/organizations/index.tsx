import { View, Text, Pressable, ScrollView, RefreshControl, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { Container } from "@/components/container";
import { client as orpcClient } from "@/utils/orpc";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { queryClient } from "@/utils/orpc";

export default function OrganizationsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const foregroundColor = useThemeColor("foreground");
  const accentColor = useThemeColor("accent");
  const mutedColor = useThemeColor("muted");
  const dangerColor = useThemeColor("danger");

  // Fetch all organizations
  const { data: orgsData, refetch } = useQuery({
    queryKey: ["admin-organizations"],
    queryFn: () => orpcClient.admin.getAllOrganizations(),
  });

  // Delete organization mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => orpcClient.admin.deleteOrganization({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-organizations"] });
      Alert.alert("Success", "Organization deleted successfully");
    },
    onError: (error) => {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to delete organization");
    },
  });

  const organizations = orgsData?.organizations || [];

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      "Delete Organization",
      `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMutation.mutate(id),
        },
      ]
    );
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
          <View className="flex-row items-center justify-between mb-4">
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 bg-surface rounded-xl items-center justify-center active:opacity-70"
            >
              <Ionicons name="arrow-back" size={20} color={foregroundColor} />
            </Pressable>

            <Pressable
              onPress={() => router.push("/(tabs)/admin-panel/organizations/create" as any)}
              className="bg-accent rounded-xl px-4 py-2 flex-row items-center active:opacity-90"
            >
              <Ionicons name="add" size={20} color="#fff" style={{ marginRight: 4 }} />
              <Text className="text-background font-semibold">New Org</Text>
            </Pressable>
          </View>

          <Text className="text-4xl font-bold text-foreground mb-2">
            Organizations
          </Text>
          <Text className="text-muted text-base">
            Manage all organizations in the system
          </Text>
        </View>

        {/* Stats */}
        <View className="mb-6 px-2">
          <View className="bg-surface rounded-2xl p-4 border border-divider">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-purple-500/20 rounded-xl items-center justify-center mr-3">
                  <Ionicons name="business" size={24} color="#a855f7" />
                </View>
                <View>
                  <Text className="text-muted text-xs mb-1">Total Organizations</Text>
                  <Text className="text-foreground font-bold text-2xl">
                    {organizations.length}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Organizations List */}
        <View className="mb-6 px-2">
          <Text className="text-xl font-bold text-foreground mb-4">
            All Organizations
          </Text>

          {organizations.length === 0 ? (
            <View className="bg-surface rounded-2xl p-8 border border-divider items-center">
              <View className="w-16 h-16 bg-muted/20 rounded-2xl items-center justify-center mb-4">
                <Ionicons name="business-outline" size={32} color={mutedColor} />
              </View>
              <Text className="text-foreground font-semibold text-lg mb-2">
                No Organizations
              </Text>
              <Text className="text-muted text-center mb-4">
                Get started by creating your first organization
              </Text>
              <Pressable
                onPress={() => router.push("/(tabs)/admin-panel/organizations/create" as any)}
                className="bg-accent rounded-xl px-6 py-3 active:opacity-90"
              >
                <Text className="text-background font-semibold">
                  Create Organization
                </Text>
              </Pressable>
            </View>
          ) : (
            <View className="gap-3">
              {organizations.map((org: any, index: number) => (
                <View
                  key={org.id || index}
                  className="bg-surface rounded-2xl border border-divider overflow-hidden"
                >
                  <View className="p-4">
                    <View className="flex-row items-start justify-between mb-3">
                      <View className="flex-1 mr-3">
                        <View className="flex-row items-center mb-2">
                          <View className="w-10 h-10 bg-purple-500/20 rounded-lg items-center justify-center mr-3">
                            <Ionicons name="business" size={20} color="#a855f7" />
                          </View>
                          <View className="flex-1">
                            <Text className="text-foreground font-bold text-lg">
                              {org.name}
                            </Text>
                            {org.isActive && (
                              <View className="flex-row items-center mt-1">
                                <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                                <Text className="text-green-500 text-xs font-medium">
                                  Active
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>

                        {org.description && (
                          <Text className="text-muted text-sm mb-3" numberOfLines={2}>
                            {org.description}
                          </Text>
                        )}

                        <View className="flex-row items-center">
                          <Ionicons name="calendar-outline" size={14} color={mutedColor} />
                          <Text className="text-muted text-xs ml-1">
                            Created {new Date(org.createdAt).toLocaleDateString()}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Actions */}
                    <View className="flex-row gap-2">
                      <Pressable
                        onPress={() => router.push(`/(tabs)/admin-panel/organizations/${org.id}` as any)}
                        className="flex-1 bg-accent/10 rounded-xl py-3 flex-row items-center justify-center active:opacity-70"
                      >
                        <Ionicons name="eye" size={18} color={accentColor} style={{ marginRight: 6 }} />
                        <Text className="text-accent font-semibold text-sm">View</Text>
                      </Pressable>

                      <Pressable
                        onPress={() => handleDelete(org.id, org.name)}
                        disabled={deleteMutation.isPending}
                        className="flex-1 bg-red-500/10 rounded-xl py-3 flex-row items-center justify-center active:opacity-70"
                      >
                        <Ionicons name="trash" size={18} color="#ef4444" style={{ marginRight: 6 }} />
                        <Text className="text-red-500 font-semibold text-sm">Delete</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Footer */}
        <View className="border-t border-divider pt-6 pb-12 px-2">
          <Text className="text-muted text-xs text-center">
            Organization Management
          </Text>
        </View>
      </ScrollView>
    </Container>
  );
}
