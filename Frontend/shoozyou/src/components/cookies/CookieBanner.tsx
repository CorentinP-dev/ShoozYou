import React, { useEffect, useState } from "react";
import Modal from "../ui/Modal";
import { useCookieConsent } from "../../features/consent/useCookieConsent";

export default function CookieBanner() {
    const {
        consent,
        bannerOpen,
        setBannerOpen,
        prefsOpen,
        setPrefsOpen,
        acceptAll,
        refuseAll,
        saveCustom,
    } = useCookieConsent();

    // états locaux de la modale
    const [analytics, setAnalytics] = useState(false);
    const [marketing, setMarketing] = useState(false);
    const [functional, setFunctional] = useState(false);

    useEffect(() => {
        if (prefsOpen) {
            setAnalytics(consent?.analytics ?? false);
            setMarketing(consent?.marketing ?? false);
            setFunctional(consent?.functional ?? false);
        }
    }, [prefsOpen, consent]);

    return (
        <>
            {/* Bannière en bas */}
            {bannerOpen && (
                <div className="cookie-banner" role="region" aria-label="Bannière de consentement">
                    <div className="cookie-text">
                        Nous utilisons des cookies pour améliorer votre expérience, mesurer l’audience et proposer des contenus personnalisés.
                        Vous pouvez accepter, refuser, ou personnaliser vos choix.
                        <a className="cookie-link" href="/privacy"> En savoir plus</a>.
                    </div>
                    <div className="cookie-actions">
                        <button className="btn btn-outline-danger" onClick={refuseAll}>Refuser</button>
                        <button className="btn btn-solid" onClick={acceptAll}>Accepter</button>
                        <button className="btn cookie-manage" onClick={() => setPrefsOpen(true)}>Paramétrer</button>
                    </div>
                    <button className="cookie-close" aria-label="Fermer" onClick={() => setBannerOpen(false)}>×</button>
                </div>
            )}

            {/* Modale de préférences */}
            <Modal open={prefsOpen} onClose={() => setPrefsOpen(false)} width={720}>
                <h2 style={{ marginTop: 0 }}>Paramètres des cookies</h2>
                <p>Les cookies « nécessaires » sont indispensables au fonctionnement du site.</p>

                <div className="cookie-pref">
                    <div className="pref-left">
                        <strong>Nécessaires</strong>
                        <div className="pref-desc">Indispensables au bon fonctionnement (toujours actifs).</div>
                    </div>
                    <div className="pref-right"><span className="pref-badge">Toujours actif</span></div>
                </div>

                <div className="cookie-pref">
                    <div className="pref-left">
                        <strong>Fonctionnels</strong>
                        <div className="pref-desc">Confort d’utilisation (mémorisation de préférences).</div>
                    </div>
                    <div className="pref-right">
                        <label className="switch">
                            <input type="checkbox" checked={functional} onChange={e => setFunctional(e.target.checked)} />
                            <span className="slider" />
                        </label>
                    </div>
                </div>

                <div className="cookie-pref">
                    <div className="pref-left">
                        <strong>Analytics</strong>
                        <div className="pref-desc">Mesure d’audience et performance.</div>
                    </div>
                    <div className="pref-right">
                        <label className="switch">
                            <input type="checkbox" checked={analytics} onChange={e => setAnalytics(e.target.checked)} />
                            <span className="slider" />
                        </label>
                    </div>
                </div>

                <div className="cookie-pref">
                    <div className="pref-left">
                        <strong>Marketing</strong>
                        <div className="pref-desc">Publicités personnalisées.</div>
                    </div>
                    <div className="pref-right">
                        <label className="switch">
                            <input type="checkbox" checked={marketing} onChange={e => setMarketing(e.target.checked)} />
                            <span className="slider" />
                        </label>
                    </div>
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                    <button className="btn btn-outline-danger" onClick={refuseAll}>Tout refuser</button>
                    <button className="btn btn-solid" onClick={() => saveCustom({ analytics, marketing, functional })}>
                        Enregistrer mes choix
                    </button>
                </div>
            </Modal>
        </>
    );
}
