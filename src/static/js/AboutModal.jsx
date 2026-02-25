import React, { useState } from "react";

export default function AboutModal({ onClose }) {
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
        <h2 className="text-xl font-serif tracking-widest text-amber-200/80 uppercase text-center mb-6 shrink-0">About</h2>

        <div className="space-y-4 text-sm text-amber-200/50 overflow-y-auto min-h-0">
          <p>
            <span className="text-amber-200/70 font-medium">Planchette</span> is an AI-powered talking board that uses a locally-running language model to simulate spirit communication.
          </p>

          <div className="border-t border-amber-900/20 pt-4">
            <p className="text-amber-200/60">
              Developed by{" "}
              <a href="https://github.com/SurceBeats/" target="_blank" rel="noopener noreferrer" className="text-amber-300/70 hover:text-amber-300 underline transition-colors">
                SurceBeats
              </a>
            </p>
          </div>

          <div className="border-t border-amber-900/20 pt-4">
            <h3 className="text-xs tracking-wider text-amber-200/30 uppercase mb-2">AI Model / LLM</h3>
            <p>
              <a href="https://huggingface.co/BansheeTechnologies/Ouija-3B" target="_blank" rel="noopener noreferrer" className="text-amber-400/40 hover:text-amber-400/70 underline transition-colors">
                Ouija-3B
              </a>
            </p>
          </div>

          <div className="border-t border-amber-900/20 pt-4">
            <h3 className="text-xs tracking-wider text-amber-200/30 uppercase mb-2">Audio</h3>
            <p>
              <span className="text-amber-300/60">Bus Ride</span> by <span className="text-amber-300/60">ElevatorFan2020</span>
              <br />
              <a href="https://freesound.org/s/846035/" target="_blank" rel="noopener noreferrer" className="text-amber-400/40 hover:text-amber-400/70 underline transition-colors">
                freesound.org/s/846035
              </a>
              <br />
              <span className="text-amber-200/30">License: Creative Commons 0</span>
            </p>
            <p className="mt-2">
              <span className="text-amber-300/60">Fence Opening</span> by <span className="text-amber-300/60">Robo9418</span>
              <br />
              <a href="https://freesound.org/s/841832/" target="_blank" rel="noopener noreferrer" className="text-amber-400/40 hover:text-amber-400/70 underline transition-colors">
                freesound.org/s/841832
              </a>
              <br />
              <span className="text-amber-200/30">License: Creative Commons 0</span>
            </p>
            <p className="mt-2">
              <span className="text-amber-300/60">11605 resonating ghost fly.wav</span> by <span className="text-amber-300/60">Robinhood76</span>
              <br />
              <a href="https://freesound.org/s/704427/" target="_blank" rel="noopener noreferrer" className="text-amber-400/40 hover:text-amber-400/70 underline transition-colors">
                freesound.org/s/704427
              </a>
              <br />
              <span className="text-amber-200/30">License: Attribution NonCommercial 4.0</span>
            </p>
          </div>

          <div className="border-t border-amber-900/20 pt-4">
            <h3 className="text-xs tracking-wider text-amber-200/30 uppercase mb-2">License</h3>
            <p>
              <a href="https://www.gnu.org/licenses/agpl-3.0.html" target="_blank" rel="noopener noreferrer" className="text-amber-400/40 hover:text-amber-400/70 underline transition-colors">
                AGPL-3.0
              </a>
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
