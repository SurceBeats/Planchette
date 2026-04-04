import React from "react";
import { t, useLanguageRefresh } from "./i18n.jsx";

export default function AuthPage({ mode, flash }) {
  useLanguageRefresh();

  const isSetup = mode === "setup";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-950 select-none px-4">
      <img src="/__data__/logoSmall.png" alt="Planchette" className="w-16 h-16 sm:w-20 sm:h-20 mb-4 opacity-80 smoke-text" />
      <h1 className="text-2xl sm:text-3xl font-serif tracking-widest text-amber-200/80 uppercase mb-1 smoke-text">Planchette</h1>
      <p className="text-[10px] sm:text-xs tracking-[0.3em] text-amber-200/30 uppercase mb-8 subtitle-fade">{t("The Talking Board")}</p>

      <div className="bg-neutral-900 border border-amber-900/40 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        {isSetup && (
          <p className="text-sm text-amber-200/40 text-center mb-6">{t("Create your account")}</p>
        )}

        {flash.map((msg, i) => (
          <div key={i} className={`px-3 py-2 rounded-lg mb-4 text-sm text-center ${msg === "Account created. Log in below." || msg === t("Account created. Log in below.") ? "bg-green-950/50 border border-green-900/40 text-green-400/80" : "bg-red-950/50 border border-red-900/40 text-red-400/80"}`}>
            {t(msg)}
          </div>
        ))}

        <form method="POST">
          <label htmlFor="username" className="block text-xs tracking-wider text-amber-200/30 uppercase mb-1">{t("Username")}</label>
          <input type="text" id="username" name="username" autoComplete="username" required autoFocus className="w-full text-sm py-2 px-3 bg-neutral-800 border border-amber-900/30 rounded-lg text-amber-100 placeholder-amber-200/20 outline-none focus:border-amber-700/60 transition-colors mb-4" />

          <label htmlFor="password" className="block text-xs tracking-wider text-amber-200/30 uppercase mb-1">{t("Password")}</label>
          <input type="password" id="password" name="password" autoComplete={isSetup ? "new-password" : "current-password"} required className="w-full text-sm py-2 px-3 bg-neutral-800 border border-amber-900/30 rounded-lg text-amber-100 placeholder-amber-200/20 outline-none focus:border-amber-700/60 transition-colors mb-4" />

          {isSetup && (
            <>
              <label htmlFor="confirm" className="block text-xs tracking-wider text-amber-200/30 uppercase mb-1">{t("Confirm password")}</label>
              <input type="password" id="confirm" name="confirm" autoComplete="new-password" required className="w-full text-sm py-2 px-3 bg-neutral-800 border border-amber-900/30 rounded-lg text-amber-100 placeholder-amber-200/20 outline-none focus:border-amber-700/60 transition-colors mb-4" />
            </>
          )}

          <div className={isSetup ? "mt-2" : ""}>
            <button type="submit" className="w-full py-2 bg-amber-900/40 hover:bg-amber-800/50 border border-amber-900/40 rounded-lg text-amber-200/80 text-sm font-medium cursor-pointer transition-colors text-center">
              {isSetup ? t("Create account") : t("Log in")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
