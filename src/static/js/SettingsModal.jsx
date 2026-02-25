import React, { useState, useEffect } from "react";

export default function SettingsModal({ onClose }) {
  const [closing, setClosing] = useState(false);
  const [username, setUsername] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    fetch("/api/account/me")
      .then((r) => r.json())
      .then((d) => setUsername(d.username))
      .catch(() => {});
  }, []);

  const handleClose = () => setClosing(true);

  const wantsUsername = newUsername.trim() !== "";
  const wantsPassword = currentPw !== "" || newPw !== "" || confirmPw !== "";
  const canSave = wantsUsername || wantsPassword;

  const handleSave = async () => {
    setMsg(null);
    setSaving(true);

    try {
      const r = await fetch("/api/account/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newUsername.trim(),
          current_password: currentPw,
          new_password: newPw,
          confirm_password: confirmPw,
        }),
      });
      const d = await r.json();
      if (d.ok) {
        window.location.href = "/logout";
        return;
      }
      setMsg({ type: "error", text: d.error });
    } catch {
      setMsg({ type: "error", text: "Request failed." });
    }
    setSaving(false);
  };

  const handleLogout = () => {
    window.location.href = "/logout";
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm ${closing ? "modal-overlay-out" : "modal-overlay-in"}`}
      onClick={handleClose}
      onAnimationEnd={() => {
        if (closing) onClose();
      }}
    >
      <div className={`bg-neutral-900 border border-amber-900/40 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto ${closing ? "modal-panel-out" : "modal-panel-in"}`} onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-serif tracking-widest text-amber-200/80 uppercase text-center mb-6">Settings</h2>

        <p className="text-sm text-amber-200/40 text-center mb-6">
          Logged in as <span className="text-amber-200/70">{username}</span>
        </p>

        <div className="space-y-3 mb-6">
          <h3 className="text-xs tracking-wider text-amber-200/30 uppercase">Change Username</h3>
          <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="New username" className="w-full text-sm py-2 px-3 bg-neutral-800 border border-amber-900/30 rounded-lg text-amber-100 placeholder-amber-200/20 outline-none focus:border-amber-700/60 transition-colors" />
        </div>

        <div className="border-t border-amber-900/20 mb-6" />

        <div className="space-y-3 mb-6">
          <h3 className="text-xs tracking-wider text-amber-200/30 uppercase">Change Password</h3>
          <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="Current password" className="w-full text-sm py-2 px-3 bg-neutral-800 border border-amber-900/30 rounded-lg text-amber-100 placeholder-amber-200/20 outline-none focus:border-amber-700/60 transition-colors" />
          <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="New password" className="w-full text-sm py-2 px-3 bg-neutral-800 border border-amber-900/30 rounded-lg text-amber-100 placeholder-amber-200/20 outline-none focus:border-amber-700/60 transition-colors" />
          <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="Confirm new password" className="w-full text-sm py-2 px-3 bg-neutral-800 border border-amber-900/30 rounded-lg text-amber-100 placeholder-amber-200/20 outline-none focus:border-amber-700/60 transition-colors" />
        </div>

        {msg && <p className={`text-xs mb-4 ${msg.type === "success" ? "text-green-400/70" : "text-red-400/70"}`}>{msg.text}</p>}

        <button onClick={handleSave} disabled={!canSave || saving} className="w-full py-2 bg-amber-900/30 hover:bg-amber-900/50 border border-amber-900/30 rounded-lg text-amber-200/60 text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
          {saving ? "Saving…" : "Save Changes"}
        </button>

        <div className="border-t border-amber-900/20 my-6" />

        <button onClick={handleLogout} className="w-full py-2 bg-red-900/30 hover:bg-red-900/50 border border-red-900/30 rounded-lg text-red-200/60 text-sm transition-colors">
          Log Out
        </button>

        <button onClick={handleClose} className="mt-4 w-full py-2 bg-amber-900/30 hover:bg-amber-900/50 border border-amber-900/30 rounded-lg text-amber-200/60 text-sm transition-colors">
          Close
        </button>
      </div>
    </div>
  );
}
