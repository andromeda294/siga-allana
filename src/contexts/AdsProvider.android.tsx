import mobileAds, {
    AdsConsent,
    TestIds,
    useInterstitialAd,
} from "react-native-google-mobile-ads";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PropsWithChildren } from "react";
import { AdsContext } from "@/contexts/AdsContext";

const INTERSTITIAL_UNIT_ID = __DEV__
    ? TestIds.INTERSTITIAL
    : "ca-app-pub-1347711363031200/1924420679";

export default function AdsProvider({ children }: PropsWithChildren) {
    const [consentReady, setConsentReady] = useState(false);
    const initializationStarted = useRef(false);

    useEffect(() => {
        let isActive = true;

        async function initializeAds() {
            try {
                await AdsConsent.gatherConsent();
            } catch (error) {
                console.error("Could not gather AdMob consent.", error);
            }

            const { canRequestAds } = await AdsConsent.getConsentInfo();
            if (!isActive || !canRequestAds || initializationStarted.current) return;

            initializationStarted.current = true;
            await mobileAds().initialize();
            if (isActive) setConsentReady(true);
        }

        void initializeAds().catch((error: unknown) => {
            console.error("Could not initialize AdMob.", error);
        });

        return () => {
            isActive = false;
        };
    }, []);

    const { status, load, show } = useInterstitialAd({
        adUnitId: consentReady ? INTERSTITIAL_UNIT_ID : null,
        autoLoad: consentReady,
    });

    useEffect(() => {
        if (status === "closed") load();
    }, [load, status]);

    const showInterstitial = useCallback(() => {
        if (status === "loaded") show();
    }, [show, status]);

    return (
        <AdsContext.Provider value={{ showInterstitial }}>
            {children}
        </AdsContext.Provider>
    );
}
