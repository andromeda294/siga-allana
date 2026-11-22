import { Stack } from "expo-router";
import AdsProvider from "@/contexts/AdsProvider";
import { MealsProvider } from "@/contexts/MealsContext";
import { AppSettingsProvider, useAppSettings } from "@/contexts/AppSettingsContext";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

function AppNavigator() {
  const { colorScheme } = useAppSettings();

  return (
    <>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === "web") {
      document.documentElement.classList.add("siga-app-ready");
    }
  }, []);

  return (
    <AdsProvider>
      <AppSettingsProvider>
        <MealsProvider>
          <AppNavigator />
        </MealsProvider>
      </AppSettingsProvider>
    </AdsProvider>
  );
}