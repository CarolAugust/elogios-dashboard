import { Buffer } from "buffer";
import type { DashboardStats } from "@shared/schema";
import { db } from "./db";
import { sql, and, desc, eq, gte, lte } from "drizzle-orm";
import {
  elogios_motoristas,
  elogios_internos,
  users,
  settings,
  type InsertUser,
  type UpdateUserRequest,
  type WeightsConfig,
} from "@shared/schema";

// =======================
// Tipos locais
// =======================
type ElogioNormalizado = {
  id: number;
  type: "interno" | "motoristas";
  motorista: string; // ✅ no retorno, SEMPRE o elogiado
  cidade?: string | null;
  estado?: string | null;
  descricao: string;
  data: Date | string | null;
  pontos: number;
  carreta?: string | null;
};

type ElogiosFilters = {
  motorista?: string;
  cidade?: string;
  page?: number | string;
  limit?: number | string;
  start?: string;
  end?: string;
};

// ✅ helper: parse de data em horário local (evita UTC do "YYYY-MM-DD" / ISO)
function parseLocalDate(d?: string | null) {
  if (!d) return null;

  const only = String(d).slice(0, 10); // "YYYY-MM-DD"
  const [y, m, day] = only.split("-").map(Number);
  if (!y || !m || !day) return null;

  return new Date(y, m - 1, day, 0, 0, 0, 0);
}

export class DatabaseStorage {
  // -----------------------
  // USERS
  // -----------------------
  async getUsers() {
    return await db.select().from(users);
  }

  async getUserByUsername(username: string) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  // -----------------------
  // SETTINGS (weights)
  // -----------------------
  async getWeights(): Promise<WeightsConfig> {
    const [row] = await db.select().from(settings).where(eq(settings.key, "weights"));

    console.log("[getWeights] row existe?", !!row);
    console.log("[getWeights] row.value bruto:", row?.value);
    console.log("[getWeights] typeof row.value:", typeof (row as any)?.value);

    // ✅ default interno 2 (caso não exista row)
    if (!row) return { interno: 2, gestao: 2, externo: 2 };

    let raw: any = row.value;

    if (Buffer.isBuffer(raw)) raw = raw.toString("utf-8");

    console.log("[getWeights] raw before parse:", raw, "type:", typeof raw);

    if (typeof raw === "object" && raw !== null) {
      const parsedObj = {
        interno: Number((raw as any)?.interno ?? 1),
        gestao: Number((raw as any)?.gestao ?? 2),
        externo: Number((raw as any)?.externo ?? 2),
      };

      console.log("[getWeights] parsed (object):", parsedObj);
      return parsedObj;
    }

    if (typeof raw === "string") {
      try {
        raw = JSON.parse(raw);
      } catch {
        raw = {};
      }
    }

    const parsed = {
      interno: Number(raw?.interno ?? 1),
      gestao: Number(raw?.gestao ?? 2),
      externo: Number(raw?.externo ?? 2),
    };

    console.log("[getWeights] parsed:", parsed);
    return parsed;
  }

  async updateWeights(weights: WeightsConfig): Promise<void> {
    const valueObj = {
      interno: Number(weights.interno),
      gestao: Number(weights.gestao),
      externo: Number(weights.externo),
    };

    const value = JSON.stringify(valueObj);

    const [row] = await db.select().from(settings).where(eq(settings.key, "weights"));

    if (row) {
      await db.update(settings).set({ value }).where(eq(settings.key, "weights"));
    } else {
      await db.insert(settings).values({ key: "weights", value });
    }
  }

