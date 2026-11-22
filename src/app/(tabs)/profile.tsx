import StorageNotice from "@/components/StorageNotice";
import ScreenLoader from "@/components/ScreenLoader";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useAds } from "@/contexts/AdsContext";
import type {
    ReminderPreferences,
    UserProfile,
} from "@/contexts/AppSettingsContext";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeStyles } from "@/styles/useThemeStyles";

type ProfileForm = {
    name: string;
    heightCm: string;
    weightKg: string;
    targetWeightKg: string;
};

const themeOptions = [
    { value: "system", label: "Sistema", icon: "phone-portrait-outline" },
    { value: "light", label: "Claro", icon: "sunny-outline" },
    { value: "dark", label: "Escuro", icon: "moon-outline" },
] as const;

const waterIntervals = [1, 2, 3, 4, 6];

function toProfileForm(profile: UserProfile): ProfileForm {
    return {
        name: profile.name,
        heightCm: profile.heightCm === null ? "" : String(profile.heightCm),
        weightKg: profile.weightHistory[0] ? String(profile.weightHistory[0].weightKg) : "",
        targetWeightKg: profile.targetWeightKg === null ? "" : String(profile.targetWeightKg),
    };
}

function parseOptionalNumber(value: string) {
    const trimmed = value.trim();
    return trimmed ? Number(trimmed.replace(",", ".")) : null;
}

function parseCardiovascularValue(value: string, maximum: number) {
    const trimmed = value.trim();
    if (!/^\d+$/.test(trimmed)) return null;
    const parsed = Number(trimmed);
    return Number.isSafeInteger(parsed) && parsed > 0 && parsed <= maximum ? parsed : null;
}

