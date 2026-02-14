import { useColorScheme } from "@/hooks/useColorScheme";
import { Image, ImageStyle, StyleProp } from "react-native";

const logoLight = require("@/assets/images/ios-light.png");
const logoDark = require("@/assets/images/ios-dark.png");

export interface MeetMateLogoProps {
  size?: number;
  style?: StyleProp<ImageStyle>;
}

export function MeetMateLogo({ size = 48, style }: MeetMateLogoProps) {
  const colorScheme = useColorScheme();
  const source = colorScheme === "dark" ? logoDark : logoLight;

  return (
    <Image
      source={source}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size * 0.25,
        },
        style,
      ]}
    />
  );
}
