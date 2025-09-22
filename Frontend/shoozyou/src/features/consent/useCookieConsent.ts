import { useEffect, useMemo, useState } from "react";

export type Consent = {
    necessary: true;              // toujours vrai (non désactivable)
    analytics: boolean;
    marketing: boolean;
    functional: boolean;
    date: string;                 // ISO
    version: string;              // pour invalider plus tard si besoin
};

const KEY = "cookie-consent-v1";
const CURRENT_VERSION = "1.0.0";

const defaultConsent: Consent = {
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false,
    date: new Date().toISOString(),
    version: CURRENT_VERSION,
};

export function loadConsent(): Consent | null {
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as Consent;
        // si on a changé la version, on redemande
        if (parsed.version !== CURRENT_VERSION) return null;
        return parsed;
    } catch {
        return null;
    }
}

export function saveConsent(c: Consent) {
    localStorage.setItem(KEY, JSON.stringify(c));
}

export function useCookieConsent() {
    const [consent, setConsent] = useState<Consent | null>(() => loadConsent());
    const [bannerOpen, setBannerOpen] = useState<boolean>(() => !loadConsent());
    const [prefsOpen, setPrefsOpen] = useState(false);

    useEffect(() => {
        // expose une API globale pour “Paramétrer les cookies” depuis le footer
        window.__openCookiePrefs = () => setPrefsOpen(true);
        return () => { delete window.__openCookiePrefs; };
    }, []);

    const actions = useMemo(() => ({
        acceptAll: () => {
            const c: Consent = { ...defaultConsent, analytics: true, marketing: true, functional: true, date: new Date().toISOString() };
            saveConsent(c);
            setConsent(c);
            setBannerOpen(false);
            // 👉 ici vous pouvez initialiser Google Analytics / Meta pixel, etc. selon c.analytics / c.marketing
        },
        refuseAll: () => {
            const c: Consent = { ...defaultConsent, analytics: false, marketing: false, functional: false, date: new Date().toISOString() };
            saveConsent(c);
            setConsent(c);
            setBannerOpen(false);
        },
        saveCustom: (partial: Omit<Consent, "necessary" | "date" | "version">) => {
            const c: Consent = { ...defaultConsent, ...partial, date: new Date().toISOString() };
            saveConsent(c);
            setConsent(c);
            setPrefsOpen(false);
            setBannerOpen(false);
        }
    }), []);

    return {
        consent,
        bannerOpen,
        setBannerOpen,
        prefsOpen,
        setPrefsOpen,
        ...actions,
    };
}
