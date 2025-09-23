import { useEffect, useState } from "react";
import {
    fetchProducts,
    type FetchProductsOptions,
    type Product,
    type ProductsMeta
} from "../../services/productService";

type UseProductsOptions = FetchProductsOptions & {
    fetchAll?: boolean;
};

type UseProductsResult = {
    loading: boolean;
    list: Product[];
    error: unknown;
    meta: ProductsMeta | null;
};

const defaultMeta: ProductsMeta = {
    total: 0,
    page: 1,
    limit: 0,
    pages: 1,
};

export function useProducts(options: UseProductsOptions = {}): UseProductsResult {
    const [loading, setLoading] = useState(true);
    const [list, setList] = useState<Product[]>([]);
    const [error, setError] = useState<unknown>(null);
    const [meta, setMeta] = useState<ProductsMeta | null>(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                setLoading(true);
                setError(null);

                if (options.fetchAll) {
                    let currentPage = options.page ?? 1;
                    const aggregated: Product[] = [];
                    let lastMeta: ProductsMeta | null = null;

                    while (true) {
                        const result = await fetchProducts({ ...options, page: currentPage });
                        aggregated.push(...result.items);
                        lastMeta = result.meta;

                        if (currentPage >= result.meta.pages) {
                            break;
                        }
                        currentPage += 1;
                    }

                    if (!cancelled) {
                        setList(aggregated);
                        setMeta(lastMeta ?? defaultMeta);
                    }
                } else {
                    const result = await fetchProducts(options);
                    if (!cancelled) {
                        setList(result.items);
                        setMeta(result.meta);
                    }
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [JSON.stringify(options)]);

    return { loading, list, error, meta };
}
