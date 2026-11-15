import { colors } from "@/styles/global";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";


export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                    borderTopWidth: 1,
                    paddingTop: 6,
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: "600",
                },
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
        </Tabs>
    )
}