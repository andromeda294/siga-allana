import HomeHeader from "@/components/HomeHeader";
import GoalsEditor from "@/components/GoalsEditor";
import MacroGrid from "@/components/MacroGrid";
import RecentMeals from "@/components/RecentMeal";
import ScreenLoader from "@/components/ScreenLoader";
import StorageNotice from "@/components/StorageNotice";
import WaterTracker from "@/components/WaterTracker";
import { useMeals } from "@/contexts/MealsContext";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useThemeStyles } from "@/styles/useThemeStyles";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

export default function HomeScreen() {
    const { colors, globalStyles, settings, settingsError } = useAppSettings();
    const styles = useThemeStyles(createStyles);
    const { goals, isHydrated, storageError, updateGoals } = useMeals();
    const [isEditingGoals, setIsEditingGoals] = useState(false);

    if (!isHydrated) return <ScreenLoader />;

    return (
        <SafeAreaView edges={["top", "left", "right"]} style={globalStyles.screen}>
            <ScrollView contentContainerStyle={globalStyles.content} showsVerticalScrollIndicator={false}>
                <StorageNotice message={settingsError} />
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
                <Text style={styles.goalHint}>Acompanha o teu progresso diário com RITMO.</Text>
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
                        <Ionicons name="add" size={20} color={colors.onPrimary} />
                        <Text style={styles.addButtonText}>Registar refeição</Text>
                    </Pressable>
                </Link>
                <WaterTracker />
                <Link href="/profile" asChild>
                    <Pressable accessibilityRole="link" style={styles.profileSummary}>
                        <View style={styles.profileIcon}>
                            <Ionicons name="body-outline" size={20} color={colors.primary} />
                        </View>
                        <View style={styles.profileCopy}>
                            <Text style={styles.profileTitle}>Peso e evolução</Text>
                            <Text style={styles.profileDetail}>
                                {settings.profile.weightHistory[0]
                                    ? `${settings.profile.weightHistory[0].weightKg.toLocaleString("pt-PT", { maximumFractionDigits: 1 })} kg`
                                    : "Completa o teu perfil"}
                                {settings.profile.heightCm
                                    ? `  ·  ${settings.profile.heightCm} cm`
                                    : ""}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                    </Pressable>
                </Link>
                <RecentMeals />
            </ScrollView>
        </SafeAreaView>
    );
}

function createStyles(
    colors: ReturnType<typeof useAppSettings>["colors"],
    globalStyles: ReturnType<typeof useAppSettings>["globalStyles"],
) {
    return StyleSheet.create({
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
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.13,
        shadowRadius: 10,
        elevation: 3,
    },
    addButtonText: {
        color: colors.onPrimary,
        fontSize: 15,
        fontWeight: "800",
    },
    profileSummary: {
        ...globalStyles.card,
        alignItems: "center",
        flexDirection: "row",
        gap: 12,
        marginTop: 16,
        minHeight: 72,
        paddingHorizontal: 15,
    },
    profileIcon: {
        alignItems: "center",
        backgroundColor: colors.surfaceRaised,
        borderRadius: 12,
        height: 40,
        justifyContent: "center",
        width: 40,
    },
    profileCopy: {
        flex: 1,
    },
    profileTitle: {
        color: colors.text,
        fontSize: 13,
        fontWeight: "700",
    },
    profileDetail: {
        color: colors.textSecondary,
        fontSize: 12,
        marginTop: 4,
    },
    });
}
