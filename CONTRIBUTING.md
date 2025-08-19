Contributing Guide
==================

Thank you for taking the time to contribute! This guide explains the local dev flow, code quality checks, and PR checklist.

Local Development
- Node.js: v20.x recommended (>=16 required)
- Install deps: `npm install`
- Start dev server: `npm run dev` (http://localhost:5000)
- Electron (dev-like): `npm run electron` (or `./start-electron.sh`)

Quality Gates
- Type check: `npm run check`
- Lint: `npm run lint`
- Format: `npm run format`

Notes
- Unused variables/args must be prefixed with `_` to be ignored by lint rules.
- Switch fallthrough is disallowed. If intentional, refactor or add explicit branching.
- Client `console.log` is discouraged; use `console.warn` / `console.error` while we phase logs out.

Branch & Commit
- Branch: `feat/...`, `fix/...`, `chore/...`, `docs/...`
- Conventional commit style is preferred:
  - `feat(ui): add /embed/galaga route`
  - `fix(server): handle vite allowedHosts type`
  - `chore(lint): enable ESLint flat config`

PR Checklist
- [ ] `npm run check` passes
- [ ] `npm run lint` passes (0 errors)
- [ ] `npm run build` succeeds
- [ ] Docs updated if commands/routes/ports changed
- [ ] Screenshots for UI changes (optional but helpful)

Electron Packaging
- macOS: `npm run electron:build` produces `.app` under `electron-dist/`
- Windows/Linux: build requires OS-specific toolchains (NSIS/Wine, AppImage, etc.)
- Code signing/notarization is not configured by default; add per your distribution plan.

Security
- Run `npm audit` locally and consider `npm audit fix` where safe.
- See `SECURITY.md` for reporting and dependency guidance.

