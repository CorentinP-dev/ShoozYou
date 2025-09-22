import React from "react";

type LogoProps = { condensed?: boolean };

const Logo: React.FC<LogoProps> = ({ condensed = false }) => {
    const h = condensed ? 32 : 40;
    const src = "/logo_shoozyou.png"; // image dans /public

    return (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img
                src={src}
                alt="ShoozYou"
                height={h}
                style={{ height: h, width: "auto", display: "block", borderRadius: "50%" }}
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
            <span style={{ fontWeight: 800, letterSpacing: ".3px", fontSize: condensed ? 18 : 20, color: "#fff" }}>
        SHOOZ<span style={{ color: "var(--color-accent)" }}>YOU</span>
      </span>
        </div>
    );
};
export default Logo;
