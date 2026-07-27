import fs from "fs";
import path from "path";

const PREFIX = "tcm";
const ROOT = path.resolve(import.meta.dirname, "..");
const TARGET_DIRS = [
  path.join(ROOT, "src"),
];

function prefixClassToken(token) {
  const trimmed = token.trim();
  if (!trimmed || trimmed.startsWith(`${PREFIX}:`)) {
    return trimmed;
  }
  return trimmed.split(":").map((part) => `${PREFIX}:${part}`).join(":");
}

function prefixClassString(str) {
  return str
    .split(/\s+/)
    .filter(Boolean)
    .map(prefixClassToken)
    .join(" ");
}

function prefixQuotedStrings(content) {
  return content.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/g, (match, inner) => {
    if (inner.startsWith("@") || inner.includes("/") && !/\b(flex|grid|text-|bg-|border|rounded|hover:|lg:|md:|sm:)\b/.test(inner)) {
      return match;
    }
    return `"${prefixClassString(inner)}"`;
  });
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }
    if (!/\.(tsx|ts|css)$/.test(entry.name)) {
      continue;
    }
    let content = fs.readFileSync(fullPath, "utf8");
    const next = prefixQuotedStrings(content);
    if (next !== content) {
      fs.writeFileSync(fullPath, next);
      console.log(`prefixed: ${path.relative(ROOT, fullPath)}`);
    }
  }
}

for (const dir of TARGET_DIRS) {
  if (fs.existsSync(dir)) {
    walk(dir);
  }
}
