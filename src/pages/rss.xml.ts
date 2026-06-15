import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { AUTHOR } from '../data/author';

export async function GET(context: { site: URL }) {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
  return rss({
    title: `${AUTHOR.name} — Blog`,
    description: AUTHOR.description,
    site: context.site,
    items: posts.map(post => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blog/${post.id}/`,
      author: AUTHOR.name,
    })),
  });
}
