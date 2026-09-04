// The desk demo under the hero: five texts, the ordered phases, and how
// each phase ends. Kept apart from the component so the TTS command and
// the test can read it. `backticks` render as inline code and are stripped
// for the voice.

export const PLAN =
  "Migrate session handling from JWT cookies to server-side sessions stored in Redis. The refresh endpoint goes away. `auth/middleware.ts` reads the session id from the cookie and loads the user once per request. Existing tokens stay valid for 24 hours so nobody gets logged out during the rollout."

export const PR_BODY =
  "This PR replaces the JWT cookie flow with server-side sessions. Every request used to verify a signed token and, when it was close to expiry, call the refresh endpoint to mint a new pair, which meant two round trips on a cold tab and a race when two tabs refreshed at once. Sessions now live in Redis with a 30-day sliding TTL, the middleware loads the user once per request, and the refresh endpoint is deleted. Old tokens are accepted for 24 hours after deploy so nobody is logged out."

export const PR_SUMMARY =
  "Done: JWT cookies replaced by Redis sessions, refresh endpoint removed. Changed: `auth/middleware.ts`, the session store, login and logout routes, one migration. Left to decide: the 30-day TTL, and whether to keep the 24-hour token grace after the first deploy."

export const SLACK_FR =
  "Salut, j'ai relu la PR des sessions ce matin. Le middleware me paraît propre, mais je ne suis pas sûr du TTL de 30 jours : pour les comptes admin on avait dit 7 jours max. Tu peux confirmer avant que je valide ? Sinon je merge cet après-midi."

export const SLACK_EN =
  "Hi, I reviewed the sessions PR this morning. The middleware looks clean, but I'm not sure about the 30-day TTL: for admin accounts we said 7 days max. Can you confirm before I approve? Otherwise I'll merge this afternoon."

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
