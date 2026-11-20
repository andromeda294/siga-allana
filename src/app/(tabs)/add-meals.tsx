import ScreenLoader from "@/components/ScreenLoader";
import StorageNotice from "@/components/StorageNotice";
import { useMeals } from "@/contexts/MealsContext";
import type { MealInput } from "@/contexts/MealsContext";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useThemeStyles } from "@/styles/useThemeStyles";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type FormState = {
    name: string;
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
};

type NumericField = Exclude<keyof FormState, "name">;

const initialForm: FormState = {
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
};

const numericFields: { key: NumericField; label: string; unit: string }[] = [
    { key: "calories", label: "Calorias", unit: "kcal" },
    { key: "protein", label: "Proteína", unit: "g" },
    { key: "carbs", label: "Hidratos", unit: "g" },
    { key: "fat", label: "Gordura", unit: "g" },
];

function parseAmount(value: string) {
    return Number(value.trim().replace(",", "."));
}

export default function AddMealScreen() {
    const { colors, globalStyles, settingsError } = useAppSettings();
    const styles = useThemeStyles(createStyles);
    const {
        addMeal,
        clearMealForEditing,
        editingMealId,
        isHydrated,
        meals,
        storageError,
        updateMeal,
    } = useMeals();
    const editingMeal = meals.find((meal) => meal.id === editingMealId);
    const [form, setForm] = useState(initialForm);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (!isHydrated) return;
        if (editingMeal) {
            setForm({
                name: editingMeal.name,
                calories: String(editingMeal.calories),
                protein: String(editingMeal.protein),
                carbs: String(editingMeal.carbs),
                fat: String(editingMeal.fat),
            });
            setError("");
            setSuccess("");
        } else if (editingMealId === null) {
            setForm(initialForm);
            setError("");
        }
    }, [editingMeal, editingMealId, isHydrated]);

    if (!isHydrated) return <ScreenLoader />;

    function updateForm<Key extends keyof FormState>(key: Key, value: FormState[Key]) {
        setForm((current) => ({ ...current, [key]: value }));
        setError("");
        setSuccess("");
    }

    function handleSubmit() {
        if (!form.name.trim()) {
            setError("Indica o nome da refeição.");
            return;
        }

        const amounts = numericFields.map(({ key }) => form[key]);
        if (amounts.some((amount) => amount.trim() === "")) {
            setError("Preenche todos os valores nutricionais.");
            return;
        }

        const [calories, protein, carbs, fat] = amounts.map(parseAmount);
        if ([calories, protein, carbs, fat].some((amount) => !Number.isFinite(amount) || amount < 0)) {
            setError("Usa valores numéricos iguais ou superiores a zero.");
            return;
        }
        if (calories === 0) {
            setError("As calorias têm de ser superiores a zero.");
            return;
        }

        const meal: MealInput = {
            name: form.name.trim(),
            calories,
            protein,
            carbs,
            fat,
        };
        if (editingMeal) {
            updateMeal(editingMeal.id, meal);
            clearMealForEditing();
            setSuccess("Refeição atualizada.");
        } else {
            addMeal(meal);
            setForm(initialForm);
            setSuccess("Refeição adicionada.");
        }
    }

    return (
        <SafeAreaView edges={["top", "left", "right"]} style={globalStyles.screen}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={globalStyles.content}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.header}>
                        <Text style={styles.eyebrow}>REGISTO DIÁRIO</Text>
                        <View style={styles.titleRow}>
                            <Text style={globalStyles.title}>
                                {editingMeal ? "Editar refeição" : "Adicionar refeição"}
                            </Text>
                            {editingMeal ? (
                                <Pressable
                                    accessibilityRole="button"
                                    onPress={() => {
                                        clearMealForEditing();
                                        setForm(initialForm);
                                        setSuccess("");
                                    }}
                                >
                                    <Text style={styles.cancelEdit}>Cancelar</Text>
                                </Pressable>
                            ) : null}
                        </View>
                        <Text style={[globalStyles.subtitle, styles.description]}>
                            Regista o que comeste e acompanha os teus nutrientes ao longo do dia.
                        </Text>
                    </View>

                    <StorageNotice message={settingsError} />
                    <StorageNotice message={storageError} />
                    <View style={styles.formCard}>
                        <Text style={styles.label}>Nome da refeição</Text>
                        <TextInput
                            accessibilityLabel="Nome da refeição"
                            autoCapitalize="sentences"
                            maxLength={60}
                            onChangeText={(value) => updateForm("name", value)}
                            placeholder="Ex.: Almoço"
                            placeholderTextColor={colors.textSecondary}
                            returnKeyType="next"
                            style={styles.input}
                            value={form.name}
                        />

                        <Text style={[styles.label, styles.nutritionLabel]}>Informação nutricional</Text>
                        <View style={styles.fieldsGrid}>
                            {numericFields.map(({ key, label, unit }) => (
                                <View key={key} style={styles.field}>
                                    <Text style={styles.fieldLabel}>{label}</Text>
                                    <View style={styles.inputWithUnit}>
                                        <TextInput
                                            accessibilityLabel={`${label} em ${unit}`}
                                            keyboardType="decimal-pad"
                                            maxLength={7}
                                            onChangeText={(value) => updateForm(key, value)}
                                            placeholder="0"
                                            placeholderTextColor={colors.textSecondary}
                                            returnKeyType="done"
                                            style={styles.numericInput}
                                            value={form[key]}
                                        />
                                        <Text style={styles.unit}>{unit}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>

                        {error ? (
                            <Text accessibilityRole="alert" style={styles.error}>{error}</Text>
                        ) : null}
                        {success ? (
                            <View accessibilityRole="alert" style={styles.successMessage}>
                                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                                <Text style={styles.successText}>{success}</Text>
                            </View>
                        ) : null}

                        <Pressable
                            accessibilityRole="button"
                            onPress={handleSubmit}
                            style={({ pressed }) => [styles.submitButton, pressed && styles.submitPressed]}
                        >
                            <Ionicons name="add" size={20} color={colors.onPrimary} />
                            <Text style={styles.submitText}>
                                {editingMeal ? "Guardar alterações" : "Adicionar refeição"}
                            </Text>
                        </Pressable>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

function createStyles(
    colors: ReturnType<typeof useAppSettings>["colors"],
    globalStyles: ReturnType<typeof useAppSettings>["globalStyles"],
) {
    return StyleSheet.create({
    keyboardView: {
        flex: 1,
    },
    header: {
        marginBottom: 24,
    },
    titleRow: {
        alignItems: "center",
        flexDirection: "row",
        gap: 12,
        justifyContent: "space-between",
    },
    cancelEdit: {
        color: colors.textSecondary,
        fontSize: 12,
        fontWeight: "700",
    },
    eyebrow: {
        color: colors.primary,
        fontSize: 11,
        fontWeight: "800",
        letterSpacing: 1.8,
        marginBottom: 9,
    },
    description: {
        marginTop: 8,
        maxWidth: 340,
    },
    formCard: {
        ...globalStyles.card,
        padding: 18,
    },
    label: {
        color: colors.text,
        fontSize: 14,
        fontWeight: "700",
        marginBottom: 9,
    },
    input: {
        backgroundColor: colors.background,
        borderColor: colors.border,
        borderRadius: 12,
        borderWidth: 1,
        color: colors.text,
        fontSize: 15,
        minHeight: 50,
        paddingHorizontal: 14,
    },
    nutritionLabel: {
        marginTop: 22,
    },
    fieldsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    field: {
        flexBasis: "47%",
        flexGrow: 1,
        minWidth: 125,
    },
    fieldLabel: {
        color: colors.textSecondary,
        fontSize: 12,
        fontWeight: "600",
        marginBottom: 7,
    },
    inputWithUnit: {
        alignItems: "center",
        backgroundColor: colors.background,
        borderColor: colors.border,
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: "row",
        minHeight: 48,
        paddingHorizontal: 12,
    },
    numericInput: {
        color: colors.text,
        flex: 1,
        fontSize: 15,
        minWidth: 0,
        paddingVertical: 10,
    },
    unit: {
        color: colors.textSecondary,
        fontSize: 12,
        marginLeft: 8,
    },
    error: {
        color: colors.danger,
        fontSize: 13,
        lineHeight: 19,
        marginTop: 14,
    },
    successMessage: {
        alignItems: "center",
        flexDirection: "row",
        gap: 8,
        marginTop: 14,
    },
    successText: {
        color: colors.success,
        flex: 1,
        fontSize: 13,
    },
    submitButton: {
        alignItems: "center",
        backgroundColor: colors.primary,
        borderRadius: 13,
        flexDirection: "row",
        gap: 8,
        justifyContent: "center",
        marginTop: 22,
        minHeight: 52,
    },
    submitPressed: {
        backgroundColor: colors.primaryPressed,
    },
    submitText: {
        color: colors.background,
        fontSize: 15,
        fontWeight: "800",
    },
    });
}
