import { useEffect, useState } from "react";
import { fetchAllProducts } from "../../services/productService";
import type { Product } from "../../services/productService";

export function useProducts() {
    const [loading, setLoading] = useState(true);
    const [list, setList] = useState<Product[]>([]);
    const [error, setError] = useState<unknown>(null);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        fetchAllProducts()
            .then(items => { if (mounted) { setList(items); setLoading(false); } })
            .catch(e => { if (mounted) { setError(e); setLoading(false); } });
        return () => { mounted = false; };
    }, []);

    return { loading, list, error };
}
