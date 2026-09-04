import { Font } from "@react-pdf/renderer";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// By default, @react-pdf/renderer hyphenates long words that don't fit a
// line — e.g. a 44-character surname can come out as "Featherstone-\nhaugh"
// with a hyphen that isn't actually part of the name. An ATS parser that
// rejoins wrapped lines would then read a name that's subtly wrong. Treating
// each space-separated token as unbreakable means wrapping only ever
// happens at real word boundaries, never inserting a synthetic hyphen.
// Imported once from render.ts before any template renders.
Font.registerHyphenationCallback((word) => [word]);

// Inter, embedded — a deliberate exception to "base-14 fonts only." Verified
// empirically before shipping (not assumed): WOFF2 crashes fontkit's glyph
// embedding outright (`RangeError: Out of bounds access` in
// fontkit/pdfkit's `_addGlyph`), but plain WOFF embeds cleanly, and
// pdftotext extraction — including classic ligature-prone words
// ("office", "fluffy", "waffle") — comes back correct. Only Polished uses
// this (via ResumeTheme.fontFamily: "Inter"); every other template still
// defaults to Helvetica with zero embedding risk.
//
// Resolved from this module's own location, not process.cwd() — same trap
// DB_PATH hit (see db/client.ts): an MCP client spawns this process from a
// cwd it controls, and a bare relative path would silently fail to find the
// font from the wrong directory instead of erroring.
const fontsDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "node_modules", "@fontsource", "inter", "files");
Font.register({
  family: "Inter",
  fonts: [
    { src: join(fontsDir, "inter-latin-400-normal.woff"), fontWeight: 400 },
    { src: join(fontsDir, "inter-latin-700-normal.woff"), fontWeight: 700 },
  ],
});
