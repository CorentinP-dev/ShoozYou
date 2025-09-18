import React from "react";

export const CartIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M7 4h-2l-1 2m0 0 3 9h10l3-7H6M4 6h16"
              stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="9.5" cy="20" r="1.5" fill="#fff"/>
        <circle cx="16.5" cy="20" r="1.5" fill="#fff"/>
    </svg>
);

export const UserIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5Z" fill="#fff"/>
    </svg>
);
