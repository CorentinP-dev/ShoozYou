import React from "react";

export default function Home() {
    return (
        <>
            <section className="container" style={{ marginTop: 24 }}>
                <div className="hero">
                    <h1>SHOOZYOU</h1>
                    <p>La référence des sneakers premium</p>
                    <a href="/Frontend/shoozyou/src/pages/Products" className="btn-primary">Découvrir la collection</a>
                </div>
            </section>

            <section className="container grid3">
                <div className="card">🧔 <strong>Homme</strong><p>Collection masculine premium</p></div>
                <div className="card">👩 <strong>Femme</strong><p>Élégance et confort</p></div>
                <div className="card">🧒 <strong>Enfant</strong><p>Style junior</p></div>
            </section>
        </>
    );
}
