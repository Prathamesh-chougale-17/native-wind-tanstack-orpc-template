import { cn } from "heroui-native";
import { type PropsWithChildren } from "react";
import { ScrollView, View, type ViewProps } from "react-native";
import Animated, { type AnimatedProps } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "./header";

const AnimatedView = Animated.createAnimatedComponent(View);

type Props = AnimatedProps<ViewProps> & {
  className?: string;
};

export function Container({
  children,
  className,
  ...props
}: PropsWithChildren<Props>) {
  const insets = useSafeAreaInsets();

  return (
    <AnimatedView
      className={cn("flex-1 bg-background", className)}
      style={{
        paddingBottom: insets.bottom,
        paddingTop: insets.top,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
      {...props}
    >
      <Header />

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {children}
      </ScrollView>
    </AnimatedView>
  );
}
