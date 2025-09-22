import React from "react";

const LAST_UPDATE = "22/09/2025";
/** Remarque : l’adresse fournie contient deux « o » (coockies@...).
 *  Si c’est volontaire, garde-la. Sinon remplace par "cookies@shoozyou.com".
 */
const CONTACT_EMAIL = "coockies@shoozyou.com";

declare global {
    interface Window {
        __openCookiePrefs?: () => void;
    }
}

export default function CookiesPolicy() {
    const openCookiePrefs = () => window.__openCookiePrefs?.();

    return (
        <article className="legal">
            <header className="legal-header">
                <h1>Politique cookies</h1>
                <p className="meta">Dernière mise à jour : <strong>{LAST_UPDATE}</strong></p>
                <p>
                    Sur <strong>ShoozYou</strong>, nous utilisons des cookies et technologies similaires pour faire fonctionner le site,
                    mesurer son audience et améliorer votre expérience.
                </p>

                <div className="legal-cta">
                    <button className="btn btn-solid" onClick={openCookiePrefs}>Paramétrer mes cookies</button>
                    <a className="btn btn-outline-danger" href="/privacy">Politique de confidentialité</a>
                </div>
            </header>

            <section className="legal-section">
                <h2>Quels cookies utilisons-nous&nbsp;?</h2>
                <ul>
                    <li>
                        <strong>Indispensables (toujours actifs)</strong> : fonctionnement du site, panier, sécurité,
                        conservation de vos choix de cookies.
                    </li>
                    <li>
                        <strong>Mesure d’audience</strong> : statistiques anonymisées pour comprendre l’utilisation du site et l’améliorer.
                    </li>
                    <li>
                        <strong>Personnalisation</strong> : mémoriser vos préférences (marques, pointure) et vous proposer un contenu plus pertinent.
                    </li>
                    <li>
                        <strong>Publicité & réseaux sociaux</strong> : affichage d’annonces et partage social. Utilisés uniquement si vous y consentez.
                    </li>
                </ul>
                <div className="cookie-callout">
                    La liste à jour des partenaires figure dans la fenêtre <em>«&nbsp;Paramétrer mes cookies&nbsp;»</em>.
                </div>
            </section>

            <section className="legal-section">
                <h2>Vos choix</h2>
                <p>
                    À votre arrivée, un bandeau vous permet d’<strong>Accepter tout</strong>, <strong>Refuser tout</strong> (hors indispensables)
                    ou <strong>Personnaliser</strong> par catégorie. Vous pouvez modifier vos préférences à tout moment via le lien
                    <em> «&nbsp;Gérer mes cookies&nbsp;»</em> (en bas de page).
                </p>
                <div className="legal-cta">
                    <button className="btn btn-solid" onClick={openCookiePrefs}>Gérer mes cookies</button>
                </div>
            </section>

            <section className="legal-section">
                <h2>Durée</h2>
                <ul>
                    <li>Les cookies ont une durée de vie maximale de <strong>13 mois</strong>.</li>
                    <li>La preuve de votre consentement est conservée au plus <strong>6 mois</strong>.</li>
                </ul>
            </section>

            <section className="legal-section">
                <h2>Partenaires</h2>
                <p>
                    Certains cookies proviennent de prestataires (hébergement, analytics, publicité, réseaux sociaux).
                    La liste à jour des partenaires figure dans la fenêtre <em>«&nbsp;Paramétrer mes cookies&nbsp;»</em>.
                </p>
            </section>

            <section className="legal-section">
                <h2>Gérer depuis votre navigateur</h2>
                <p>
                    Vous pouvez aussi supprimer ou bloquer les cookies via les réglages de votre navigateur
                    (cela peut limiter certaines fonctionnalités, comme le panier).
                </p>
            </section>

            <section className="legal-section">
                <h2>Vos droits & contact</h2>
                <p>
                    Pour toute question ou pour exercer vos droits (accès, rectification, opposition, effacement…), écrivez-nous à&nbsp;
                    <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
                    Plus d’infos dans notre <a href="/privacy">Politique de confidentialité</a>.
                </p>
            </section>
        </article>
    );
}
