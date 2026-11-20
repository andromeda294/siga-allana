import { useThemeStyles } from "@/styles/useThemeStyles";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { StyleSheet, Text, View } from "react-native";

type MacroCardProps = {
    label: string;
    value: number;
    goal: number;
    unit: string;
    color: string;
};

export default function MacroCard({ label, value, goal, unit, color }: MacroCardProps) {
    const styles = useThemeStyles(createStyles);
    const progress = Math.min(value / goal, 1) * 100;
    const formattedValue = Math.round(value).toLocaleString("pt-PT");
    const formattedGoal = goal.toLocaleString("pt-PT");

    return (
        <View style={styles.card}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>
                {formattedValue}
                <Text style={styles.unit}> {unit}</Text>
            </Text>
            <View
                accessibilityRole="progressbar"
                accessibilityLabel={`${label}: ${formattedValue} de ${formattedGoal} ${unit}`}
                accessibilityValue={{ min: 0, max: goal, now: Math.min(value, goal) }}
                style={styles.track}
            >
                <View style={[styles.progress, { width: `${progress}%`, backgroundColor: color }]} />
            </View>
            <Text style={styles.goal}>Meta: {formattedGoal} {unit}</Text>
        </View>
    );
}

function createStyles(
    colors: ReturnType<typeof useAppSettings>["colors"],
    globalStyles: ReturnType<typeof useAppSettings>["globalStyles"],
) {
    return StyleSheet.create({
    card: {
        ...globalStyles.card,
        borderRadius: 16,
        flexBasis: "30%",
        flexGrow: 1,
        minWidth: 88,
        padding: 12,
    },
    label: {
        color: colors.textSecondary,
        fontSize: 11,
        fontWeight: "600",
    },
    value: {
        color: colors.text,
        fontSize: 20,
        fontWeight: "700",
        marginTop: 8,
    },
    unit: {
        color: colors.textSecondary,
        fontSize: 11,
        fontWeight: "500",
    },
    track: {
        backgroundColor: colors.surfaceRaised,
        borderRadius: 5,
        height: 6,
        marginTop: 11,
        overflow: "hidden",
    },
    progress: {
        borderRadius: 5,
        height: "100%",
    },
    goal: {
        color: colors.textSecondary,
        fontSize: 9,
        marginTop: 7,
    },
    });
}