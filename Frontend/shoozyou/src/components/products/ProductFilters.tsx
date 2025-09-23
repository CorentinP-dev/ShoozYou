import { useMemo } from "react";
import { useFilterOptions } from "../../features/products/useFilterOptions";

export type ProductFilterValue = {
  brandId?: string;
  shoeTypeId?: string;
  minPrice?: number;
  maxPrice?: number;
};

type Props = {
  value: ProductFilterValue;
  onChange: (value: ProductFilterValue) => void;
};

export const ProductFilters: React.FC<Props> = ({ value, onChange }) => {
  const { brands, shoeTypes, loading, error } = useFilterOptions();

  const hasActiveFilters = useMemo(() => {
    return Boolean(value.brandId || value.shoeTypeId || value.minPrice !== undefined || value.maxPrice !== undefined);
  }, [value.brandId, value.shoeTypeId, value.minPrice, value.maxPrice]);

  const update = (patch: Partial<ProductFilterValue>) => {
    onChange({ ...value, ...patch });
  };

  const handleReset = () => {
    onChange({});
  };

  return (
    <section className="product-filters" aria-label="Filtres produits">
      <div className="product-filters__row">
        <label className="field">
          <span>Marque</span>
          <select
            value={value.brandId ?? ""}
            onChange={(event) => update({ brandId: event.target.value || undefined })}
            disabled={loading || !!error}
          >
            <option value="">Toutes les marques</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Type</span>
          <select
            value={value.shoeTypeId ?? ""}
            onChange={(event) => update({ shoeTypeId: event.target.value || undefined })}
            disabled={loading || !!error}
          >
            <option value="">Tous les types</option>
            {shoeTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Prix min (€)</span>
          <input
            type="number"
            min={0}
            step={10}
            inputMode="decimal"
            value={value.minPrice !== undefined ? value.minPrice : ""}
            onChange={(event) => {
              const raw = event.target.value;
              update({ minPrice: raw ? Number(raw) : undefined });
            }}
          />
        </label>

        <label className="field">
          <span>Prix max (€)</span>
          <input
            type="number"
            min={0}
            step={10}
            inputMode="decimal"
            value={value.maxPrice !== undefined ? value.maxPrice : ""}
            onChange={(event) => {
              const raw = event.target.value;
              update({ maxPrice: raw ? Number(raw) : undefined });
            }}
          />
        </label>
      </div>

      <div className="product-filters__actions">
        {error && <span className="filters-error">{error}</span>}
        {hasActiveFilters && (
          <button type="button" className="btn" onClick={handleReset}>
            Réinitialiser
          </button>
        )}
      </div>
    </section>
  );
};
