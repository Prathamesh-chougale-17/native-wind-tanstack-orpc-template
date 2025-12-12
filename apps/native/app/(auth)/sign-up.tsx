import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
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

  // Validation error state
  const [validationError, setValidationError] = useState<string | null>(null);

  // TanStack Query Mutation
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
      router.push("/(drawer)");
    },
  });

  async function handleSignUp() {
    // Validation
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
    <KeyboardAvoidingView behavior="padding" className="flex-1 bg-background">
      <ScrollView contentContainerClassName="flex-grow">
        <Container className="flex-1 justify-between py-8 px-6">
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

          {/* Form */}
          <View className="flex-1">
            {/* Error Message */}
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

            {/* Name Input */}
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
                  onChangeText={(text) => {
                    setName(text);
                    setValidationError(null);
                  }}
                  editable={!signUpMutation.isPending}
                />
              </View>
            </View>

            {/* Email Input */}
            <View className="mb-5">
              <Text className="text-foreground font-semibold mb-2 ml-1">
                Email
              </Text>
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
                    setValidationError(null);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!signUpMutation.isPending}
                />
              </View>
            </View>

            {/* Password Input */}
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
                  onChangeText={(text) => {
                    setPassword(text);
                    setValidationError(null);
                  }}
                  secureTextEntry={!showPassword}
                  editable={!signUpMutation.isPending}
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
              {password && !passwordValid && (
                <Text className="text-danger text-xs mt-1 ml-1">
                  Must be at least 8 characters
                </Text>
              )}
              {passwordValid && (
                <View className="flex-row items-center mt-1">
                  <Ionicons
                    name="checkmark-circle"
                    size={14}
                    color={successColor}
                  />
                  <Text className="text-success text-xs ml-1">
                    Password strength: Good
                  </Text>
                </View>
              )}
            </View>

            {/* Confirm Password Input */}
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
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    setValidationError(null);
                  }}
                  secureTextEntry={!showConfirmPassword}
                  editable={!signUpMutation.isPending}
                />
                <Pressable
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  hitSlop={8}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye" : "eye-off"}
                    size={20}
                    color={mutedColor}
                  />
                </Pressable>
              </View>
              {confirmPassword && !passwordMatch && (
                <Text className="text-danger text-xs mt-1 ml-1">
                  Passwords do not match
                </Text>
              )}
              {passwordMatch && (
                <View className="flex-row items-center mt-1">
                  <Ionicons
                    name="checkmark-circle"
                    size={14}
                    color={successColor}
                  />
                  <Text className="text-success text-xs ml-1">
                    Passwords match
                  </Text>
                </View>
              )}
            </View>

            {/* Sign Up Button */}
            <Pressable
              onPress={handleSignUp}
              disabled={signUpMutation.isPending}
              className={`${
                signUpMutation.isPending ? "opacity-70" : "active:opacity-90"
              } bg-accent rounded-xl py-4 flex-row justify-center items-center mb-4`}
            >
              {signUpMutation.isPending ? (
                <ActivityIndicator size="small" color={backgroundColor} />
              ) : (
                <>
                  <Ionicons
                    name="person-add-outline"
                    size={20}
                    color={backgroundColor}
                    style={{ marginRight: 8 }}
                  />
                  <Text className="text-background font-bold text-lg">
                    Create Account
                  </Text>
                </>
              )}
            </Pressable>

            {/* Divider */}
            <View className="flex-row items-center mb-6">
              <View className="flex-1 h-px bg-divider" />
              <Text className="px-3 text-muted text-sm">OR</Text>
              <View className="flex-1 h-px bg-divider" />
            </View>

            {/* Social Login Buttons */}
            <View className="flex-row gap-3 mb-6">
              <Pressable className="flex-1 border border-divider rounded-xl py-3 active:bg-surface">
                <View className="items-center">
                  <Ionicons
                    name="logo-google"
                    size={24}
                    color={foregroundColor}
                  />
                </View>
              </Pressable>
              <Pressable className="flex-1 border border-divider rounded-xl py-3 active:bg-surface">
                <View className="items-center">
                  <Ionicons
                    name="logo-apple"
                    size={24}
                    color={foregroundColor}
                  />
                </View>
              </Pressable>
            </View>
          </View>

          {/* Footer */}
          <View className="flex-row items-center justify-center mb-8">
            <Text className="text-muted">Already have an account? </Text>
            <Link href="/(auth)/sign-in" asChild>
              <Pressable className="active:opacity-70">
                <Text className="text-accent font-bold">Sign In</Text>
              </Pressable>
            </Link>
          </View>
        </Container>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
