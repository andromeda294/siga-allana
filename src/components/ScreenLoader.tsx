import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useThemeStyles } from "@/styles/useThemeStyles";
import { Image } from "expo-image";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ScreenLoader() {
    const { colors, globalStyles } = useAppSettings();
    const styles = useThemeStyles(createStyles);
    return (
        <SafeAreaView style={globalStyles.screen}>
            <View style={styles.content}>
                <Image
                    source={require("../../assets/images/icon.png")}
                    style={styles.logo}
                    contentFit="cover"
                    accessibilityLabel="Ritmo"
                />
                <Text style={styles.brand}>RITMO</Text>
                <Text style={styles.tagline}>NUTRIÇÃO · BEM-ESTAR</Text>
                <ActivityIndicator color={colors.primary} size="large" />
                <Text style={styles.label}>A preparar a tua experiência...</Text>
            </View>
        </SafeAreaView>
    );
}

function createStyles(
    colors: ReturnType<typeof useAppSettings>["colors"],
    globalStyles: ReturnType<typeof useAppSettings>["globalStyles"],
) {
    return StyleSheet.create({
    content: {
        alignItems: "center",
        flex: 1,
        gap: 12,
        justifyContent: "center",
    },
    logo: {
        borderRadius: 22,
        height: 84,
        marginBottom: 8,
        width: 84,
    },
    brand: {
        color: colors.text,
        fontSize: 16,
        fontWeight: "800",
        letterSpacing: 2,
    },
    tagline: {
        color: colors.textSecondary,
        fontSize: 10,
        fontWeight: "600",
        letterSpacing: 1.5,
        marginBottom: 18,
    },
    label: {
        color: colors.textSecondary,
        fontSize: 13,
    },
    });
}
