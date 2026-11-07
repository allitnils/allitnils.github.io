# Scheduling blog posts

Posts publish themselves on their `pubDate`. Your computer does not need to be on.

## How to schedule a post

1. Add a file to `src/content/blog/`, e.g. `src/content/blog/my-post.md`:

   ```yaml
   ---
   title: "Full headline shown on the page"
   seoTitle: "Shorter title for search results (≤ 51 chars)"   # optional
   description: "One or two sentences, ideally 100–160 characters."
   pubDate: 2026-11-18          # the Melbourne date it should go live
   tags: [observability, grafana]
   category: observability       # optional
   ---
   ```

2. Commit and push to `main`.

The post stays hidden (no page, not in the blog list, RSS or sitemap) until a
build runs on or after its `pubDate` in Melbourne time.

## When builds run

- On every push to `main`
- **Tuesday and Thursday ~07:00 Melbourne** (06:00 during AEST), via the
  `schedule` trigger in `.github/workflows/deploy.yml`
- Manually: GitHub → Actions → *Deploy to GitHub Pages* → **Run workflow**
  (or `gh workflow run deploy.yml`)

So a post dated for a Tuesday or Thursday goes live that morning. A post dated
for any other day goes live at the next scheduled build or push after that date.

## Other controls

| Want to… | Do this |
|---|---|
| Hold a post back indefinitely | `draft: true` |
| Publish early | Change `pubDate` to today and push |
| Change the schedule | Edit the `cron` line in `deploy.yml` (times are UTC) |

## Things to know

- **The repo is public.** Scheduled posts can be read in the GitHub source
  before their publish date.
- **GitHub disables scheduled workflows after 60 days with no repository
  activity.** Pushing scheduled posts regularly keeps it active. If it does get
  disabled, GitHub → Actions → *Deploy to GitHub Pages* shows a banner with an
  **Enable workflow** button.
- Scheduled runs can start several minutes late at busy times.

The publish rule lives in `src/utils/posts.ts` (`isPublished`).
