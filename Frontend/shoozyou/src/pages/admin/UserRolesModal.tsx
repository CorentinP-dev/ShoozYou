import { useEffect, useState } from "react";
import Modal from "../../components/ui/Modal";
import {
    fetchAdminUsers,
    updateAdminUserRole,
    updateAdminUserStatus,
    type AdminUserDto
} from "../../services/adminUserApi";

export default function UserRolesModal({
                                           open,
                                           onClose,
                                       }: {
    open: boolean;
    onClose: () => void;
}) {
    const [users, setUsers] = useState<AdminUserDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [savingId, setSavingId] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        if (!open) {
            return;
        }

        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchAdminUsers();
                if (!cancelled) {
                    setUsers(data);
                }
            } catch (err) {
                if (!cancelled) {
                    const message = err instanceof Error ? err.message : "Impossible de charger les utilisateurs";
                    setError(message);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        load();
        return () => { cancelled = true; };
    }, [open]);

    const setRole = async (id: string, role: AdminUserDto["role"]) => {
        setSavingId(id);
        try {
            const updated = await updateAdminUserRole(id, role);
            setUsers(prev => prev.map(u => (u.id === updated.id ? updated : u)));
        } catch (err) {
            alert(err instanceof Error ? err.message : "Impossible de mettre à jour le rôle");
        } finally {
            setSavingId(null);
        }
    };

    const setActive = async (id: string, active: boolean) => {
        setSavingId(id);
        try {
            const updated = await updateAdminUserStatus(id, active);
            setUsers(prev => prev.map(u => (u.id === updated.id ? updated : u)));
        } catch (err) {
            alert(err instanceof Error ? err.message : "Impossible de mettre à jour le statut");
        } finally {
            setSavingId(null);
        }
    };

    if (!open) return null;

    return (
        <Modal open={open} onClose={onClose} width={780}>
            <h2 style={{ marginTop: 0 }}>Gestion des vendeurs & rôles</h2>
            {loading ? (
                <div>Chargement…</div>
            ) : error ? (
                <div style={{ color: "#dc2626", marginBottom: 12 }}>{error}</div>
            ) : (
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
                                <td>{u.name || u.email}</td>
                                <td>{u.email}</td>
                                <td>
                                    <select
                                        value={u.role}
                                        onChange={(e) => setRole(u.id, e.target.value as AdminUserDto["role"])}
                                        disabled={savingId === u.id}
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
                                            disabled={savingId === u.id}
                                        />
                                        <span>{u.active ? "Actif" : "Inactif"}</span>
                                    </label>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div style={{ marginTop: 10 }}>
                <button className="btn" onClick={onClose}>
                    Fermer
                </button>
            </div>
        </Modal>
    );
}
