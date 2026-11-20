import { useMeals } from "@/contexts/MealsContext";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useThemeStyles } from "@/styles/useThemeStyles";
import MacroCard from "./MacroCard";
import { StyleSheet, Text, View } from "react-native";

export default function MacroGrid() {
    const { colors } = useAppSettings();
    const styles = useThemeStyles(createStyles);
    const { todayTotals, goals } = useMeals();
    const calorieProgress = Math.min(todayTotals.calories / goals.calories, 1) * 100;
    const remainingCalories = Math.max(goals.calories - Math.round(todayTotals.calories), 0);

    return (
        <View>
            <View style={styles.calorieCard}>
                <View style={styles.calorieHeader}>
                    <View>
                        <Text style={styles.calorieLabel}>CALORIAS HOJE</Text>
                        <View style={styles.calorieAmountRow}>
                            <Text style={styles.calorieValue}>
                                {Math.round(todayTotals.calories).toLocaleString("pt-PT")}
                            </Text>
                            <Text style={styles.calorieUnit}>kcal</Text>
                        </View>
                        <Text style={styles.calorieGoal}>de {goals.calories.toLocaleString("pt-PT")} kcal</Text>
                    </View>
                    <View style={styles.progressBadge}>
                        <Text style={styles.progressValue}>{Math.round(calorieProgress)}%</Text>
                        <Text style={styles.progressLabel}>da meta</Text>
                    </View>
                </View>
                <View style={styles.track}>
                    <View style={[styles.progress, { width: `${calorieProgress}%` }]} />
                </View>
                <Text style={styles.remaining}>
                    {remainingCalories > 0 ? `${remainingCalories.toLocaleString("pt-PT")} kcal restantes` : "Meta diária alcançada"}
                </Text>
            </View>
            <View style={styles.grid}>
                <MacroCard label="Proteína" value={todayTotals.protein} goal={goals.protein} unit="g" color={colors.protein} />
                <MacroCard label="Hidratos" value={todayTotals.carbs} goal={goals.carbs} unit="g" color={colors.carbs} />
                <MacroCard label="Gordura" value={todayTotals.fat} goal={goals.fat} unit="g" color={colors.fat} />
            </View>
        </View>
    );
}

function createStyles(
    colors: ReturnType<typeof useAppSettings>["colors"],
    globalStyles: ReturnType<typeof useAppSettings>["globalStyles"],
) {
    return StyleSheet.create({
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginTop: 12,
    },
    calorieCard: {
        ...globalStyles.card,
        borderRadius: 24,
        padding: 22,
    },
    calorieHeader: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    calorieLabel: {
        color: colors.textSecondary,
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 1,
    },
    calorieAmountRow: {
        alignItems: "baseline",
        flexDirection: "row",
        gap: 7,
        marginTop: 10,
    },
    calorieValue: {
        color: colors.text,
        fontSize: 42,
        fontWeight: "800",
        letterSpacing: -1.5,
    },
    calorieUnit: {
        color: colors.textSecondary,
        fontSize: 14,
        fontWeight: "600",
    },
    calorieGoal: {
        color: colors.textSecondary,
        fontSize: 12,
        marginTop: 2,
    },
    progressBadge: {
        alignItems: "center",
        backgroundColor: colors.surfaceRaised,
        borderColor: colors.border,
        borderRadius: 38,
        borderWidth: 1,
        height: 74,
        justifyContent: "center",
        width: 74,
    },
    progressValue: {
        color: colors.primary,
        fontSize: 18,
        fontWeight: "800",
    },
    progressLabel: {
        color: colors.textSecondary,
        fontSize: 9,
        marginTop: 1,
    },
    track: {
        backgroundColor: colors.surfaceRaised,
        borderRadius: 5,
        height: 7,
        marginTop: 18,
        overflow: "hidden",
    },
    progress: {
        backgroundColor: colors.primary,
        borderRadius: 5,
        height: "100%",
    },
    remaining: {
        color: colors.textSecondary,
        fontSize: 11,
        fontWeight: "600",
        marginTop: 8,
    },
    });
}