import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, Keyboard, Platform, View } from "react-native";
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { MainTabParamList } from "./types";
import { useTheme } from "@/theme/ThemeProvider";
import { useAuthStore } from "@/store/authStore";
import { WebLayout, type WebNavItem } from "@/components/layout/WebLayout";
import HomeScreen from "@/screens/home/HomeScreen";
import CoursesTabScreen from "@/screens/home/CoursesTabScreen";
import MyLearningScreen from "@/screens/progress/MyLearningScreen";
import DownloadsScreen from "@/screens/progress/DownloadsScreen";
import AskDoubtsTabScreen from "@/screens/tabs/AskDoubtsTabScreen";
import WhatsappTabScreen from "@/screens/tabs/WhatsappTabScreen";

const Tab = createBottomTabNavigator<MainTabParamList>();

const tabIcons: Record<keyof MainTabParamList, string> = {
  HomeTab: "🏠",
  CoursesTab: "📋",
  MyCoursesTab: "🎓",
  DownloadsTab: "📥",
  AskDoubtsTab: "🌐",
  WhatsappTab: "💬",
};

/** Home for the web chrome: keeps the SAME screens, just swaps the chrome. */
function WebTabsHome() {
  const navigation = useNavigation<any>();
  const logout = useAuthStore((s) => s.logout);
  const [active, setActive] = useState<keyof MainTabParamList>("HomeTab");

  const tabs: WebNavItem[] = (
    [
      { key: "HomeTab", icon: "🏠", label: "Home" },
      { key: "CoursesTab", icon: "📋", label: "Courses" },
      { key: "MyCoursesTab", icon: "🎓", label: "My Courses" },
      { key: "DownloadsTab", icon: "📥", label: "Downloads" },
      { key: "AskDoubtsTab", icon: "🌐", label: "Ask Doubts" },
      { key: "WhatsappTab", icon: "💬", label: "Whatsapp" },
    ] as { key: keyof MainTabParamList; icon: string; label: string }[]
  ).map((t) => ({ ...t, onPress: () => setActive(t.key) }));

  // The drawer's items, now permanent left-sidebar entries (same actions).
  const go = (screen: string) => {
    const stackRoutes = [
      "Settings",
      "Subscription",
      "LearningAnalytics",
      "Support",
      "About",
      "Notifications",
      "SocialLinks",
      "Bookmarks",
    ];
    if (stackRoutes.includes(screen)) navigation.navigate(screen as never);
  };

  const menu: WebNavItem[] = [
    { key: "home", icon: "🏠", label: "Home", onPress: () => setActive("HomeTab") },
    { key: "purchases", icon: "💳", label: "Purchases", onPress: () => go("Subscription") },
    { key: "chat", icon: "💬", label: "Chat", onPress: () => setActive("AskDoubtsTab") },
    { key: "settings", icon: "⚙️", label: "Settings", onPress: () => go("Settings") },
    { key: "progress", icon: "📈", label: "Progress Report", onPress: () => go("LearningAnalytics") },
    { key: "refer", icon: "🎁", label: "Refer & Earn", onPress: () => go("Support") },
    { key: "rate", icon: "⭐", label: "Rate", onPress: () => go("About") },
    {
      key: "share",
      icon: "🔗",
      label: "Share",
      onPress: () => go("SocialLinks"),
    },
    { key: "tutorial", icon: "🎓", label: "App Tutorial", onPress: () => go("About") },
    {
      key: "notifications",
      icon: "🔔",
      label: "Notifications",
      onPress: () => go("Notifications"),
    },
    { key: "exit", icon: "🚪", label: "Logout", onPress: () => logout(), danger: true },
  ];

  const socials = [
    { icon: "✈️", url: "https://t.me/" },
    { icon: "🌐", url: "https://conceptbuilderclasses.com" },
    { icon: "💬", url: "https://wa.me/" },
    { icon: "▶️", url: "https://youtube.com" },
    { icon: "📸", url: "https://instagram.com" },
    { icon: "📘", url: "https://facebook.com" },
  ];

  const screens: Record<keyof MainTabParamList, React.ReactNode> = {
    HomeTab: <HomeScreen />,
    CoursesTab: <CoursesTabScreen />,
    MyCoursesTab: <MyLearningScreen />,
    DownloadsTab: <DownloadsScreen />,
    AskDoubtsTab: <AskDoubtsTabScreen />,
    WhatsappTab: <WhatsappTabScreen />,
  };

  return (
    <WebLayout tabs={tabs} activeTab={active} menu={menu} socials={socials}>
      <View style={{ flex: 1, minHeight: 0 }}>{screens[active]}</View>
    </WebLayout>
  );
}

export function MainTabs() {
  const { colors, brand } = useTheme();

  // ── WEB: top navbar + left sidebar (the requested web layout) ──
  if (Platform.OS === "web") {
    return <WebTabsHome />;
  }

  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setKeyboardVisible(true)
    );
    const hide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardVisible(false)
    );
    return () => { show.remove(); hide.remove(); };
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: brand.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: keyboardVisible
          ? { display: "none" }
          : { backgroundColor: colors.surface, borderTopColor: colors.border, height: 60, paddingBottom: 6 },
        tabBarLabelStyle: { fontSize: 10, fontWeight: "600" },
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 18, color: focused ? brand.primary : colors.muted }}>
            {tabIcons[route.name as keyof MainTabParamList]}
          </Text>
        ),
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ tabBarLabel: "Home" }} />
      <Tab.Screen name="CoursesTab" component={CoursesTabScreen} options={{ tabBarLabel: "Courses" }} />
      <Tab.Screen name="MyCoursesTab" component={MyLearningScreen} options={{ tabBarLabel: "My Courses" }} />
      <Tab.Screen name="DownloadsTab" component={DownloadsScreen} options={{ tabBarLabel: "Downloads" }} />
      <Tab.Screen name="AskDoubtsTab" component={AskDoubtsTabScreen} options={{ tabBarLabel: "Ask Doubts" }} />
      <Tab.Screen name="WhatsappTab" component={WhatsappTabScreen} options={{ tabBarLabel: "Whatsapp" }} />
    </Tab.Navigator>
  );
}
