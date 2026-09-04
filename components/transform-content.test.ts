// Run: node --test components/transform-content.test.ts
import assert from "node:assert/strict"
import { test } from "node:test"

import {
  RESULTS,
  SOURCE,
  plainText,
  spokenWords,
  tokenize,
} from "./transform-content.ts"

test("inline code stays one token and punctuation glues to it", () => {
  const t = tokenize([{ kind: "p", text: "for `Promise<User | null>`. It" }])
  assert.deepEqual(
    t.map((x) => [x.text, x.code, x.glue]),
    [
      ["for", false, false],
      ["Promise<User | null>", true, false],
      [".", false, true],
      ["It", false, false],
    ]
  )
})

test("labels are bold, pre blocks are unspoken", () => {
  const t = tokenize([
    { kind: "li", label: "Done -", text: "x" },
    { kind: "pre", text: "code" },
  ])
  assert.deepEqual(
    t.map((x) => [x.bold, x.spoken]),
    [
      [true, 0],
      [true, 1],
      [false, 2],
      [false, -1],
    ]
  )
})

test("spoken words and plain text drop markup", () => {
  assert.equal(spokenWords(SOURCE).length, 100)
  for (const r of Object.values(RESULTS)) assert.ok(!plainText(r).includes("`"))
})
