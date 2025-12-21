import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "heroui-native";
import { authClient } from "@/lib/auth-client";
import { client as orpcClient } from "@/utils/orpc";
import { useQuery } from "@tanstack/react-query";

export default function TabLayout() {
  const accentColor = useThemeColor("accent");
  const mutedColor = useThemeColor("muted");
  const backgroundColor = useThemeColor("background");
  const foregroundColor = useThemeColor("foreground");

  const { data: session } = authClient.useSession();

  // Get user profile with role
  const { data: profileData } = useQuery({
    queryKey: ["user-profile"],
    queryFn: () => orpcClient.user.getProfile(),
    enabled: !!session?.user,
  });

  const userRole = profileData?.user?.role || "user";
  const isAdmin = userRole === "admin";
  const isOrg = userRole === "org";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: accentColor,
        tabBarInactiveTintColor: mutedColor,
        tabBarStyle: {
          backgroundColor: backgroundColor,
          borderTopColor: mutedColor + "20",
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="organization"
        options={{
          title: "Organization",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="business" size={size} color={color} />
          ),
          href: (isOrg || isAdmin ? "/(tabs)/organization" : null) as any,
        }}
      />

      <Tabs.Screen
        name="admin"
        options={{
          title: "Admin",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
          href: (isAdmin ? "/(tabs)/admin" : null) as any,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
