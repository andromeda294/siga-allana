import type { PropsWithChildren } from "react";
import { AdsContext } from "@/contexts/AdsContext";

const noAds = { showInterstitial: () => {} };

export default function AdsProvider({ children }: PropsWithChildren) {
    return <AdsContext.Provider value={noAds}>{children}</AdsContext.Provider>;
}
