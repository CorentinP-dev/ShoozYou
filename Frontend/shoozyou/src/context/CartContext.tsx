import { createContext, useContext, useEffect, useMemo, useReducer } from "react";

export type CartItem = {
    id: string;
    name: string;
    price: number;
    image?: string;
    size?: number | string;
    quantity: number;
};

type CartState = { items: CartItem[] };

type Action =
    | { type: "ADD"; payload: CartItem }
    | { type: "QTY"; payload: { id: string; size?: number | string; quantity: number } }
    | { type: "RM"; payload: { id: string; size?: number | string } }
    | { type: "CLEAR" };

const STORAGE_KEY = "cart-v1";

const reducer = (state: CartState, action: Action): CartState => {
    switch (action.type) {
        case "ADD": {
            const key = (i: CartItem) => `${i.id}__${i.size ?? ""}`;
            const exists = state.items.find(i => key(i) === key(action.payload));
            const items = exists
                ? state.items.map(i => key(i) === key(action.payload) ? { ...i, quantity: i.quantity + action.payload.quantity } : i)
                : [...state.items, action.payload];
            return { items };
        }
        case "QTY": {
            const { id, size, quantity } = action.payload;
            const items = state.items
                .map(i => (i.id === id && i.size === size) ? { ...i, quantity } : i)
                .filter(i => i.quantity > 0);
            return { items };
        }
        case "RM": {
            const { id, size } = action.payload;
            return { items: state.items.filter(i => !(i.id === id && i.size === size)) };
        }
        case "CLEAR":
            return { items: [] };
        default:
            return state;
    }
};

type Ctx = {
    items: CartItem[];
    count: number;
    subtotal: number;
    add: (item: CartItem) => void;
    setQty: (id: string, size: CartItem["size"], qty: number) => void;
    remove: (id: string, size: CartItem["size"]) => void;
    clear: () => void;
};

const CartContext = createContext<Ctx | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, undefined, () => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? (JSON.parse(raw) as CartState) : { items: [] };
        } catch { return { items: [] }; }
    });

    useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }, [state]);

    const value = useMemo<Ctx>(() => {
        const count = state.items.reduce((n, i) => n + i.quantity, 0);
        const subtotal = state.items.reduce((s, i) => s + i.price * i.quantity, 0);
        return {
            items: state.items,
            count,
            subtotal,
            add: (item) => dispatch({ type: "ADD", payload: item }),
            setQty: (id, size, quantity) => dispatch({ type: "QTY", payload: { id, size, quantity } }),
            remove: (id, size) => dispatch({ type: "RM", payload: { id, size } }),
            clear: () => dispatch({ type: "CLEAR" }),
        };
    }, [state]);

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within CartProvider");
    return ctx;
};
