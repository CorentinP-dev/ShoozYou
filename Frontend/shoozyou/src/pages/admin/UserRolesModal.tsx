import React, { useEffect, useState } from "react";
import Modal from "../../components/ui/Modal";

// 👉 imports runtime (fonctions)
import { listUsers, toggleUserActive, updateUserRole } from "../../services/adminRepo";
// 👉 import de type (compile-time uniquement)
import type { AdminUser } from "../../services/adminRepo";

export default function UserRolesModal({
                                           open,
                                           onClose,
                                       }: {
    open: boolean;
    onClose: () => void;
}) {
    const [users, setUsers] = useState<AdminUser[]>([]);

    useEffect(() => {
        if (open) setUsers(listUsers());
    }, [open]);

    const setRole = (id: string, role: AdminUser["role"]) => {
        updateUserRole(id, role);
        setUsers(listUsers());
    };

    const setActive = (id: string, active: boolean) => {
        toggleUserActive(id, active);
        setUsers(listUsers());
    };

    if (!open) return null;

    return (
        <Modal open={open} onClose={onClose} width={780}>
            <h2 style={{ marginTop: 0 }}>Gestion des vendeurs & rôles</h2>
            <div className="table-responsive">
                <table className="table">
                    <thead>
                    <tr>
                        <th>Utilisateur</th>
                        <th>Email</th>
                        <th>Rôle</th>
                        <th>Actif</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map((u) => (
                        <tr key={u.id}>
                            <td>{u.name}</td>
                            <td>{u.email}</td>
                            <td>
                                <select
                                    value={u.role}
                                    onChange={(e) => setRole(u.id, e.target.value as AdminUser["role"])}
                                >
                                    <option value="client">Client</option>
                                    <option value="seller">Vendeur</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </td>
                            <td>
                                <label style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                                    <input
                                        type="checkbox"
                                        checked={u.active}
                                        onChange={(e) => setActive(u.id, e.target.checked)}
                                    />
                                    <span>{u.active ? "Actif" : "Inactif"}</span>
                                </label>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: 10 }}>
                <button className="btn" onClick={onClose}>
                    Fermer
                </button>
            </div>
        </Modal>
    );
}
