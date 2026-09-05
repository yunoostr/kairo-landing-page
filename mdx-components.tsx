import type { MDXComponents } from "mdx/types"

// ponytail: legal pages only need these tags; add more when a page uses them
export function useMDXComponents(): MDXComponents {
  return {
    h1: (p) => (
      <h1
        className="mb-2 text-3xl font-semibold tracking-tight text-foreground"
        {...p}
      />
    ),
    h2: (p) => (
      <h2
        className="mt-10 mb-3 text-lg font-medium tracking-tight text-foreground"
        {...p}
      />
    ),
    h3: (p) => (
      <h3 className="mt-8 mb-2 text-base font-medium text-foreground" {...p} />
    ),
    p: (p) => (
      <p className="my-4 leading-relaxed text-muted-foreground" {...p} />
    ),
    ul: (p) => (
      <ul
        className="my-4 list-disc space-y-1.5 pl-5 text-muted-foreground marker:text-muted-foreground/50"
        {...p}
      />
    ),
    ol: (p) => (
      <ol
        className="my-4 list-decimal space-y-1.5 pl-5 text-muted-foreground"
        {...p}
      />
    ),
    li: (p) => <li className="leading-relaxed" {...p} />,
    a: (p) => (
      <a
        className="text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
        {...p}
      />
    ),
    strong: (p) => <strong className="font-medium text-foreground" {...p} />,
    em: (p) => (
      <em
        className="font-mono text-xs text-muted-foreground not-italic"
        {...p}
      />
    ),
  }
}
