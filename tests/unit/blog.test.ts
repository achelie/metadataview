import { describe, expect, it } from 'vitest';
import type { BlogPost } from '../../src/lib/blog';
import { BLOG_PAGE_SIZE, blogPath, formatBlogDate, getFeaturedPost, getReadingTime, sortBlogPosts } from '../../src/lib/blog';

function post(id: string, publishedAt: string, featured = false): BlogPost {
  return {
    id,
    body: '',
    collection: 'blog',
    data: { publishedAt: new Date(publishedAt), featured },
  } as unknown as BlogPost;
}

describe('blog helpers', () => {
  it('orders posts newest first without mutating the input', () => {
    const posts = [post('older', '2026-01-02'), post('newer', '2026-08-09')];
    expect(sortBlogPosts(posts).map((item) => item.id)).toEqual(['newer', 'older']);
    expect(posts.map((item) => item.id)).toEqual(['older', 'newer']);
  });

  it('selects the featured post even when it is not newest and falls back safely', () => {
    expect(getFeaturedPost([post('featured', '2026-01-02', true), post('newer', '2026-08-09')])?.id).toBe('featured');
    expect(getFeaturedPost([post('older', '2026-01-02'), post('newer', '2026-08-09')])?.id).toBe('newer');
    expect(getFeaturedPost([])).toBeUndefined();
  });

  it('computes stable human reading time from markdown text', () => {
    const words = Array.from({ length: 450 }, () => 'metadata').join(' ');
    expect(getReadingTime(words)).toBe(2);
    expect(getReadingTime('[Check the final file](/image-metadata-viewer/)')).toBe(1);
    expect(getReadingTime('')).toBe(1);
  });

  it('keeps canonical dates, paths, and six-post pagination', () => {
    expect(BLOG_PAGE_SIZE).toBe(6);
    expect(blogPath(post('do-screenshots-have-metadata', '2026-08-09'))).toBe('/blog/do-screenshots-have-metadata/');
    expect(formatBlogDate(new Date('2026-08-09T23:59:59-07:00'))).toBe('Aug 10, 2026');
  });
});
