import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export const metadata = { title: "Changelog - Kairo" }

const REPO = "https://github.com/nathanrenard3/kairo-releases"

type Release = {
  id: number
  name: string
  tag_name: string
  published_at: string
  draft: boolean
  prerelease: boolean
  body_html: string
}

// GitHub renders the markdown for us (`html+json`), so no markdown parser.
// Anonymous quota is 60 req/h; the hourly cache keeps us far under it.
async function getReleases(): Promise<Release[] | null> {
  const res = await fetch(
    `https://api.github.com/repos/nathanrenard3/kairo-releases/releases?per_page=50`,
    {
      headers: { Accept: "application/vnd.github.html+json" },
      next: { revalidate: 3600 },
    }
  )
  if (!res.ok) return null
  const all: Release[] = await res.json()
  return all.filter((r) => !r.draft && !r.prerelease)
}

const fmt = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
})

// Same look as mdx-components.tsx, applied to GitHub's HTML via descendant selectors.
const PROSE =
  "[&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-medium [&_h2]:tracking-tight [&_h2]:text-foreground " +
  "[&_p]:my-4 [&_p]:leading-relaxed [&_p]:text-muted-foreground " +
  "[&_ul]:my-4 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_ul]:text-muted-foreground [&_ul]:marker:text-muted-foreground/50 " +
  "[&_ol]:my-4 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5 [&_ol]:text-muted-foreground " +
  "[&_li]:leading-relaxed " +
  "[&_a]:text-foreground [&_a]:underline [&_a]:decoration-border [&_a]:underline-offset-4 [&_a:hover]:decoration-foreground " +
  "[&_strong]:font-medium [&_strong]:text-foreground " +
  "[&_code]:font-mono [&_code]:text-[0.9em] [&_code]:text-foreground"

export default async function Changelog() {
  const releases = await getReleases()

  return (
    <>
      <h1 className="mb-2 text-3xl font-semibold tracking-tight text-foreground">
        Changelog
      </h1>
      <p className="mb-14 font-mono text-xs text-muted-foreground">
        Every Kairo release, from{" "}
        <a
          href={`${REPO}/releases`}
          className="underline decoration-border underline-offset-4 hover:decoration-foreground"
        >
          GitHub Releases
        </a>
        . Kairo updates itself from the sidebar.
      </p>

      {releases === null ? (
        <p className="leading-relaxed text-muted-foreground">
          Couldn&apos;t load the releases right now.{" "}
          <a
            href={`${REPO}/releases`}
            className="text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
          >
            Read them on GitHub
          </a>
          .
        </p>
      ) : (
        releases.map((r, i) => (
          <section key={r.id}>
            {i > 0 && <Separator className="my-14" />}
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <h2 className="flex items-center gap-2.5 text-[22px] font-semibold tracking-tight text-foreground">
                {r.name || r.tag_name}
                {i === 0 && <Badge>latest</Badge>}
              </h2>
              <div className="flex gap-3.5 font-mono text-xs text-muted-foreground tabular-nums">
                <span className="opacity-60">{r.tag_name}</span>
                <time dateTime={r.published_at}>
                  {fmt.format(new Date(r.published_at))}
                </time>
              </div>
            </div>
            <div
              className={PROSE}
              // GitHub sanitizes body_html, and it's our own repo.
              dangerouslySetInnerHTML={{ __html: r.body_html }}
            />
          </section>
        ))
      )}
    </>
  )
}
