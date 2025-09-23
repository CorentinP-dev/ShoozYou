import { useEffect, useState } from "react";
import { fetchBrands, fetchShoeTypes, type BrandDto, type ShoeTypeDto } from "../../services/referenceApi";

export interface FilterOptionsState {
  brands: BrandDto[];
  shoeTypes: ShoeTypeDto[];
  loading: boolean;
  error: string | null;
}

export const useFilterOptions = (): FilterOptionsState => {
  const [brands, setBrands] = useState<BrandDto[]>([]);
  const [shoeTypes, setShoeTypes] = useState<ShoeTypeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [brandList, shoeTypeList] = await Promise.all([fetchBrands(), fetchShoeTypes()]);
        if (cancelled) return;
        setBrands(brandList);
        setShoeTypes(shoeTypeList);
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Impossible de charger les filtres";
        setError(message);
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
  }, []);

  return { brands, shoeTypes, loading, error };
};
