
type CartBadgeProps = { count?: number };

const CartBadge: React.FC<CartBadgeProps> = ({ count = 0 }) => {
    if (!count) return null;
    const label = `${count} article${count > 1 ? "s" : ""}`;
    return (
        <span
            className="badge-count"
            aria-label={`Articles dans le panier : ${label}`}
        >
            {count}
        </span>
    );
};

export default CartBadge;
