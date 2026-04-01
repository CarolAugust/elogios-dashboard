import { sql } from "drizzle-orm";
import {
  mysqlTable,
  int,
  varchar,
  text,
  datetime,
  decimal,
  json,
  boolean,
} from "drizzle-orm/mysql-core";
import { z } from "zod";

// =======================================================
// TABELAS DO APP (criadas no `dw-superbi`)
// =======================================================

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 50 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("votante"),
  isManager: boolean("isManager").notNull().default(false),
  created_at: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: datetime("updated_at"),
});

export const settings = mysqlTable("settings", {
  key: varchar("key", { length: 50 }).primaryKey(),
  value: json("value").notNull(),
  updated_at: datetime("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// =======================================================
// TABELAS DO DW (já existentes no banco)
// =======================================================

export const elogios_motoristas = mysqlTable("elogios_motoristas", {
  id: int("id").autoincrement().primaryKey(),
  data_hora: datetime("data_hora"),

  // ✅ quem elogiou (avaliador)
  nome: varchar("nome", { length: 100 }).notNull(),

  // ✅ quem foi elogiado (motorista elogiado)
  // (esse é o campo que você quer mostrar no dashboard)
  nome_motorista: varchar("nome_motorista", { length: 255 }),

  carreta: varchar("carreta", { length: 50 }).notNull(),
  telefone: varchar("telefone", { length: 20 }).notNull(),
  elogio: text("elogio").notNull(),

  latitude: decimal("latitude", { precision: 10, scale: 6 }),
  longitude: decimal("longitude", { precision: 10, scale: 6 }),
  maps_link: varchar("maps_link", { length: 255 }),
  user_agent: varchar("user_agent", { length: 255 }),

  cidade: varchar("cidade", { length: 100 }),
  estado: varchar("estado", { length: 100 }),
  token_avaliador: varchar("token_avaliador", { length: 36 }),
  data_registro: datetime("data_registro"),

  tipo: varchar("tipo", { length: 20 }),
  pontos: int("pontos"),
});

export const elogios_internos = mysqlTable("elogios_internos", {
  id: int("id").autoincrement().primaryKey(),
  matricula: varchar("matricula", { length: 20 }).notNull(),
  elogio: text("elogio").notNull(),
  motorista: varchar("motorista", { length: 255 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  maps_link: varchar("maps_link", { length: 255 }),
  data_hora: datetime("data_hora").notNull().default(sql`CURRENT_TIMESTAMP`),
  telefone: varchar("telefone", { length: 20 }),
  cidade: varchar("cidade", { length: 100 }),
  estado: varchar("estado", { length: 100 }),
  token_avaliador: varchar("token_avaliador", { length: 36 }),
  tipo: varchar("tipo", { length: 20 }),
  pontos: int("pontos"),
});

export const ocorrencias_motoristas = mysqlTable("ocorrencias_motoristas", {
  id: int("id").autoincrement().primaryKey(),
  data_hora: datetime("data_hora"),
  nome: varchar("nome", { length: 100 }).notNull(),
  carreta: varchar("carreta", { length: 50 }).notNull(),
  telefone: varchar("telefone", { length: 20 }).notNull(),
  tipo_ocorrencia: varchar("tipo_ocorrencia", { length: 100 }).notNull(),
  descricao: text("descricao").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 6 }),
  longitude: decimal("longitude", { precision: 10, scale: 6 }),
  maps_link: varchar("maps_link", { length: 255 }),
  user_agent: varchar("user_agent", { length: 255 }),
  cidade: varchar("cidade", { length: 100 }),
  estado: varchar("estado", { length: 100 }),
});

// =======================================================
// ZOD SCHEMAS (compatibilidade com front)
// =======================================================

export const insertUserSchema = z.object({
  username: z.string().min(3, "Usuário precisa ter pelo menos 3 caracteres"),
  password: z.string().min(6, "Senha precisa ter pelo menos 6 caracteres"),
  role: z.enum(["admin", "contabilizacao", "votante"]),
  isManager: z.boolean().default(false),
});

export const insertSettingsSchema = z.object({
  key: z.string().min(1),
  value: z.any(),
});

// O front espera esse export existir:
export const insertElogioSchema = z.object({
  type: z.enum(["interno", "motoristas"]).optional().default("motoristas"),
  motorista: z.string().min(1),
  cidade: z.string().optional().nullable(),
  estado: z.string().optional().nullable(),
  descricao: z.string().min(1),
});

// =======================================================
// TYPES
// =======================================================

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUserRequest = Partial<InsertUser>;

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingsSchema>;

export type InsertElogio = z.infer<typeof insertElogioSchema>;

// Dashboard / weights
export interface DashboardStats {
  totalPoints: number;
  byCategory: { interno: number; gestao: number; externo: number };
  topDrivers: { motorista: string; totalPoints: number; count: number }[];
}

export interface WeightsConfig {
  interno: number;
  gestao: number;
  externo: number;
}

// Aliases (camelCase) opcionais
export const elogiosMotoristas = elogios_motoristas;
export const elogiosInternos = elogios_internos;
export const ocorrenciasMotoristas = ocorrencias_motoristas;
