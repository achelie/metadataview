import type { CollectionEntry } from 'astro:content';

export const BLOG_PAGE_SIZE = 6;
export type BlogPost = CollectionEntry<'blog'>;

export interface BlogPagination {
  featured?: BlogPost;
  pages: BlogPost[][];
  pageCount: number;
}

export function sortBlogPosts(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((left, right) => right.data.publishedAt.getTime() - left.data.publishedAt.getTime());
}

export function getFeaturedPost(posts: BlogPost[]): BlogPost | undefined {
  return sortBlogPosts(posts).find((post) => post.data.featured) ?? sortBlogPosts(posts)[0];
}

export function paginateBlogPosts(posts: BlogPost[]): BlogPagination {
  const sorted = sortBlogPosts(posts);
  const featured = getFeaturedPost(sorted);
  const latest = sorted.filter((post) => post.id !== featured?.id);
  const pages = Array.from(
    { length: Math.max(1, Math.ceil(latest.length / BLOG_PAGE_SIZE)) },
    (_, index) => latest.slice(index * BLOG_PAGE_SIZE, (index + 1) * BLOG_PAGE_SIZE),
  );
  return { featured, pages, pageCount: pages.length };
}

export function blogPagePath(page: number): string {
  return page === 1 ? '/blog/' : `/blog/page/${page}/`;
}

export function resolveRelatedPosts(post: BlogPost, posts: BlogPost[]): BlogPost[] {
  if (post.data.related.length !== 3) {
    throw new Error(`Blog post "${post.id}" must define exactly three Keep reading articles.`);
  }
  if (new Set(post.data.related).size !== post.data.related.length) {
    throw new Error(`Blog post "${post.id}" contains duplicate Keep reading articles.`);
  }
  if (post.data.related.includes(post.id)) {
    throw new Error(`Blog post "${post.id}" cannot recommend itself.`);
  }

  const postsById = new Map(posts.map((candidate) => [candidate.id, candidate]));
  return post.data.related.map((relatedId) => {
    const relatedPost = postsById.get(relatedId);
    if (!relatedPost) {
      throw new Error(`Blog post "${post.id}" recommends missing article "${relatedId}".`);
    }
    return relatedPost;
  });
}

export function validateBlogRelationships(posts: BlogPost[]): void {
  posts.forEach((post) => resolveRelatedPosts(post, posts));
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
