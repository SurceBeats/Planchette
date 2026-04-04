import { useState, useEffect } from "react";

import es from "./locales/es.js";
import de from "./locales/de.js";
import fr from "./locales/fr.js";
import it from "./locales/it.js";
import zh from "./locales/zh.js";
import ru from "./locales/ru.js";
import uk from "./locales/uk.js";
import ja from "./locales/ja.js";
import ko from "./locales/ko.js";
import pt from "./locales/pt.js";

export const LANGUAGES = [
  { code: "en", name: "English", nativeName: "English", flag: "\u{1F1FA}\u{1F1F8}" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "\u{1F1EA}\u{1F1F8}" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "\u{1F1E9}\u{1F1EA}" },
  { code: "fr", name: "French", nativeName: "Français", flag: "\u{1F1EB}\u{1F1F7}" },
  { code: "it", name: "Italian", nativeName: "Italiano", flag: "\u{1F1EE}\u{1F1F9}" },
  { code: "zh", name: "Chinese", nativeName: "\u4E2D\u6587", flag: "\u{1F1E8}\u{1F1F3}" },
  { code: "ru", name: "Russian", nativeName: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439", flag: "\u{1F1F7}\u{1F1FA}" },
  { code: "uk", name: "Ukrainian", nativeName: "\u0423\u043A\u0440\u0430\u0457\u043D\u0441\u044C\u043A\u0430", flag: "\u{1F1FA}\u{1F1E6}" },
  { code: "ja", name: "Japanese", nativeName: "\u65E5\u672C\u8A9E", flag: "\u{1F1EF}\u{1F1F5}" },
  { code: "ko", name: "Korean", nativeName: "\uD55C\uAD6D\uC5B4", flag: "\u{1F1F0}\u{1F1F7}" },
  { code: "pt", name: "Portuguese", nativeName: "Portugu\u00EAs", flag: "\u{1F1E7}\u{1F1F7}" },
];

const localeMap = { es, de, fr, it, zh, ru, uk, ja, ko, pt };

let currentLanguage = "en";
let currentTranslations = null;
const listeners = new Set();
const STORAGE_KEY = "__language";

export function setLanguage(code) {
  currentLanguage = code;
  try { localStorage.setItem(STORAGE_KEY, code); } catch {}
  currentTranslations = code === "en" ? null : (localeMap[code] || null);
  listeners.forEach((fn) => fn());
}

export function initLanguage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored !== "en") setLanguage(stored);
  } catch {}
}

export function useLanguageRefresh() {
  const [, setV] = useState(0);
  useEffect(() => {
    const listener = () => setV((n) => n + 1);
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);
}

export function getLanguage() {
  return currentLanguage;
}

export function t(key) {
  if (!currentTranslations || currentLanguage === "en") return key;
  return currentTranslations[key] ?? key;
}

export function ti(key, params) {
  let result = t(key);
  for (const [k, v] of Object.entries(params)) {
    result = result.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
  }
  return result;
}

// Restore language from localStorage on module load
initLanguage();
