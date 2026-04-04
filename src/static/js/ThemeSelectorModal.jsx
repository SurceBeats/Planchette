import React, { useState } from "react";
import { THEMES, THEME_ORDER, useTheme } from "./themes.jsx";
import { t, useLanguageRefresh } from "./i18n.jsx";
import PlanchetteSvg from "./PlanchetteSvg.jsx";

const ROW1 = "ABCDEFG".split("");
const ROW2 = "HIJKLMN".split("");

function ThemePreviewCard({ themeData, isSelected, onPress }) {
  const c = themeData.colors;
  return (
    <button
      onClick={onPress}
      className="relative rounded-[14px] overflow-hidden cursor-pointer"
      style={{
        width: "47%",
        flexGrow: 1,
        aspectRatio: "0.85",
        borderWidth: "1.5px",
        borderStyle: "solid",
        borderColor: isSelected ? c.activeColor : c.boardBorder,
        backgroundColor: c.boardBg,
        boxShadow: isSelected ? `0 0 12px ${c.activeColor}66` : "none",
      }}
    >
      {/* Board gradient */}
      <div className="absolute inset-0" style={{ backgroundColor: c.boardGradient }} />

      {/* Board content */}
      <div className="relative flex flex-col items-center justify-center h-full pt-3 pb-6 gap-1">
        {/* Words row */}
        <div className="flex justify-between w-[70%] mb-1">
          <span className="font-serif text-[7px] tracking-wider" style={{ color: c.wordColor || c.letterColor }}>YES</span>
          <span className="font-serif text-[7px] tracking-wider" style={{ color: c.wordColor || c.letterColor }}>NO</span>
        </div>

        {/* Letter rows */}
        <div className="flex justify-center gap-[3px]">
          {ROW1.map((ch, i) => (
            <span key={ch} className="font-serif text-[10px]" style={{ color: i === 3 ? c.activeColor : c.letterColor }}>{ch}</span>
          ))}
        </div>
        <div className="flex justify-center gap-[3px]">
          {ROW2.map((ch) => (
            <span key={ch} className="font-serif text-[10px]" style={{ color: c.letterColor }}>{ch}</span>
          ))}
        </div>

        {/* Mini planchette */}
        <div className="mt-1.5 opacity-90">
          <PlanchetteSvg className="w-[18px] h-[20px]" wood1={c.wood[0]} wood2={c.wood[1]} wood3={c.wood[2]} wood4={c.wood[3]} wood5={c.wood[4]} crystal={c.crystal} />
        </div>
      </div>

      {/* Name overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center py-2">
        <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.55)" }} />
        <span className="relative font-serif text-[11px] tracking-[3px] uppercase" style={{ color: isSelected ? c.activeColor : c.letterColor }}>
          {t(themeData.name)}
        </span>
      </div>

      {/* Selected badge */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: c.activeColor }}>
          <span className="text-[11px] font-bold text-black">&#10003;</span>
        </div>
      )}
    </button>
  );
}

export default function ThemeSelectorModal({ onClose }) {
  const { themeId, setThemeId } = useTheme();
  const [closing, setClosing] = useState(false);

  useLanguageRefresh();

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
          {t("THEMES")}
        </h2>
        <p className="text-[11px] tracking-[2px] text-center mb-5" style={{ color: "rgba(253,230,138,0.3)" }}>
          {t("Choose your board style")}
        </p>

        {/* Theme grid */}
        <div className="flex flex-wrap gap-3 mb-6">
          {THEME_ORDER.map((id) => {
            const th = THEMES[id];
            return (
              <ThemePreviewCard
                key={id}
                themeData={th}
                isSelected={id === themeId}
                onPress={() => setThemeId(id)}
              />
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
          {t("Close")}
        </button>
      </div>
    </div>
  );
}
