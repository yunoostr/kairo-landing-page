// Run: node --test components/demo-content.test.ts
import assert from "node:assert/strict"
import { test } from "node:test"

import {
  ENDS,
  PHASES,
  PLAN,
  PR_SUMMARY,
  SLACK_EN,
  TICK,
  advance,
  spoken,
} from "./demo-content.ts"

test("advance walks the phases on the right event only", () => {
  assert.equal(advance("rest", "click"), "claude-open")
  assert.equal(advance("rest", "timer"), "rest")
  assert.equal(advance("claude-open", "timer"), "claude-stream")
  assert.equal(advance("claude-open", "click"), "claude-open")
  assert.equal(advance("claude-read", "ended"), "pr-open")
  assert.equal(advance("claude-read", "timer"), "claude-read")
  assert.equal(advance("slack-listen", "ended"), "end")
  assert.equal(advance("end", "click"), "claude-open")
  assert.equal(advance("end", "timer"), "end")
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
