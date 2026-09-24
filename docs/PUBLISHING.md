# Publishing to GitHub

Everything is in place; nothing has been pushed. This is the checklist.

---

## 1. Read this before you push

The repository will be public unless you make it private, and it contains
opinions about markets. Two things follow.

**The disclaimer is load-bearing.** Every page footer and the LICENSE both say
this is analytical framework, not investment advice. Do not remove either.
The trade expressions carry entry, target, stop and invalidation levels, which
makes them look like recommendations. They are illustrations of how the
scenarios would be expressed, and the file that holds them says so in its
header comment.

**The scheduled job runs under your account.** It polls FRED, the NY Fed,
Treasury Fiscal Data and TreasuryDirect once per weekday with a descriptive
User-Agent. That is well inside any reasonable use of those endpoints, but the
traffic is attributable to you, so keep the schedule as it is rather than
tightening it.

---

## 2. Create the repository and push

```bash
gh repo create market-plumbing --public --source=. --remote=origin --push
```

Or, without the `gh` CLI:

```bash
git remote add origin https://github.com/<you>/market-plumbing.git
git branch -M main
git push -u origin main
```

The branch must be `main` — both workflows key off it.

---

## 3. Enable Pages

`Settings → Pages → Build and deployment → Source: GitHub Actions`

Not "Deploy from a branch". The deploy workflow uploads a Pages artifact
directly; selecting branch deployment will serve the raw repository instead of
the build, and the page will not work.

The site lands at `https://<you>.github.io/market-plumbing/`. The asset base
path is set from the repository name automatically by `BASE_PATH` in
`deploy.yml`, so renaming the repository needs no code change.

---

## 4. Check Actions permissions

`Settings → Actions → General → Workflow permissions`
→ **Read and write permissions**

The refresh job commits the snapshot back to the repository. Without write
permission it will fetch successfully, fail at the commit step, and the page
will quietly keep serving the same data forever.

---

## 5. Verify the loop end to end

Do not wait for the cron. Trigger it by hand and watch the whole chain:

1. `Actions → Refresh market snapshot → Run workflow`.
2. It should finish with either a `data: snapshot YYYY-MM-DD (N series, 0
   failures)` commit, or "No change in the snapshot" if markets have not moved.
3. **Build and deploy** should start on its own straight afterwards. This is
   the step most likely to be missing: a push made by `GITHUB_TOKEN` does not
   trigger other workflows, which is why `deploy.yml` also listens for
   `workflow_run` on the refresh workflow. If the deploy does not fire, that
   trigger is what to check.
4. Open the site. The header should read **● LIVE**, and the Data Feed tab
   should show a generation timestamp from minutes ago.

If the header reads **● BUILD-TIME**, the page is serving the snapshot that was
bundled at build time because the published `data/snapshot.json` is not newer.
That is correct behaviour after a rebuild, not a fault.

---

## 6. Optional: a FRED API key

The fetcher works with no key by reading FRED's public CSV endpoint. Adding a
key switches it to the documented JSON API, which is politer and has clearer
rate limits.

`Settings → Secrets and variables → Actions → New repository secret`
Name: `FRED_API_KEY`. Free key from <https://fredaccount.stlouisfed.org/apikey>.

Nothing else changes; the two paths produce identical output. Never put the key
in a file — it is read from the environment only, and the client bundle never
sees it because the fetch happens at build/schedule time, not in the browser.

---

## 7. What to expect afterwards

- **One commit per weekday**, only when something moved. Quiet days produce no
  commit at all.
- **`app/public/data/history/` grows** by roughly 15KB per refresh, about 4MB a
  year. That directory is the framework's track record — it is what makes a
  "what changed" comparison possible later — so do not gitignore it. Prune it
  in a few years if it ever matters.
- **The self-check will start failing on the narrative clock.** By design. Ten
  days after the last narrative review it warns; at forty-five it fails. That is
  the framework telling you the numbers have moved on and the words have not.

---

## 8. Keeping it honest once it is live

The pipeline maintains the data. It cannot maintain the reasoning, and the gap
between those two is the whole risk of publishing something that refreshes
itself. When you re-reason the narrative:

1. Update `narrativeReviewedOn` in both `app/src/data/marketData.ts` and
   `app/src/data/scenarios.ts`.
2. Move the scenario probabilities and set `priorProbability` to what they were.
3. Re-read every layer steelman. If a steelman has become the base case, the
   signal should have flipped.
4. Check the seven manual fields on the Data Feed tab and re-enter them.
5. Append to `docs/CHANGELOG.md` — including what the previous run got wrong.
   That third item is the only one that improves the framework.

`docs/REFRESH_RUNBOOK.md` has the detail.
