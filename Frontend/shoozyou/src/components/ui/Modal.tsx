import React, { useEffect } from "react";
import { createPortal } from "react-dom";

type Props = {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    width?: number;
};

export default function Modal({ open, onClose, children, width = 880 }: Props) {
    useEffect(() => {
        if (!open) return;
        const orig = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = orig; };
    }, [open]);

    if (!open) return null;

    return createPortal(
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
            <div
                className="modal-dialog"
                style={{ maxWidth: width }}
                onClick={(e) => e.stopPropagation()}
            >
                <button className="modal-close" aria-label="Fermer" onClick={onClose}>×</button>
                {children}
            </div>
        </div>,
        document.body
    );
}
