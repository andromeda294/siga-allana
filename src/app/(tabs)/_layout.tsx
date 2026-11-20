import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useThemeStyles } from "@/styles/useThemeStyles";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
    const { colors, settings } = useAppSettings();
    const styles = useThemeStyles(createStyles);
    const insets = useSafeAreaInsets();
    const blurTint =
        settings.themePreference === "dark"
            ? "dark"
            : settings.themePreference === "light"
                ? "light"
                : "default";

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarBackground: () => (
                    <BlurView intensity={80} tint={blurTint} style={styles.blurBackground} />
                ),
                tabBarStyle: [styles.tabBar, { bottom: Math.max(insets.bottom, 8) + 8 }],
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarHideOnKeyboard: true,
                tabBarItemStyle: styles.tabBarItem,
                tabBarLabelStyle: styles.tabBarLabel,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Início",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons
                            name="home-outline"
                            size={size}
                            color={typeof color === "number" || color === null || color === undefined ? undefined : color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="add-meals"
                options={{
                    title: "Adicionar",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons
                            name="add-circle-outline"
                            size={size}
                            color={typeof color === "number" || color === null || color === undefined ? undefined : color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="meals"
                options={{
                    title: "Refeições",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons
                            name="restaurant-outline"
                            size={size}
                            color={typeof color === "number" || color === null || color === undefined ? undefined : color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Perfil",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons
                            name="person-outline"
                            size={size}
                            color={typeof color === "number" || color === null || color === undefined ? undefined : color}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}

function createStyles(colors: ReturnType<typeof useAppSettings>["colors"]) {
    return StyleSheet.create({
        tabBar: {
            backgroundColor: "transparent",
            borderColor: colors.border,
            borderRadius: 32,
            borderTopWidth: 0,
            borderWidth: StyleSheet.hairlineWidth,
            elevation: 3,
            height: 68,
            left: 16,
            maxWidth: 520,
            paddingBottom: 4,
            paddingTop: 4,
            position: "absolute",
            right: 16,
            alignSelf: "center",
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: colors.shadowOpacity,
            shadowRadius: 14,
        },
        blurBackground: {
            ...StyleSheet.absoluteFill,
            borderRadius: 32,
            overflow: "hidden",
        },
        tabBarItem: {
            paddingVertical: 4,
        },
        tabBarLabel: {
            fontSize: 10,
            fontWeight: "600",
        },
    });
}
