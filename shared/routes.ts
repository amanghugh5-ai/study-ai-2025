import { z } from 'zod';
import { insertHistorySchema, history, generateRequestSchema } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  limitExceeded: z.object({
    message: z.string(),
  }),
};

export const api = {
  ai: {
    generate: {
      method: 'POST' as const,
      path: '/api/generate',
      input: generateRequestSchema,
      responses: {
        200: z.object({
          result: z.string(),
          remaining: z.number(),
        }),
        400: errorSchemas.validation,
        429: errorSchemas.limitExceeded,
      },
    },
  },
  history: {
    list: {
      method: 'GET' as const,
      path: '/api/history',
      responses: {
        200: z.array(z.custom<typeof history.$inferSelect>()),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
