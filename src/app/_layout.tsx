import { Stack } from "expo-router";
import { MealsProvider } from "@/contexts/MealsContext";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform } from "react-native";

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === "web") {
      document.documentElement.classList.add("siga-app-ready");
    }
  }, []);

  return (
    <MealsProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </MealsProvider>
  );
}