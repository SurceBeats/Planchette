import React from "react";

export default function Footer({ onAbout, onDisclaimer }) {
  return (
    <footer className="mt-auto w-full border-t border-amber-900/20 py-3 px-4 space-y-1">
      <p className="text-[11px] text-amber-200/25 text-center flex flex-wrap items-center justify-center gap-x-1.5">
        <span>v1.0.24</span>
        <span>|</span>
        <button onClick={onAbout} className="hover:text-amber-200/50 transition-colors">
          About Planchette
        </button>
        <span>|</span>
        <button onClick={onDisclaimer} className="hover:text-amber-200/50 transition-colors">
          Disclaimer
        </button>
      </p>
      <p className="text-[10px] text-amber-200/15 text-center text-balance">
        Built with{" "}
        <a href="https://github.com/BansheeTech/vite_fusion" target="_blank" rel="noopener noreferrer" className="hover:text-amber-200/40 underline transition-colors">
          vite-fusion
        </a>
        , a pip package initially built to bridge Vite+Flask on{" "}
        <a href="https://github.com/BansheeTech/HomeDockOS" target="_blank" rel="noopener noreferrer" className="hover:text-amber-200/40 underline transition-colors">
          HomeDock OS
        </a>
      </p>
    </footer>
  );
}
