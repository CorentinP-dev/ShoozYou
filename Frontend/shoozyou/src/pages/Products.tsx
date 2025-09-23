import { Link, useSearchParams } from "react-router-dom";
import { useProducts } from "../features/products/useProducts";
import ProductCard from "../components/products/ProductCard";
import Pagination from "../components/pagination/Pagination";
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
        search: filters.search,
    });

    const currentPage = meta?.page ?? page;
    const pageSize = meta?.limit ?? PAGE_SIZE;
    const totalItems = meta?.total ?? list.length;

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

                <ProductFilters value={filters} onChange={setFilters} />

                {loading ? (
                    <div className="skeleton-grid">
                        {Array.from({ length: 8 }).map((_, i) => <div className="skeleton-card" key={i} />)}
                    </div>
                ) : (
                    <>
                        <div className="product-grid">
                            {list.map(p => <ProductCard key={p.id} product={p} />)}
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
        </div>
    );
}
