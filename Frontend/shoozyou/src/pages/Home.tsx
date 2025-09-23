import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useProducts } from "../features/products/useProducts";
import ProductCard from "../components/products/ProductCard";
import Pagination from "../components/pagination/Pagination";
import ProductModal from "../components/products/ProductModal";
import type { Product } from "../services/productService";
import { ProductFilters } from "../components/products/ProductFilters";
import { useProductFilterParams } from "../features/products/useProductFilterParams";

const PAGE_SIZE = 20;

export default function Home() {
    const { filters, setFilters } = useProductFilterParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Math.max(1, Number(searchParams.get("page")) || 1);

    const { loading, list, meta } = useProducts({
        limit: PAGE_SIZE,
        page,
        brandId: filters.brandId,
        shoeTypeId: filters.shoeTypeId,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
    });

    // --- Quick View modal ---
    const [selected, setSelected] = useState<Product | null>(null);
    const [open, setOpen] = useState(false);
    const openModal = (p: Product) => {
        setSelected(p);
        setOpen(true);
    };

    const currentPage = meta?.page ?? page;
    const pageSize = meta?.limit ?? PAGE_SIZE;
    const totalItems = meta?.total ?? list.length;

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

                <ProductFilters value={filters} onChange={setFilters} />

                {loading ? (
                    <div className="skeleton-grid">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="skeleton-card" />
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="product-grid">
                            {list.map((p) => (
                                <ProductCard key={p.id} product={p} onClick={() => openModal(p)} />
                            ))}
                        </div>

                        <Pagination
                            page={currentPage}
                            pageSize={pageSize}
                            total={totalItems}
                            onPageChange={(nextPage) => {
                                const next = new URLSearchParams(searchParams);
                                next.set("page", String(nextPage));
                                setSearchParams(next, { replace: true });
                            }}
                        />
                    </>
                )}
            </section>

            {/* Modal Quick View */}
            <ProductModal open={open} product={selected} onClose={() => setOpen(false)} />
        </>
    );
}
