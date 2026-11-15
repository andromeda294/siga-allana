import { useMeals } from "@/contexts/MealsContext";
import { colors, globalStyles } from "@/styles/global";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function WaterTracker() {
    const { goals, todayWaterMl, addWater, undoLastWater } = useMeals();
    const progress = Math.min(todayWaterMl / goals.waterMl, 1) * 100;

    return (
        <View style={styles.card}>
            <View style={styles.heading}>
                <View style={styles.iconWrap}>
                    <Ionicons name="water-outline" size={20} color="#77a8ff" />
                </View>
                <View style={styles.headingText}>
                    <Text style={styles.title}>Hidratação</Text>
                    <Text style={styles.subtitle}>
                        {todayWaterMl.toLocaleString("pt-PT")} / {goals.waterMl.toLocaleString("pt-PT")} ml
                    </Text>
                </View>
                {todayWaterMl > 0 ? (
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Anular último registo de água"
                        hitSlop={8}
                        onPress={undoLastWater}
                        style={styles.undoButton}
                    >
                        <Ionicons name="arrow-undo-outline" size={18} color={colors.textSecondary} />
                    </Pressable>
                ) : null}
            </View>
            <View
                accessibilityRole="progressbar"
                accessibilityLabel="Progresso de hidratação"
                accessibilityValue={{ min: 0, max: goals.waterMl, now: Math.min(todayWaterMl, goals.waterMl) }}
                style={styles.track}
            >
                <View style={[styles.progress, { width: `${progress}%` }]} />
            </View>
            <View style={styles.actions}>
                <Pressable
                    accessibilityRole="button"
                    onPress={() => addWater(250)}
                    style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
                >
                    <Text style={styles.addButtonText}>+ 250 ml</Text>
                </Pressable>
                <Pressable
                    accessibilityRole="button"
                    onPress={() => addWater(500)}
                    style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
                >
                    <Text style={styles.addButtonText}>+ 500 ml</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        ...globalStyles.card,
        marginTop: 24,
        padding: 16,
    },
    heading: {
        alignItems: "center",
        flexDirection: "row",
        gap: 11,
    },
    iconWrap: {
        alignItems: "center",
        backgroundColor: colors.surfaceRaised,
        borderRadius: 12,
        height: 40,
        justifyContent: "center",
        width: 40,
    },
    headingText: {
        flex: 1,
    },
    title: {
        color: colors.text,
        fontSize: 14,
        fontWeight: "700",
    },
    subtitle: {
        color: colors.textSecondary,
        fontSize: 12,
        marginTop: 3,
    },
    undoButton: {
        alignItems: "center",
        justifyContent: "center",
        minHeight: 36,
        minWidth: 36,
    },
    track: {
        backgroundColor: colors.surfaceRaised,
        borderRadius: 5,
        height: 7,
        marginTop: 16,
        overflow: "hidden",
    },
    progress: {
        backgroundColor: "#77a8ff",
        borderRadius: 5,
        height: "100%",
    },
    actions: {
        flexDirection: "row",
        gap: 10,
        marginTop: 14,
    },
    addButton: {
        alignItems: "center",
        backgroundColor: colors.surfaceRaised,
        borderColor: colors.border,
        borderRadius: 10,
        borderWidth: 1,
        flex: 1,
        justifyContent: "center",
        minHeight: 40,
    },
    pressed: {
        opacity: 0.75,
    },
    addButtonText: {
        color: colors.text,
        fontSize: 12,
        fontWeight: "700",
    },
});
