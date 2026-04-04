import React, { useState, useEffect } from "react";
import { t, ti, useLanguageRefresh, setLanguage, getLanguage, LANGUAGES } from "./i18n.jsx";

export default function SettingsModal({ onClose }) {
  const [closing, setClosing] = useState(false);
  const [tab, setTab] = useState("user");

  const [username, setUsername] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useLanguageRefresh();

  const [noteVisible, setNoteVisible] = useState(0);
  const noteText = t("The spirits tend to communicate in English through the board, but they may occasionally respond in other languages if spoken to directly in them.");

  useEffect(() => {
    setNoteVisible(0);
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setNoteVisible(i);
      if (i >= noteText.length) clearInterval(timer);
    }, 20);
    return () => clearInterval(timer);
  }, [noteText]);

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
      setMsg({ type: "error", text: t("Request failed.") });
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
        <h2 className="text-xl font-serif tracking-widest text-amber-200/80 uppercase text-center mb-5">{t("Settings")}</h2>

        <div className="flex mb-6 border-b border-amber-900/30">
          <button
            onClick={() => setTab("user")}
            className={`flex-1 pb-2.5 text-xs tracking-wider uppercase transition-colors cursor-pointer ${
              tab === "user"
                ? "text-amber-200/80 border-b-2 border-amber-600/60"
                : "text-amber-200/30 hover:text-amber-200/50"
            }`}
          >
            {t("User")}
          </button>
          <button
            onClick={() => setTab("language")}
            className={`flex-1 pb-2.5 text-xs tracking-wider uppercase transition-colors cursor-pointer ${
              tab === "language"
                ? "text-amber-200/80 border-b-2 border-amber-600/60"
                : "text-amber-200/30 hover:text-amber-200/50"
            }`}
          >
            {t("Language")}
          </button>
        </div>

        {tab === "language" && (
          <>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                    getLanguage() === lang.code
                      ? "bg-amber-900/30 border border-amber-700/40 text-amber-100"
                      : "bg-neutral-800/50 border border-amber-900/20 text-amber-200/50 hover:text-amber-200/70 hover:border-amber-900/30"
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.nativeName}</span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-amber-200/30 leading-relaxed italic">
              {noteText.slice(0, noteVisible)}
              {noteVisible < noteText.length && <span className="animate-pulse">|</span>}
            </p>
          </>
        )}

        {tab === "user" && (
          <>
            <p className="text-sm text-amber-200/40 text-center mb-6">
              {t("Logged in as")} <span className="text-amber-200/70">{username}</span>
            </p>

            <div className="space-y-3 mb-6">
              <h3 className="text-xs tracking-wider text-amber-200/30 uppercase">{t("Change Username")}</h3>
              <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder={t("New username")} className="w-full text-sm py-2 px-3 bg-neutral-800 border border-amber-900/30 rounded-lg text-amber-100 placeholder-amber-200/20 outline-none focus:border-amber-700/60 transition-colors" />
            </div>

            <div className="border-t border-amber-900/20 mb-6" />

            <div className="space-y-3 mb-6">
              <h3 className="text-xs tracking-wider text-amber-200/30 uppercase">{t("Change Password")}</h3>
              <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder={t("Current password")} className="w-full text-sm py-2 px-3 bg-neutral-800 border border-amber-900/30 rounded-lg text-amber-100 placeholder-amber-200/20 outline-none focus:border-amber-700/60 transition-colors" />
              <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder={t("New password")} className="w-full text-sm py-2 px-3 bg-neutral-800 border border-amber-900/30 rounded-lg text-amber-100 placeholder-amber-200/20 outline-none focus:border-amber-700/60 transition-colors" />
              <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder={t("Confirm new password")} className="w-full text-sm py-2 px-3 bg-neutral-800 border border-amber-900/30 rounded-lg text-amber-100 placeholder-amber-200/20 outline-none focus:border-amber-700/60 transition-colors" />
            </div>

            {msg && <p className={`text-xs mb-4 ${msg.type === "success" ? "text-green-400/70" : "text-red-400/70"}`}>{msg.text}</p>}

            <button onClick={handleSave} disabled={!canSave || saving} className="w-full py-2 bg-amber-900/30 hover:bg-amber-900/50 border border-amber-900/30 rounded-lg text-amber-200/60 text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
              {saving ? t("Saving\u2026") : t("Save Changes")}
            </button>

            <div className="border-t border-amber-900/20 my-6" />

            <button onClick={handleLogout} className="w-full py-2 bg-red-900/30 hover:bg-red-900/50 border border-red-900/30 rounded-lg text-red-200/60 text-sm transition-colors">
              {t("Log Out")}
            </button>
          </>
        )}

        <button onClick={handleClose} className="mt-6 w-full py-2 bg-amber-900/30 hover:bg-amber-900/50 border border-amber-900/30 rounded-lg text-amber-200/60 text-sm transition-colors text-center">
          {t("Close")}
        </button>
      </div>
    </div>
  );
}
