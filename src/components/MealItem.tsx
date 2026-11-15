import { colors } from "@/styles/global";
import type { MealRecord } from "@/contexts/MealsContext";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

type MealItemProps = {
    meal: MealRecord;
    onRemove?: (id: string) => void;
    onEdit?: (id: string) => void;
    showDate?: boolean;
};

export default function MealItem({ meal, onRemove, onEdit, showDate = false }: MealItemProps) {
    const time = new Date(meal.createdAt).toLocaleString("pt-PT", showDate
        ? { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }
        : { hour: "2-digit", minute: "2-digit" });

    return (
        <View style={styles.card}>
            <View style={styles.iconWrap}>
                <Ionicons name="restaurant-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.details}>
                <View style={styles.heading}>
                    <Text style={styles.name} numberOfLines={1}>{meal.name}</Text>
                    <Text style={styles.time}>{time}</Text>
                </View>
                <Text style={styles.nutrition}>
                    {Math.round(meal.calories)} kcal
                    <Text style={styles.separator}>  ·  </Text>
                    {Math.round(meal.protein)}g proteína
                    <Text style={styles.separator}>  ·  </Text>
                    {Math.round(meal.carbs)}g hidratos
                    <Text style={styles.separator}>  ·  </Text>
                    {Math.round(meal.fat)}g gordura
                </Text>
            </View>
            {onEdit ? (
                <Link href="/add-meals" asChild>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Editar ${meal.name}`}
                        hitSlop={8}
                        onPress={() => onEdit(meal.id)}
                        style={styles.actionButton}
                    >
                        <Ionicons name="pencil-outline" size={17} color={colors.textSecondary} />
                    </Pressable>
                </Link>
            ) : null}
            {onRemove ? (
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Remover ${meal.name}`}
                    hitSlop={10}
                    onPress={() => onRemove(meal.id)}
                    style={styles.actionButton}
                >
                    <Ionicons name="trash-outline" size={18} color={colors.textSecondary} />
                </Pressable>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        alignItems: "center",
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderRadius: 16,
        borderWidth: 1,
        flexDirection: "row",
        gap: 12,
        marginBottom: 10,
        padding: 14,
    },
    iconWrap: {
        alignItems: "center",
        backgroundColor: colors.surfaceRaised,
        borderRadius: 13,
        height: 42,
        justifyContent: "center",
        width: 42,
    },
    details: {
        flex: 1,
        minWidth: 0,
    },
    heading: {
        alignItems: "center",
        flexDirection: "row",
        gap: 8,
        justifyContent: "space-between",
    },
    name: {
        color: colors.text,
        flex: 1,
        fontSize: 15,
        fontWeight: "700",
    },
    time: {
        color: colors.textSecondary,
        fontSize: 12,
    },
    nutrition: {
        color: colors.textSecondary,
        fontSize: 11,
        lineHeight: 17,
        marginTop: 5,
    },
    separator: {
        color: colors.border,
    },
    actionButton: {
        alignItems: "center",
        justifyContent: "center",
        minHeight: 36,
        minWidth: 28,
    },
});