function isMealTime(value: string) {
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export default function ProfileScreen() {
    const { showInterstitial } = useAds();
    const {
        colors,
        globalStyles,
        settings,
        settingsError,
        isSettingsHydrated,
        setThemePreference,
        saveProfile,
        saveCardiovascularReading,
        saveReminders,
    } = useAppSettings();
    const styles = useThemeStyles(createStyles);
    const [profileForm, setProfileForm] = useState(() => toProfileForm(settings.profile));
    const [profileError, setProfileError] = useState("");
    const [profileMessage, setProfileMessage] = useState("");
    const [pulseInput, setPulseInput] = useState("");
    const [systolicInput, setSystolicInput] = useState("");
    const [diastolicInput, setDiastolicInput] = useState("");
    const [cardiovascularError, setCardiovascularError] = useState("");
    const [cardiovascularMessage, setCardiovascularMessage] = useState("");
    const [reminderDraft, setReminderDraft] = useState<ReminderPreferences>(settings.reminders);
    const [mealTimesInput, setMealTimesInput] = useState(settings.reminders.mealTimes.join(", "));
    const [reminderError, setReminderError] = useState("");
    const [reminderMessage, setReminderMessage] = useState("");
    const [isSavingReminders, setIsSavingReminders] = useState(false);

    useEffect(() => {
        setProfileForm(toProfileForm(settings.profile));
    }, [settings.profile]);

    useEffect(() => {
        setReminderDraft(settings.reminders);
        setMealTimesInput(settings.reminders.mealTimes.join(", "));
    }, [settings.reminders]);

    const weightHistory = settings.profile.weightHistory;
    const cardiovascularHistory = settings.profile.cardiovascularHistory;
    const currentWeight = weightHistory[0]?.weightKg;
    const previousWeight = weightHistory[1]?.weightKg;
    const weightChange =
        currentWeight !== undefined && previousWeight !== undefined
            ? currentWeight - previousWeight
            : null;

    function updateProfileForm<Key extends keyof ProfileForm>(key: Key, value: ProfileForm[Key]) {
        setProfileForm((current) => ({ ...current, [key]: value }));
        setProfileError("");
        setProfileMessage("");
    }

    function handleSaveProfile() {
        const heightCm = parseOptionalNumber(profileForm.heightCm);
        const weightKg = parseOptionalNumber(profileForm.weightKg);
        const targetWeightKg = parseOptionalNumber(profileForm.targetWeightKg);
        const hasInvalidNumber = [heightCm, weightKg, targetWeightKg].some(
            (value) => value !== null && (!Number.isFinite(value) || value <= 0),
        );

        if (profileForm.name.trim().length > 40) {
            setProfileError("O nome deve ter até 40 caracteres.");
            return;
        }
        if (hasInvalidNumber) {
            setProfileError("Verifica os valores: utiliza apenas números positivos.");
            return;
        }
        if (heightCm !== null && (heightCm < 80 || heightCm > 250)) {
            setProfileError("A altura deve estar entre 80 e 250 cm.");
            return;
        }
        if (
            (weightKg !== null && weightKg > 500) ||
            (targetWeightKg !== null && targetWeightKg > 500)
        ) {
            setProfileError("O peso deve ser inferior a 500 kg.");
            return;
        }

        try {
            saveProfile({
                name: profileForm.name,
                heightCm,
                weightKg,
                targetWeightKg,
            });
            setProfileMessage("Perfil atualizado.");
        } catch (error: unknown) {
            console.error("Could not save the Ritmo profile.", error);
            setProfileError(
                error instanceof Error ? error.message : "Não foi possível guardar o perfil.",
            );
        }
    }

    function handleSaveCardiovascularReading() {
        const pulseBpm = parseCardiovascularValue(pulseInput, 300);
        const systolicMmHg = parseCardiovascularValue(systolicInput, 400);
        const diastolicMmHg = parseCardiovascularValue(diastolicInput, 300);
        if (pulseBpm === null || systolicMmHg === null || diastolicMmHg === null) {
            setCardiovascularError("Confirma os valores numéricos e tenta novamente.");
            setCardiovascularMessage("");
            return;
        }

        try {
            saveCardiovascularReading({ pulseBpm, systolicMmHg, diastolicMmHg });
            setPulseInput("");
            setSystolicInput("");
            setDiastolicInput("");
            setCardiovascularError("");
            setCardiovascularMessage("Medição guardada.");
        } catch (error: unknown) {
            console.error("Could not save a manual cardiovascular reading.", error);
            setCardiovascularMessage("");
            setCardiovascularError(
                error instanceof Error ? error.message : "Não foi possível guardar a medição.",
            );
        }
    }

    async function handleSaveReminders() {
        const mealTimes = mealTimesInput
            .split(",")
            .map((time) => time.trim())
            .filter(Boolean);

        if (mealTimes.length === 0 || !mealTimes.every(isMealTime)) {
            setReminderError("Indica pelo menos um horário válido, como 08:00, 13:00.");
            setReminderMessage("");
            return;
        }

        setIsSavingReminders(true);
        setReminderError("");
        setReminderMessage("");
        try {
            await saveReminders({
                ...reminderDraft,
                mealTimes: [...new Set(mealTimes)].sort(),
            });
            showInterstitial();
            setReminderMessage(
                reminderDraft.waterEnabled || reminderDraft.mealEnabled
                    ? "Lembretes atualizados."
                    : "Lembretes desativados.",
            );
        } catch (error: unknown) {
            console.error("Could not update Ritmo reminders.", error);
            setReminderError(
                error instanceof Error ? error.message : "Não foi possível atualizar os lembretes.",
            );
        } finally {
            setIsSavingReminders(false);
        }
    }

    if (!isSettingsHydrated) return <ScreenLoader />;

    return (
        <SafeAreaView edges={["top", "left", "right"]} style={globalStyles.screen}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                <StorageNotice message={settingsError} />
                <Text style={styles.eyebrow}>RITMO · BEM-ESTAR</Text>
                <Text style={globalStyles.title}>O teu perfil</Text>
                <Text style={[globalStyles.subtitle, styles.intro]}>
                    Personaliza a tua experiência e acompanha a tua evolução.
                </Text>

                <View style={styles.card}>
                    <View style={styles.sectionHeading}>
                        <Ionicons name="person-circle-outline" size={22} color={colors.primary} />
                        <Text style={globalStyles.sectionTitle}>Dados pessoais</Text>
                    </View>
                    <Text style={styles.label}>Nome</Text>
                    <TextInput
                        accessibilityLabel="Nome"
                        autoCapitalize="words"
                        maxLength={40}
                        onChangeText={(value) => updateProfileForm("name", value)}
                        placeholder="Como te devemos chamar?"
                        placeholderTextColor={colors.textSecondary}
                        style={styles.input}
                        value={profileForm.name}
                    />
                    <View style={styles.fieldsRow}>
                        <View style={styles.field}>
                            <Text style={styles.label}>Altura</Text>
                            <View style={styles.inputWithUnit}>
                                <TextInput
                                    accessibilityLabel="Altura em centímetros"
                                    keyboardType="decimal-pad"
                                    onChangeText={(value) => updateProfileForm("heightCm", value)}
                                    placeholder="—"
                                    placeholderTextColor={colors.textSecondary}
                                    style={styles.numericInput}
                                    value={profileForm.heightCm}
                                />
                                <Text style={styles.unit}>cm</Text>
                            </View>
                        </View>
                        <View style={styles.field}>
                            <Text style={styles.label}>Peso atual</Text>
                            <View style={styles.inputWithUnit}>
                                <TextInput
                                    accessibilityLabel="Peso atual em quilogramas"
                                    keyboardType="decimal-pad"
                                    onChangeText={(value) => updateProfileForm("weightKg", value)}
                                    placeholder="—"
                                    placeholderTextColor={colors.textSecondary}
                                    style={styles.numericInput}
                                    value={profileForm.weightKg}
                                />
                                <Text style={styles.unit}>kg</Text>
                            </View>
                        </View>
                    </View>
                    <Text style={[styles.label, styles.targetLabel]}>Meta de peso (opcional)</Text>
                    <View style={styles.inputWithUnit}>
                        <TextInput
                            accessibilityLabel="Meta de peso em quilogramas"
                            keyboardType="decimal-pad"
                            onChangeText={(value) => updateProfileForm("targetWeightKg", value)}
                            placeholder="—"
                            placeholderTextColor={colors.textSecondary}
                            style={styles.numericInput}
                            value={profileForm.targetWeightKg}
                        />
                        <Text style={styles.unit}>kg</Text>
                    </View>
                    {profileError ? (
                        <Text accessibilityRole="alert" style={styles.error}>{profileError}</Text>
                    ) : null}
                    {profileMessage ? (
                        <Text accessibilityRole="alert" style={styles.success}>{profileMessage}</Text>
                    ) : null}
                    <Pressable
                        accessibilityRole="button"
                        onPress={handleSaveProfile}
                        style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
                    >
                        <Text style={styles.primaryButtonText}>Guardar perfil</Text>
                    </Pressable>
                </View>

                <View style={styles.card}>
                    <View style={styles.sectionHeading}>
                        <Ionicons name="analytics-outline" size={21} color={colors.primary} />
                        <Text style={globalStyles.sectionTitle}>Evolução do peso</Text>
                    </View>
                    {currentWeight === undefined ? (
                        <Text style={styles.emptyText}>Regista o teu peso para começares a acompanhar a evolução.</Text>
                    ) : (
                        <View style={styles.weightSummary}>
                            <Text style={styles.weightValue}>
                                {currentWeight.toLocaleString("pt-PT", { maximumFractionDigits: 1 })}
                                <Text style={styles.weightUnit}> kg</Text>
                            </Text>
                            {settings.profile.targetWeightKg !== null ? (
                                <Text style={styles.weightGoal}>
                                    Meta: {settings.profile.targetWeightKg.toLocaleString("pt-PT")} kg
                                </Text>
                            ) : null}
                            {weightChange !== null ? (
                                <Text style={styles.weightChange}>
                                    {weightChange === 0
                                        ? "Sem alteração desde o registo anterior"
                                        : `${weightChange > 0 ? "+" : "−"}${Math.abs(weightChange).toLocaleString("pt-PT", { maximumFractionDigits: 1 })} kg desde o registo anterior`}
                                </Text>
                            ) : null}
                        </View>
                    )}
                    {weightHistory.length > 0 ? (
                        <View style={styles.history}>
                            <Text style={styles.label}>Registos recentes</Text>
                            {weightHistory.slice(0, 5).map((entry) => (
                                <View key={entry.id} style={styles.historyRow}>
                                    <Text style={styles.historyDate}>
                                        {new Date(entry.createdAt).toLocaleDateString("pt-PT", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </Text>
                                    <Text style={styles.historyValue}>
                                        {entry.weightKg.toLocaleString("pt-PT", { maximumFractionDigits: 1 })} kg
                                    </Text>
                                </View>
                            ))}
                        </View>
                    ) : null}
                </View>

                <View style={styles.card}>
                    <View style={styles.sectionHeading}>
                        <Ionicons name="heart-outline" size={21} color={colors.primary} />
                        <Text style={globalStyles.sectionTitle}>Pressão arterial e pulso</Text>
                    </View>
                    <Text style={styles.helper}>
                        Regista valores lidos num aparelho de medição. O Ritmo guarda os dados, mas não avalia a saúde nem faz diagnósticos.
                    </Text>
                    <View style={styles.fieldsRow}>
                        <View style={styles.field}>
                            <Text style={styles.label}>Pressão sistólica</Text>
                            <View style={styles.inputWithUnit}>
                                <TextInput
                                    accessibilityLabel="Pressão sistólica em mmHg"
                                    keyboardType="number-pad"
                                    maxLength={3}
                                    onChangeText={(value) => {
                                        setSystolicInput(value);
                                        setCardiovascularError("");
                                        setCardiovascularMessage("");
                                    }}
                                    placeholder="—"
                                    placeholderTextColor={colors.textSecondary}
                                    style={styles.numericInput}
                                    value={systolicInput}
                                />
                                <Text style={styles.unit}>mmHg</Text>
                            </View>
                        </View>
                        <View style={styles.field}>
                            <Text style={styles.label}>Pressão diastólica</Text>
                            <View style={styles.inputWithUnit}>
                                <TextInput
                                    accessibilityLabel="Pressão diastólica em mmHg"
                                    keyboardType="number-pad"
                                    maxLength={3}
                                    onChangeText={(value) => {
                                        setDiastolicInput(value);
                                        setCardiovascularError("");
                                        setCardiovascularMessage("");
                                    }}
                                    placeholder="—"
                                    placeholderTextColor={colors.textSecondary}
                                    style={styles.numericInput}
                                    value={diastolicInput}
                                />
                                <Text style={styles.unit}>mmHg</Text>
                            </View>
                        </View>
                    </View>
                    <Text style={[styles.label, styles.targetLabel]}>Pulso</Text>
                    <View style={styles.inputWithUnit}>
                        <TextInput
                            accessibilityLabel="Pulso em batimentos por minuto"
                            keyboardType="number-pad"
                            maxLength={3}
                            onChangeText={(value) => {
                                setPulseInput(value);
                                setCardiovascularError("");
                                setCardiovascularMessage("");
                            }}
                            placeholder="—"
                            placeholderTextColor={colors.textSecondary}
                            style={styles.numericInput}
                            value={pulseInput}
                        />
                        <Text style={styles.unit}>bpm</Text>
                    </View>
                    {cardiovascularError ? (
                        <Text accessibilityRole="alert" style={styles.error}>
                            {cardiovascularError}
                        </Text>
                    ) : null}
                    {cardiovascularMessage ? (
                        <Text accessibilityRole="alert" style={styles.success}>
                            {cardiovascularMessage}
                        </Text>
                    ) : null}
                    <Pressable
                        accessibilityRole="button"
                        onPress={handleSaveCardiovascularReading}
                        style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
                    >
                        <Text style={styles.primaryButtonText}>Guardar medição</Text>
                    </Pressable>
                    {cardiovascularHistory.length > 0 ? (
                        <View style={styles.cardiovascularHistory}>
                            <Text style={styles.label}>Registos recentes</Text>
                            {cardiovascularHistory.slice(0, 5).map((reading) => (
                                <View key={reading.id} style={styles.cardiovascularHistoryRow}>
                                    <Text style={styles.historyDate}>
                                        {new Date(reading.createdAt).toLocaleString("pt-PT", {
                                            day: "2-digit",
                                            month: "short",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </Text>
                                    <Text style={styles.historyValue}>
                                        {reading.pulseBpm} bpm · {reading.systolicMmHg}/{reading.diastolicMmHg} mmHg
                                    </Text>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <Text style={styles.helper}>Ainda não há medições registadas.</Text>
                    )}
                </View>

                <View style={styles.card}>
                    <View style={styles.sectionHeading}>
                        <Ionicons name="contrast-outline" size={21} color={colors.primary} />
                        <Text style={globalStyles.sectionTitle}>Aparência</Text>
                    </View>
                    <Text style={styles.helper}>Escolhe o tema da aplicação.</Text>
                    <View style={styles.themeOptions}>
                        {themeOptions.map((option) => (
                            <Pressable
                                key={option.value}
                                accessibilityRole="radio"
                                accessibilityState={{ checked: settings.themePreference === option.value }}
                                onPress={() => setThemePreference(option.value)}
                                style={[
                                    styles.themeOption,
                                    settings.themePreference === option.value && styles.themeOptionSelected,
                                ]}
                            >
                                <Ionicons
                                    name={option.icon}
                                    size={18}
                                    color={settings.themePreference === option.value ? colors.primary : colors.textSecondary}
                                />
                                <Text
                                    style={[
                                        styles.themeLabel,
                                        settings.themePreference === option.value && styles.themeLabelSelected,
                                    ]}
                                >
                                    {option.label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                <View style={styles.card}>
                    <View style={styles.sectionHeading}>
                        <Ionicons name="notifications-outline" size={21} color={colors.primary} />
                        <Text style={globalStyles.sectionTitle}>Lembretes</Text>
                    </View>
                    <Text style={styles.helper}>
                        Ativa os lembretes que te ajudam a manter a rotina. Só pedimos permissão quando guardares uma opção ativa.
                    </Text>
                    <View style={styles.switchRow}>
                        <View style={styles.switchCopy}>
                            <Text style={styles.switchTitle}>Beber água</Text>
                            <Text style={styles.switchDescription}>Entre as 09:00 e as 21:00</Text>
                        </View>
                        <Switch
                            accessibilityLabel="Ativar lembretes de água"
                            onValueChange={(waterEnabled) =>
                                setReminderDraft((current) => ({ ...current, waterEnabled }))
                            }
                            thumbColor={colors.surface}
                            trackColor={{ false: colors.border, true: colors.primary }}
                            value={reminderDraft.waterEnabled}
                        />
                    </View>
                    {reminderDraft.waterEnabled ? (
                        <View style={styles.intervalRow}>
                            <Text style={styles.helper}>Repetir a cada</Text>
                            <View style={styles.intervalOptions}>
                                {waterIntervals.map((hours) => (
                                    <Pressable
                                        key={hours}
                                        accessibilityRole="radio"
                                        accessibilityState={{ checked: reminderDraft.waterIntervalHours === hours }}
                                        onPress={() =>
                                            setReminderDraft((current) => ({ ...current, waterIntervalHours: hours }))
                                        }
                                        style={[
                                            styles.intervalOption,
                                            reminderDraft.waterIntervalHours === hours && styles.intervalOptionSelected,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.intervalLabel,
                                                reminderDraft.waterIntervalHours === hours && styles.intervalLabelSelected,
                                            ]}
                                        >
                                            {hours}h
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    ) : null}
                    <View style={[styles.switchRow, styles.mealSwitchRow]}>
                        <View style={styles.switchCopy}>
                            <Text style={styles.switchTitle}>Registar refeições</Text>
                            <Text style={styles.switchDescription}>Lembretes diários nos horários escolhidos</Text>
                        </View>
                        <Switch
                            accessibilityLabel="Ativar lembretes de refeições"
                            onValueChange={(mealEnabled) =>
                                setReminderDraft((current) => ({ ...current, mealEnabled }))
                            }
                            thumbColor={colors.surface}
                            trackColor={{ false: colors.border, true: colors.primary }}
                            value={reminderDraft.mealEnabled}
                        />
                    </View>
                    {reminderDraft.mealEnabled ? (
                        <View style={styles.mealTimes}>
                            <Text style={styles.label}>Horários (HH:MM separados por vírgula)</Text>
                            <TextInput
                                accessibilityLabel="Horários dos lembretes de refeições"
                                autoCapitalize="none"
                                autoCorrect={false}
                                onChangeText={setMealTimesInput}
                                placeholder="08:00, 13:00, 20:00"
                                placeholderTextColor={colors.textSecondary}
                                style={styles.input}
                                value={mealTimesInput}
                            />
                        </View>
                    ) : null}
                    {reminderError ? (
                        <Text accessibilityRole="alert" style={styles.error}>{reminderError}</Text>
                    ) : null}
                    {reminderMessage ? (
                        <Text accessibilityRole="alert" style={styles.success}>{reminderMessage}</Text>
                    ) : null}
                    <Pressable
                        accessibilityRole="button"
                        disabled={isSavingReminders}
                        onPress={() => void handleSaveReminders()}
                        style={({ pressed }) => [
                            styles.primaryButton,
                            styles.reminderButton,
                            pressed && styles.pressed,
                            isSavingReminders && styles.disabledButton,
                        ]}
                    >
                        <Text style={styles.primaryButtonText}>
                            {isSavingReminders ? "A guardar..." : "Guardar lembretes"}
                        </Text>
                    </Pressable>
                    <Text style={styles.privacyNote}>
                        Lembretes locais no telemóvel. Sem conta e sem notificações remotas.
                    </Text>
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
        content: {
            ...globalStyles.content,
            gap: 16,
        },
        eyebrow: {
            color: colors.primary,
            fontSize: 11,
            fontWeight: "800",
            letterSpacing: 1.6,
            marginBottom: -8,
        },
        intro: {
            marginTop: -8,
            marginBottom: 4,
        },
        card: {
            ...globalStyles.card,
            padding: 17,
        },
        sectionHeading: {
            alignItems: "center",
            flexDirection: "row",
            gap: 9,
            marginBottom: 17,
        },
        label: {
            color: colors.text,
            fontSize: 12,
            fontWeight: "700",
            marginBottom: 7,
        },
        input: {
            backgroundColor: colors.background,
            borderColor: colors.border,
            borderRadius: 11,
            borderWidth: 1,
            color: colors.text,
            fontSize: 14,
            minHeight: 46,
            paddingHorizontal: 12,
        },
        fieldsRow: {
            flexDirection: "row",
            gap: 11,
            marginTop: 14,
        },
        field: {
            flex: 1,
            minWidth: 0,
        },
        inputWithUnit: {
            alignItems: "center",
            backgroundColor: colors.background,
            borderColor: colors.border,
            borderRadius: 11,
            borderWidth: 1,
            flexDirection: "row",
            minHeight: 46,
            paddingHorizontal: 12,
        },
        numericInput: {
            color: colors.text,
            flex: 1,
            fontSize: 14,
            minWidth: 0,
            paddingVertical: 10,
        },
        unit: {
            color: colors.textSecondary,
            fontSize: 12,
            marginLeft: 7,
        },
        targetLabel: {
            marginTop: 14,
        },
        primaryButton: {
            alignItems: "center",
            backgroundColor: colors.primary,
            borderRadius: 12,
            justifyContent: "center",
            marginTop: 16,
            minHeight: 48,
        },
        primaryButtonText: {
            color: colors.onPrimary,
            fontSize: 14,
            fontWeight: "800",
        },
        pressed: {
            backgroundColor: colors.primaryPressed,
        },
        error: {
            color: colors.danger,
            fontSize: 12,
            lineHeight: 18,
            marginTop: 10,
        },
        success: {
            color: colors.success,
            fontSize: 12,
            marginTop: 10,
        },
        weightSummary: {
            backgroundColor: colors.background,
            borderRadius: 13,
            padding: 15,
        },
        weightValue: {
            color: colors.text,
            fontSize: 27,
            fontWeight: "800",
        },
        weightUnit: {
            color: colors.textSecondary,
            fontSize: 15,
            fontWeight: "600",
        },
        weightGoal: {
            color: colors.textSecondary,
            fontSize: 12,
            marginTop: 4,
        },
        weightChange: {
            color: colors.primary,
            fontSize: 12,
            fontWeight: "600",
            marginTop: 9,
        },
        history: {
            marginTop: 18,
        },
        cardiovascularHistory: {
            marginTop: 18,
        },
        cardiovascularHistoryRow: {
            borderBottomColor: colors.border,
            borderBottomWidth: StyleSheet.hairlineWidth,
            gap: 3,
            paddingVertical: 9,
        },
        historyRow: {
            alignItems: "center",
            borderBottomColor: colors.border,
            borderBottomWidth: 1,
            flexDirection: "row",
            justifyContent: "space-between",
            minHeight: 40,
        },
        historyDate: {
            color: colors.textSecondary,
            fontSize: 12,
        },
        historyValue: {
            color: colors.text,
            fontSize: 13,
            fontWeight: "700",
        },
        emptyText: {
            color: colors.textSecondary,
            fontSize: 13,
            lineHeight: 19,
        },
        privacyNote: {
            color: colors.textSecondary,
            fontSize: 11,
            lineHeight: 16,
            marginTop: 13,
        },
        helper: {
            color: colors.textSecondary,
            flex: 1,
            fontSize: 12,
            lineHeight: 18,
        },
        themeOptions: {
            flexDirection: "row",
            gap: 7,
            marginTop: 14,
        },
        themeOption: {
            alignItems: "center",
            backgroundColor: colors.background,
            borderColor: colors.border,
            borderRadius: 11,
            borderWidth: 1,
            flex: 1,
            gap: 7,
            justifyContent: "center",
            minHeight: 70,
        },
        themeOptionSelected: {
            backgroundColor: colors.surfaceRaised,
            borderColor: colors.primary,
        },
        themeLabel: {
            color: colors.textSecondary,
            fontSize: 11,
            fontWeight: "600",
        },
        themeLabelSelected: {
            color: colors.primary,
            fontWeight: "800",
        },
        switchRow: {
            alignItems: "center",
            flexDirection: "row",
            gap: 10,
            justifyContent: "space-between",
            minHeight: 54,
        },
        switchCopy: {
            flex: 1,
        },
        switchTitle: {
            color: colors.text,
            fontSize: 13,
            fontWeight: "700",
        },
        switchDescription: {
            color: colors.textSecondary,
            fontSize: 11,
            lineHeight: 16,
            marginTop: 3,
        },
        intervalRow: {
            marginBottom: 12,
            marginTop: 5,
        },
        intervalOptions: {
            flexDirection: "row",
            gap: 8,
            marginTop: 8,
        },
        intervalOption: {
            alignItems: "center",
            backgroundColor: colors.background,
            borderColor: colors.border,
            borderRadius: 10,
            borderWidth: 1,
            flex: 1,
            justifyContent: "center",
            minHeight: 38,
        },
        intervalOptionSelected: {
            backgroundColor: colors.surfaceRaised,
            borderColor: colors.primary,
        },
        intervalLabel: {
            color: colors.textSecondary,
            fontSize: 12,
            fontWeight: "600",
        },
        intervalLabelSelected: {
            color: colors.primary,
            fontWeight: "800",
        },
        mealSwitchRow: {
            borderTopColor: colors.border,
            borderTopWidth: 1,
            marginTop: 5,
            paddingTop: 7,
        },
        mealTimes: {
            marginTop: 10,
        },
        reminderButton: {
            marginTop: 18,
        },
        disabledButton: {
            opacity: 0.6,
        },
    });
}
