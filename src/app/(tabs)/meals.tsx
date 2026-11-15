import MealItem from "@/components/MealItem";
import ScreenLoader from "@/components/ScreenLoader";
import StorageNotice from "@/components/StorageNotice";
import { useMeals } from "@/contexts/MealsContext";
import type { MealRecord } from "@/contexts/MealsContext";
import { colors, globalStyles } from "@/styles/global";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Period = "today" | "all";

function normalizeSearch(value: string) {
    return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-PT");
}

export default function MealsScreen() {
    const {
        meals,
        todayMeals,
        isHydrated,
        storageError,
        removeMeal,
        selectMealForEditing,
    } = useMeals();
    const [period, setPeriod] = useState<Period>("today");
    const [search, setSearch] = useState("");

    const periodMeals = period === "today" ? todayMeals : meals;
    const filteredMeals = useMemo(() => {
        const query = normalizeSearch(search.trim());
        if (!query) return periodMeals;
        return periodMeals.filter((meal) => normalizeSearch(meal.name).includes(query));
    }, [periodMeals, search]);
    const totals = useMemo(
        () =>
            periodMeals.reduce(
                (summary, meal) => ({
                    calories: summary.calories + meal.calories,
                    protein: summary.protein + meal.protein,
                    carbs: summary.carbs + meal.carbs,
                    fat: summary.fat + meal.fat,
                }),
                { calories: 0, protein: 0, carbs: 0, fat: 0 },
            ),
        [periodMeals],
    );
    const renderMeal = useCallback(
        ({ item }: { item: MealRecord }) => (
            <MealItem
                meal={item}
                onEdit={selectMealForEditing}
                onRemove={removeMeal}
                showDate={period === "all"}
            />
        ),
        [period, removeMeal, selectMealForEditing],
    );

    if (!isHydrated) return <ScreenLoader />;

    const listHeader = (
        <View>
            <StorageNotice message={storageError} />
            <Text style={styles.eyebrow}>O TEU REGISTO</Text>
            <Text style={globalStyles.title}>Refeições</Text>
            <Text style={[globalStyles.subtitle, styles.subtitle]}>
                {period === "today"
                    ? `${todayMeals.length} ${todayMeals.length === 1 ? "refeição registada" : "refeições registadas"} hoje`
                    : `${meals.length} ${meals.length === 1 ? "refeição guardada" : "refeições guardadas"} no total`}
            </Text>

            <View style={styles.summary}>
                <Text style={styles.summaryLabel}>{period === "today" ? "Total de hoje" : "Total do histórico"}</Text>
                <Text style={styles.calories}>
                    {Math.round(totals.calories).toLocaleString("pt-PT")}
                    <Text style={styles.kcal}> kcal</Text>
                </Text>
                <Text style={styles.macroSummary}>
                    {Math.round(totals.protein)}g proteína
                    <Text style={styles.separator}>  ·  </Text>
                    {Math.round(totals.carbs)}g hidratos
                    <Text style={styles.separator}>  ·  </Text>
                    {Math.round(totals.fat)}g gordura
                </Text>
            </View>

            <View style={styles.filters}>
                {(["today", "all"] as const).map((value) => (
                    <Pressable
                        key={value}
                        accessibilityRole="button"
                        accessibilityState={{ selected: period === value }}
                        onPress={() => setPeriod(value)}
                        style={[styles.filterButton, period === value && styles.filterSelected]}
                    >
                        <Text style={[styles.filterText, period === value && styles.filterTextSelected]}>
                            {value === "today" ? "Hoje" : "Histórico"}
                        </Text>
                    </Pressable>
                ))}
            </View>

            <View style={styles.searchBox}>
                <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
                <TextInput
                    accessibilityLabel="Pesquisar refeições"
                    onChangeText={setSearch}
                    placeholder="Pesquisar pelo nome"
                    placeholderTextColor={colors.textSecondary}
                    returnKeyType="search"
                    style={styles.searchInput}
                    value={search}
                />
                {search ? (
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Limpar pesquisa"
                        hitSlop={8}
                        onPress={() => setSearch("")}
                    >
                        <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                    </Pressable>
                ) : null}
            </View>

            <View style={styles.listHeader}>
                <Text style={globalStyles.sectionTitle}>{period === "today" ? "Hoje" : "Mais recentes"}</Text>
                <Text style={styles.count}>{filteredMeals.length}</Text>
            </View>
        </View>
    );

    const emptyList = (
        <View style={styles.empty}>
            <Text style={styles.emptyTitle}>
                {search ? "Nenhum resultado" : period === "today" ? "Ainda sem refeições" : "O histórico está vazio"}
            </Text>
            <Text style={styles.emptyText}>
                {search
                    ? "Experimenta outro nome ou limpa a pesquisa."
                    : "Adiciona uma refeição para começar a acompanhar o teu dia."}
            </Text>
            {!search ? (
                <Link href="/add-meals" asChild>
                    <Pressable accessibilityRole="button" style={styles.addButton}>
                        <Text style={styles.addButtonText}>Adicionar refeição</Text>
                    </Pressable>
                </Link>
            ) : null}
        </View>
    );

    return (
        <SafeAreaView edges={["top", "left", "right"]} style={globalStyles.screen}>
            <FlatList
                contentContainerStyle={styles.listContent}
                data={filteredMeals}
                initialNumToRender={8}
                keyExtractor={(meal) => meal.id}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={emptyList}
                ListHeaderComponent={listHeader}
                maxToRenderPerBatch={8}
                renderItem={renderMeal}
                showsVerticalScrollIndicator={false}
                windowSize={7}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    listContent: {
        flexGrow: 1,
        paddingBottom: 32,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    eyebrow: {
        color: colors.primary,
        fontSize: 11,
        fontWeight: "800",
        letterSpacing: 1.8,
        marginBottom: 9,
    },
    subtitle: {
        marginTop: 6,
    },
    summary: {
        ...globalStyles.card,
        marginTop: 22,
        padding: 18,
    },
    summaryLabel: {
        color: colors.textSecondary,
        fontSize: 13,
        fontWeight: "600",
    },
    calories: {
        color: colors.text,
        fontSize: 30,
        fontWeight: "800",
        marginTop: 8,
    },
    kcal: {
        color: colors.textSecondary,
        fontSize: 14,
        fontWeight: "500",
    },
    macroSummary: {
        color: colors.textSecondary,
        fontSize: 12,
        lineHeight: 19,
        marginTop: 5,
    },
    separator: {
        color: colors.border,
    },
    filters: {
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: "row",
        gap: 5,
        marginTop: 18,
        padding: 4,
    },
    filterButton: {
        alignItems: "center",
        borderRadius: 9,
        flex: 1,
        justifyContent: "center",
        minHeight: 38,
    },
    filterSelected: {
        backgroundColor: colors.surfaceRaised,
    },
    filterText: {
        color: colors.textSecondary,
        fontSize: 13,
        fontWeight: "600",
    },
    filterTextSelected: {
        color: colors.text,
    },
    searchBox: {
        alignItems: "center",
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: "row",
        gap: 10,
        marginTop: 12,
        minHeight: 48,
        paddingHorizontal: 13,
    },
    searchInput: {
        color: colors.text,
        flex: 1,
        fontSize: 14,
        minWidth: 0,
        paddingVertical: 10,
    },
    listHeader: {
        alignItems: "center",
        flexDirection: "row",
        gap: 9,
        marginBottom: 14,
        marginTop: 26,
    },
    count: {
        backgroundColor: colors.surfaceRaised,
        borderRadius: 10,
        color: colors.textSecondary,
        fontSize: 12,
        fontWeight: "700",
        overflow: "hidden",
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    empty: {
        ...globalStyles.card,
        alignItems: "center",
        marginTop: 2,
        padding: 24,
    },
    emptyTitle: {
        color: colors.text,
        fontSize: 16,
        fontWeight: "700",
        textAlign: "center",
    },
    emptyText: {
        color: colors.textSecondary,
        fontSize: 13,
        lineHeight: 20,
        marginTop: 7,
        textAlign: "center",
    },
    addButton: {
        alignItems: "center",
        backgroundColor: colors.primary,
        borderRadius: 12,
        justifyContent: "center",
        marginTop: 18,
        minHeight: 46,
        paddingHorizontal: 18,
    },
    addButtonText: {
        color: colors.background,
        fontSize: 13,
        fontWeight: "800",
    },
});
