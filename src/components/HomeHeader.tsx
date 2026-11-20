import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useThemeStyles } from "@/styles/useThemeStyles";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function HomeHeader() {
    const { settings, colors } = useAppSettings();
    const styles = useThemeStyles(createStyles);
    const now = new Date();
    const currentDate = now.toLocaleDateString("pt-PT", {
        weekday: "long",
        month: "long",
        day: "numeric",
    });
    const hour = now.getHours();
    const greeting = hour < 12 ? "Bom dia" : hour < 19 ? "Boa tarde" : "Boa noite";
    const firstName = settings.profile.name.trim().split(/\s+/)[0];

    return (
        <View style={styles.container}>
            <View style={styles.brandRow}>
                <Text style={styles.brand}>RITMO</Text>
                <View style={styles.separator} />
                <Text style={styles.date}>{currentDate}</Text>
            </View>
            <View style={styles.headingRow}>
                <Text numberOfLines={2} style={styles.title}>
                    {firstName ? `${greeting}, ${firstName}` : greeting}
                </Text>
                <Link href="/profile" asChild>
                    <Pressable
                        accessibilityLabel="Abrir perfil"
                        accessibilityRole="link"
                        hitSlop={8}
                        style={styles.profileButton}
                    >
                        <Ionicons name="person-outline" size={20} color={colors.primary} />
                    </Pressable>
                </Link>
            </View>
        </View>
    );
}

function createStyles(colors: ReturnType<typeof useAppSettings>["colors"]) {
    return StyleSheet.create({
    container: {
        marginBottom: 26,
    },
    brandRow: {
        alignItems: "center",
        flexDirection: "row",
        gap: 10,
        marginBottom: 9,
    },
    brand: {
        color: colors.primary,
        fontSize: 11,
        fontWeight: "800",
        letterSpacing: 1.3,
    },
    separator: {
        backgroundColor: colors.border,
        height: 12,
        width: 1,
    },
    headingRow: {
        alignItems: "center",
        flexDirection: "row",
        gap: 12,
    },
    title: {
        color: colors.text,
        flex: 1,
        fontSize: 34,
        fontWeight: "700",
        letterSpacing: -1,
        lineHeight: 40,
    },
    date: {
        color: colors.textSecondary,
        flexShrink: 1,
        fontSize: 12,
        textTransform: "capitalize",
    },
    profileButton: {
        alignItems: "center",
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderRadius: 22,
        borderWidth: 1,
        height: 44,
        justifyContent: "center",
        width: 44,
    },
    });
}