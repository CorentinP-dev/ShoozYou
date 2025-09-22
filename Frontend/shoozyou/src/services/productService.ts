export const CATEGORIES = ["homme", "femme", "enfant"] as const;
export type Category = typeof CATEGORIES[number];

export type Product = {
    id: string;
    name: string;
    category: Category;
    price: number;   // EUR
    image?: string;  // URL ou chemin local
};

/** MOCK: 84 produits de démo. Tu brancheras une vraie API plus tard. */
export async function fetchAllProducts(): Promise<Product[]> {
    const total = 84;
    const items: Product[] = Array.from({ length: total }, (_, i) => {
        const n = i + 1;
        const cat = CATEGORIES[i % CATEGORIES.length];
        return {
            id: `P${n}`,
            name: `Sneaker ${n}`,
            category: cat,
            price: 79.99 + (i % 9) * 10,
            image: undefined, // ajoute une URL si tu as des images produits
        };
    });
    await new Promise(r => setTimeout(r, 120)); // petit délai simulé
    return items;
}