  // -----------------------
  // DASHBOARD STATS
  // -----------------------
  async getDashboardStats(filters?: { start?: string; end?: string }): Promise<DashboardStats> {
    const weights = await this.getWeights();

    const startDate = parseLocalDate(filters?.start);
    const endDate = parseLocalDate(filters?.end);

    if (endDate && !isNaN(endDate.getTime())) {
      endDate.setHours(23, 59, 59, 999);
    }

    const validStart = startDate && !isNaN(startDate.getTime()) ? startDate : null;
    const validEnd = endDate && !isNaN(endDate.getTime()) ? endDate : null;

    const condInternos: any[] = [];
    const condMotoristas: any[] = [];

    if (validStart) {
      condInternos.push(gte(elogios_internos.data_hora, validStart));
      condMotoristas.push(gte(elogios_motoristas.data_hora, validStart));
    }
    if (validEnd) {
      condInternos.push(lte(elogios_internos.data_hora, validEnd));
      condMotoristas.push(lte(elogios_motoristas.data_hora, validEnd));
    }

    const whereInternos = condInternos.length ? and(...condInternos) : undefined;
    const whereMotoristas = condMotoristas.length ? and(...condMotoristas) : undefined;

    const [internos, motoristas] = await Promise.all([
      db.select().from(elogios_internos).where(whereInternos),
      db.select().from(elogios_motoristas).where(whereMotoristas),
    ]);

    const stats: DashboardStats = {
      totalPoints: 0,
      byCategory: { interno: 0, gestao: 0, externo: 0 },
      topDrivers: [],
    };

    const driverPoints = new Map<string, number>();
    const driverCounts = new Map<string, number>();

    // ✅ internos: como schema não tem tipo/pontos, assume peso de "interno"
    for (const e of internos as any[]) {
      const motorista = (e.motorista ?? "Sem nome").trim();
      const pontos = Number(weights.interno);

      stats.totalPoints += pontos;
      stats.byCategory.interno += pontos;

      driverPoints.set(motorista, (driverPoints.get(motorista) || 0) + pontos);
      driverCounts.set(motorista, (driverCounts.get(motorista) || 0) + 1);
    }

    // ✅ motoristas: motorista elogiado vem de nome_motorista
    for (const e of motoristas as any[]) {
      const motorista = String(e.nome_motorista ?? "Sem nome").trim();
      const pontos = Number(weights.externo);

      stats.totalPoints += pontos;
      stats.byCategory.externo += pontos;

      driverPoints.set(motorista, (driverPoints.get(motorista) || 0) + pontos);
      driverCounts.set(motorista, (driverCounts.get(motorista) || 0) + 1);
    }

    stats.topDrivers = Array.from(driverPoints.entries())
      .map(([motorista, totalPoints]) => ({
        motorista,
        totalPoints,
        count: driverCounts.get(motorista) || 0,
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 10);

    return stats;
  }

  // -----------------------
  // CRUD USERS
  // -----------------------
  async createUser(input: InsertUser) {
    await db.insert(users).values(input);
    const [created] = await db.select().from(users).where(eq(users.username, input.username));
    return created;
  }

  async updateUser(id: number, updates: UpdateUserRequest) {
    await db.update(users).set(updates).where(eq(users.id, id));
    const [updated] = await db.select().from(users).where(eq(users.id, id));
    return updated;
  }

  async deleteUser(id: number) {
    await db.delete(users).where(eq(users.id, id));
  }

  // -----------------------
  // CREATE ELOGIO (VOTAÇÃO)
  // -----------------------
  async createElogioVotacao(data: {
    type: "interno" | "estrada" | "externo" | "gestao";
    motorista: string;
    cidade?: string | null;
    estado?: string | null;
    descricao: string;

    matricula?: string | null;
    frotaId?: string | null;

    carreta?: string | null;
    telefone?: string | null;

    tokenAvaliador?: string | null;
    userAgent?: string | null;

    createdBy?: string;
    createdRole?: string;

    nomeMotorista?: string | null;
    nomeAvaliador?: string | null;
  }) {
    const weights = await this.getWeights();
    const tipo = String(data.type).trim().toLowerCase();

    const pontos =
      tipo === "gestao"
        ? Number(weights.gestao)
        : tipo === "externo" || tipo === "estrada"
        ? Number(weights.externo)
        : Number(weights.interno);

    // ✅ LOGS (para validar se está vindo 2 e se está calculando 2)
    console.log("[VOTACAO] type:", data.type);
    console.log("[VOTACAO] weights:", weights);
    console.log("[VOTACAO] pontos calculado:", pontos);

    // ✅ Interno/Gestão -> elogios_internos
    if (data.type === "interno" || data.type === "gestao") {
      const mat = String(data.matricula ?? "").trim();
      if (!mat) throw new Error("matricula obrigatória para interno/gestao");

      const values: any = {
        matricula: mat,
        motorista: String(data.motorista ?? "").trim(),
        elogio: String(data.descricao ?? "").trim(),
        cidade: data.cidade ? String(data.cidade).trim() : null,
        token_avaliador: data.tokenAvaliador ? String(data.tokenAvaliador).trim() : null,
        tipo: data.type,
        pontos,
      };

      if (data.estado?.trim()) values.estado = data.estado.trim();
      if (data.telefone?.trim()) values.telefone = data.telefone.trim();

      console.log("[VOTACAO] values interno:", values);

      await db.insert(elogios_internos).values(values);

      return { success: true, pontos, tipo: data.type };
    }

    // ✅ Externo/Estrada -> elogios_motoristas
    if (data.type === "estrada" || data.type === "externo") {
      if (!data.carreta || !data.telefone) {
        throw new Error("carreta e telefone obrigatórios para estrada/externo");
      }

      const nomeMotorista = String(data.nomeMotorista ?? data.motorista ?? "").trim();
      const nomeAvaliador = String(
        data.nomeAvaliador ?? data.tokenAvaliador ?? data.createdBy ?? "Anônimo"
      ).trim();

      const values: any = {
        nome: nomeAvaliador,
        nome_motorista: nomeMotorista || null,
        carreta: String(data.carreta),
        telefone: String(data.telefone),
        elogio: String(data.descricao ?? "").trim(),
        cidade: data.cidade ?? null,
        token_avaliador: data.tokenAvaliador ?? null,
        user_agent: data.userAgent ?? null,
        data_hora: new Date(),
        data_registro: new Date(),
        tipo: data.type,
        pontos,
      };

      if (data.estado?.trim()) values.estado = data.estado.trim();

      console.log("[VOTACAO] values externo:", values);

      await db.insert(elogios_motoristas).values(values);

      return { success: true, pontos, tipo: data.type };
    }

    throw new Error("type inválido");
  }

  // -----------------------
  // ELOGIOS SEPARADOS (LIST)
  // -----------------------
  async getElogiosSeparados(filters?: ElogiosFilters): Promise<{
    internos: { data: ElogioNormalizado[]; total: number; page: number; totalPages: number };
    motoristas: { data: ElogioNormalizado[]; total: number; page: number; totalPages: number };
  }> {
    const weights = await this.getWeights();

    const page = Number(filters?.page) || 1;
    const limit = Number(filters?.limit) || 10;

    const motoristaFiltro = filters?.motorista?.toLowerCase();
    const cidadeFiltro = filters?.cidade?.toLowerCase();

    const startDate = parseLocalDate(filters?.start);
    const endDate = parseLocalDate(filters?.end);

    if (endDate && !isNaN(endDate.getTime())) {
      endDate.setHours(23, 59, 59, 999);
    }

    const validStart = startDate && !isNaN(startDate.getTime()) ? startDate : null;
    const validEnd = endDate && !isNaN(endDate.getTime()) ? endDate : null;

    // ---- MOTORISTAS
    const condMotoristas: any[] = [];

    if (motoristaFiltro) {
      condMotoristas.push(
        sql`lower(${elogios_motoristas.nome_motorista}) like ${`%${motoristaFiltro}%`}`
      );
    }

    if (cidadeFiltro) {
      condMotoristas.push(sql`lower(${elogios_motoristas.cidade}) like ${`%${cidadeFiltro}%`}`);
    }

    if (validStart) condMotoristas.push(gte(elogios_motoristas.data_hora, validStart));
    if (validEnd) condMotoristas.push(lte(elogios_motoristas.data_hora, validEnd));

    const whereMotoristas = condMotoristas.length ? and(...condMotoristas) : undefined;

    const motoristasRows = await db
      .select()
      .from(elogios_motoristas)
      .where(whereMotoristas)
      .orderBy(desc(elogios_motoristas.data_hora))
      .limit(limit)
      .offset((page - 1) * limit);

    console.log("DEBUG elogios_motoristas row[0] keys:", Object.keys(motoristasRows?.[0] ?? {}));
    console.log("DEBUG elogios_motoristas row[0] nome:", motoristasRows?.[0]?.nome);
    console.log(
      "DEBUG elogios_motoristas row[0] nome_motorista:",
      motoristasRows?.[0]?.nome_motorista
    );
    console.log("DEBUG elogios_motoristas row[0] completo:", motoristasRows?.[0]);

    const [motoristasCount] = await db
      .select({ count: sql<string>`count(*)`.as("count") })
      .from(elogios_motoristas)
      .where(whereMotoristas);

    const motoristasData: ElogioNormalizado[] = motoristasRows.map((r: any) => ({
      id: r.id,
      type: "motoristas",
      motorista: String(r.nome_motorista ?? "Sem nome").trim(),
      cidade: r.cidade,
      estado: r.estado,
      carreta: r.carreta ?? null,
      descricao: r.elogio,
      data: r.data_hora ?? r.data_registro ?? null,
      pontos: Number(weights.externo),
    }));

    // ---- INTERNOS
    const condInternos: any[] = [];

    if (motoristaFiltro) {
      condInternos.push(sql`lower(${elogios_internos.motorista}) like ${`%${motoristaFiltro}%`}`);
    }
    if (cidadeFiltro) {
      condInternos.push(sql`lower(${elogios_internos.cidade}) like ${`%${cidadeFiltro}%`}`);
    }

    if (validStart) condInternos.push(gte(elogios_internos.data_hora, validStart));
    if (validEnd) condInternos.push(lte(elogios_internos.data_hora, validEnd));

    const whereInternos = condInternos.length ? and(...condInternos) : undefined;

    const internosRows = await db
      .select()
      .from(elogios_internos)
      .where(whereInternos)
      .orderBy(desc(elogios_internos.data_hora))
      .limit(limit)
      .offset((page - 1) * limit);

    const [internosCount] = await db
      .select({ count: sql<string>`count(*)`.as("count") })
      .from(elogios_internos)
      .where(whereInternos);

    const internosData: ElogioNormalizado[] = internosRows.map((r: any) => ({
      id: r.id,
      type: "interno",
      motorista: String(r.motorista ?? "Sem nome").trim(),
      cidade: r.cidade,
      estado: r.estado,
      descricao: r.elogio,
      data: r.data_hora ?? null,
      pontos: Number(weights.interno),
    }));

    const motoristasTotal = Number((motoristasCount as any)?.count ?? 0);
    const internosTotal = Number((internosCount as any)?.count ?? 0);

    return {
      motoristas: {
        data: motoristasData,
        total: motoristasTotal,
        page,
        totalPages: Math.ceil(motoristasTotal / limit),
      },
      internos: {
        data: internosData,
        total: internosTotal,
        page,
        totalPages: Math.ceil(internosTotal / limit),
      },
    };
  }
}

export const storage = new DatabaseStorage();
