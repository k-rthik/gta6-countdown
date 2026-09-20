#!/usr/bin/env node
/**
 * Sanity checks for the static site. No dependencies, no build step.
 * Run with: npm test   (or: node scripts/check.mjs)
 *
 * These guard the handful of invariants that are easy to break while editing
 * card copy and annoying to notice afterwards.
 */

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(join(root, "index.html"), "utf8");

let failures = 0;
const ok = (name) => console.log(`  ok   ${name}`);
const fail = (name, detail) => {
  failures++;
  console.error(`  FAIL ${name}\n       ${detail}`);
};

function check(name, fn) {
  try {
    const problem = fn();
    if (problem) fail(name, problem);
    else ok(name);
  } catch (err) {
    fail(name, err.message);
  }
}

console.log("\nnights in leonida — checks\n");

/* ---- the one invariant that actually matters ---- */
check("CARDS array holds exactly 64 entries", () => {
  const block = html.match(/var CARDS = \[([\s\S]*?)\n  \];/);
  if (!block) return "could not locate the CARDS array in index.html";
  const entries = block[1].match(/^\s*\["/gm) || [];
  return entries.length === 64
    ? null
    : `found ${entries.length} entries; the calendar runs 16 Sep -> 18 Nov 2026 and needs exactly 64`;
});

check("every card uses a known category", () => {
  const block = html.match(/var CARDS = \[([\s\S]*?)\n  \];/);
  if (!block) return "could not locate the CARDS array";
  const known = new Set(["throwback", "receipts", "fineprint", "radio", "dispatch"]);
  const used = [...block[1].matchAll(/^\s*\["([a-z]+)"/gm)].map((m) => m[1]);
  const bad = [...new Set(used.filter((c) => !known.has(c)))];
  return bad.length ? `unknown categor${bad.length > 1 ? "ies" : "y"}: ${bad.join(", ")}` : null;
});

check("launch and start dates are unchanged", () => {
  const hasLaunch = /var LAUNCH = new Date\(2026,10,19/.test(html);
  const hasStart = /var START  = new Date\(2026,8,16/.test(html);
  if (!hasLaunch) return "LAUNCH is no longer 19 Nov 2026 — update the copy and og.png too";
  if (!hasStart) return "START is no longer 16 Sep 2026 — the 64-card count depends on it";
  return null;
});

/* ---- no third-party requests at runtime ---- */
check("no external assets are loaded at runtime", () => {
  const offenders = [...html.matchAll(/(?:src|href)\s*=\s*"(https?:\/\/[^"]+)"/g)]
    .map((m) => m[1])
    // footer source links are anchors, not loaded assets
    .filter((u) => !html.includes(`<a href="${u}"`))
    // Vercel Analytics is allowed for monitoring
    .filter((u) => !u.includes("vercel-insights.com"));
  return offenders.length ? `would fetch: ${offenders.join(", ")}` : null;
});

check("every referenced font file exists", () => {
  const refs = [...html.matchAll(/url\("(fonts\/[^"]+)"\)/g)].map((m) => m[1]);
  if (!refs.length) return "no @font-face sources found — did the self-hosted fonts get dropped?";
  const missing = refs.filter((p) => !existsSync(join(root, p)));
  return missing.length ? `missing: ${missing.join(", ")}` : null;
});

/* ---- things link unfurlers and browsers need ---- */
check("social and viewport meta tags are present", () => {
  const required = [
    'property="og:title"',
    'property="og:description"',
    'property="og:image"',
    'name="twitter:card"',
    'name="viewport"',
    "<title>",
  ];
  const missing = required.filter((t) => !html.includes(t));
  return missing.length ? `missing: ${missing.join(", ")}` : null;
});

check("og.png is present and roughly 1200x630", () => {
  const p = join(root, "og.png");
  if (!existsSync(p)) return "og.png is missing";
  const buf = readFileSync(p);
  if (buf.toString("ascii", 1, 4) !== "PNG") return "og.png is not a PNG";
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  return w === 1200 && h === 630 ? null : `og.png is ${w}x${h}, expected 1200x630`;
});

check("the cheat code still matches the one documented in the README", () => {
  const inHtml = html.match(/var CODE\s*=\s*"([A-Z]+)"/);
  if (!inHtml) return "could not find CODE in index.html";
  const readme = readFileSync(join(root, "README.md"), "utf8");
  return readme.includes(inHtml[1])
    ? null
    : `index.html uses ${inHtml[1]} but the README documents something else`;
});

console.log(
  failures === 0
    ? "\nall checks passed\n"
    : `\n${failures} check${failures > 1 ? "s" : ""} failed\n`
);
process.exit(failures === 0 ? 0 : 1);
