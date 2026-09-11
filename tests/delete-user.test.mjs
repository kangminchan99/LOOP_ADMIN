import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

// 실제 API/쿠키 대신 가짜 의존성을 주입해 Route Handler를 검증.
function loadModule(relativePath, { token, fetchImpl }) {
  const source = readFileSync(new URL(relativePath, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
  }});
  const exports = {};
  vm.runInNewContext(outputText, {
    exports, Response, Request, URL, AbortSignal,
    fetch: fetchImpl,
    require(name) {
      if (name === '@/src/config/env') return { env: { apiBaseUrl: 'http://test-api.invalid' } };
      if (name === 'next/headers') return { cookies: async () => ({ get: () => token ? { value: token } : undefined }) };
      throw new Error(`Unexpected dependency: ${name}`);
    },
  });
  return exports;
}
function setup({ token = 'mock-token', upstream = async () => new Response(null, { status: 204 }) } = {}) {
  const calls = [];
  const { DELETE } = loadModule('../app/api/admin/users/[id]/route.ts', { token,
    fetchImpl: async (...args) => { calls.push(args); return upstream(...args); },
  });
  return {
    calls,
    invoke: (id = '123', origin = 'http://localhost:3001') => DELETE(
      new Request(`http://localhost:3001/api/admin/users/${id}`, {
        method: 'DELETE', headers: origin ? { origin } : {},
      }), { params: Promise.resolve({ id }) }),
  };
}
test('rejects cross-origin and missing-origin requests without contacting API', async () => {
  const app = setup();
  assert.equal((await app.invoke('1', 'https://other.invalid')).status, 403);
  assert.equal((await app.invoke('1', '')).status, 403);
  assert.equal(app.calls.length, 0);
});
test('rejects invalid IDs before contacting API', async () => {
  const app = setup();
  for (const id of ['0', '-1', 'abc', '1.5', '01', '9007199254740992']) {
    assert.equal((await app.invoke(id)).status, 400);
  }
  assert.equal(app.calls.length, 0);
});
test('missing cookie returns 401 without contacting API', async () => {
  const app = setup({ token: '' });
  assert.equal((await app.invoke()).status, 401);
  assert.equal(app.calls.length, 0);
});
test('forwards DELETE and token only to configured backend; handles empty 204', async () => {
  const app = setup();
  const response = await app.invoke();
  assert.equal(response.status, 204);
  assert.equal(await response.text(), '');
  assert.equal(app.calls[0][0], 'http://test-api.invalid/users/123');
  assert.equal(app.calls[0][1].method, 'DELETE');
  assert.equal(app.calls[0][1].headers.Authorization, 'Bearer mock-token');
  assert.equal(app.calls[0][1].cache, 'no-store');
});
test('supports existing backend empty 200 response', async () => {
  const app = setup({ upstream: async () => new Response(null, { status: 200 }) });
  assert.equal((await app.invoke()).status, 204);
});
for (const status of [401, 403, 404, 409, 429, 500]) {
  test(`propagates ${status} without exposing backend body`, async () => {
    const app = setup({ upstream: async () => new Response('internal-data-do-not-expose', { status }) });
    const response = await app.invoke();
    assert.equal(response.status, status);
    assert.ok(!(await response.text()).includes('internal-data-do-not-expose'));
  });
}
test('network failure returns uncertain-result message and never retries deletion', async () => {
  const app = setup({ upstream: async () => { throw new Error('connection lost'); } });
  const response = await app.invoke();
  assert.equal(response.status, 502);
  assert.match((await response.json()).message, /목록을 새로고침/);
  assert.equal(app.calls.length, 1);
});
test('browser API accepts 204 without parsing JSON', async () => {
  const { deleteAdminUser } = loadModule('../src/features/users/api/delete-admin-user.ts', {
    fetchImpl: async () => new Response(null, { status: 204 }),
  });
  await deleteAdminUser(123);
});
test('browser API displays safe server error', async () => {
  const { deleteAdminUser } = loadModule('../src/features/users/api/delete-admin-user.ts', {
    fetchImpl: async () => Response.json({ message: '권한이 없습니다.' }, { status: 403 }),
  });
  await assert.rejects(deleteAdminUser(123), /권한이 없습니다/);
});
