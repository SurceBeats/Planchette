import React, { useState } from "react";
import { THEMES, THEME_ORDER, useTheme } from "./themes.jsx";

export default function ThemeSelectorModal({ onClose }) {
  const { themeId, setThemeId } = useTheme();
  const [closing, setClosing] = useState(false);

  const handleClose = () => setClosing(true);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${closing ? "modal-overlay-out" : "modal-overlay-in"}`}
      style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
      onClick={handleClose}
      onAnimationEnd={() => {
        if (closing) onClose();
      }}
    >
      <div className={`relative w-full max-w-[360px] max-h-[85vh] overflow-y-auto rounded-2xl mx-4 ${closing ? "modal-panel-out" : "modal-panel-in"}`} style={{ backgroundColor: "#1a1a1a", borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(120,75,20,0.3)", padding: 24 }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <h2 className="text-lg font-serif tracking-[4px] text-center mb-1" style={{ color: "rgba(253,230,138,0.8)" }}>
          THEMES
        </h2>
        <p className="text-[11px] tracking-[2px] text-center mb-5" style={{ color: "rgba(253,230,138,0.3)" }}>
          Choose your board style
        </p>

        {/* Theme grid */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {THEME_ORDER.map((id) => {
            const t = THEMES[id];
            const selected = id === themeId;
            return (
              <button
                key={id}
                onClick={() => setThemeId(id)}
                className="relative rounded-xl cursor-pointer"
                style={{
                  width: 140,
                  padding: 10,
                  borderWidth: "1px",
                  borderStyle: "solid",
                  borderColor: selected ? "#f59e0b" : "rgba(120,75,20,0.15)",
                  backgroundColor: selected ? "rgba(120,53,15,0.15)" : "rgba(0,0,0,0.3)",
                }}
              >
                {/* Checkmark */}
                {selected && (
                  <span className="absolute z-10" style={{ top: 6, right: 8, fontSize: 12, color: "#fbbf24" }}>
                    &#10003;
                  </span>
                )}
                {/* Board preview */}
                <div className="relative mx-auto overflow-hidden rounded-lg flex flex-col items-center justify-center" style={{ width: 120, height: 70, borderWidth: "1px", borderStyle: "solid", borderColor: t.colors.boardBorder, backgroundColor: t.colors.boardBg, marginBottom: 8 }}>
                  <div className="absolute inset-0" style={{ backgroundColor: t.colors.boardGradient }} />
                  {/* Sample letters */}
                  <div className="relative flex items-center justify-center gap-1.5">
                    <span className="font-serif text-sm" style={{ color: t.colors.letterColor }}>
                      A
                    </span>
                    <span className="font-serif text-sm" style={{ color: t.colors.activeColor }}>
                      B
                    </span>
                    <span className="font-serif text-sm" style={{ color: t.colors.letterColor }}>
                      C
                    </span>
                  </div>
                  {/* Planchette oval */}
                  <div className="relative" style={{ width: 12, height: 14, borderRadius: 6, borderWidth: "1px", borderStyle: "solid", borderColor: t.colors.crystal, backgroundColor: t.colors.wood[0], opacity: 0.8, marginTop: 6 }} />
                </div>
                {/* Theme name */}
                <p className="text-xs font-serif tracking-[2px] text-center" style={{ color: selected ? "#fcd34d" : "rgba(253,230,138,0.5)" }}>
                  {t.name}
                </p>
              </button>
            );
          })}
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="w-full py-2.5 rounded-xl text-[13px] text-center cursor-pointer transition-colors"
          style={{
            backgroundColor: "rgba(120,53,15,0.3)",
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: "rgba(120,75,20,0.25)",
            color: "rgba(253,230,138,0.5)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(120,53,15,0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(120,53,15,0.3)";
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
