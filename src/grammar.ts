// The closed verb vocabulary of GRAMMAR.md: one body schema and exactly one
// rendering rule per verb. Law-6 conformance is mechanical — closed verbs x
// closed bodies x one rule each means every event renders.

export type Body = Record<string, unknown>;

type Field = (value: unknown) => boolean;

const text: Field = (value) => typeof value === "string" && value.length > 0;
const mode: Field = (value) => value === "query" || value === "mutate";
const grants: Field = (value) => Array.isArray(value) && value.every(text);

type VerbSpec = {
  body: Record<string, Field>;
  render: (actor: string, body: Body) => string;
};

const RESERVED = "observe";

const spec: Record<string, VerbSpec> = {
  open: { body: { scope: text }, render: (a, b) => `${a} opens session in ${b.scope}` },
  close: { body: {}, render: (a) => `${a} closes session` },
  say: { body: { text }, render: (a, b) => `${a} says: ${b.text}` },
  address: { body: { to: text, text }, render: (a, b) => `${a} → ${b.to}: ${b.text}` },
  join: { body: {}, render: (a) => `${a} joins` },
  leave: { body: {}, render: (a) => `${a} leaves` },
  attach: { body: { scope: text }, render: (a, b) => `${a} attaches ${b.scope}` },
  detach: { body: { scope: text }, render: (a, b) => `${a} detaches ${b.scope}` },
  grant: {
    body: { grantee: text, mode, target: text },
    render: (a, b) => `${a} grants ${b.mode}:${b.target} to ${b.grantee}`,
  },
  revoke: {
    body: { grantee: text, mode, target: text },
    render: (a, b) => `${a} revokes ${b.mode}:${b.target} from ${b.grantee}`,
  },
  spawn: { body: { child: text, grants }, render: (a, b) => `${a} spawns ${b.child}` },
  produce: {
    body: { artifact: text, hash: text },
    render: (a, b) => `${a} produces ${b.artifact} (${String(b.hash).slice(0, 6)})`,
  },
  // ponytail: reserved per GRAMMAR.md — parsing recognizes it, mechanics and
  // rendering land with reciprocal observation (glass-factory-v4l.6). Its body
  // stays unconstrained until that design says what is in it.
  [RESERVED]: {
    body: {},
    render: () => { throw new Error(`Rendering of reserved verb "${RESERVED}" is deferred`); },
  },
};

export const VERBS: readonly string[] = Object.keys(spec);

export function isVerb(verb: unknown): verb is string {
  return typeof verb === "string" && Object.hasOwn(spec, verb);
}

/** Closed bodies: exactly the schema's keys, each well-typed. `observe` is exempt. */
export function validateBody(verb: string, body: Body): void {
  if (!isVerb(verb)) throw new Error(`Unknown verb "${verb}"`);
  if (verb === RESERVED) return;
  const fields = spec[verb].body;
  for (const key of Object.keys(body)) {
    if (!Object.hasOwn(fields, key)) throw new Error(`Verb "${verb}" has no body field "${key}"`);
  }
  for (const [key, ok] of Object.entries(fields)) {
    if (!ok(body[key])) throw new Error(`Verb "${verb}" body field "${key}" is missing or ill-typed`);
  }
}

/** The canonical text line, always derived from the record, never stored. */
export function render(event: { actor: string; verb: string; body: Body }): string {
  validateBody(event.verb, event.body);
  return spec[event.verb].render(event.actor, event.body);
}
