// Minimal zero-dependency ESLint config: correctness rules only (no style
// rules), so `npx eslint js --config reference/eslint.config.mjs` catches
// undefined identifiers and similar breakage without any npm install.
const browserGlobals = {
  window: "readonly",
  document: "readonly",
  localStorage: "readonly",
  navigator: "readonly",
  console: "readonly",
  fetch: "readonly",
  setTimeout: "readonly",
  clearTimeout: "readonly",
  setInterval: "readonly",
  clearInterval: "readonly",
  requestAnimationFrame: "readonly",
  CustomEvent: "readonly",
  Event: "readonly",
  FileReader: "readonly",
  Blob: "readonly",
  URL: "readonly",
  crypto: "readonly",
  confirm: "readonly",
};

export default [
  {
    files: ["js/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: browserGlobals,
    },
    rules: {
      "no-undef": "error",
      // Unused function params are pre-existing upstream noise; keep them
      // visible as warnings without failing the run. `catch (_)` is idiomatic.
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrors: "none",
        },
      ],
      "no-dupe-keys": "error",
      "no-dupe-args": "error",
      "no-redeclare": "error",
      "no-const-assign": "error",
      "no-fallthrough": "error",
      "no-unreachable": "error",
      "no-async-promise-executor": "error",
      "no-compare-neg-zero": "error",
      "no-self-compare": "error",
      "no-sparse-arrays": "error",
      "no-template-curly-in-string": "warn",
      "require-yield": "error",
      "use-isnan": "error",
      "valid-typeof": "error",
    },
  },
];
