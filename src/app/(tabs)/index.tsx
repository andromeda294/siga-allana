import HomeHeader from "@/components/HomeHeader";
import GoalsEditor from "@/components/GoalsEditor";
import MacroGrid from "@/components/MacroGrid";
import RecentMeals from "@/components/RecentMeal";
import ScreenLoader from "@/components/ScreenLoader";
import StorageNotice from "@/components/StorageNotice";
import WaterTracker from "@/components/WaterTracker";
import { useMeals } from "@/contexts/MealsContext";
import { colors, globalStyles } from "@/styles/global";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

export default function HomeScreen() {
    const { goals, isHydrated, storageError, updateGoals } = useMeals();
    const [isEditingGoals, setIsEditingGoals] = useState(false);

    if (!isHydrated) return <ScreenLoader />;

    return (
        <SafeAreaView edges={["top", "left", "right"]} style={globalStyles.screen}>
            <ScrollView contentContainerStyle={globalStyles.content} showsVerticalScrollIndicator={false}>
                <StorageNotice message={storageError} />
                <HomeHeader />
                <View style={styles.summaryHeading}>
                    <Text style={globalStyles.sectionTitle}>Resumo de hoje</Text>
                    <Pressable
                        accessibilityRole="button"
                        onPress={() => setIsEditingGoals((visible) => !visible)}
                        hitSlop={8}
                    >
                        <Text style={styles.editGoals}>{isEditingGoals ? "Fechar" : "Editar metas"}</Text>
                    </Pressable>
                </View>
                <Text style={styles.goalHint}>Acompanha o teu progresso diário.</Text>
                {isEditingGoals ? (
                    <GoalsEditor
                        visible={isEditingGoals}
                        goals={goals}
                        onClose={() => setIsEditingGoals(false)}
                        onSave={updateGoals}
                    />
                ) : null}
                <MacroGrid />
                <Link href="/add-meals" asChild>
                    <Pressable accessibilityRole="button" style={styles.addButton}>
                        <Ionicons name="add" size={20} color="#ffffff" />
                        <Text style={styles.addButtonText}>Registar refeição</Text>
                    </Pressable>
                </Link>
                <WaterTracker />
                <RecentMeals />
                <Text style={styles.sessionNote}>Os teus registos são guardados localmente neste dispositivo.</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    summaryHeading: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    editGoals: {
        color: colors.primary,
        fontSize: 12,
        fontWeight: "700",
    },
    goalHint: {
        color: colors.textSecondary,
        fontSize: 12,
        marginBottom: 14,
        marginTop: 5,
    },
    addButton: {
        alignItems: "center",
        backgroundColor: colors.primary,
        borderRadius: 15,
        flexDirection: "row",
        gap: 7,
        justifyContent: "center",
        marginTop: 18,
        minHeight: 52,
        shadowColor: "#0f5132",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.13,
        shadowRadius: 10,
        elevation: 3,
    },
    addButtonText: {
        color: "#ffffff",
        fontSize: 15,
        fontWeight: "800",
    },
    sessionNote: {
        color: colors.textSecondary,
        fontSize: 11,
        lineHeight: 16,
        marginTop: 28,
        textAlign: "center",
    },
});
