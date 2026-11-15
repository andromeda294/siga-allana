import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { PropsWithChildren } from "react";

export type MealRecord = {
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    createdAt: number;
};

export type MealInput = Omit<MealRecord, "id" | "createdAt">;

export type DailyGoals = {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    waterMl: number;
};

type WaterEntry = {
    id: string;
    amountMl: number;
    createdAt: number;
};

type NutritionTotals = Pick<MealRecord, "calories" | "protein" | "carbs" | "fat">;

export const DEFAULT_DAILY_GOALS: DailyGoals = {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 65,
    waterMl: 2000,
};

type StoredData = {
    version: 1;
    meals: MealRecord[];
    goals: DailyGoals;
    waterEntries: WaterEntry[];
};

type MealsContextValue = {
    meals: MealRecord[];
    todayMeals: MealRecord[];
    todayTotals: NutritionTotals;
    goals: DailyGoals;
    todayWaterMl: number;
    isHydrated: boolean;
    storageError: string | null;
    editingMealId: string | null;
    addMeal: (meal: MealInput) => void;
    updateMeal: (id: string, meal: MealInput) => void;
    removeMeal: (id: string) => void;
    selectMealForEditing: (id: string) => void;
    clearMealForEditing: () => void;
    updateGoals: (goals: DailyGoals) => void;
    addWater: (amountMl: number) => void;
    undoLastWater: () => void;
};

const STORAGE_KEY = "@siga-allana/local-data-v1";
const MealsContext = createContext<MealsContextValue | null>(null);
let mealSequence = 0;
let waterSequence = 0;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function isFiniteNumber(value: unknown, minimum = 0): value is number {
    return typeof value === "number" && Number.isFinite(value) && value >= minimum;
}

function isStoredMeal(value: unknown): value is MealRecord {
    if (!isRecord(value)) return false;
    return (
        typeof value.id === "string" &&
        typeof value.name === "string" &&
        value.name.trim().length > 0 &&
        isFiniteNumber(value.calories) &&
        isFiniteNumber(value.protein) &&
        isFiniteNumber(value.carbs) &&
        isFiniteNumber(value.fat) &&
        isFiniteNumber(value.createdAt)
    );
}

function isDailyGoals(value: unknown): value is DailyGoals {
    if (!isRecord(value)) return false;
    return (
        isFiniteNumber(value.calories, 1) &&
        isFiniteNumber(value.protein, 1) &&
        isFiniteNumber(value.carbs, 1) &&
        isFiniteNumber(value.fat, 1) &&
        isFiniteNumber(value.waterMl, 1)
    );
}

function isWaterEntry(value: unknown): value is WaterEntry {
    if (!isRecord(value)) return false;
    return (
        typeof value.id === "string" &&
        isFiniteNumber(value.amountMl, 1) &&
        isFiniteNumber(value.createdAt)
    );
}

function parseStoredData(raw: string): StoredData {
    const value: unknown = JSON.parse(raw);
    if (
        !isRecord(value) ||
        value.version !== 1 ||
        !Array.isArray(value.meals) ||
        !value.meals.every(isStoredMeal) ||
        !isDailyGoals(value.goals) ||
        !Array.isArray(value.waterEntries) ||
        !value.waterEntries.every(isWaterEntry)
    ) {
        throw new Error("The saved SIGA Allana data has an unsupported format.");
    }

    return {
        version: 1,
        meals: value.meals,
        goals: value.goals,
        waterEntries: value.waterEntries,
    };
}

function getTodayRange() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start: start.getTime(), end: end.getTime() };
}

