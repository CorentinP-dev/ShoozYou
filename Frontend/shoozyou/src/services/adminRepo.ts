// src/services/adminRepo.ts
export type AdminCategory = "Homme" | "Femme" | "Enfant";
export type AdminSizeStock = { size: number; stock: number };
export type AdminProduct = {
    id: string;
    name: string;
    category: AdminCategory;
    price: number;
    sizes: AdminSizeStock[];
    image?: string;
};
export type AdminUser = {
    id: string;
    name: string;
    email: string;
    role: "admin" | "seller" | "client";
    active: boolean;
};

const PKEY = "admin-products-v1";
const UKEY = "admin-users-v1";

function uid() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/* ---------- PRODUITS ---------- */
export function loadProducts(): AdminProduct[] {
    try {
        const raw = localStorage.getItem(PKEY);
        if (raw) return JSON.parse(raw) as AdminProduct[];
    } catch {}
    const seed: AdminProduct[] = [
        { id: uid(), name: "Adventure Kids", category: "Enfant", price: 69.99, sizes: [ {size:30,stock:12},{size:31,stock:10},{size:32,stock:8} ] },
        { id: uid(), name: "Adventure Kids Blanc Cuir", category: "Enfant", price: 85.11, sizes: [ {size:29,stock:6},{size:30,stock:11},{size:31,stock:12} ] },
        { id: uid(), name: "Urban Runner", category: "Femme", price: 89.99, sizes: [ {size:37,stock:8},{size:38,stock:11},{size:39,stock:7} ] },
        { id: uid(), name: "Air Max Classic", category: "Homme", price: 129.99, sizes: [ {size:41,stock:12},{size:42,stock:9},{size:43,stock:7} ] },
    ];
    localStorage.setItem(PKEY, JSON.stringify(seed));
    return seed;
}
export function saveProducts(list: AdminProduct[]) { localStorage.setItem(PKEY, JSON.stringify(list)); }
export function listProducts(): AdminProduct[] { return loadProducts(); }
export function createProduct(p: Omit<AdminProduct, "id">): AdminProduct {
    const list = loadProducts(); const np: AdminProduct = { ...p, id: uid() };
    list.unshift(np); saveProducts(list); return np;
}
export function updateProduct(id: string, patch: Partial<AdminProduct>): AdminProduct {
    const list = loadProducts(); const idx = list.findIndex(p => p.id === id);
    if (idx === -1) throw new Error("Produit introuvable");
    list[idx] = { ...list[idx], ...patch, id }; saveProducts(list); return list[idx];
}
export function removeProduct(id: string) {
    saveProducts(loadProducts().filter(p => p.id !== id));
}

/* ---------- UTILISATEURS ---------- */
export function loadUsers(): AdminUser[] {
    try {
        const raw = localStorage.getItem(UKEY);
        if (raw) return JSON.parse(raw) as AdminUser[];
    } catch {}
    const users: AdminUser[] = [
        { id: uid(), name: "Admin SHOOZYOU", email: "admin@shoozyou.com", role: "admin", active: true },
        { id: uid(), name: "Sophie Vendeur", email: "sophie@shoozyou.com", role: "seller", active: true },
        { id: uid(), name: "Marc Vendeur", email: "marc@shoozyou.com", role: "seller", active: true },
        { id: uid(), name: "Camille Client", email: "camille@client.com", role: "client", active: true },
    ];
    localStorage.setItem(UKEY, JSON.stringify(users));
    return users;
}
export function saveUsers(list: AdminUser[]) { localStorage.setItem(UKEY, JSON.stringify(list)); }
export function listUsers(): AdminUser[] { return loadUsers(); }
export function updateUserRole(id: string, role: AdminUser["role"]) {
    const list = loadUsers(); const i = list.findIndex(u => u.id === id);
    if (i === -1) throw new Error("Utilisateur introuvable");
    list[i] = { ...list[i], role }; saveUsers(list); return list[i];
}
export function toggleUserActive(id: string, active: boolean) {
    const list = loadUsers(); const i = list.findIndex(u => u.id === id);
    if (i === -1) throw new Error("Utilisateur introuvable");
    list[i] = { ...list[i], active }; saveUsers(list); return list[i];
}
