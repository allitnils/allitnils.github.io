import type { CollectionEntry } from 'astro:content';

/** Publishing timezone: a post goes live on its pubDate in Melbourne, not UTC. */
const TZ = 'Australia/Melbourne';

/** Today's date in Melbourne as YYYY-MM-DD (evaluated at build time). */
export function todayInMelbourne(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(now);
}

/**
 * A post is public when it is not a draft and its pubDate (a calendar date,
 * e.g. `pubDate: 2026-11-18`) is today or earlier in Melbourne.
 * Future-dated posts are excluded from every page, RSS and the sitemap until
 * the scheduled rebuild on or after that date (see .github/workflows/deploy.yml).
 */
export function isPublished(post: CollectionEntry<'blog'>, today = todayInMelbourne()): boolean {
  if (post.data.draft) return false;
  return post.data.pubDate.toISOString().slice(0, 10) <= today;
}
