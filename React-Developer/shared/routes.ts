import { z } from "zod";
import { users, insertElogioSchema, insertUserSchema } from "./schema";

// =======================
// Tipos normalizados
// =======================
const elogioNormalizadoSchema = z.object({
  id: z.number(),
  type: z.enum(["interno", "motoristas"]),
  motorista: z.string(),
  cidade: z.string().nullable().optional(),
  estado: z.string().nullable().optional(),
  descricao: z.string(),
  data: z.any().nullable(), // no JSON vem string/Date/null
  pontos: z.number(),
});

const paginatedElogiosSchema = z.object({
  data: z.array(elogioNormalizadoSchema),
  total: z.number(),
  page: z.number(),
  totalPages: z.number(),
});

export const api = {


  
  
  // =======================
  // ELOGIOS / DASHBOARD
  // =======================
  elogios: {
    list: {
      method: "GET" as const,
      path: "/api/elogios",
      input: z
        .object({
          motorista: z.string().optional(),
          cidade: z.string().optional(),
          page: z.string().optional(),
          limit: z.string().optional(),
        })
        .optional(),
      responses: {
        // backend retorna separado
        200: z.object({
          internos: paginatedElogiosSchema,
          motoristas: paginatedElogiosSchema,
        }),
      },
    },

    stats: {
      method: "GET" as const,
      path: "/api/elogios/stats",
      responses: {
        200: z.object({
          totalPoints: z.number(),
          byCategory: z.object({
            interno: z.number(),
            gestao: z.number(),
            externo: z.number(),
          }),
          topDrivers: z.array(
            z.object({
              motorista: z.string(),
              totalPoints: z.number(),
              count: z.number(),
            })
          ),
        }),
      },
    },

    /**
     * CREATE: desativado por enquanto porque DW é leitura.
     * Se você quiser cadastrar via app, criamos tabela elogios_app e ativamos.
     */
    // create: {
    //   method: "POST" as const,
    //   path: "/api/elogios",
    //   input: insertElogioSchema,
    //   responses: {
    //     201: elogioNormalizadoSchema,
    //     400: z.object({ message: z.string() }),
    //   },
    // },

    export: {
      method: "GET" as const,
      path: "/api/elogios/export",
      input: z
        .object({
          motorista: z.string().optional(),
          cidade: z.string().optional(),
        })
        .optional(),
      responses: {
        // backend retorna { internos: [], motoristas: [] }
        200: z.object({
          internos: z.array(elogioNormalizadoSchema),
          motoristas: z.array(elogioNormalizadoSchema),
        }),
      },
    },
  },

  // =======================
  // ADMIN / USERS
  // =======================
  users: {
    list: {
      method: "GET" as const,
      path: "/api/users",
      responses: {
        200: z.array(z.custom<typeof users.$inferSelect>()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/users",
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: z.object({ message: z.string() }),
      },
    },
    update: {
      method: "PATCH" as const,
      path: "/api/users/:id",
      input: insertUserSchema.partial(),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        404: z.object({ message: z.string() }),
      },
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/users/:id",
      responses: {
        204: z.void(),
      },
    },
  },


// =======================
// AUTH
// =======================
auth: {
  login: {
    method: "POST" as const,
    path: "/api/auth/login",
    input: z.object({
      username: z.string().min(1),
      password: z.string().min(1),
    }),
    responses: {
      200: z.object({
        token: z.string(),
        user: z.object({
          username: z.string(),
          role: z.enum(["admin", "gestor"]),
        }),
      }),
      401: z.object({ message: z.string() }),
      400: z.object({ message: z.string() }),
    },
  },

  me: {
    method: "GET" as const,
    path: "/api/auth/me",
    responses: {
      200: z.object({
        user: z.object({
          username: z.string().optional(),
          role: z.enum(["admin", "gestor"]),
        }),
      }),
      401: z.object({ message: z.string() }),
    },
  },

  logout: {
    method: "POST" as const,
    path: "/api/auth/logout",
    responses: {
      200: z.object({ success: z.boolean() }),
    },
  },
},


  // =======================
  // SETTINGS (WEIGHTS)
  // =======================
  settings: {
    getWeights: {
      method: "GET" as const,
      path: "/api/settings/weights",
      responses: {
        200: z.object({
          interno: z.number(),
          gestao: z.number(),
          externo: z.number(),
        }),
      },
    },
    updateWeights: {
      method: "PUT" as const,
      path: "/api/settings/weights",
      input: z.object({
        interno: z.number(),
        gestao: z.number(),
        externo: z.number(),
      }),
      responses: {
        200: z.object({ success: z.boolean() }),
      },
    },
  },
};

export function buildUrl(
  path: string,
  params?: Record<string, string | number>
): string {
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


