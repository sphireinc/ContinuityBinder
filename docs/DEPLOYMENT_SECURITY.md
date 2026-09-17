# Static deployment security

The production site is a static application. Configure the host for HTTPS and serve `public/_headers` (or the equivalent host-specific header configuration). The policy disables application network connections, prevents framing and MIME sniffing, sends no referrer, disables unneeded browser capabilities, and enables HSTS after HTTPS is stable.

Hashed assets may use immutable caching. HTML and the service worker use `no-cache` so updates can be discovered without forcibly reloading an active form.

Before release, verify the deployed site from a clean browser over HTTPS: setup, encrypted persistence, print, readable export, encrypted backup, offline reopen, and browser network policy. Host infrastructure may still receive ordinary request metadata; the application does not add analytics or tracking.
