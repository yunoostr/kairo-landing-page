// Run: node --test lib/compare.test.ts
import assert from "node:assert/strict"
import { test } from "node:test"

import { CRITERIA, LATEST_CHECK, PRODUCTS, pick } from "./compare.ts"

const BANNED = /\b(best|better|worse|slow|bad|robotic)\b/i

test("every product has every criterion, a valid check date and a sourced price", () => {
  assert.ok(PRODUCTS.length >= 4)
  for (const p of PRODUCTS) {
    assert.ok(!Number.isNaN(Date.parse(p.checked)), `${p.name}: checked`)
    for (const c of CRITERIA) {
      const cell = p.facts[c.key]
      assert.ok(cell?.value, `${p.name}: ${c.key} missing`)
      assert.ok(
        !BANNED.test(cell.value),
        `${p.name}: ${c.key} uses a banned word`
      )
    }
    assert.ok(
      p.facts.pricing.source?.startsWith("https://"),
      `${p.name}: pricing source`
    )
  }
})

test("kairo is first and pick keeps the requested order", () => {
  assert.equal(PRODUCTS[0].slug, "kairo")
  assert.deepEqual(
    pick("speechify", "kairo").map((p) => p.slug),
    ["speechify", "kairo"]
  )
  assert.throws(() => pick("nope"))
})

test("latest check is the newest product date", () => {
  const max = PRODUCTS.map((p) => p.checked)
    .sort()
    .at(-1)
  assert.equal(LATEST_CHECK, max)
})
