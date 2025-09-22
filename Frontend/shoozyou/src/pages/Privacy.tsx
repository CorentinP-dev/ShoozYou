import React from "react";

/** ⚠️ Si ton adresse ne supporte pas les accents, remplace par
 *  "politique.confidentialite@shoozyou.com" (sans accent).
 */
const CONTACT_EMAIL = "politique.confidentialite@shoozyou.com";

declare global {
    interface Window {
        __openCookiePrefs?: () => void;
    }
}

export default function Privacy() {
    const openCookiePrefs = () => window.__openCookiePrefs?.();

    return (
        <article className="legal">
            <header className="legal-header">
                <h1>Politique de confidentialité</h1>
                <p className="meta">Dernière mise à jour : <strong>22/09/2025</strong></p>
                <p className="meta">
                    Responsable du traitement : <strong>ShoozYou</strong> — Contact :{" "}
                    <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                </p>
                <div className="legal-cta">
                    <a className="btn btn-solid" href="/cookies">Politique cookies</a>
                </div>
            </header>

            <section className="legal-section">
                <h2>Données que nous traitons</h2>
                <ul>
                    <li>
                        <strong>Compte & commandes</strong> : identité, e-mail, adresses, téléphone,{" "}
                        pointure, historique d’achats.
                    </li>
                    <li>
                        <strong>Paiement</strong> : traité par nos prestataires (nous ne stockons pas vos numéros de carte).
                    </li>
                    <li>
                        <strong>Livraison / SAV</strong>, <strong>avis & messages</strong>,{" "}
                        <strong>préférences marketing</strong>.
                    </li>
                    <li>
                        <strong>Données de navigation & cookies</strong> (voir notre Politique cookies).
                    </li>
                </ul>
            </section>

            <section className="legal-section">
                <h2>Finalités & bases légales</h2>
                <ul className="legal-list">
                    <li>
                        <span className="badge base">Contrat</span> Vente & service : commande, paiement, livraison, SAV.
                    </li>
                    <li>
                        <span className="badge base">Contrat</span> Gestion du compte.
                    </li>
                    <li>
                        <span className="badge base">Obligation légale</span> Facturation / comptabilité.
                    </li>
                    <li>
                        <span className="badge base">Consentement</span> Newsletter & offres (désinscription possible à tout moment) — ou{" "}
                        <span className="badge base">Intérêt légitime</span> pour des offres similaires destinées à nos clients.
                    </li>
                    <li>
                        <span className="badge base">Consentement</span> Mesure d’audience & amélioration du site (cookies non essentiels).{" "}
                        Solutions exemptées si applicables.
                    </li>
                    <li>
                        <span className="badge base">Intérêt légitime</span> Lutte contre la fraude & sécurité.
                    </li>
                </ul>
            </section>

            <section className="legal-section">
                <h2>Destinataires</h2>
                <p>
                    Prestataires de paiement (ex. Stripe/PayPal), transport/logistique (ex. Colissimo/Chronopost), hébergement & e-commerce,
                    emailing/analytics. Nous ne partageons que le nécessaire et encadrons contractuellement ces traitements.
                </p>
            </section>

            <section className="legal-section">
                <h2>Durées de conservation (maximum)</h2>
                <ul>
                    <li>
                        <strong>Compte / commandes :</strong> durée de la relation + <strong>5 ans</strong>
                    </li>
                    <li>
                        <strong>Factures :</strong> <strong>10 ans</strong>
                    </li>
                    <li>
                        <strong>Prospects / newsletter :</strong> <strong>3 ans</strong> après le dernier contact
                    </li>
                    <li>
                        <strong>SAV :</strong> <strong>2 ans</strong>
                    </li>
                    <li>
                        <strong>Cookies :</strong> ≤ <strong>13 mois</strong> (consentement ≤ <strong>6 mois</strong>)
                    </li>
                </ul>
            </section>

            <section className="legal-section">
                <h2>Vos droits</h2>
                <p>
                    Vous disposez des droits d’<strong>accès</strong>, <strong>rectification</strong>, <strong>effacement</strong>,{" "}
                    <strong>limitation</strong>, <strong>portabilité</strong>, <strong>opposition</strong>, <strong>retrait du consentement</strong>, et{" "}
                    <strong>directives post-mortem</strong>.
                </p>
                <p>
                    Pour exercer vos droits :{" "}
                    <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Vous pouvez également saisir la{" "}
                    <a href="https://www.cnil.fr" target="_blank" rel="noreferrer">CNIL</a>.
                </p>
            </section>

            <section className="legal-section">
                <h2>Cookies</h2>
                <p>
                    À l’arrivée sur le site, vous pouvez <strong>accepter</strong>, <strong>refuser</strong> ou{" "}
                    <strong>personnaliser</strong> les cookies non essentiels. Vous pouvez modifier vos choix à tout moment via{" "}
                </p>
                <div className="legal-cta">
                    <a className="btn btn-solid" href="/cookies">Voir la Politique cookies</a>
                </div>
            </section>

            <section className="legal-section">
                <h2>Transferts hors UE</h2>
                <p>
                    Si certains prestataires sont situés hors UE, nous utilisons les <strong>Clauses Contractuelles Types</strong> et des{" "}
                    <strong>mesures adéquates</strong> pour encadrer les transferts.
                </p>
            </section>

            <section className="legal-section">
                <h2>Plus d’informations</h2>
                <p>
                    Pour les destinataires détaillés, la sécurité et les transferts, consultez nos{" "}
                    <a href="/legal">Mentions légales</a> et notre <a href="/cookies">Politique cookies</a>.
                </p>
            </section>
        </article>
    );
}
