import React from "react";
import { t, useLanguageRefresh } from "./i18n.jsx";

export default function Footer({ onAbout, onDisclaimer }) {
  useLanguageRefresh();

  return (
    <footer className="mt-auto w-full border-t border-amber-900/20 py-3 px-4 space-y-2">
      <div className="flex justify-center">
        <a href="https://apps.apple.com/app/id6759858464" target="_blank" rel="noopener noreferrer">
          <img src="/__data__/appstore.png" alt="Download on the App Store" className="h-10 opacity-40 hover:opacity-70 transition-opacity" />
        </a>
      </div>
      <p className="text-[11px] text-amber-200/25 text-center flex flex-wrap items-center justify-center gap-x-1.5">
        <span>v1.2.106</span>
        <span>|</span>
        <button onClick={onAbout} className="hover:text-amber-200/50 transition-colors cursor-pointer">
          {t("About Planchette")}
        </button>
        <span>|</span>
        <button onClick={onDisclaimer} className="hover:text-amber-200/50 transition-colors cursor-pointer">
          {t("Disclaimer")}
        </button>
      </p>
      <p className="text-[10px] text-amber-200/15 text-center text-balance">
        {t("Built with")}{" "}
        <a href="https://github.com/BansheeTech/vite_fusion" target="_blank" rel="noopener noreferrer" className="hover:text-amber-200/40 underline transition-colors">
          vite-fusion
        </a>
        {t(", a pip package initially built to bridge Vite+Flask on")}{" "}
        <a href="https://github.com/BansheeTech/HomeDockOS" target="_blank" rel="noopener noreferrer" className="hover:text-amber-200/40 underline transition-colors">
          HomeDock OS
        </a>
      </p>
    </footer>
  );
}
