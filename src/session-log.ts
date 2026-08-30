import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export type Cause = { session: string; seq: number };
export type EventInput = {
  ts: string;
  actor: string;
  verb: string;
  cause?: Cause | null;
  body: Record<string, unknown>;
};
export type Event = EventInput & { seq: number };

const verbs = new Set([
  "open", "close", "say", "address", "join", "leave", "attach", "detach",
  "grant", "revoke", "spawn", "produce", "observe",
]);

function object(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validCause(value: unknown): value is Cause | null | undefined {
  if (value == null) return true;
  return object(value) && typeof value.session === "string" && value.session.length > 0
    && Number.isSafeInteger(value.seq) && value.seq >= 0;
}

export function validateEnvelope(value: unknown): asserts value is Event {
  if (!object(value) || !Number.isSafeInteger(value.seq) || value.seq < 0
    || typeof value.ts !== "string" || Number.isNaN(Date.parse(value.ts))
    || typeof value.actor !== "string" || value.actor.length === 0
    || typeof value.verb !== "string" || !verbs.has(value.verb)
    || !validCause(value.cause) || !object(value.body)) {
    throw new Error("Invalid event envelope");
  }
}

function sessionPath(root: string, session: string): string {
  if (!session || session === "." || session === ".." || session.includes("/")) {
    throw new Error("Invalid session id");
  }
  return join(root, `${session}.jsonl`);
}

export class SessionLog {
  readonly path: string;

  private constructor(path: string) {
    this.path = path;
  }

  static create(root: string, session: string, actor: string, scope: string): SessionLog {
    const path = sessionPath(root, session);
    mkdirSync(root, { recursive: true });
    writeFileSync(path, "", { flag: "wx" });
    const log = new SessionLog(path);
    log.append({ ts: new Date().toISOString(), actor, verb: "open", body: { scope } });
    return log;
  }

  static open(root: string, session: string): SessionLog {
    const path = sessionPath(root, session);
    readFileSync(path);
    return new SessionLog(path);
  }

  append(input: EventInput): Event {
    const events = this.read();
    if (events.at(-1)?.verb === "close") throw new Error("Cannot append to a closed session");
    const event: Event = { ...input, seq: events.length };
    validateEnvelope(event);
    if (event.seq === 0 && event.verb !== "open") throw new Error("First event must be open");
    if (event.seq > 0 && event.verb === "open") throw new Error("Open is only valid at sequence zero");
    appendFileSync(this.path, `${JSON.stringify(event)}\n`, { encoding: "utf8" });
    return event;
  }

  read(): Event[] {
    const text = readFileSync(this.path, "utf8");
    if (text === "") return [];
    const lines = text.split("\n");
    if (lines.at(-1) === "") lines.pop();
    const events = lines.map((line, index) => {
      let value: unknown;
      try { value = JSON.parse(line); } catch { throw new Error(`Malformed event at line ${index + 1}`); }
      validateEnvelope(value);
      if (value.seq !== index) throw new Error(`Non-contiguous sequence at line ${index + 1}`);
      if (index === 0 && value.verb !== "open") throw new Error("First event must be open");
      return value;
    });
    return events;
  }
}
