import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useRouter, Link } from "expo-router";
import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/utils/orpc";
import { useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { Container } from "@/components/container";
import { useMutation } from "@tanstack/react-query";

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const mutedColor = useThemeColor("muted");
  const foregroundColor = useThemeColor("foreground");
  const dangerColor = useThemeColor("danger");
  const backgroundColor = useThemeColor("background");

  // Mutation for login
  const signInMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      return new Promise((resolve, reject) => {
        authClient.signIn.email(credentials, {
          onError(error) {
            reject(error.error?.message || "Failed to sign in");
          },
          onSuccess() {
            resolve("Sign in successful");
          },
        });
      });
    },
    onSuccess: () => {
      setEmail("");
      setPassword("");
      queryClient.refetchQueries();
      router.replace("/"); // go to home
    },
  });

  function handleLogin() {
    if (!email || !password) return;
    signInMutation.mutate({ email, password });
  }

  return (
    <Container className="flex-1 justify-between px-2">
      {/* Header */}
      <View className="mt-12">
        <View className="mb-6 items-center">
          <View className="w-20 h-20 bg-accent rounded-2xl items-center justify-center mb-4">
            <Ionicons name="lock-closed" size={40} color={backgroundColor} />
          </View>

          <Text className="text-3xl font-bold text-foreground mb-2">
            Welcome Back
          </Text>

          <Text className="text-muted text-center text-base">
            Sign in to continue to your account
          </Text>
        </View>
      </View>

      {/* Form */}
      <View className="flex-1">
        {/* Error */}
        {signInMutation.isError && (
          <View className="mb-4 p-4 bg-danger/10 rounded-xl border border-danger/20 flex-row items-center">
            <Ionicons name="alert-circle" size={20} color={dangerColor} />
            <Text className="text-danger ml-2 flex-1 text-sm font-medium">
              {signInMutation.error instanceof Error
                ? signInMutation.error.message
                : String(signInMutation.error)}
            </Text>
          </View>
        )}

        {/* Email */}
        <View className="mb-5">
          <Text className="text-foreground font-semibold mb-2 ml-1">Email</Text>

          <View className="bg-surface border border-divider rounded-xl px-4 py-1 flex-row items-center">
            <Ionicons
              name="mail-outline"
              size={20}
              color={mutedColor}
              style={{ marginRight: 8 }}
            />

            <TextInput
              className="flex-1 text-foreground py-4"
              placeholder="you@example.com"
              placeholderTextColor={mutedColor}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                signInMutation.reset();
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!signInMutation.isPending}
            />
          </View>
        </View>

        {/* Password */}
        <View className="mb-6">
          <Text className="text-foreground font-semibold mb-2 ml-1">
            Password
          </Text>

          <View className="bg-surface border border-divider rounded-xl px-4 py-1 flex-row items-center">
            <Ionicons
              name="key-outline"
              size={20}
              color={mutedColor}
              style={{ marginRight: 8 }}
            />

            <TextInput
              className="flex-1 text-foreground py-4"
              placeholder="••••••••"
              placeholderTextColor={mutedColor}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                signInMutation.reset();
              }}
              secureTextEntry={!showPassword}
              editable={!signInMutation.isPending}
            />

            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={8}
            >
              <Ionicons
                name={showPassword ? "eye" : "eye-off"}
                size={20}
                color={mutedColor}
              />
            </Pressable>
          </View>
        </View>

        {/* Forgot Password */}
        <Pressable className="mb-8 active:opacity-70">
          <Text className="text-accent font-semibold text-center">
            Forgot Password?
          </Text>
        </Pressable>

        {/* Sign In Button */}
        <Pressable
          onPress={handleLogin}
          disabled={signInMutation.isPending}
          className={`${
            signInMutation.isPending ? "opacity-70" : "active:opacity-90"
          } bg-accent rounded-xl py-4 flex-row justify-center items-center mb-4`}
        >
          {signInMutation.isPending ? (
            <ActivityIndicator size="small" color={backgroundColor} />
          ) : (
            <>
              <Ionicons
                name="log-in-outline"
                size={20}
                color={backgroundColor}
                style={{ marginRight: 8 }}
              />
              <Text className="text-background font-bold text-lg">Sign In</Text>
            </>
          )}
        </Pressable>

        {/* Divider */}
        <View className="flex-row items-center mb-6">
          <View className="flex-1 h-px bg-divider" />
          <Text className="px-3 text-muted text-sm">OR</Text>
          <View className="flex-1 h-px bg-divider" />
        </View>

        {/* Social Login */}
        <View className="flex-row gap-3 mb-6">
          <Pressable className="flex-1 border border-divider rounded-xl py-3 active:bg-surface">
            <View className="items-center">
              <Ionicons name="logo-google" size={24} color={foregroundColor} />
            </View>
          </Pressable>

          <Pressable className="flex-1 border border-divider rounded-xl py-3 active:bg-surface">
            <View className="items-center">
              <Ionicons name="logo-apple" size={24} color={foregroundColor} />
            </View>
          </Pressable>
        </View>
      </View>

      {/* Footer */}
      <View className="flex-row items-center justify-center mb-8">
        <Text className="text-muted">Don't have an account? </Text>

        <Link href="/(auth)/sign-up" asChild>
          <Pressable className="active:opacity-70">
            <Text className="text-accent font-bold">Sign Up</Text>
          </Pressable>
        </Link>
      </View>
    </Container>
  );
}
