import { useEffect } from "react";
import { View, Text, Pressable, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { authClient } from "@/lib/auth-client";
import { useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { Container } from "@/components/container";
import { Header } from "@/components/header";

const { width } = Dimensions.get("window");

export default function LandingPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const backgroundColor = useThemeColor("background");
  const foregroundColor = useThemeColor("foreground");
  const accentColor = useThemeColor("accent");
  const mutedColor = useThemeColor("muted");
  const successColor = useThemeColor("success");

  useEffect(() => {
    // Redirect unauthenticated users to sign up
    if (!isPending && !session) {
      router.replace("/(auth)/sign-up");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <View className="w-12 h-12 rounded-full border-4 border-accent border-t-transparent animate-spin" />
      </View>
    );
  }

  if (!session) {
    return null; // Redirect is in progress
  }

  return (
    <Container showHeader={true}>
      {/* Header */}
      <View className="mt-2 mb-6 px-2">
        <View className="flex-row items-center justify-between mb-8">
          <View>
            <Text className="text-4xl font-bold text-foreground">Welcome</Text>
            <Text className="text-accent font-semibold text-lg">
              {session.user?.name}
            </Text>
          </View>
          <View className="w-16 h-16 bg-accent/20 rounded-2xl items-center justify-center">
            <Ionicons name="sparkles" size={32} color={accentColor} />
          </View>
        </View>

        <Text className="text-muted text-base leading-6">
          You're all set! Explore amazing features and make the most of your
          experience.
        </Text>
      </View>

      {/* Hero Card */}
      <View className="bg-linear-to-br px-2 from-accent/20 to-accent/5 rounded-3xl p-6 mb-6 border border-accent/20">
        <View className="flex-row items-start gap-4">
          <View className="w-12 h-12 bg-accent/30 rounded-xl items-center justify-center">
            <Ionicons name="rocket" size={24} color={accentColor} />
          </View>
          <View className="flex-1">
            <Text className="text-xl font-bold text-foreground mb-1">
              Let's Get Started
            </Text>
            <Text className="text-muted text-sm">
              Explore our dashboard and discover powerful features.
            </Text>
          </View>
        </View>
      </View>

      {/* Features Grid */}
      <View className="mb-6 px-2">
        <Text className="text-2xl font-bold text-foreground mb-6">
          Features
        </Text>

        <View className="gap-4">
          {/* Feature 1 */}
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
                Secure & Safe
              </Text>
              <Text className="text-muted text-sm">Your data is encrypted</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={mutedColor} />
          </View>

          {/* Feature 2 */}
          <View className="bg-surface rounded-2xl p-4 border border-divider flex-row items-center">
            <View className="w-12 h-12 bg-blue-500/20 rounded-xl items-center justify-center mr-4">
              <Ionicons name="flash" size={24} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text className="text-foreground font-semibold">
                Lightning Fast
              </Text>
              <Text className="text-muted text-sm">Optimized performance</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={mutedColor} />
          </View>

          {/* Feature 3 */}
          <View className="bg-surface rounded-2xl p-4 border border-divider flex-row items-center">
            <View className="w-12 h-12 bg-purple-500/20 rounded-xl items-center justify-center mr-4">
              <Ionicons name="settings" size={24} color="#a855f7" />
            </View>
            <View className="flex-1">
              <Text className="text-foreground font-semibold">
                Customizable
              </Text>
              <Text className="text-muted text-sm">Tailored to your needs</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={mutedColor} />
          </View>

          {/* Feature 4 */}
          <View className="bg-surface rounded-2xl p-4 border border-divider flex-row items-center">
            <View className="w-12 h-12 bg-orange-500/20 rounded-xl items-center justify-center mr-4">
              <Ionicons name="help-circle" size={24} color="#f97316" />
            </View>
            <View className="flex-1">
              <Text className="text-foreground font-semibold">
                24/7 Support
              </Text>
              <Text className="text-muted text-sm">
                We're always here to help
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={mutedColor} />
          </View>
        </View>
      </View>

      {/* Stats Section */}
      <View className="mb-6 px-2">
        <Text className="text-2xl font-bold text-foreground mb-6">
          By The Numbers
        </Text>

        <View className="flex-row gap-4">
          <View className="flex-1 bg-surface rounded-2xl p-5 border border-divider items-center">
            <Text className="text-xl font-bold text-accent mb-1">100K+</Text>
            <Text className="text-muted text-xs text-center">Active Users</Text>
          </View>

          <View className="flex-1 bg-surface rounded-2xl p-5 border border-divider items-center">
            <Text className="text-xl font-bold text-accent mb-1">99.9%</Text>
            <Text className="text-muted text-xs text-center">Uptime</Text>
          </View>

          <View className="flex-1 bg-surface rounded-2xl p-5 border border-divider items-center">
            <Text className="text-xl font-bold text-accent mb-1">50+</Text>
            <Text className="text-muted text-xs text-center">Countries</Text>
          </View>
        </View>
      </View>

      {/* CTA Section */}
      <View className="mb-6 px-2">
        <View className="bg-accent/10 rounded-2xl p-6 border border-accent/20">
          <View className="items-center mb-6">
            <Ionicons name="star" size={40} color={accentColor} />
          </View>
          <Text className="text-2xl font-bold text-foreground mb-2 text-center">
            Ready to Explore?
          </Text>
          <Text className="text-muted text-center mb-6">
            Access your dashboard and start creating amazing things today.
          </Text>

          <Pressable className="bg-accent rounded-xl py-4 flex-row justify-center items-center active:opacity-90">
            <Ionicons
              name="arrow-forward"
              size={20}
              color={backgroundColor}
              style={{ marginRight: 8 }}
            />
            <Text className="text-background font-bold text-lg">
              Go to Dashboard
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Footer Stats */}
      <View className="border-t border-divider pt-6 pb-12">
        <Text className="text-muted text-xs text-center">
          🎉 Join thousands of happy users worldwide
        </Text>
        <Text className="text-muted text-xs text-center mt-2">
          Made with ❤️ for amazing people
        </Text>
      </View>
    </Container>
  );
}
