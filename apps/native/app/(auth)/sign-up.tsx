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

export default function SignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const mutedColor = useThemeColor("muted");
  const accentColor = useThemeColor("accent");
  const foregroundColor = useThemeColor("foreground");
  const dangerColor = useThemeColor("danger");
  const successColor = useThemeColor("success");
  const backgroundColor = useThemeColor("background");

  const [validationError, setValidationError] = useState<string | null>(null);

  const signUpMutation = useMutation({
    mutationFn: async (credentials: {
      name: string;
      email: string;
      password: string;
    }) => {
      return new Promise((resolve, reject) => {
        authClient.signUp.email(credentials, {
          onError(error) {
            reject(error.error?.message || "Failed to create account");
          },
          onSuccess() {
            resolve("Account created successfully");
          },
        });
      });
    },
    onSuccess: () => {
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      queryClient.refetchQueries();
      router.replace("/(auth)/sign-in");
    },
  });

  async function handleSignUp() {
    setValidationError(null);

    if (!name || !email || !password || !confirmPassword) {
      setValidationError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setValidationError("Password must be at least 8 characters");
      return;
    }

    if (!email.includes("@")) {
      setValidationError("Please enter a valid email");
      return;
    }

    signUpMutation.mutate({ name, email, password });
  }

  const passwordMatch =
    password && confirmPassword && password === confirmPassword;
  const passwordValid = password.length >= 8;

  return (
    <Container className="flex-1 justify-between px-2">
      {/* Header */}
      <View className="mt-8">
        <View className="mb-6 items-center">
          <View className="w-20 h-20 bg-accent rounded-2xl items-center justify-center mb-4">
            <Ionicons name="person-add" size={40} color={backgroundColor} />
          </View>
          <Text className="text-3xl font-bold text-foreground mb-2">
            Create Account
          </Text>
          <Text className="text-muted text-center text-base">
            Join us and start exploring
          </Text>
        </View>
      </View>

      {/* ERROR */}
      {(validationError || signUpMutation.isError) && (
        <View className="mb-4 p-4 bg-danger/10 rounded-xl border border-danger/20 flex-row items-center">
          <Ionicons name="alert-circle" size={20} color={dangerColor} />
          <Text className="text-danger ml-2 flex-1 text-sm font-medium">
            {validationError ||
              (signUpMutation.error instanceof Error
                ? signUpMutation.error.message
                : String(signUpMutation.error))}
          </Text>
        </View>
      )}

      {/* Inputs */}
      <View className="flex-1">
        {/* Name */}
        <View className="mb-5">
          <Text className="text-foreground font-semibold mb-2 ml-1">
            Full Name
          </Text>
          <View className="bg-surface border border-divider rounded-xl px-4 py-1 flex-row items-center">
            <Ionicons
              name="person-outline"
              size={20}
              color={mutedColor}
              style={{ marginRight: 8 }}
            />
            <TextInput
              className="flex-1 text-foreground py-4"
              placeholder="John Doe"
              placeholderTextColor={mutedColor}
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>

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
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={setEmail}
            />
          </View>
        </View>

        {/* Password */}
        <View className="mb-5">
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
              secureTextEntry
              onChangeText={setPassword}
            />
          </View>
        </View>

        {/* Confirm Password */}
        <View className="mb-6">
          <Text className="text-foreground font-semibold mb-2 ml-1">
            Confirm Password
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
              value={confirmPassword}
              secureTextEntry
              onChangeText={setConfirmPassword}
            />
          </View>
        </View>

        {/* Submit Button */}
        <Pressable
          onPress={handleSignUp}
          className="bg-accent rounded-xl py-4 flex-row justify-center items-center mb-4"
        >
          {signUpMutation.isPending ? (
            <ActivityIndicator size="small" color={backgroundColor} />
          ) : (
            <Text className="text-background font-bold text-lg">
              Create Account
            </Text>
          )}
        </Pressable>

        {/* Link to Sign In */}
        <View className="flex-row items-center justify-center mb-8">
          <Text className="text-muted">Already have an account? </Text>
          <Link href="/(auth)/sign-in" asChild>
            <Pressable>
              <Text className="text-accent font-bold">Sign In</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </Container>
  );
}
