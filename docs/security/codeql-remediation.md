# CodeQL remediation inventory

This document tracks open CodeQL findings remediated on the security hardening branch. Alert numbers are assigned sequentially for traceability; update numbers after exporting the GitHub code-scanning API on the PR branch.

| Alert | Severity | Rule | File | Classification | Resolution | Test |
|------|----------|------|------|----------------|------------|------|
| 1 | High | `js/tainted-format-string` | `embedded32-supervisor/src/logger.ts` | Confirmed vulnerability | Use constant `%s` format strings via `safeConsoleWrite` and `sanitizeLogText` | `embedded32-supervisor/tests/logger.test.ts`, `embedded32-core/tests/security/logSanitize.test.ts` |
| 2 | High | `js/stored-xss` | `apps/site/src/lib/content.ts`, `apps/site/src/components/Markdown.tsx`, `apps/site/src/app/labs/page.tsx` | Confirmed vulnerability | Strict lab slug allowlist, plain-text title sanitization, URL scheme validation | `apps/site/tests/security.test.mjs` |
| 3 | Medium | `js/hardcoded-credentials` | `embedded32.yaml` | Confirmed vulnerability | Remove inline MQTT username/password; load from `EMBEDDED32_MQTT_*` env vars at runtime | `embedded32-core/tests/security/mqttCredentials.test.ts`, `embedded32-cli/tests/config-loader.test.ts` |
| 4 | Medium | `js/incomplete-sanitization` / `js/regex/missing-regexp-anchor` | `scripts/verify-citation.mjs` | Code-quality defect | Replace broad `/doi\.org\/10\./` regex with literal `includes('https://doi.org/10.')` | `scripts/tests/citation-security.test.mjs` |
| 5 | High | `js/prototype-pollution` | `embedded32-core/src/config/ConfigLoader.ts` | Confirmed vulnerability | Validate path segments, reject forbidden keys, use `Object.hasOwn`, null-prototype records, deep copies | `embedded32-core/tests/security/configPath.test.ts`, `embedded32-core/tests/configLoader.test.ts` |
| 6 | High | `js/command-line-injection` | `embedded32-tools/src/commands/CANSetupCommand.ts` | Confirmed vulnerability | Replace `exec` shell strings with `execFile` argument arrays; validate interface names | `embedded32-tools/tests/interfaceName.test.ts`, `embedded32-tools/tests/CANSetupCommand.test.ts` |
| 7 | Medium | `js/log-injection` | `embedded32-supervisor/src/logger.ts`, `embedded32-ethernet/src/tcp.ts`, `embedded32-tools/src/suppress-warnings.ts`, `embedded32-core/src/logger/Logger.ts` | Confirmed vulnerability | Sanitize CR/LF/ANSI/control chars; constant format strings; validate IP/port fields | `embedded32-core/tests/security/logSanitize.test.ts`, `embedded32-ethernet/tests/tcpLogging.test.ts` |
| 8 | Note | `js/unused-local-variable` | various production/examples/labs | Mixed | Remove dead imports in production code; preserve intentional incomplete lab starters with documented rationale | Targeted cleanup in touched production files |

## False-positive policy

Every false-positive dismissal must include a specific technical explanation. Starter lab files that intentionally omit imports until a student exercise step may be dismissed individually with the reason **Intentional educational code** once documented in the lab README.

## Verification

After merge, export open alerts:

```bash
gh api --paginate \
  "repos/Mukesh-SCS/Embedded32/code-scanning/alerts?state=open&per_page=100"
```

Target: zero open High and Medium alerts on the PR branch.
