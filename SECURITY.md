# Security policy

## Supported versions

Security fixes are provided for the **latest** `1.0.x` release line on the default branch when applicable.

| Version                     | Supported        |
| --------------------------- | ---------------- |
| `1.0.x` (main / latest tag) | Yes              |
| Older unpublished snapshots | Best effort only |
| Pre-release branches        | No               |

Embedded32 is an **education and experimentation** platform - not certified for safety-critical or production vehicle deployments.

## Reporting a vulnerability

**Do not** open public GitHub issues for security vulnerabilities.

Report privately using one of:

1. **[GitHub private vulnerability reporting](https://github.com/Mukesh-SCS/Embedded32/security/advisories/new)** (preferred when enabled on the repository)
2. **Email** the maintainer listed in [MAINTAINERS.md](MAINTAINERS.md)

Include:

- Description of the issue and impact
- Steps to reproduce
- Affected package(s) and version or commit hash
- Proof-of-concept if available (keep it minimal)
- Suggested fix if you have one

## What not to post publicly

- Exploit code or step-by-step attack instructions
- Credentials, tokens, or customer/student data
- Unpatched zero-day details before maintainers acknowledge receipt

## Response process

1. **Acknowledgment** - within 7 days of a valid report (goal)
2. **Triage** - severity assessment and affected components
3. **Fix** - patch on a private branch or direct fix with coordinated disclosure
4. **Release** - semver-appropriate release notes; npm publish only with maintainer approval
5. **Credit** - reporters credited in advisory if they wish

Timelines may be longer for low-severity or documentation-only issues.

## Safe harbor

We support good-faith security research on your own installations and forks. Do not test against third-party systems or live vehicle networks without authorization.

## Dependencies

Report vulnerable **dependencies** via Dependabot alerts (when enabled) or a private advisory. Run `npm audit` locally for awareness - not all findings require immediate action in a dev/education toolchain.

## MQTT credentials

- Do **not** commit MQTT usernames or passwords in `embedded32.yaml` or example files.
- When MQTT is enabled, provide credentials through environment variables:
  - `EMBEDDED32_MQTT_USERNAME`
  - `EMBEDDED32_MQTT_PASSWORD`
- Anonymous local brokers are supported when neither variable is set.
- Runtime logs redact credential fields via `redactSecrets()`; never log authorization headers or raw broker passwords.

## Contact

See [MAINTAINERS.md](MAINTAINERS.md) for current security contacts. No phone numbers are listed in this policy.
