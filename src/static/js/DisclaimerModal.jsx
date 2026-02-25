import React, { useState } from "react";

export default function DisclaimerModal({ onClose }) {
  const [closing, setClosing] = useState(false);

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
        <h2 className="text-xl font-serif tracking-widest text-amber-200/80 uppercase text-center mb-6 shrink-0">Disclaimer</h2>

        <div className="space-y-4 text-sm text-amber-200/50 overflow-y-auto min-h-0">
          <p>
            This is <span className="text-amber-200/70 font-medium">not</span> a real spirit talking board. Planchette is an AI-powered simulation that uses a language model to generate responses.
          </p>

          <div className="border-t border-amber-900/20 pt-4">
            <p>All answers are artificially generated and do not come from any supernatural or spiritual source. The "spirit" responses are produced entirely by a machine learning model.</p>
          </div>

          <div className="border-t border-amber-900/20 pt-4">
            <p>Responses may feel meaningful or personal, but they are statistical patterns, not expressions of consciousness or emotion.</p>
          </div>

          <div className="border-t border-amber-900/20 pt-4">
            <p>
              This application is intended <span className="text-amber-200/70 font-medium">purely for entertainment purposes</span>. No claims of paranormal activity are made or implied.
            </p>
          </div>
        </div>

        <button onClick={handleClose} className="mt-6 w-full py-2 bg-amber-900/30 hover:bg-amber-900/50 border border-amber-900/30 rounded-lg text-amber-200/60 text-sm transition-colors shrink-0">
          Close
        </button>
      </div>
    </div>
  );
}
