import React from "react";

type CartBadgeProps = { count?: number };
const CartBadge: React.FC<CartBadgeProps> = ({ count = 0 }) => (
    <span aria-label={`Articles dans le panier: ${count}`} style={{
        display: "inline-flex",
        minWidth: 20, height: 20,
        alignItems: "center", justifyContent: "center",
        borderRadius: 10, background: "var(--color-accent)", color: "#000",
        fontSize: 12, fontWeight: 700, padding: "0 6px", lineHeight: 1
    }}>
    {count}
  </span>
);
export default CartBadge;
