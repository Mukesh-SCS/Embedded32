# Security regression tests

Maps security regression tests to the CodeQL rules they protect against.

| Test file                                                | CodeQL rule / concern                          | What it proves                                                                                            |
| -------------------------------------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `embedded32-core/tests/security/logSanitize.test.ts`     | `js/tainted-format-string`, `js/log-injection` | Format tokens, CR/LF, ANSI escapes, circular objects, and large payloads are sanitized; console uses `%s` |
| `embedded32-core/tests/logger.test.ts`                   | `js/log-injection`                             | Core logger emits single-line sanitized output                                                            |
| `embedded32-supervisor/tests/logger.test.ts`             | `js/tainted-format-string`, `js/log-injection` | Supervisor logger cannot forge additional log lines                                                       |
| `embedded32-core/tests/security/configPath.test.ts`      | `js/prototype-pollution`                       | Forbidden keys and path segments are rejected; `Object.prototype` stays clean                             |
| `embedded32-core/tests/configLoader.test.ts`             | `js/prototype-pollution`                       | Loader throws on malformed JSON and returns deep copies                                                   |
| `embedded32-core/tests/security/mqttCredentials.test.ts` | `js/hardcoded-credentials`                     | Default YAML has no credentials; env resolution and redaction work                                        |
| `embedded32-cli/tests/config-loader.test.ts`             | `js/hardcoded-credentials`                     | Inline YAML credentials rejected; runtime env credentials applied; logs redacted                          |
| `embedded32-tools/tests/interfaceName.test.ts`           | `js/command-line-injection`                    | Malicious interface names are rejected before subprocess use                                              |
| `embedded32-tools/tests/CANSetupCommand.test.ts`         | `js/command-line-injection`                    | Rejected names never reach `child_process`                                                                |
| `embedded32-ethernet/tests/tcpLogging.test.ts`           | `js/log-injection`                             | Remote client IDs are sanitized before logging                                                            |
| `apps/site/tests/security.test.mjs`                      | `js/stored-xss`                                | Lab slugs, titles, links, and image sources are validated                                                 |
| `scripts/tests/citation-security.test.mjs`               | `js/regex/missing-regexp-anchor`               | DOI prefix checks use explicit literals without broad regex                                               |

## Running security-focused tests

```bash
npm run test --workspace @embedded32/core -- --testPathPattern=security
npm run test --workspace @embedded32/supervisor -- tests/logger.test.ts
npm run test --workspace @embedded32/tools -- --testPathPattern="interfaceName|CANSetup"
npm run test --workspace @embedded32/ethernet -- tests/tcpLogging.test.ts
npm run test --workspace @embedded32/cli -- tests/config-loader.test.ts
node --test apps/site/tests/security.test.mjs scripts/tests/citation-security.test.mjs
```

These run as part of `npm run verify` through the standard package test and citation verification scripts.
