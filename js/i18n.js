// Minimal i18n core for the no-build static app.
//
// Design rules (keep it boring and reliable):
// - Flat dictionaries with dotted keys, one module per language under
//   js/locales/. Adding a language = adding one file + one entry in LOCALES.
// - English is the canonical dictionary; missing keys in other locales fall
//   back to English, then to the key itself. reference/check-locales.mjs
//   enforces key parity so the fallback stays an emergency hatch, not a habit.
// - {param} interpolation on lookup. Values are plain strings.
// - Static index.html text is marked with data-i18n / data-i18n-html /
//   data-i18n-title / data-i18n-placeholder attributes and applied by
//   applyDomTranslations(); JS-rendered markup calls t() at render time and
//   re-renders on locale change.
import { en } from "./locales/en.js";
import { zh } from "./locales/zh.js";

export const LOCALES = {
  en: { code: "en", label: "English" },
  zh: { code: "zh", label: "中文" },
};

const DICTS = { en, zh };
const STORAGE_KEY = "m916_lang";
const listeners = new Set();

function detectLocale() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && DICTS[saved]) return saved;
  } catch (_) {}
  const lang = (navigator.language || "en").toLowerCase();
  return lang.startsWith("zh") ? "zh" : "en";
}

let current = detectLocale();

export function getLocale() {
  return current;
}

export function setLocale(code) {
  if (!DICTS[code] || code === current) return;
  current = code;
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch (_) {}
  document.documentElement.lang = code;
  listeners.forEach((cb) => {
    try {
      cb(code);
    } catch (e) {
      console.error(e);
    }
  });
}

export function onLocaleChange(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function t(key, params, fallback) {
  let s = (DICTS[current] || en)[key];
  if (s === undefined) s = en[key];
  if (s === undefined) s = fallback;
  if (s === undefined) return key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      s = s.replaceAll(`{${k}}`, String(v));
    }
  }
  return s;
}

// Applies translations to static HTML markers. Re-run after every locale
// change; JS-rendered panes re-render themselves via their own subscriptions.
export function applyDomTranslations(root = document) {
  root.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  root.querySelectorAll("[data-i18n-html]").forEach((el) => {
    // Values come from our own locale files, never from user input.
    el.innerHTML = t(el.getAttribute("data-i18n-html"));
  });
  root.querySelectorAll("[data-i18n-title]").forEach((el) => {
    el.setAttribute("title", t(el.getAttribute("data-i18n-title")));
  });
  root.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
  });
}

export function initI18n() {
  document.documentElement.lang = current;
  applyDomTranslations();
}
