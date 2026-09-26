// Locale integrity checker: run `node reference/check-locales.mjs` after
// adding or editing strings. It verifies:
//  1. en/zh dictionaries have identical key sets (no missing, no extras)
//  2. every key referenced via t("...") or data-i18n*="..." in the sources
//     exists in the dictionaries
//  3. every dynamic template usage (t(`prefix.${x}`)) has at least one
//     matching key
//  4. keys not referenced anywhere are reported (delete or wire them up)
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const root = path.join(path.dirname(url.fileURLToPath(import.meta.url)), "..");
const srcDir = path.join(root, "js");
const htmlPath = path.join(root, "index.html");

const toUrl = (p) => url.pathToFileURL(p).href;
const { en } = await import(toUrl(path.join(srcDir, "locales", "en.js")));
const { zh } = await import(toUrl(path.join(srcDir, "locales", "zh.js")));

let failures = 0;
const fail = (msg) => {
  failures++;
  console.log("FAIL  " + msg);
};
const warn = (msg) => console.log("WARN  " + msg);

// 1. key parity
const enKeys = new Set(Object.keys(en));
const zhKeys = new Set(Object.keys(zh));
for (const k of enKeys) if (!zhKeys.has(k)) fail(`zh missing key: ${k}`);
for (const k of zhKeys) if (!enKeys.has(k)) fail(`zh extra key (not in en): ${k}`);
for (const [k, v] of Object.entries(en)) {
  if (typeof v !== "string" || !v.trim()) fail(`en value empty: ${k}`);
}
console.log(
  `en keys: ${enKeys.size}, zh keys: ${zhKeys.size}, parity: ${enKeys.size === zhKeys.size && [...enKeys].every((k) => zhKeys.has(k)) ? "OK" : "BROKEN"}`,
);

// 2/3/4. collect references from sources
const jsFiles = fs
  .readdirSync(srcDir)
  .filter((f) => f.endsWith(".js"))
  .map((f) => path.join(srcDir, f));

const staticKeys = new Set();
const dynamicPrefixes = new Set();

for (const file of jsFiles) {
  const src = fs.readFileSync(file, "utf8");
  for (const m of src.matchAll(/\bt\(\s*["']([^"'`]+)["']/g)) {
    staticKeys.add(m[1]);
  }
  for (const m of src.matchAll(/\bt\(\s*`([^`$]*)\$\{/g)) {
    dynamicPrefixes.add(m[1]);
  }
}
const html = fs.readFileSync(htmlPath, "utf8");
for (const m of html.matchAll(/data-i18n(?:-html|-title|-placeholder)?="([^"]+)"/g)) {
  staticKeys.add(m[1]);
}
const allSourceText = [...jsFiles.map((f) => fs.readFileSync(f, "utf8")), html];

let missing = 0;
for (const k of staticKeys) {
  if (!enKeys.has(k)) {
    fail(`referenced but not defined: ${k}`);
    missing++;
  }
}
for (const p of dynamicPrefixes) {
  const hits = [...enKeys].filter((k) => k.startsWith(p));
  if (hits.length === 0) {
    fail(`dynamic prefix matches no key: \`${p}\${...}\``);
    missing++;
  }
}

const referenced = (k) => {
  if (staticKeys.has(k)) return true;
  if ([...dynamicPrefixes].some((p) => k.startsWith(p))) return true;
  // Data-driven lookups (e.g. `t(obj.keyField)`) can't be followed statically;
  // if the key appears as a plain string literal anywhere in the sources it
  // counts as referenced.
  return allSourceText.some((src) => src.includes(`"${k}"`) || src.includes(`'${k}'`));
};
const unreferenced = [...enKeys].filter((k) => !referenced(k));
for (const k of unreferenced) {
  warn(`key never referenced in sources: ${k}`);
}

// 5. interpolation audit: every t("key", { params }) call must provide all
// {placeholders} the dictionary value needs, and keys applied via
// data-i18n (no interpolation) must not contain placeholders.
const placeholdersOf = (k) => [...(en[k] || "").matchAll(/\{(\w+)\}/g)].map((m) => m[1]);

// Balanced-brace extraction of the params object after t("key", so that
// template literals (${...}) and nested calls inside param values don't
// confuse the scan.
function extractParamNames(src, objStart) {
  const provided = new Set();
  let depth = 0;
  let end = -1;
  for (let j = objStart; j < src.length; j++) {
    const ch = src[j];
    if (ch === "'" || ch === '"' || ch === "`") {
      const quote = ch;
      j++;
      for (; j < src.length; j++) {
        if (src[j] === "\\") {
          j++;
        } else if (quote === "`" && src[j] === "$" && src[j + 1] === "{") {
          let inner = 0;
          j += 1;
          for (; j < src.length; j++) {
            if (src[j] === "{") inner++;
            else if (src[j] === "}") {
              inner--;
              if (inner === 0) break;
            }
          }
        } else if (src[j] === quote) break;
      }
      continue;
    }
    if (ch === "{" || ch === "(" || ch === "[") depth++;
    else if (ch === "}" || ch === ")" || ch === "]") {
      depth--;
      if (depth === 0) {
        end = j;
        break;
      }
    }
  }
  if (end === -1) return provided;
  const body = src.slice(objStart + 1, end);
  let d = 0;
  let cur = "";
  const parts = [];
  for (const ch of body) {
    if (ch === "{" || ch === "(" || ch === "[") d++;
    else if (ch === "}" || ch === ")" || ch === "]") d--;
    if (d === 0 && ch === ",") {
      parts.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  if (cur.trim()) parts.push(cur);
  for (const part of parts) {
    const pm = part.match(/^\s*(\w+)\s*:/);
    if (pm) provided.add(pm[1]);
  }
  return provided;
}

for (const file of jsFiles) {
  const src = fs.readFileSync(file, "utf8");
  const re = /\bt\(\s*["']([^"'`]+)["']\s*,\s*\{/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const objStart = m.index + m[0].length - 1;
    const provided = extractParamNames(src, objStart);
    for (const ph of placeholdersOf(m[1])) {
      if (!provided.has(ph)) {
        fail(
          `t("${m[1]}") is missing param {${ph}} (${path.relative(root, file)})`,
        );
      }
    }
  }
}
for (const k of staticKeys) {
  if (html.includes(`data-i18n="${k}"`) && placeholdersOf(k).length > 0) {
    fail(`data-i18n key has placeholders but cannot interpolate: ${k}`);
  }
}

console.log(
  `static refs: ${staticKeys.size}, dynamic prefixes: ${dynamicPrefixes.size}, unreferenced keys: ${unreferenced.length}`,
);
console.log(
  failures === 0 ? "\nLOCALE CHECK PASSED" : `\n${failures} CHECK(S) FAILED`,
);
process.exit(failures === 0 ? 0 : 1);
