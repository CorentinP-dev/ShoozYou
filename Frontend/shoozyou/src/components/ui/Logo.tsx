import React from "react";

type LogoProps = { condensed?: boolean };
const Logo: React.FC<LogoProps> = ({ condensed = false }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <span
        style={{
            fontFamily: "var(--font-brand)",
            fontWeight: 700,
            letterSpacing: ".5px",
            fontSize: condensed ? "18px" : "20px",
            color: "#fff",
        }}
        aria-label="SHOOZYOU"
    >
      SHOOZ<span style={{ color: "var(--color-accent)" }}>YOU</span>
    </span>
    </div>
);
export default Logo;
