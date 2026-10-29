#!/usr/bin/env node
/* Merge a ledger saved from this run into the ledger as GitHub has it now, so recording what went
 * out never overwrites (or conflicts with) what another run recorded in the meantime.
 *
 *   node scripts/ledger-merge.js <this run's posted.json> <GitHub's posted.json> > social/posted.json
 *
 * Every entry from both; where both have an entry, GitHub's fields first, this run's on top.
 */
const fs = require("fs");
const read = (p) => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch (e) { return { posted: {} }; } };
const [, , localPath, remotePath] = process.argv;
const local = read(localPath), remote = read(remotePath);
const out = Object.assign({}, remote, local, { posted: Object.assign({}, remote.posted || {}) });
for (const [id, rec] of Object.entries(local.posted || {})) out.posted[id] = Object.assign({}, out.posted[id] || {}, rec);
process.stdout.write(JSON.stringify(out, null, 2) + "\n");
