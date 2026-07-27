import { execSync } from "child_process";

console.log("[v0] Running pnpm install...");
try {
  const output = execSync("cd /vercel/share/v0-project && pnpm install", {
    encoding: "utf8",
    stdio: "pipe",
  });
  console.log("[v0] Install output:", output);
  console.log("[v0] Done.");
} catch (err) {
  console.error("[v0] Install failed:", err.message);
  console.error("[v0] stderr:", err.stderr);
}
