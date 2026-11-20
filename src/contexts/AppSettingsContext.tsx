import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { PropsWithChildren } from "react";
import { useColorScheme } from "react-native";
import { scheduleLocalReminders } from "@/services/notifications";
import { createGlobalStyles, getPalette } from "@/styles/global";
import type { AppColors, ColorScheme } from "@/styles/global";

export type ThemePreference = "system" | ColorScheme;

export type WeightEntry = {
    id: string;
    weightKg: number;
    createdAt: number;
};

export type CardiovascularReading = {
    id: string;
    pulseBpm: number;
    systolicMmHg: number;
    diastolicMmHg: number;
    createdAt: number;
};

export type CardiovascularReadingInput = Omit<CardiovascularReading, "id" | "createdAt">;

export type UserProfile = {
    name: string;
    heightCm: number | null;
    targetWeightKg: number | null;
    weightHistory: WeightEntry[];
    cardiovascularHistory: CardiovascularReading[];
};

export type ProfileInput = {
    name: string;
    heightCm: number | null;
    weightKg: number | null;
    targetWeightKg: number | null;
};

export type ReminderPreferences = {
    waterEnabled: boolean;
    waterIntervalHours: number;
    mealEnabled: boolean;
    mealTimes: string[];
};

export type AppSettings = {
    themePreference: ThemePreference;
    profile: UserProfile;
    reminders: ReminderPreferences;
};

type AppSettingsContextValue = {
    settings: AppSettings;
    colors: AppColors;
    globalStyles: ReturnType<typeof createGlobalStyles>;
    colorScheme: ColorScheme;
    isSettingsHydrated: boolean;
    settingsError: string | null;
    setThemePreference: (preference: ThemePreference) => void;
    saveProfile: (profile: ProfileInput) => void;
    saveCardiovascularReading: (reading: CardiovascularReadingInput) => void;
    saveReminders: (reminders: ReminderPreferences) => Promise<void>;
};

const STORAGE_KEY = "@ritmo/app-settings-v1";
const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);
let weightSequence = 0;
let cardiovascularSequence = 0;

