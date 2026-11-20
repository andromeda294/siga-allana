import { useMeals } from "@/contexts/MealsContext";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useThemeStyles } from "@/styles/useThemeStyles";
import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import MealItem from "./MealItem";

export default function RecentMeals() {
    const { globalStyles } = useAppSettings();
    const styles = useThemeStyles(createStyles);
    const { todayMeals } = useMeals();
    const recentMeals = todayMeals.slice(0, 3);

    return (
        <View style={styles.section}>
            <View style={styles.heading}>
                <Text style={globalStyles.sectionTitle}>Refeições recentes</Text>
                <Link href="/meals" style={styles.link}>Ver todas</Link>
            </View>
            {recentMeals.length > 0 ? (
                recentMeals.map((meal) => <MealItem key={meal.id} meal={meal} />)
            ) : (
                <View style={styles.emptyCard}>
                    <Text style={styles.emptyTitle}>Ainda sem registos</Text>
                    <Text style={styles.emptyText}>Adiciona a tua primeira refeição para acompanhar o dia.</Text>
                    <Link href="/add-meals" style={styles.addLink}>Adicionar refeição</Link>
                </View>
            )}
        </View>
    );
}

function createStyles(
    colors: ReturnType<typeof useAppSettings>["colors"],
    globalStyles: ReturnType<typeof useAppSettings>["globalStyles"],
) {
    return StyleSheet.create({
    section: {
        marginTop: 30,
    },
    heading: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 14,
    },
    link: {
        color: colors.primary,
        fontSize: 13,
        fontWeight: "700",
    },
    emptyCard: {
        ...globalStyles.card,
        padding: 18,
    },
    emptyTitle: {
        color: colors.text,
        fontSize: 15,
        fontWeight: "700",
    },
    emptyText: {
        color: colors.textSecondary,
        fontSize: 13,
        lineHeight: 20,
        marginTop: 5,
    },
    addLink: {
        color: colors.primary,
        fontSize: 13,
        fontWeight: "700",
        marginTop: 15,
    },
    });
}
