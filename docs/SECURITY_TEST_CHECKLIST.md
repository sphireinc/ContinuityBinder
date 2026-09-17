# Security test checklist

Run this checklist for every release:

- Run `npm run check` and inspect the production build output.
- Run `npm audit` or the selected dependency scanner; review every finding rather than accepting a blanket exception.
- Generate an SBOM with `npm sbom --sbom-format=cyclonedx` and retain it with the release evidence.
- Confirm the production response policy has `connect-src 'none'` and that no application code uses fetch, XHR, WebSocket, EventSource, or `sendBeacon`.
- Fill forms with a unique sensitive sentinel and inspect browser network logs; no request URL, header, or body may contain it.
- Confirm user content is rendered as text or escaped export content; do not add `dangerouslySetInnerHTML` or arbitrary HTML fields.
- Confirm imported backups are schema- and checksum-validated before any database replacement.
- Confirm attachment plaintext is absent from IndexedDB, Cache Storage, and localStorage.
- Confirm readable exports and printed pages are treated as unencrypted copies.
- Confirm no secrets are copied automatically to the clipboard and browser autofill does not target sensitive instructions or identifiers.

The checklist is evidence to collect; a passing static check alone is not browser or deployment proof.
