import { DailyGoals } from "@/contexts/MealsContext";
import { useThemeStyles } from "@/styles/useThemeStyles";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type GoalForm = Record<keyof DailyGoals, string>;

type GoalsEditorProps = {
    visible: boolean;
    goals: DailyGoals;
    onClose: () => void;
    onSave: (goals: DailyGoals) => void;
};

const fields: { key: keyof DailyGoals; label: string; unit: string }[] = [
    { key: "calories", label: "Calorias", unit: "kcal" },
    { key: "protein", label: "Proteína", unit: "g" },
    { key: "carbs", label: "Hidratos", unit: "g" },
    { key: "fat", label: "Gordura", unit: "g" },
    { key: "waterMl", label: "Água", unit: "ml" },
];

function toForm(goals: DailyGoals): GoalForm {
    return {
        calories: String(goals.calories),
        protein: String(goals.protein),
        carbs: String(goals.carbs),
        fat: String(goals.fat),
        waterMl: String(goals.waterMl),
    };
}

export default function GoalsEditor({ visible, goals, onClose, onSave }: GoalsEditorProps) {
    const styles = useThemeStyles(createStyles);
    const [form, setForm] = useState(() => toForm(goals));
    const [error, setError] = useState("");

    useEffect(() => {
        if (visible) {
            setForm(toForm(goals));
            setError("");
        }
    }, [goals, visible]);

    if (!visible) return null;

    function handleSave() {
        const values = fields.map(({ key }) => Number(form[key].trim().replace(",", ".")));
        if (values.some((value) => !Number.isFinite(value) || value <= 0)) {
            setError("Indica metas numéricas superiores a zero.");
            return;
        }

        const [calories, protein, carbs, fat, waterMl] = values;
        onSave({ calories, protein, carbs, fat, waterMl });
        onClose();
    }

    return (
        <View style={styles.card}>
            <Text style={styles.title}>As tuas metas diárias</Text>
            <Text style={styles.subtitle}>Personaliza os valores que aparecem no teu resumo.</Text>
            <View style={styles.grid}>
                {fields.map(({ key, label, unit }) => (
                    <View key={key} style={styles.field}>
                        <Text style={styles.label}>{label}</Text>
                        <View style={styles.inputWrap}>
                            <TextInput
                                accessibilityLabel={`Meta de ${label}`}
                                keyboardType="decimal-pad"
                                onChangeText={(value) => {
                                    setForm((current) => ({ ...current, [key]: value }));
                                    setError("");
                                }}
                                style={styles.input}
                                value={form[key]}
                            />
                            <Text style={styles.unit}>{unit}</Text>
                        </View>
                    </View>
                ))}
            </View>
            {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
            <View style={styles.actions}>
                <Pressable accessibilityRole="button" onPress={onClose} style={styles.cancelButton}>
                    <Text style={styles.cancelText}>Cancelar</Text>
                </Pressable>
                <Pressable accessibilityRole="button" onPress={handleSave} style={styles.saveButton}>
                    <Text style={styles.saveText}>Guardar metas</Text>
                </Pressable>
            </View>
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
        marginBottom: 20,
        padding: 18,
    },
    title: {
        color: colors.text,
        fontSize: 17,
        fontWeight: "700",
    },
    subtitle: {
        color: colors.textSecondary,
        fontSize: 12,
        lineHeight: 18,
        marginTop: 5,
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginTop: 17,
    },
    field: {
        flexBasis: "46%",
        flexGrow: 1,
        minWidth: 120,
    },
    label: {
        color: colors.textSecondary,
        fontSize: 12,
        marginBottom: 6,
    },
    inputWrap: {
        alignItems: "center",
        backgroundColor: colors.background,
        borderColor: colors.border,
        borderRadius: 10,
        borderWidth: 1,
        flexDirection: "row",
        paddingHorizontal: 10,
    },
    input: {
        color: colors.text,
        flex: 1,
        minWidth: 0,
        paddingVertical: 10,
    },
    unit: {
        color: colors.textSecondary,
        fontSize: 11,
        marginLeft: 5,
    },
    error: {
        color: colors.danger,
        fontSize: 12,
        marginTop: 12,
    },
    actions: {
        flexDirection: "row",
        gap: 10,
        justifyContent: "flex-end",
        marginTop: 18,
    },
    cancelButton: {
        alignItems: "center",
        justifyContent: "center",
        minHeight: 42,
        paddingHorizontal: 12,
    },
    cancelText: {
        color: colors.textSecondary,
        fontSize: 13,
        fontWeight: "700",
    },
    saveButton: {
        alignItems: "center",
        backgroundColor: colors.primary,
        borderRadius: 11,
        justifyContent: "center",
        minHeight: 42,
        paddingHorizontal: 14,
    },
    saveText: {
        color: colors.background,
        fontSize: 13,
        fontWeight: "800",
    },
    });
}
