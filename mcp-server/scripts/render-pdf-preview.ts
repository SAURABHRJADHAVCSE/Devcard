#!/usr/bin/env bun
import { mkdirSync, writeFileSync } from "fs";
import { resolve } from "path";
import { renderResumePdf } from "../src/pdf/render";
import { applyResumeVersion } from "../src/pdf/tailor";
import { FIXTURES } from "./pdf-fixtures";

const fixtureName = process.argv[2] ?? "mid-level (3 jobs)";
const fixture = FIXTURES.find(({ name }) => name === fixtureName);

if (!fixture) {
  throw new Error(`Unknown fixture "${fixtureName}". Choose one of: ${FIXTURES.map(({ name }) => name).join(", ")}`);
}

const outputDir = resolve(import.meta.dir, "..", "..", "output", "pdf");
mkdirSync(outputDir, { recursive: true });

const result = await renderResumePdf("polished", applyResumeVersion(fixture.profile));
const outputPath = resolve(outputDir, "devcard-polished-resume-preview.pdf");
writeFileSync(outputPath, result.buffer);

console.log(`${outputPath}\n${result.pageCount} page(s), density=${result.density}`);
