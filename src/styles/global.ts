import { StyleSheet } from "react-native"

export const colors = {
    background: "#f5f8f5",
    surface: "#ffffff",
    surfaceRaised: "#edf3ee",
    border: "#e1e9e2",
    primary: "#16734d",
    primaryPressed: "#105f3f",
    text: "#17241c",
    textSecondary: "#738078",
    danger: "#bd3d36",
    success: "#16734d",
};

export const globalStyles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 32,
    },
    title: {
        color: colors.text,
        fontSize: 28,
        fontWeight: "700",
        letterSpacing: -0.5,
    },
    subtitle: {
        color: colors.textSecondary,
        fontSize: 14,
        lineHeight: 21,
    },
    sectionTitle: {
        color: colors.text,
        fontSize: 18,
        fontWeight: "700",
    },
    card: {
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderRadius: 18,
        borderWidth: 1,
    },
});