const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'scripts/publish.js'), 'utf8');

// Execute the actual publisher with an in-memory disk and fake APIs. No real
// credentials, browser, network requests, ledger writes or posts are possible.
function harness(initial = { posted: {} }, options = {}) {
  const ledgerPath = path.join(root, 'social/posted.json');
  const files = new Map([[ledgerPath, JSON.stringify(initial)]]);
  const pending = [{ id: 'no-33', title: 'Test' }];
  let failIG = options.failIG, failWrite = options.failWrite;
  const calls = [];
  const disk = {
    mkdirSync() {},
    existsSync: () => false, // No reels in this fixture.
    readFileSync(p) {
      if (p.endsWith('legacymammals-pending.json')) return JSON.stringify(pending);
      if (p.endsWith('.png')) return Buffer.from('fake image');
      if (!files.has(p)) throw new Error('missing file');
      return files.get(p);
    },
    writeFileSync(p, value) { if (failWrite) throw new Error('disk full'); files.set(p, value); },
    renameSync(from, to) { files.set(to, files.get(from)); files.delete(from); },
  };
  const response = (value, ok = true) => ({ok, status: ok ? 200 : 503, json: async () => value});
  const context = {
    require: name => name === 'fs' ? disk : require(name), module: {exports: {}},
    __dirname: path.join(root, 'scripts'), Buffer, URLSearchParams, Blob, FormData,
    console: {log() {}}, process: { env: {
      X_API_KEY: 'fake', X_API_SECRET: 'fake', X_ACCESS_TOKEN: 'fake', X_ACCESS_SECRET: 'fake',
      IG_USER_ID: 'fake-user', IG_ACCESS_TOKEN: 'IGfake', SOCIAL_DRY_RUN: options.dry ? 'true' : 'false',
    } },
    fetch: async (url, init = {}) => {
      if (init.method === 'HEAD') return response({});
      if (url === 'https://api.x.com/2/media/upload') return response({data: {id: 'upload'}});
      if (url === 'https://api.x.com/2/tweets') { calls.push('x'); return response({data: {id: 'x-id'}}); }
      if (url.includes('status_code')) return response({status_code: 'FINISHED'});
      if (url.endsWith('/media')) {
        // X's success must already be durable before Instagram is attempted.
        assert.equal(JSON.parse(files.get(ledgerPath)).posted['no-33'].x, options.x || 'x-id');
        if (failIG) return response({error: 'temporary failure'}, false);
        return response({id: 'container'});
      }
      if (url.endsWith('/media_publish')) { calls.push('ig'); return response({id: 'ig-id'}); }
      throw new Error('Unexpected network request: ' + url);
    },
  };
  vm.runInNewContext(source, context);
  return {
    post: context.module.exports.post, calls,
    ledger: () => JSON.parse(files.get(ledgerPath)),
    replaceLedger: value => files.set(ledgerPath, JSON.stringify(value)),
    corrupt: () => files.set(ledgerPath, '{'),
    remove: () => files.delete(ledgerPath),
    recoverIG: () => { failIG = false; },
  };
}

test('queued checkout resolves main under the existing serialization lock', () => {
  const workflow = fs.readFileSync(path.join(root, '.github/workflows/publish.yml'), 'utf8');
  const publish = workflow.slice(workflow.indexOf('\n  publish:'));
  assert.match(workflow, /concurrency:\n  group: publish\n  cancel-in-progress: false/);
  assert.match(publish, /uses: actions\/checkout@v4\n        with:\n(?:          #.*\n)*          ref: main/);
  assert.match(publish, /name: Record what went out\n        if: always\(\) && inputs.check_only != true/);
  assert.match(publish, /name: Keep the publishing ledger for recovery\n        if: always\(\)/);
});

test('stale pending selection rechecks the current ledger and sends nothing twice', async () => {
  const h = harness();
  // Previous serialized run commits between event/selection and this post phase.
  h.replaceLedger({posted: {'no-33': {x: 'first-x', ig: 'first-ig', igStory: 'first-story'}}});
  await h.post();
  assert.deepEqual(h.calls, []);
  assert.equal(h.ledger().posted['no-33'].x, 'first-x');
  assert.equal(h.ledger().posted['no-33'].igStory, 'first-story');
});

test('partial success is checkpointed and only the failed platform retries', async () => {
  const h = harness({posted: {}}, {failIG: true});
  await h.post();
  assert.deepEqual(h.calls, ['x']);
  assert.equal(h.ledger().posted['no-33'].x, 'x-id');
  assert.ok(h.ledger().posted['no-33'].igError);
  h.recoverIG();
  await h.post();
  assert.deepEqual(h.calls, ['x', 'ig']);
  assert.equal(h.ledger().posted['no-33'].igError, undefined);
  await h.post();
  assert.deepEqual(h.calls, ['x', 'ig']);
});

test('existing Instagram success is retained when X catches up', async () => {
  const h = harness({posted: {'no-33': {ig: 'original-ig', xError: 'retry'}}});
  await h.post();
  assert.deepEqual(h.calls, ['x']);
  assert.equal(h.ledger().posted['no-33'].ig, 'original-ig');
});

test('checkpoint failure stops before another platform publishes', async () => {
  const h = harness({posted: {}}, {failWrite: true});
  await assert.rejects(h.post(), /disk full/);
  assert.deepEqual(h.calls, ['x']);
});

for (const state of ['corrupt', 'remove']) test(state + ' ledger fails closed', async () => {
  const h = harness(); h[state]();
  await assert.rejects(h.post());
  assert.deepEqual(h.calls, []);
});

test('dry run neither publishes nor changes the ledger', async () => {
  const h = harness({posted: {}}, {dry: true});
  await h.post();
  assert.deepEqual(h.calls, []);
  assert.deepEqual(h.ledger(), {posted: {}});
});
