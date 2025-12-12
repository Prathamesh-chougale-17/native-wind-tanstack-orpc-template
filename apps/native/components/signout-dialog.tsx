import { View, Text, Pressable, Modal } from "react-native";
import { useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";

interface SignOutConfirmDialogProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function SignOutConfirmDialog({
  visible,
  onConfirm,
  onCancel,
  isLoading,
}: SignOutConfirmDialogProps) {
  const surfaceColor = useThemeColor("surface");
  const dangerColor = useThemeColor("danger");

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <View
          className="bg-surface rounded-3xl w-full max-w-sm p-6 border border-divider"
          style={{ backgroundColor: surfaceColor }}
        >
          {/* Icon */}
          <View className="items-center mb-4">
            <View className="w-16 h-16 bg-danger/10 rounded-full items-center justify-center border border-danger/20">
              <Ionicons name="exit-outline" size={32} color={dangerColor} />
            </View>
          </View>

          {/* Title */}
          <Text className="text-2xl font-bold text-foreground text-center mb-2">
            Sign Out?
          </Text>

          {/* Description */}
          <Text className="text-muted text-center text-base mb-8">
            Are you sure you want to sign out? You'll need to sign in again to
            access your account.
          </Text>

          {/* Buttons */}
          <View className="gap-3">
            {/* Cancel Button */}
            <Pressable
              disabled={isLoading}
              onPress={onCancel}
              className="bg-surface border border-divider rounded-xl py-3 items-center justify-center active:opacity-70"
            >
              <Text className="text-foreground font-semibold">Cancel</Text>
            </Pressable>

            {/* Confirm Button */}
            <Pressable
              disabled={isLoading}
              onPress={onConfirm}
              className={`${
                isLoading ? "opacity-70" : "active:opacity-90"
              } bg-danger rounded-xl py-3 flex-row items-center justify-center`}
            >
              {isLoading ? (
                <Text className="text-white font-semibold">Signing out...</Text>
              ) : (
                <>
                  <Ionicons
                    name="log-out-outline"
                    size={20}
                    color="white"
                    style={{ marginRight: 8 }}
                  />
                  <Text className="text-white font-semibold">Sign Out</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
