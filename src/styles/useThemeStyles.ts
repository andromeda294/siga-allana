import { useMemo } from "react";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import type { AppColors, GlobalStyles } from "@/styles/global";

type StyleFactory<T> = (
    colors: AppColors,
    globalStyles: GlobalStyles,
) => T;

export function useThemeStyles<T>(factory: StyleFactory<T>) {
    const { colors, globalStyles } = useAppSettings();
    return useMemo(
        () => factory(colors, globalStyles),
        [colors, factory, globalStyles],
    );
}
