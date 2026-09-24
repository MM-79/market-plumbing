# Archive

Superseded artefacts, kept only so a claim about what v1 did can be checked
rather than taken on trust.

- `workspace.tar.gz` — the v2.7.1 sandbox snapshot as it was received on
  2026-09-24, before the restructure.

The v1 source itself is preserved in git history: the v3.0 restructure moved
`workspace/*` to `app/*` as renames, so `git log --follow` on any file reaches
back through it.

The stale `dist/` build output that shipped alongside v1 was deleted rather than
archived. It was regenerable from source, it predated the source it was built
from, and a committed build artefact that disagrees with `src/` is worse than
no artefact at all.
