import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdoc}' }),
  schema: ({ image }) => z.object({
    title: z.string().min(20),
    description: z.string().min(80).max(180),
    excerpt: z.string().min(80).max(260),
    category: z.string().min(2),
    tags: z.array(z.string()).min(1),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    featured: z.boolean().default(false),
    author: z.string().default('MetadataView Editorial Team'),
    reviewedBy: z.string().default('MetadataView product engineering'),
    cover: image(),
    coverAlt: z.string().min(20),
    practicalTake: z.array(z.string().min(20)).min(3).max(6),
    faqs: z.array(z.object({
      question: z.string().min(10),
      answer: z.string().min(30),
    })).min(3).max(8),
    related: z.array(z.string()).default([]),
  }),
});

export const collections = { blog };
