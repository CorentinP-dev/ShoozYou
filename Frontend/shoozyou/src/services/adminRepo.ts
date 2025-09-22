// src/services/adminRepo.ts
export type AdminUser = {
    id: string;
    name: string;
    email: string;
    role: "admin" | "seller" | "client";
    active: boolean;
};

const UKEY = "admin-users-v1";

function uid() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
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
