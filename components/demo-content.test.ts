// Run: node --test components/demo-content.test.ts
import assert from "node:assert/strict"
import { test } from "node:test"

import {
  ENDS,
  PHASES,
  PLAN,
  PR_BODY,
  PR_SUMMARY,
  SLACK_EN,
  SLACK_FR,
  TICK,
  advance,
  spoken,
  type Phase,
} from "./demo-content.ts"

test("advance walks the phases on the right event only", () => {
  assert.equal(advance("rest", "click"), "claude-open")
  assert.equal(advance("rest", "timer"), "rest")
  assert.equal(advance("claude-open", "timer"), "claude-stream")
  assert.equal(advance("claude-open", "click"), "claude-open")
  assert.equal(advance("claude-read", "ended"), "pr-open")
  assert.equal(advance("claude-read", "timer"), "claude-read")
  assert.equal(advance("claude-read", "click"), "claude-read")
  assert.equal(advance("slack-listen", "ended"), "end")
  assert.equal(advance("end", "click"), "claude-open")
  assert.equal(advance("end", "timer"), "end")
  assert.equal(advance("end", "ended"), "end")
})

test("advance walks every phase in order from rest to end", () => {
  let phase: Phase = "rest"
  const visited: Phase[] = [phase]
  while (phase !== "end") {
    const end = ENDS[phase]
    const event = end === "click" ? "click" : end === "audio" ? "ended" : "timer"
    phase = advance(phase, event)
    visited.push(phase)
  }
  assert.deepEqual(visited, PHASES)
  assert.equal(advance("end", "click"), "claude-open")
})

test("timing invariant: a phase's timeout outlasts its last word", () => {
  const texts: Partial<Record<Phase, string>> = {
    "claude-stream": PLAN,
    "claude-select": PLAN,
    "pr-open": PR_BODY,
    "pr-summarize": PR_SUMMARY,
    "slack-open": SLACK_FR,
    "slack-translate": SLACK_EN,
  }
  for (const p of Object.keys(TICK) as Phase[]) {
    const end = ENDS[p]
    const wordCount = texts[p]!.split(" ").length
    assert.ok(typeof end === "number", p)
    assert.ok((end as number) >= wordCount * TICK[p]! + 300, p)
  }
})

test("every phase has an end and every tick belongs to a phase", () => {
  for (const p of PHASES) {
    const end = ENDS[p]
    assert.ok(end === "click" || end === "audio" || end > 0, p)
  }
  for (const p of Object.keys(TICK)) assert.ok(PHASES.includes(p as never), p)
  assert.equal(PHASES[0], "rest")
  assert.equal(PHASES.at(-1), "end")
})

test("spoken text has no backticks and reads in one breath", () => {
  for (const t of [PLAN, PR_SUMMARY, SLACK_EN]) {
    assert.ok(!spoken(t).includes("`"))
    assert.ok(spoken(t).split(" ").length < 90)
  }
})
