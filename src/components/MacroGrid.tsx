import { useMeals } from "@/contexts/MealsContext";
import { colors } from "@/styles/global";
import MacroCard from "./MacroCard";
import { StyleSheet, Text, View } from "react-native";

export default function MacroGrid() {
    const { todayTotals, goals } = useMeals();
    const calorieProgress = Math.min(todayTotals.calories / goals.calories, 1) * 100;
    const remainingCalories = Math.max(goals.calories - Math.round(todayTotals.calories), 0);

    return (
        <View>
            <View style={styles.calorieCard}>
                <View style={styles.calorieHeader}>
                    <View>
                        <Text style={styles.calorieLabel}>CALORIAS CONSUMIDAS</Text>
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
                <MacroCard label="Proteína" value={todayTotals.protein} goal={goals.protein} unit="g" color="#16734d" />
                <MacroCard label="Hidratos" value={todayTotals.carbs} goal={goals.carbs} unit="g" color="#4574c4" />
                <MacroCard label="Gordura" value={todayTotals.fat} goal={goals.fat} unit="g" color="#c47832" />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginTop: 12,
    },
    calorieCard: {
        backgroundColor: colors.primary,
        borderRadius: 22,
        padding: 20,
    },
    calorieHeader: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    calorieLabel: {
        color: "#d7f0e2",
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 1.1,
    },
    calorieAmountRow: {
        alignItems: "baseline",
        flexDirection: "row",
        gap: 7,
        marginTop: 10,
    },
    calorieValue: {
        color: "#ffffff",
        fontSize: 38,
        fontWeight: "800",
        letterSpacing: -1,
    },
    calorieUnit: {
        color: "#e1f3e8",
        fontSize: 14,
        fontWeight: "600",
    },
    calorieGoal: {
        color: "#d7f0e2",
        fontSize: 12,
        marginTop: 2,
    },
    progressBadge: {
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.14)",
        borderColor: "rgba(255,255,255,0.24)",
        borderRadius: 38,
        borderWidth: 1,
        height: 74,
        justifyContent: "center",
        width: 74,
    },
    progressValue: {
        color: "#ffffff",
        fontSize: 18,
        fontWeight: "800",
    },
    progressLabel: {
        color: "#d7f0e2",
        fontSize: 9,
        marginTop: 1,
    },
    track: {
        backgroundColor: "rgba(255,255,255,0.2)",
        borderRadius: 5,
        height: 7,
        marginTop: 18,
        overflow: "hidden",
    },
    progress: {
        backgroundColor: "#ffffff",
        borderRadius: 5,
        height: "100%",
    },
    remaining: {
        color: "#e1f3e8",
        fontSize: 11,
        fontWeight: "600",
        marginTop: 8,
    },
});