import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useProducts } from "../features/products/useProducts";
import ProductCard from "../components/products/ProductCard";
import Pagination from "../components/pagination/Pagination";
import ProductModal from "../components/products/ProductModal";
import type { Product } from "../services/productService";

const PAGE_SIZE = 20;
function paginate<T>(arr: T[], page: number, size: number) {
    const start = (page - 1) * size;
    return arr.slice(start, start + size);
}

export default function Home() {
    const { loading, list } = useProducts({ limit: 120 });

    // pagination via ?page=
    const [search, setSearch] = useSearchParams();
    const page = Math.max(1, Number(search.get("page")) || 1);

    // --- Quick View modal ---
    const [selected, setSelected] = useState<Product | null>(null);
    const [open, setOpen] = useState(false);
    const openModal = (p: Product) => {
        setSelected(p);
        setOpen(true);
    };

    const pageItems = useMemo(() => paginate(list, page, PAGE_SIZE), [list, page]);

    return (
        <>
            {/* HERO */}
            <section className="hero">
                <h1>SHOOZYOU</h1>
                <p>La référence des sneakers premium</p>
                <Link to="/products" className="btn-primary">
                    Découvrir la collection
                </Link>
            </section>

            {/* BULLES / CARTES CATÉGORIES */}
            <section className="grid3 section" aria-label="Catégories vedettes">
                <Link to="/homme" className="card cat">
                    <span>🧔</span>
                    <strong> Homme</strong>
                    <p>Collection masculine</p>
                </Link>

                <Link to="/femme" className="card cat">
                    <span>👩</span>
                    <strong> Femme</strong>
                    <p>Élégance et confort</p>
                </Link>

                <Link to="/enfant" className="card cat">
                    <span>🧒</span>
                    <strong> Enfant</strong>
                    <p>Style junior</p>
                </Link>
            </section>

            {/* NOUVEAUTÉS + MODAL */}
            <section className="section">
                <h2 style={{ margin: "0 0 12px" }}> Produits </h2>

                {loading ? (
                    <div className="skeleton-grid">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="skeleton-card" />
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="product-grid">
                            {pageItems.map((p) => (
                                <ProductCard key={p.id} product={p} onClick={() => openModal(p)} />
                            ))}
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

            {/* Modal Quick View */}
            <ProductModal open={open} product={selected} onClose={() => setOpen(false)} />
        </>
    );
}
