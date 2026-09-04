import { Font } from "@react-pdf/renderer";

// By default, @react-pdf/renderer hyphenates long words that don't fit a
// line — e.g. a 44-character surname can come out as "Featherstone-\nhaugh"
// with a hyphen that isn't actually part of the name. An ATS parser that
// rejoins wrapped lines would then read a name that's subtly wrong. Treating
// each space-separated token as unbreakable means wrapping only ever
// happens at real word boundaries, never inserting a synthetic hyphen.
// Imported once from render.ts before any template renders.
Font.registerHyphenationCallback((word) => [word]);
