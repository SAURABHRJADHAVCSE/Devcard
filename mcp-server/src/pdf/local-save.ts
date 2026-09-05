import { mkdirSync, writeFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";

// Job application forms that need an actual file upload (not just a text
// paste) require a real path on disk — a browser-download link or a
// base64 blob in an MCP response are useless for that, since nothing
// guarantees where a download lands or what it gets renamed to, and a
// pipeline generating several tailored PDFs in one run needs to reliably
// point at the *right* one for each application. Anchored to the user's
// home directory, not process.cwd() or import.meta.url — same reasoning as
// DB_PATH and the embedded fonts: an MCP client can spawn this server from
// an unpredictable working directory, but the user's home directory is
// stable regardless of who spawned the process or from where.
const RESUMES_DIR = join(homedir(), "Devcard", "resumes");

export function saveResumePdfLocally(buffer: Buffer, filename: string): string {
  mkdirSync(RESUMES_DIR, { recursive: true });
  const path = join(RESUMES_DIR, filename);
  writeFileSync(path, buffer);
  return path;
}
