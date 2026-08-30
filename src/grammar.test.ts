import test from "node:test";
import assert from "node:assert/strict";
import { VERBS, render, validateBody } from "./grammar.ts";

// The Line column of GRAMMAR.md, verbatim. If these drift, the document and
// the renderer have drifted — which is the one thing law 6 cannot tolerate.
const lines: Array<[string, string, Record<string, unknown>, string]> = [
  ["open", "mira", { scope: "atelier" }, "mira opens session in atelier"],
  ["close", "mira", {}, "mira closes session"],
  ["say", "mira", { text: "relay is up" }, "mira says: relay is up"],
  ["address", "mira", { to: "fetcher-1", text: "rerun the build" }, "mira → fetcher-1: rerun the build"],
  ["join", "fetcher-1", {}, "fetcher-1 joins"],
  ["leave", "fetcher-1", {}, "fetcher-1 leaves"],
  ["attach", "mira", { scope: "audit-scope" }, "mira attaches audit-scope"],
  ["detach", "mira", { scope: "audit-scope" }, "mira detaches audit-scope"],
  ["grant", "mira", { grantee: "fetcher-1", mode: "query", target: "spec-v3" }, "mira grants query:spec-v3 to fetcher-1"],
  ["revoke", "mira", { grantee: "fetcher-1", mode: "query", target: "spec-v3" }, "mira revokes query:spec-v3 from fetcher-1"],
  ["spawn", "mira", { child: "fetcher-1", grants: ["query:spec-v3"] }, "mira spawns fetcher-1"],
  ["produce", "mira", { artifact: "spec-v3", hash: "a41f2c93" }, "mira produces spec-v3 (a41f2c)"],
];

test("every verb renders exactly the line GRAMMAR.md specifies", () => {
  for (const [verb, actor, body, line] of lines) {
    assert.equal(render({ actor, verb, body }), line, verb);
  }
});

test("the vocabulary is closed and fully covered", () => {
  assert.deepEqual([...VERBS].sort(), [...lines.map(([verb]) => verb), "observe"].sort());
  assert.throws(() => render({ actor: "mira", verb: "deploy", body: {} }), /Unknown verb/);
});

test("observe parses but does not render", () => {
  validateBody("observe", { anything: true });
  assert.throws(() => render({ actor: "mira", verb: "observe", body: {} }), /reserved/);
});

test("bodies are closed: missing, ill-typed, and extra fields are rejected", () => {
  assert.throws(() => validateBody("say", {}), /"text" is missing/);
  assert.throws(() => validateBody("say", { text: 42 }), /ill-typed/);
  assert.throws(() => validateBody("say", { text: "hi", urgent: true }), /no body field "urgent"/);
  assert.throws(() => validateBody("grant", { grantee: "f", mode: "admin", target: "s" }), /"mode"/);
  assert.throws(() => validateBody("close", { reason: "done" }), /no body field "reason"/);
  assert.throws(() => validateBody("spawn", { child: "f", grants: "query" }), /"grants"/);
});

test("the line front-loads actor and verb, so a truncation still says who did what", () => {
  const line = render({ actor: "mira", verb: "say", body: { text: "x".repeat(200) } });
  assert.equal(line.slice(0, 9), "mira says");
});
