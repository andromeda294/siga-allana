import { colors } from "@/styles/global";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

export default function HomeHeader() {
    const now = new Date();
    const currentDate = now.toLocaleDateString("pt-PT", {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    });
    const hour = now.getHours();
    const greeting = hour < 12 ? "Bom dia" : hour < 19 ? "Boa tarde" : "Boa noite";

    return (
        <View style={styles.container}>
            <View style={styles.brandRow}>
                <View style={styles.logo}>
                    <Ionicons name="leaf-outline" size={19} color={colors.primary} />
                </View>
                <Text style={styles.brand}>SIGA ALLANA</Text>
            </View>
            <Text style={styles.title}>{greeting}, Allana</Text>
            <Text style={styles.date}>{currentDate.charAt(0).toUpperCase() + currentDate.slice(1)}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 30,
    },
    brandRow: {
        alignItems: "center",
        flexDirection: "row",
        gap: 9,
        marginBottom: 22,
    },
    logo: {
        alignItems: "center",
        backgroundColor: "#e4f2e9",
        borderRadius: 12,
        height: 36,
        justifyContent: "center",
        width: 36,
    },
    brand: {
        color: colors.primary,
        fontSize: 11,
        fontWeight: "800",
        letterSpacing: 1.5,
    },
    title: {
        color: colors.text,
        fontSize: 30,
        fontWeight: "700",
        letterSpacing: -0.6,
    },
    date: {
        color: colors.textSecondary,
        fontSize: 14,
        marginTop: 6,
        textTransform: "capitalize",
    },
});