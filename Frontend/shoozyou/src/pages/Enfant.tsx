import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useProducts } from "../features/products/useProducts";
import ProductCard from "../components/products/ProductCard";
import Pagination from "../components/pagination/Pagination";
import ProductModal from "../components/products/ProductModal";
import type { Product } from "../services/productService";
import { ProductFilters } from "../components/products/ProductFilters";
import { useProductFilterParams } from "../features/products/useProductFilterParams";

const PAGE_SIZE = 20;

export default function Enfant() {
    const { filters, setFilters } = useProductFilterParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Math.max(1, Number(searchParams.get("page")) || 1);

    const { loading, list, meta } = useProducts({
        genderSlug: "enfant",
        limit: PAGE_SIZE,
        page,
        brandId: filters.brandId,
        shoeTypeId: filters.shoeTypeId,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        search: filters.search,
    });

    const [selected, setSelected] = useState<Product | null>(null);
    const [open, setOpen] = useState(false);
    const openModal = (p: Product) => { setSelected(p); setOpen(true); };

    const currentPage = meta?.page ?? page;
    const pageSize = meta?.limit ?? PAGE_SIZE;
    const totalItems = meta?.total ?? list.length;

    return (
        <div className="page">
            <h1>Enfant</h1>

            <ProductFilters value={filters} onChange={setFilters} />

            {loading ? (
                <div className="skeleton-grid">{Array.from({ length: 12 }).map((_, i) => <div className="skeleton-card" key={i} />)}</div>
            ) : (
                <>
                    <div className="product-grid">
                        {list.map(p => <ProductCard key={p.id} product={p} onClick={() => openModal(p)} />)}
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

            <ProductModal open={open} product={selected} onClose={() => setOpen(false)} />
        </div>
    );
}
