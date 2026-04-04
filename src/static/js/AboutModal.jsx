import React, { useState } from "react";
import { t, useLanguageRefresh } from "./i18n.jsx";

export default function AboutModal({ onClose }) {
  const [closing, setClosing] = useState(false);

  useLanguageRefresh();

  const handleClose = () => setClosing(true);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm ${closing ? "modal-overlay-out" : "modal-overlay-in"}`}
      onClick={handleClose}
      onAnimationEnd={() => {
        if (closing) onClose();
      }}
    >
      <div className={`bg-neutral-900 border border-amber-900/40 rounded-2xl p-8 max-w-md mx-4 shadow-2xl flex flex-col max-h-[85vh] ${closing ? "modal-panel-out" : "modal-panel-in"}`} onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-serif tracking-widest text-amber-200/80 uppercase text-center mb-6 shrink-0">{t("About")}</h2>

        <div className="space-y-4 text-sm text-amber-200/50 overflow-y-auto min-h-0">
          <div>
            <p>{t("Planchette is an AI-powered talking board that uses a locally-running artificial intelligence language model to simulate spirit communication.")}</p>
            <p className="mt-1">
              <a href="https://github.com/SurceBeats/Planchette" target="_blank" rel="noopener noreferrer" className="text-amber-400/40 hover:text-amber-400/70 underline transition-colors">
                GitHub
              </a>{" "}
              <span className="text-amber-200/30">License: AGPLv3</span>
            </p>
          </div>

          <div className="border-t border-amber-900/20 pt-4">
            <p>
              Developed at{" "}
              <a href="https://www.banshee.pro" target="_blank" rel="noopener noreferrer" className="text-amber-400/40 hover:text-amber-400/70 underline transition-colors">
                Banshee Technologies S.L.
              </a>{" "}
              by{" "}
              <a href="https://github.com/SurceBeats/" target="_blank" rel="noopener noreferrer" className="text-amber-400/40 hover:text-amber-400/70 underline transition-colors">
                SurceBeats
              </a>
            </p>
          </div>

          <div className="border-t border-amber-900/20 pt-4">
            <h3 className="text-xs tracking-wider text-amber-200/30 uppercase mb-2">{t("AI Models / LLMs")}</h3>
            <p>
              <a href="https://huggingface.co/BansheeTechnologies/Ouija2-1.7B" target="_blank" rel="noopener noreferrer" className="text-amber-400/40 hover:text-amber-400/70 underline transition-colors">
                Ouija2-1.7B
              </a>
              <br />
              <span className="text-amber-200/30">License: Apache 2.0</span>
            </p>
          </div>

          <div className="border-t border-amber-900/20 pt-4">
            <h3 className="text-xs tracking-wider text-amber-200/30 uppercase mb-2">{t("Privacy")}</h3>
            <p>{t("All conversations are processed entirely on your device. No data is collected, stored, or transmitted to external servers.")}</p>
          </div>

          <div className="border-t border-amber-900/20 pt-4">
            <h3 className="text-xs tracking-wider text-amber-200/30 uppercase mb-2">{t("License")}</h3>
            <p>
              <a href="https://www.gnu.org/licenses/agpl-3.0.html" target="_blank" rel="noopener noreferrer" className="text-amber-400/40 hover:text-amber-400/70 underline transition-colors">
                AGPL-3.0
              </a>
            </p>
          </div>
        </div>

        <button onClick={handleClose} className="mt-6 w-full py-2 bg-amber-900/30 hover:bg-amber-900/50 border border-amber-900/30 rounded-lg text-amber-200/60 text-sm transition-colors shrink-0">
          {t("Close")}
        </button>
      </div>
    </div>
  );
}
