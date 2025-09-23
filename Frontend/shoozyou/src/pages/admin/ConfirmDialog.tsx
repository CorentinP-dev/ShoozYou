
type Props = {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    message: string;
};

export default function ConfirmDialog({ open, onClose, onConfirm, message }: Props) {
    if (!open) return null;
    return (
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
            <div className="modal-dialog" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" aria-label="Fermer" onClick={onClose}>×</button>
                <h3 style={{ marginTop: 0 }}>Confirmation</h3>
                <p>{message}</p>
                <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn" onClick={onClose}>Annuler</button>
                    <button className="btn-ghost-danger" onClick={onConfirm}>Supprimer</button>
                </div>
            </div>
        </div>
    );
}