export function MealsProvider({ children }: PropsWithChildren) {
    const [meals, setMeals] = useState<MealRecord[]>([]);
    const [goals, setGoals] = useState(DEFAULT_DAILY_GOALS);
    const [waterEntries, setWaterEntries] = useState<WaterEntry[]>([]);
    const [isHydrated, setIsHydrated] = useState(false);
    const [editingMealId, setEditingMealId] = useState<string | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);
    const writeQueue = useRef<Promise<void>>(Promise.resolve());

    useEffect(() => {
        let isMounted = true;

        async function loadLocalData() {
            try {
                const raw = await AsyncStorage.getItem(STORAGE_KEY);
                if (raw !== null) {
                    const stored = parseStoredData(raw);
                    if (isMounted) {
                        setMeals(stored.meals.sort((a, b) => b.createdAt - a.createdAt));
                        setGoals(stored.goals);
                        setWaterEntries(stored.waterEntries.sort((a, b) => b.createdAt - a.createdAt));
                    }
                }
            } catch (error) {
                console.error("Could not load local SIGA Allana data.", error);
                if (isMounted) {
                    setLoadError("Não foi possível carregar os dados guardados neste dispositivo.");
                }
            } finally {
                if (isMounted) setIsHydrated(true);
            }
        }

        void loadLocalData();
        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (!isHydrated || loadError) return;

        const snapshot: StoredData = { version: 1, meals, goals, waterEntries };
        const serialized = JSON.stringify(snapshot);
        writeQueue.current = writeQueue.current
            .then(() => AsyncStorage.setItem(STORAGE_KEY, serialized))
            .then(() => setSaveError(null))
            .catch((error: unknown) => {
                console.error("Could not save local SIGA Allana data.", error);
                setSaveError("Não foi possível guardar os dados neste dispositivo.");
            });
    }, [goals, isHydrated, loadError, meals, waterEntries]);

    const { start, end } = getTodayRange();
    const todayMeals = useMemo(
        () => meals.filter((meal) => meal.createdAt >= start && meal.createdAt < end),
        [end, meals, start],
    );
    const todayTotals = useMemo(
        () =>
            todayMeals.reduce<NutritionTotals>(
                (totals, meal) => ({
                    calories: totals.calories + meal.calories,
                    protein: totals.protein + meal.protein,
                    carbs: totals.carbs + meal.carbs,
                    fat: totals.fat + meal.fat,
                }),
                { calories: 0, protein: 0, carbs: 0, fat: 0 },
            ),
        [todayMeals],
    );
    const todayWaterMl = useMemo(
        () =>
            waterEntries.reduce(
                (total, entry) =>
                    entry.createdAt >= start && entry.createdAt < end ? total + entry.amountMl : total,
                0,
            ),
        [end, start, waterEntries],
    );

    const addMeal = useCallback((meal: MealInput) => {
        const createdAt = Date.now();
        const id = `${createdAt}-${mealSequence++}`;
        setMeals((current) => [{ ...meal, id, createdAt }, ...current]);
    }, []);

    const updateMeal = useCallback((id: string, meal: MealInput) => {
        setMeals((current) =>
            current.map((record) => (record.id === id ? { ...record, ...meal } : record)),
        );
    }, []);

    const removeMeal = useCallback((id: string) => {
        setMeals((current) => current.filter((meal) => meal.id !== id));
        setEditingMealId((current) => (current === id ? null : current));
    }, []);

    const selectMealForEditing = useCallback((id: string) => {
        setEditingMealId(id);
    }, []);

    const clearMealForEditing = useCallback(() => {
        setEditingMealId(null);
    }, []);

    const updateGoals = useCallback((nextGoals: DailyGoals) => {
        setGoals(nextGoals);
    }, []);

    const addWater = useCallback((amountMl: number) => {
        if (!Number.isFinite(amountMl) || amountMl <= 0) {
            throw new RangeError("Water amount must be a positive number.");
        }
        const createdAt = Date.now();
        const id = `${createdAt}-${waterSequence++}`;
        setWaterEntries((current) => [{ id, amountMl, createdAt }, ...current]);
    }, []);

    const undoLastWater = useCallback(() => {
        const { start: dayStart, end: dayEnd } = getTodayRange();
        setWaterEntries((current) => {
            const latestToday = current.find(
                (entry) => entry.createdAt >= dayStart && entry.createdAt < dayEnd,
            );
            return latestToday
                ? current.filter((entry) => entry.id !== latestToday.id)
                : current;
        });
    }, []);

    const storageError = loadError ?? saveError;
    const value = useMemo(
        () => ({
            meals,
            todayMeals,
            todayTotals,
            goals,
            todayWaterMl,
            isHydrated,
            storageError,
            editingMealId,
            addMeal,
            updateMeal,
            removeMeal,
            selectMealForEditing,
            clearMealForEditing,
            updateGoals,
            addWater,
            undoLastWater,
        }),
        [
            meals,
            todayMeals,
            todayTotals,
            goals,
            todayWaterMl,
            isHydrated,
            storageError,
            editingMealId,
            addMeal,
            updateMeal,
            removeMeal,
            selectMealForEditing,
            clearMealForEditing,
            updateGoals,
            addWater,
            undoLastWater,
        ],
    );

    return <MealsContext.Provider value={value}>{children}</MealsContext.Provider>;
}

export function useMeals() {
    const context = useContext(MealsContext);
    if (!context) {
        throw new Error("useMeals must be used within a MealsProvider");
    }

    return context;
}
