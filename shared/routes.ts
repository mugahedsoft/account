
import { z } from 'zod';
import { insertDailySalesSchema, insertExpenseSchema, insertPurchaseSchema, dailySales, expenses, purchases } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  dailySales: {
    list: {
      method: 'GET' as const,
      path: '/api/daily-sales',
      responses: {
        200: z.array(z.custom<typeof dailySales.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/daily-sales/:date',
      responses: {
        200: z.custom<typeof dailySales.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/daily-sales',
      input: insertDailySalesSchema,
      responses: {
        201: z.custom<typeof dailySales.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/daily-sales/:id',
      input: insertDailySalesSchema.partial(),
      responses: {
        200: z.custom<typeof dailySales.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  expenses: {
    list: {
      method: 'GET' as const,
      path: '/api/expenses',
      responses: {
        200: z.array(z.custom<typeof expenses.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/expenses',
      input: insertExpenseSchema,
      responses: {
        201: z.custom<typeof expenses.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/expenses/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  purchases: {
    list: {
      method: 'GET' as const,
      path: '/api/purchases',
      responses: {
        200: z.array(z.custom<typeof purchases.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/purchases',
      input: insertPurchaseSchema,
      responses: {
        201: z.custom<typeof purchases.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/purchases/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  reports: {
    get: {
      method: 'GET' as const,
      path: '/api/reports',
      input: z.object({
        startDate: z.string(),
        endDate: z.string(),
      }),
      responses: {
        200: z.object({
          totalSales: z.number(),
          totalExpenses: z.number(),
          netBankak: z.number(),
          netCash: z.number(),
          totalPurchases: z.number(),
          salesBreakdown: z.object({ bankak: z.number(), cash: z.number() }),
          expensesBreakdown: z.object({ bankak: z.number(), cash: z.number() }),
        }),
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
