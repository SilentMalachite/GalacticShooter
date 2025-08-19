Security Policy
===============

Supported Versions
- Active development occurs on `main/master`.
- No formal LTS; please pin a commit/tag for production use.

Reporting a Vulnerability
- Please open a private issue or contact the maintainers to disclose.
- Provide reproduction steps, affected versions, and impact where possible.

Dependencies & Auditing
- Run `npm audit` locally to review advisories.
- Apply non-breaking fixes with `npm audit fix`.
- For breaking updates, prefer manual upgrades and test via:
  - `npm run check`
  - `npm run build`
  - `npm run dev` (smoke test)

Electron Packaging
- Distribution artifacts are unsigned by default.
- For public distribution, configure OS code signing (Apple Developer ID, Windows code-signing cert, etc.).

