import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useProducts } from "../features/products/useProducts";
import ProductCard from "../components/products/ProductCard";
import Pagination from "../components/pagination/Pagination";
import ProductModal from "../components/products/ProductModal";
import type { Product } from "../services/productService";

const PAGE_SIZE = 20;
const paginate = <T,>(arr: T[], page: number, size: number) => arr.slice((page - 1) * size, (page - 1) * size + size);

export default function Enfant() {
    const { loading, list } = useProducts({ genderSlug: "enfant" });
    const [search, setSearch] = useSearchParams();
    const page = Math.max(1, Number(search.get("page")) || 1);

    // Quick view
    const [selected, setSelected] = useState<Product | null>(null);
    const [open, setOpen] = useState(false);
    const openModal = (p: Product) => { setSelected(p); setOpen(true); };

    const pageItems = useMemo(() => paginate(list, page, PAGE_SIZE), [list, page]);

    return (
        <div className="page">
            <h1>Enfant</h1>

            {loading ? (
                <div className="skeleton-grid">{Array.from({ length: 12 }).map((_, i) => <div className="skeleton-card" key={i} />)}</div>
            ) : (
                <>
                    <div className="product-grid">
                        {pageItems.map(p => <ProductCard key={p.id} product={p} onClick={() => openModal(p)} />)}
                    </div>

                    <Pagination
                        page={page}
                        pageSize={PAGE_SIZE}
                        total={list.length}
                        onPageChange={(p) => setSearch({ page: String(p) }, { replace: true })}
                    />
                </>
            )}

            <ProductModal open={open} product={selected} onClose={() => setOpen(false)} />
        </div>
    );
}
