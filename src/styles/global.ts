import { StyleSheet } from "react-native";

export type ColorScheme = "light" | "dark";

export type AppColors = {
    background: string;
    surface: string;
    surfaceRaised: string;
    border: string;
    primary: string;
    primaryPressed: string;
    onPrimary: string;
    text: string;
    textSecondary: string;
    danger: string;
    success: string;
    protein: string;
    carbs: string;
    fat: string;
    water: string;
    shadow: string;
    shadowOpacity: number;
};

const palettes: Record<ColorScheme, AppColors> = {
    light: {
        background: "#f2f2f7",
        surface: "#ffffff",
        surfaceRaised: "#f2f2f7",
        border: "#e5e5ea",
        primary: "#007aff",
        primaryPressed: "#0062cc",
        onPrimary: "#ffffff",
        text: "#1c1c1e",
        textSecondary: "#8e8e93",
        danger: "#ff3b30",
        success: "#34c759",
        protein: "#34c759",
        carbs: "#007aff",
        fat: "#ff9500",
        water: "#0a84ff",
        shadow: "#000000",
        shadowOpacity: 0.08,
    },
    dark: {
        background: "#000000",
        surface: "#1c1c1e",
        surfaceRaised: "#2c2c2e",
        border: "#38383a",
        primary: "#0a84ff",
        primaryPressed: "#409cff",
        onPrimary: "#ffffff",
        text: "#ffffff",
        textSecondary: "#8e8e93",
        danger: "#ff453a",
        success: "#30d158",
        protein: "#30d158",
        carbs: "#0a84ff",
        fat: "#ff9f0a",
        water: "#64d2ff",
        shadow: "#000000",
        shadowOpacity: 0.2,
    },
};

export function getPalette(scheme: ColorScheme) {
    return palettes[scheme];
}

export function createGlobalStyles(colors: AppColors) {
    return StyleSheet.create({
        screen: {
            flex: 1,
            backgroundColor: colors.background,
        },
        content: {
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 124,
        },
        title: {
            color: colors.text,
            fontSize: 34,
            fontWeight: "700",
            letterSpacing: -1,
        },
        subtitle: {
            color: colors.textSecondary,
            fontSize: 14,
            lineHeight: 21,
        },
        sectionTitle: {
            color: colors.text,
            fontSize: 20,
            fontWeight: "600",
        },
        card: {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: 20,
            borderWidth: 1,
            elevation: 3,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: colors.shadowOpacity,
            shadowRadius: 10,
        },
    });
}

export type GlobalStyles = ReturnType<typeof createGlobalStyles>;
