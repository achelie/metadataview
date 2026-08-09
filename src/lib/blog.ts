import type { CollectionEntry } from 'astro:content';

export const BLOG_PAGE_SIZE = 6;
export type BlogPost = CollectionEntry<'blog'>;

export function sortBlogPosts(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((left, right) => right.data.publishedAt.getTime() - left.data.publishedAt.getTime());
}

export function getFeaturedPost(posts: BlogPost[]): BlogPost | undefined {
  return sortBlogPosts(posts).find((post) => post.data.featured) ?? sortBlogPosts(posts)[0];
}

export function getReadingTime(body = ''): number {
  const text = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/[#>*_`|~-]/g, ' ');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 225));
}

export function formatBlogDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(date);
}

export function blogPath(post: BlogPost): string {
  return `/blog/${post.id}/`;
}
