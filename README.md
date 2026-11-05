# vfx — a private side-branch for personal video work

This branch is not part of the site. It carries sealed jobs for Higgsfield's API so that private pictures never sit in
the clear in a public repository:

- `inbox/<job>.tar.enc` — a job (plan.json plus input pictures), encrypted with a passphrase that is passed to the
  workflow at dispatch time and never stored.
- `outbox/<job>.tar.enc` — what Higgsfield made for it, sealed with the same passphrase by the workflow.
- `.github/workflows/vfx.yml` and `scripts/vfx.js` — the runner.

Archives are AES-256-CBC (PBKDF2, 100000 iterations, salted) over a gzipped tar: `openssl enc -d -aes-256-cbc -pbkdf2
-iter 100000 -pass env:PASS -in outbox/<job>.tar.enc | tar xz`.
