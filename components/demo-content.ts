// The desk demo under the hero: five texts, the ordered phases, and how
// each phase ends. Kept apart from the component so the TTS command and
// the test can read it. `backticks` render as inline code and are stripped
// for the voice.

export const PLAN =
  "Migrate session handling from JWT cookies to server-side sessions in Redis. `auth/middleware.ts` loads the user once per request. Old tokens stay valid for 24 hours during the rollout."

export const PR_BODY =
  "This PR replaces the JWT cookie flow with server-side sessions. Verifying and refreshing tokens on every request meant two round trips on a cold tab and a race between tabs. Sessions now live in Redis with a 30-day sliding TTL, and the refresh endpoint is gone."

export const PR_SUMMARY =
  "Done: JWT cookies replaced by Redis sessions, refresh endpoint removed. Changed: `auth/middleware.ts`, login and logout routes, one migration. Left to decide: the 30-day TTL."

export const SLACK_FR =
  "Salut, j'ai relu la PR des sessions. Le middleware est propre, mais le TTL de 30 jours me gêne : pour les admins on avait dit 7 jours max. Tu confirmes avant que je merge ?"

export const SLACK_EN =
  "Hi, I reviewed the sessions PR. The middleware is clean, but the 30-day TTL bothers me: for admins we said 7 days max. Can you confirm before I merge?"

export const spoken = (text: string) => text.replaceAll("`", "")

export const PHASES = [
  "rest",
  "claude-open",
  "claude-stream",
  "claude-select",
  "claude-shortcut",
  "claude-read",
  "pr-open",
  "pr-shortcut",
  "pr-summarize",
  "pr-replace",
  "slack-open",
  "slack-shortcut",
  "slack-translate",
  "slack-listen",
  "end",
] as const
export type Phase = (typeof PHASES)[number]

const words = (s: string) => s.split(" ").length

// Milliseconds between ticks while a phase streams (28) or sweeps (22).
export const TICK: Partial<Record<Phase, number>> = {
  "claude-stream": 28,
  "claude-select": 22,
  "pr-open": 22,
  "pr-summarize": 28,
  "slack-open": 22,
  "slack-translate": 28,
}

// How a phase ends: after N ms, when its audio ends, or on a click.
export const ENDS: Record<Phase, number | "audio" | "click"> = {
  rest: "click",
  "claude-open": 500,
  "claude-stream": words(PLAN) * 28 + 400,
  "claude-select": words(PLAN) * 22 + 500,
  "claude-shortcut": 700,
  "claude-read": "audio",
  "pr-open": words(PR_BODY) * 22 + 900,
  "pr-shortcut": 700,
  "pr-summarize": words(PR_SUMMARY) * 28 + 800,
  "pr-replace": 900,
  "slack-open": words(SLACK_FR) * 22 + 900,
  "slack-shortcut": 700,
  "slack-translate": words(SLACK_EN) * 28 + 800,
  "slack-listen": "audio",
  end: "click",
}

export function advance(
  phase: Phase,
  event: "click" | "timer" | "ended"
): Phase {
  const end = ENDS[phase]
  const ok =
    end === "click"
      ? event === "click"
      : end === "audio"
        ? event === "ended"
        : event === "timer"
  if (!ok) return phase
  return phase === "end" ? "claude-open" : PHASES[PHASES.indexOf(phase) + 1]
}
