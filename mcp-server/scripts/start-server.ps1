# Auto-start launcher for the Devcard mcp-server, run at login by a Windows
# Scheduled Task (see resync/mcp-server/README.md's "Auto-start" section) —
# keeps the dashboard/PDF-download HTTP API on :6366 always available without
# a manually-run `bun run dev` terminal. Full bun.exe path used because
# scheduled tasks don't reliably inherit an interactive shell's PATH.
# If :6366 is already held (e.g. a manual `bun run dev` for active
# development), this instance gracefully falls back to stdio-only — see the
# comment in src/index.ts.
Set-Location $PSScriptRoot\..
& "$env:USERPROFILE\.bun\bin\bun.exe" run src/index.ts
