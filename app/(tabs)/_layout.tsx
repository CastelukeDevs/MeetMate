import { Icon } from "@/components/ui/icon";
import { Tabs } from "expo-router";
import { AudioWaveform, Mic, User } from "lucide-react-native";

const TabsNavigation = () => {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          title: "Recording",
          tabBarIcon: (props) => <Icon name={Mic} {...props} />,
        }}
      />
      <Tabs.Screen
        name="meetings"
        options={{
          headerShown: false,
          title: "Meetings",
          tabBarIcon: (props) => <Icon name={AudioWaveform} {...props} />,
        }}
      />
      <Tabs.Screen
        name="me"
        options={{
          headerShown: false,
          title: "Me",
          tabBarIcon: (props) => <Icon name={User} {...props} />,
        }}
      />
    </Tabs>
  );
};

export default TabsNavigation;
