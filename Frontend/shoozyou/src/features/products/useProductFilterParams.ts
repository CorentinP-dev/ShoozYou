import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { ProductFilterValue } from "../../components/products/ProductFilters";

const parseNumberParam = (value: string | null): number | undefined => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const useProductFilterParams = () => {
  const [params, setParams] = useSearchParams();

  const filters = useMemo<ProductFilterValue>(() => {
    return {
      brandId: params.get("brand") || undefined,
      shoeTypeId: params.get("type") || undefined,
      minPrice: parseNumberParam(params.get("minPrice")),
      maxPrice: parseNumberParam(params.get("maxPrice")),
    };
  }, [params]);

  const setFilters = useCallback(
    (next: ProductFilterValue) => {
      const updated = new URLSearchParams(params);

      const applyParam = (key: string, value: string | undefined) => {
        if (!value) {
          updated.delete(key);
        } else {
          updated.set(key, value);
        }
      };

      applyParam("brand", next.brandId);
      applyParam("type", next.shoeTypeId);
      applyParam("minPrice", next.minPrice !== undefined ? String(next.minPrice) : undefined);
      applyParam("maxPrice", next.maxPrice !== undefined ? String(next.maxPrice) : undefined);

      // reset pagination when filters change
      updated.delete("page");

      setParams(updated, { replace: true });
    },
    [params, setParams]
  );

  return { filters, setFilters };
};
