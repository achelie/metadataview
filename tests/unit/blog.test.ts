import { describe, expect, it } from 'vitest';
import type { BlogPost } from '../../src/lib/blog';
import {
  BLOG_PAGE_SIZE,
  blogPagePath,
  blogPath,
  formatBlogDate,
  getFeaturedPost,
  getReadingTime,
  paginateBlogPosts,
  resolveRelatedPosts,
  sortBlogPosts,
  validateBlogRelationships,
} from '../../src/lib/blog';

function post(id: string, publishedAt: string, featured = false, related: string[] = []): BlogPost {
  return {
    id,
    body: '',
    collection: 'blog',
    data: { publishedAt: new Date(publishedAt), featured, related },
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
    expect(blogPagePath(1)).toBe('/blog/');
    expect(blogPagePath(3)).toBe('/blog/page/3/');
    expect(formatBlogDate(new Date('2026-08-09T23:59:59-07:00'))).toBe('Aug 10, 2026');
  });

  it('keeps the featured guide separate and moves the seventh regular post to page two', () => {
    const firstPagePosts = [
      post('featured', '2026-01-01', true),
      ...Array.from({ length: 6 }, (_, index) => post(`post-${index + 1}`, `2026-08-${String(index + 1).padStart(2, '0')}`)),
    ];
    const firstPage = paginateBlogPosts(firstPagePosts);
    expect(firstPage.featured?.id).toBe('featured');
    expect(firstPage.pageCount).toBe(1);
    expect(firstPage.pages[0]).toHaveLength(6);

    const result = paginateBlogPosts([...firstPagePosts, post('post-7', '2026-08-07')]);
    expect(result.featured?.id).toBe('featured');
    expect(result.pageCount).toBe(2);
    expect(result.pages[0]).toHaveLength(6);
    expect(result.pages[1]!.map((item) => item.id)).toEqual(['post-1']);
    expect(result.pages.flat().map((item) => item.id)).toEqual([
      'post-7', 'post-6', 'post-5', 'post-4', 'post-3', 'post-2', 'post-1',
    ]);
  });

  it('keeps three manually selected related posts in their editorial order', () => {
    const posts = [
      post('current', '2026-08-10', false, ['third', 'first', 'second']),
      post('first', '2026-08-09', false, ['current', 'second', 'third']),
      post('second', '2026-08-08', false, ['first', 'current', 'third']),
      post('third', '2026-08-07', false, ['second', 'first', 'current']),
    ];
    expect(resolveRelatedPosts(posts[0]!, posts).map((item) => item.id)).toEqual(['third', 'first', 'second']);
    expect(() => validateBlogRelationships(posts)).not.toThrow();
  });

  it('rejects incomplete, duplicate, self-referencing, and missing related posts', () => {
    const candidates = [post('one', '2026-08-09'), post('two', '2026-08-08'), post('three', '2026-08-07')];
    expect(() => resolveRelatedPosts(post('current', '2026-08-10', false, ['one']), candidates)).toThrow(/exactly three/);
    expect(() => resolveRelatedPosts(post('current', '2026-08-10', false, ['one', 'one', 'two']), candidates)).toThrow(/duplicate/);
    expect(() => resolveRelatedPosts(post('current', '2026-08-10', false, ['current', 'one', 'two']), candidates)).toThrow(/recommend itself/);
    expect(() => resolveRelatedPosts(post('current', '2026-08-10', false, ['one', 'two', 'missing']), candidates)).toThrow(/missing article/);
  });
});
