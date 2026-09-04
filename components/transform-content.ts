// One real Claude Code answer and the three Kairo results shown on the
// landing page. Kept apart from the component so the TTS script can read it.

export type Block = {
  kind: "p" | "h" | "li" | "pre"
  label?: string
  text: string // `backticks` render as inline code
}

export type Action = "humanize" | "translate" | "summarize"

export const ACTIONS: { key: Action; name: string }[] = [
  { key: "humanize", name: "Humanize" },
  { key: "translate", name: "Translate" },
  { key: "summarize", name: "Summarize" },
]

export const SOURCE: Block[] = [
  {
    kind: "p",
    text: "I've completed the implementation of the retry logic for the `fetchUser` function. Here's a summary of the changes I made:",
  },
  { kind: "h", text: "Changes" },
  {
    kind: "li",
    label: "Added exponential backoff:",
    text: "The function now retries up to 3 times with delays of 200ms, 400ms and 800ms between attempts.",
  },
  {
    kind: "li",
    label: "Error handling:",
    text: "Wrapped the network call in a try/catch block so that network errors are caught and logged instead of propagating.",
  },
  {
    kind: "li",
    label: "Type safety:",
    text: "Updated the return type to `Promise<User | null>` so callers handle the failure case explicitly.",
  },
  {
    kind: "pre",
    text: "export async function fetchUser(id: string): Promise<User | null> {\n  for (let attempt = 0; attempt < 3; attempt++) { ... }\n}",
  },
  {
    kind: "p",
    text: "Let me know if you'd like me to add unit tests for this, or if there's anything else you'd like me to adjust!",
  },
]

export const RESULTS: Record<Action, Block[]> = {
  humanize: [
    {
      kind: "p",
      text: "Retry logic is in for `fetchUser`. It retries three times with backoff at 200, 400 and 800 ms. Network errors are caught and logged instead of thrown, and the return type is now `Promise<User | null>` so callers deal with the failure case. There's a short loop over the attempts. No tests yet.",
    },
  ],
  translate: [
    {
      kind: "p",
      text: "J'ai terminé l'implémentation de la logique de retry pour la fonction `fetchUser`. Voici un résumé des changements :",
    },
    { kind: "h", text: "Changements" },
    {
      kind: "li",
      label: "Backoff exponentiel :",
      text: "la fonction réessaie jusqu'à 3 fois avec des délais de 200 ms, 400 ms et 800 ms entre les tentatives.",
    },
    {
      kind: "li",
      label: "Gestion des erreurs :",
      text: "l'appel réseau est enveloppé dans un try/catch, les erreurs sont capturées et journalisées au lieu de remonter.",
    },
    {
      kind: "li",
      label: "Typage :",
      text: "le type de retour devient `Promise<User | null>` pour que l'appelant gère explicitement l'échec.",
    },
    {
      kind: "pre",
      text: "export async function fetchUser(id: string): Promise<User | null> {\n  for (let attempt = 0; attempt < 3; attempt++) { ... }\n}",
    },
    {
      kind: "p",
      text: "Dis-moi si tu veux que j'ajoute des tests unitaires ou autre chose à ajuster.",
    },
  ],
  summarize: [
    {
      kind: "p",
      label: "Done -",
      text: "`fetchUser` retries 3× with backoff, errors are caught and logged, return type is `Promise<User | null>`.",
    },
    {
      kind: "p",
      label: "Changed -",
      text: "the `fetchUser` function body and signature.",
    },
    { kind: "p", label: "To decide -", text: "whether to add unit tests." },
  ],
}

export type Token = {
  text: string
  code: boolean
  bold: boolean
  glue: boolean // no space before this token, e.g. the "." after `fetchUser`
  block: number
  spoken: number // index among spoken words, -1 for code blocks
}

// Flattens blocks into words. A `pre` block is a single unspoken token and
// an inline `code` run is a single token, so `Promise<User | null>` stays whole.
export function tokenize(blocks: Block[]): Token[] {
  const out: Token[] = []
  let spoken = 0
  blocks.forEach((b, block) => {
    if (b.kind === "pre") {
      out.push({
        text: b.text,
        code: true,
        bold: false,
        glue: false,
        block,
        spoken: -1,
      })
      return
    }
    let spaceBefore = true
    const push = (src: string, bold: boolean) => {
      for (const run of src.match(/`[^`]*`|[^`]+/g) ?? []) {
        const code = run.startsWith("`")
        const words = code ? [run.slice(1, -1)] : run.trim().split(/\s+/)
        let glue = !spaceBefore && !/^\s/.test(run)
        for (const text of words) {
          if (text)
            out.push({ text, code, bold, glue, block, spoken: spoken++ })
          glue = false
        }
        spaceBefore = /\s$/.test(run)
      }
      spaceBefore = true
    }
    if (b.label) push(b.label, true)
    push(b.text, false)
  })
  return out
}

export const spokenWords = (blocks: Block[]) =>
  tokenize(blocks)
    .filter((t) => t.spoken >= 0)
    .map((t) => t.text)

export const plainText = (blocks: Block[]) =>
  blocks
    .map((b) => ((b.label ? b.label + " " : "") + b.text).replace(/`/g, ""))
    .join("\n\n")
