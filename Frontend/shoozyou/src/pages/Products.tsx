import React, { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useProducts } from "../features/products/useProducts";
import ProductCard from "../components/products/ProductCard";
import Pagination from "../components/pagination/Pagination";

const PAGE_SIZE = 20;
function paginate<T>(arr: T[], page: number, size: number) {
    const start = (page - 1) * size;
    return arr.slice(start, start + size);
}

export default function Home() {
    const { loading, list } = useProducts();
    const [search, setSearch] = useSearchParams();
    const page = Math.max(1, Number(search.get("page")) || 1);

    const pageItems = useMemo(() => paginate(list, page, PAGE_SIZE), [list, page]);

    return (
        <div className="container" style={{ padding: "24px 0" }}>
            {/* Hero */}
            <section className="hero">
                <h1>SHOOZYOU</h1>
                <p>La référence des sneakers premium</p>
                <Link to="/products" className="btn-primary">Découvrir la collection</Link>
            </section>

            {/* Raccourcis catégories */}
            <section className="grid3" style={{ marginTop: 20 }}>
                <Link to="/homme" className="card cat"><span>🧔</span><strong> Homme</strong><p>Collection masculine</p></Link>
                <Link to="/femme" className="card cat"><span>👩</span><strong> Femme</strong><p>Élégance et confort</p></Link>
                <Link to="/enfant" className="card cat"><span>🧒</span><strong> Enfant</strong><p>Style junior</p></Link>
            </section>

            {/* Grille + pagination */}
            <section style={{ marginTop: 28 }}>
                <h2 style={{ margin: "0 0 12px" }}>Nouveautés</h2>

                {loading ? (
                    <div className="skeleton-grid">
                        {Array.from({ length: 8 }).map((_, i) => <div className="skeleton-card" key={i} />)}
                    </div>
                ) : (
                    <>
                        <div className="product-grid">
                            {pageItems.map(p => <ProductCard key={p.id} product={p} />)}
                        </div>

                        <Pagination
                            page={page}
                            pageSize={PAGE_SIZE}
                            total={list.length}
                            onPageChange={(p) => setSearch({ page: String(p) }, { replace: true })}
                        />
                    </>
                )}
            </section>
        </div>
    );
}
