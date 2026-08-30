import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SessionLog, validateEnvelope } from "./session-log.ts";

const root = () => mkdtempSync(join(tmpdir(), "glass-factory-log-"));

test("creates, appends, and reads a session with gap-free per-session sequence", () => {
  const log = SessionLog.create(root(), "alpha", "mira", "atelier");
  assert.equal(log.append({ ts: new Date().toISOString(), actor: "mira", verb: "say", body: { text: "hello" } }).seq, 1);
  assert.deepEqual(log.read().map((event) => event.seq), [0, 1]);
});

test("sessions sequence independently and closed sessions reject appends", () => {
  const dir = root();
  const first = SessionLog.create(dir, "one", "mira", "private");
  const second = SessionLog.create(dir, "two", "mira", "private");
  first.append({ ts: new Date().toISOString(), actor: "mira", verb: "close", body: {} });
  assert.equal(second.append({ ts: new Date().toISOString(), actor: "mira", verb: "say", body: { text: "independent" } }).seq, 1);
  assert.throws(() => first.append({ ts: new Date().toISOString(), actor: "mira", verb: "say", body: { text: "nope" } }), /closed/);
});

test("rejects malformed records and invalid envelopes", () => {
  const dir = root();
  const path = join(dir, "bad.jsonl");
  writeFileSync(path, '{"seq":0,"ts":"not-a-date","actor":"mira","verb":"say","body":{}}\n');
  assert.throws(() => SessionLog.open(dir, "bad").read(), /Invalid event envelope/);
  assert.throws(() => validateEnvelope({ seq: 0, ts: new Date().toISOString(), actor: "mira", verb: "unknown", body: {} }), /Invalid event envelope/);
  writeFileSync(path, "not json\n");
  assert.throws(() => SessionLog.open(dir, "bad").read(), /Malformed event/);
});

test("preserves the envelope cause reference", () => {
  const log = SessionLog.create(root(), "child", "agent", "shared");
  const event = log.append({ ts: new Date().toISOString(), actor: "agent", verb: "say", cause: { session: "parent", seq: 4 }, body: { text: "reply" } });
  assert.deepEqual(event.cause, { session: "parent", seq: 4 });
  assert.equal(JSON.parse(readFileSync(log.path, "utf8").split("\n")[1]).cause.seq, 4);
});
