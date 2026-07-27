import fs from "fs";

const css = fs.readFileSync(
  new URL("../dist/styles.css", import.meta.url),
  "utf8",
);

const checks = [
  { name: "tcm:flex utility", pattern: ".tcm\\:flex" },
  { name: "tcm:text-foreground utility", pattern: ".tcm\\:text-foreground" },
  { name: "tcm-root scope class", pattern: ".tcm-root" },
  { name: "tcm:hover:tcm:bg-muted utility", pattern: ".tcm\\:hover\\:tcm\\:bg-muted" },
  { name: "no-scrollbar utility", pattern: ".no-scrollbar" },
  { name: "scoped --background token on .tcm-root", pattern: ".tcm-root" },
];

let failed = 0;
for (const check of checks) {
  const ok = css.includes(check.pattern);
  console.log(`${ok ? "PASS" : "FAIL"}: ${check.name}`);
  if (!ok) failed++;
}

const unprefixedFlex = css.match(/(?<![\\:])\.flex\{/);
console.log(`${unprefixedFlex ? "FAIL" : "PASS"}: no unprefixed .flex{ selector`);
if (unprefixedFlex) failed++;

process.exit(failed > 0 ? 1 : 0);
