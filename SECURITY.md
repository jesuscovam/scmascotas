# Security Policy

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Please report security issues by emailing the maintainers directly (see the GitHub repository's contact info). Include:

- A description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fix (optional)

We will acknowledge your report within 48 hours and aim to release a fix within 7 days for critical issues.

## Scope

In scope:
- SQL injection, XSS, CSRF
- Authentication/authorization bypass
- Sensitive data exposure
- Server-side vulnerabilities in `apps/web`

Out of scope:
- Rate limiting bypasses that don't expose data
- Issues requiring physical access to a device

## Disclosure

We follow responsible disclosure. We'll credit reporters in the release notes unless you prefer to remain anonymous.
