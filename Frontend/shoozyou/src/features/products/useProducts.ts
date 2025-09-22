import { useEffect, useState } from "react";
import { fetchAllProducts, type FetchProductsOptions, type Product } from "../../services/productService";

export function useProducts(options: FetchProductsOptions = {}) {
    const [loading, setLoading] = useState(true);
    const [list, setList] = useState<Product[]>([]);
    const [error, setError] = useState<unknown>(null);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        setError(null);
        fetchAllProducts(options)
            .then(items => { if (mounted) { setList(items); setLoading(false); } })
            .catch(e => { if (mounted) { setError(e); setLoading(false); } });
        return () => { mounted = false; };
    }, [JSON.stringify(options)]);

    return { loading, list, error };
}
