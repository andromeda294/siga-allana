import { createContext, useContext } from "react";

type AdsContextValue = {
    showInterstitial: () => void;
};

export const AdsContext = createContext<AdsContextValue | null>(null);

export function useAds() {
    const context = useContext(AdsContext);
    if (!context) {
        throw new Error("useAds must be used within AdsProvider.");
    }
    return context;
}