const DEFAULT_SETTINGS: AppSettings = {
    themePreference: "system",
    profile: {
        name: "",
        heightCm: null,
        targetWeightKg: null,
        weightHistory: [],
        cardiovascularHistory: [],
    },
    reminders: {
        waterEnabled: false,
        waterIntervalHours: 3,
        mealEnabled: false,
        mealTimes: ["13:00", "20:00"],
    },
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function isPositiveNumber(value: unknown, maximum: number): value is number {
    return typeof value === "number" && Number.isFinite(value) && value > 0 && value <= maximum;
}

function isOptionalNumber(value: unknown, maximum: number): value is number | null {
    return value === null || isPositiveNumber(value, maximum);
}

function isWeightEntry(value: unknown): value is WeightEntry {
    return (
        isRecord(value) &&
        typeof value.id === "string" &&
        isPositiveNumber(value.weightKg, 500) &&
        typeof value.createdAt === "number" &&
        Number.isFinite(value.createdAt) &&
        value.createdAt >= 0
    );
}

function isCardiovascularReading(value: unknown): value is CardiovascularReading {
    return (
        isRecord(value) &&
        typeof value.id === "string" &&
        isPositiveNumber(value.pulseBpm, 300) &&
        isPositiveNumber(value.systolicMmHg, 400) &&
        isPositiveNumber(value.diastolicMmHg, 300) &&
        typeof value.createdAt === "number" &&
        Number.isFinite(value.createdAt) &&
        value.createdAt >= 0
    );
}

function isMealTime(value: unknown): value is string {
    if (typeof value !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return false;
    return true;
}

function parseSettings(raw: string): AppSettings {
    const value: unknown = JSON.parse(raw);
    if (
        !isRecord(value) ||
        value.version !== 1 ||
        !isRecord(value.profile) ||
        !isRecord(value.reminders) ||
        !["system", "light", "dark"].includes(String(value.themePreference))
    ) {
        throw new Error("The saved Ritmo settings have an unsupported format.");
    }

    const { profile, reminders } = value;
    const cardiovascularHistory = profile.cardiovascularHistory ?? [];
    if (
        typeof profile.name !== "string" ||
        profile.name.length > 40 ||
        !isOptionalNumber(profile.heightCm, 250) ||
        (profile.heightCm !== null && profile.heightCm < 80) ||
        !isOptionalNumber(profile.targetWeightKg, 500) ||
        !Array.isArray(profile.weightHistory) ||
        !profile.weightHistory.every(isWeightEntry) ||
        !Array.isArray(cardiovascularHistory) ||
        !cardiovascularHistory.every(isCardiovascularReading) ||
        typeof reminders.waterEnabled !== "boolean" ||
        ![1, 2, 3, 4, 6].includes(Number(reminders.waterIntervalHours)) ||
        typeof reminders.mealEnabled !== "boolean" ||
        !Array.isArray(reminders.mealTimes) ||
        reminders.mealTimes.length === 0 ||
        !reminders.mealTimes.every(isMealTime)
    ) {
        throw new Error("The saved Ritmo settings have an unsupported format.");
    }

    return {
        themePreference:
            value.themePreference === "light" || value.themePreference === "dark"
                ? value.themePreference
                : "system",
        profile: {
            name: profile.name,
            heightCm: profile.heightCm,
            targetWeightKg: profile.targetWeightKg,
            weightHistory: [...profile.weightHistory].sort((a, b) => b.createdAt - a.createdAt),
            cardiovascularHistory: [...cardiovascularHistory].sort((a, b) => b.createdAt - a.createdAt),
        },
        reminders: {
            waterEnabled: reminders.waterEnabled,
            waterIntervalHours: Number(reminders.waterIntervalHours),
            mealEnabled: reminders.mealEnabled,
            mealTimes: reminders.mealTimes,
        },
    };
}

export function AppSettingsProvider({ children }: PropsWithChildren) {
    const systemColorScheme = useColorScheme();
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
    const [isSettingsHydrated, setIsSettingsHydrated] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);
    const writeQueue = useRef<Promise<void>>(Promise.resolve());

    useEffect(() => {
        let isMounted = true;

        async function loadSettings() {
            try {
                const raw = await AsyncStorage.getItem(STORAGE_KEY);
                if (raw !== null) {
                    const stored = parseSettings(raw);
                    if (isMounted) setSettings(stored);
                }
            } catch (error) {
                console.error("Could not load local Ritmo settings.", error);
                if (isMounted) {
                    setLoadError("Não foi possível carregar as definições guardadas neste dispositivo.");
                }
            } finally {
                if (isMounted) setIsSettingsHydrated(true);
            }
        }

        void loadSettings();
        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (!isSettingsHydrated || loadError) return;

        const serialized = JSON.stringify({ version: 1, ...settings });
        writeQueue.current = writeQueue.current
            .then(() => AsyncStorage.setItem(STORAGE_KEY, serialized))
            .then(() => setSaveError(null))
            .catch((error: unknown) => {
                console.error("Could not save local Ritmo settings.", error);
                setSaveError("Não foi possível guardar as definições neste dispositivo.");
            });
    }, [isSettingsHydrated, loadError, settings]);

    const setThemePreference = useCallback((themePreference: ThemePreference) => {
        setSettings((current) => ({ ...current, themePreference }));
    }, []);

    const saveProfile = useCallback((input: ProfileInput) => {
        if (loadError) {
            throw new Error("Não é possível guardar porque as definições não puderam ser carregadas.");
        }
        const name = input.name.trim();
        if (name.length > 40) throw new RangeError("O nome deve ter até 40 caracteres.");
        if (input.heightCm !== null && (!Number.isFinite(input.heightCm) || input.heightCm < 80 || input.heightCm > 250)) {
            throw new RangeError("A altura deve estar entre 80 e 250 cm.");
        }
        if (input.weightKg !== null && (!Number.isFinite(input.weightKg) || input.weightKg <= 0 || input.weightKg > 500)) {
            throw new RangeError("O peso deve estar entre 0 e 500 kg.");
        }
        if (input.targetWeightKg !== null && (!Number.isFinite(input.targetWeightKg) || input.targetWeightKg <= 0 || input.targetWeightKg > 500)) {
            throw new RangeError("A meta de peso deve estar entre 0 e 500 kg.");
        }

        setSettings((current) => {
            const latestWeight = current.profile.weightHistory[0]?.weightKg;
            const weightHistory =
                input.weightKg !== null && input.weightKg !== latestWeight
                    ? [
                          {
                              id: `${Date.now()}-${weightSequence++}`,
                              weightKg: input.weightKg,
                              createdAt: Date.now(),
                          },
                          ...current.profile.weightHistory,
                      ].slice(0, 1000)
                    : current.profile.weightHistory;

            return {
                ...current,
                profile: {
                    name,
                    heightCm: input.heightCm,
                    targetWeightKg: input.targetWeightKg,
                    weightHistory,
                    cardiovascularHistory: current.profile.cardiovascularHistory,
                },
            };
        });
    }, [loadError]);

    const saveCardiovascularReading = useCallback((input: CardiovascularReadingInput) => {
        if (loadError) {
            throw new Error("Não é possível guardar porque as definições não puderam ser carregadas.");
        }
        if (!Number.isInteger(input.pulseBpm) || input.pulseBpm <= 0 || input.pulseBpm > 300) {
            throw new RangeError("O pulso deve ser um número entre 1 e 300 bpm.");
        }
        if (!Number.isInteger(input.systolicMmHg) || input.systolicMmHg <= 0 || input.systolicMmHg > 400) {
            throw new RangeError("A pressão sistólica deve ser um número entre 1 e 400 mmHg.");
        }
        if (!Number.isInteger(input.diastolicMmHg) || input.diastolicMmHg <= 0 || input.diastolicMmHg > 300) {
            throw new RangeError("A pressão diastólica deve ser um número entre 1 e 300 mmHg.");
        }

        const createdAt = Date.now();
        const reading: CardiovascularReading = {
            ...input,
            id: `${createdAt}-${cardiovascularSequence++}`,
            createdAt,
        };
        setSettings((current) => ({
            ...current,
            profile: {
                ...current.profile,
                cardiovascularHistory: [reading, ...current.profile.cardiovascularHistory].slice(0, 1000),
            },
        }));
    }, [loadError]);

    const saveReminders = useCallback(async (reminders: ReminderPreferences) => {
        if (loadError) {
            throw new Error("Não é possível guardar porque as definições não puderam ser carregadas.");
        }
        await scheduleLocalReminders(reminders);
        setSettings((current) => ({ ...current, reminders }));
    }, [loadError]);

    const colorScheme =
        settings.themePreference === "system"
            ? systemColorScheme === "dark"
                ? "dark"
                : "light"
            : settings.themePreference;
    const colors = useMemo(() => getPalette(colorScheme), [colorScheme]);
    const globalStyles = useMemo(() => createGlobalStyles(colors), [colors]);
    const value = useMemo(
        () => ({
            settings,
            colors,
            globalStyles,
            colorScheme,
            isSettingsHydrated,
            settingsError: loadError ?? saveError,
            setThemePreference,
            saveProfile,
            saveCardiovascularReading,
            saveReminders,
        }),
        [
            settings,
            colors,
            globalStyles,
            colorScheme,
            isSettingsHydrated,
            loadError,
            saveError,
            setThemePreference,
            saveProfile,
            saveCardiovascularReading,
            saveReminders,
        ],
    );

    return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
}

export function useAppSettings() {
    const context = useContext(AppSettingsContext);
    if (!context) {
        throw new Error("useAppSettings must be used within an AppSettingsProvider");
    }
    return context;
}
