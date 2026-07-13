import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyAction,
  createSession,
  getCurrentSummary,
  getReflection,
  reconcileRequests,
  saveSession,
  loadSession
} from '../src/app.js';
import scenario from '../src/data/care-scenarios.json' with { type: 'json' };

const at = (minutes) => new Date(Date.UTC(2026, 6, 13, 0, minutes)).toISOString();

test('creates a deterministic bounded-irregular schedule', () => {
  const first = createSession({ now: at(0), seed: 'demo', scenario });
  const second = createSession({ now: at(0), seed: 'demo', scenario });
  assert.deepEqual(first.requests, second.requests);
  assert.ok(first.requests.length >= 3);
  const gaps = first.requests.slice(1).map((request, index) =>
    new Date(request.dueAt) - new Date(first.requests[index].dueAt));
  assert.ok(new Set(gaps).size > 1);
});

test('allows valid actions and rejects invalid transitions', () => {
  const session = createSession({ now: at(0), seed: 'actions', scenario });
  const request = session.requests[0];
  const completed = applyAction(session, request.id, 'complete', at(2));
  assert.equal(completed.requests[0].status, 'completed');
  assert.equal(completed.records.length, 1);
  assert.deepEqual(applyAction(completed, request.id, 'complete', at(3)), completed);
  assert.throws(() => applyAction(completed, request.id, 'defer', at(3)), /terminal/);
});

test('reconciles due and missed requests without changing completed requests', () => {
  const session = createSession({ now: at(0), seed: 'missed', scenario });
  const completed = applyAction(session, session.requests[0].id, 'complete', at(2));
  const reconciled = reconcileRequests(completed, at(30));
  assert.equal(reconciled.requests[0].status, 'completed');
  assert.ok(reconciled.requests.some((request) => request.status === 'missed'));
});

test('derives current summary and reflection without a readiness score', () => {
  const session = createSession({ now: at(0), seed: 'summary', scenario });
  const completed = applyAction(session, session.requests[0].id, 'complete', at(2));
  const deferred = applyAction(completed, completed.requests[1].id, 'defer', at(5));
  const current = getCurrentSummary(deferred);
  assert.equal(current.completedCount, 1);
  assert.equal(current.deferredCount, 1);
  const reflection = getReflection(reconcileRequests(deferred, at(30)));
  assert.ok(reflection.questions.length >= 2);
  assert.equal('readinessScore' in reflection, false);
});

test('persists and reloads a session through a storage-like adapter', () => {
  const session = createSession({ now: at(0), seed: 'storage', scenario });
  const storage = new Map();
  saveSession(session, storage);
  assert.deepEqual(loadSession(session.id, storage), session);
});

test('keeps paused sessions unchanged during missed-request reconciliation', () => {
  const session = createSession({ now: at(0), seed: 'paused', scenario });
  const paused = { ...session, status: 'paused' };
  assert.deepEqual(reconcileRequests(paused, at(30)), paused);
});

test('rejects malformed persisted sessions', () => {
  assert.throws(() => saveSession({ status: 'active' }, new Map()), /invalid session/);
});

test('surfaces persistence failures without changing the session', () => {
  const session = createSession({ now: at(0), seed: 'failure', scenario });
  const storage = { set() { throw new Error('disk full'); } };
  assert.throws(() => saveSession(session, storage), /disk full/);
  assert.equal(session.requests[0].status, 'pending');
});
