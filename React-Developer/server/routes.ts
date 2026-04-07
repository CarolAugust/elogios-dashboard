import { Buffer } from "buffer";
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import ExcelJS from "exceljs";

/**
 * Converte req.query (ParsedQs) para string de forma segura
 */
const asString = (v: unknown): string | undefined => {
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return typeof v[0] === "string" ? v[0] : undefined;
  return undefined;
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // ==========================
  // USERS
  // ==========================
app.get(api.users.list.path, async (_req, res) => {
    const users = await storage.getUsers();
    res.json(users);
  });

  app.post(api.users.create.path, async (req, res) => {
    try {
      const input = api.users.create.input.parse(req.body);
      const user = await storage.createUser(input);
      res.status(201).json(user);
    } catch (err: any) {
      res.status(400).json({
        message: "Invalid user data",
        error: err?.issues ?? err?.message ?? String(err),
        received: req.body,
      });
    }
  });

  app.patch(api.users.update.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id) || id <= 0) {
        return res.status(400).json({ message: "Invalid id" });
      }

      const input = api.users.update.input.parse(req.body);

      // ✅ trava update vazio (causa o 400 que você viu)
      if (!input || Object.keys(input).length === 0) {
        return res.status(400).json({
          message: "Update failed",
          error: "Body vazio: envie pelo menos 1 campo para atualizar",
          received: req.body,
        });
      }

      const user = await storage.updateUser(id, input);
      res.json(user);
    } catch (err: any) {
      res.status(400).json({
        message: "Update failed",
        error: err?.issues ?? err?.message ?? String(err),
        received: req.body,
      });
    }
  });

  app.delete(api.users.delete.path, async (req, res) => {
    const id = Number(req.params.id);
    await storage.deleteUser(id);
    res.status(204).send();
  });

  // ==========================
  // ELOGIOS (DW - leitura)
  // ==========================
app.get(api.elogios.list.path, async (req, res) => {
  const motorista = asString(req.query.motorista);
  const cidade = asString(req.query.cidade);
  const page = asString(req.query.page);
  const limit = asString(req.query.limit);

  // ✅ NOVO
  const start = asString(req.query.start);
  const end = asString(req.query.end);

  const result = await storage.getElogiosSeparados({
    motorista,
    cidade,
    page,
    limit,
    start,
    end,
  });

  res.json(result);
});


 app.get(api.elogios.stats.path, async (req, res) => {
  const start = typeof req.query.start === "string" ? req.query.start : undefined;
  const end = typeof req.query.end === "string" ? req.query.end : undefined;

  const stats = await storage.getDashboardStats({ start, end });
  res.json(stats);
});


    const ELOGIO_TYPES = ["interno", "estrada", "externo", "gestao"] as const;
type ElogioType = (typeof ELOGIO_TYPES)[number];

function isElogioType(v: string): v is ElogioType {
  return (ELOGIO_TYPES as readonly string[]).includes(v);
}


//EXPORT PARA EXCEL //


app.get("/api/elogios/export/xlsx", async (req, res) => {
  try {
    const motorista = asString(req.query.motorista);
    const cidade = asString(req.query.cidade);

    const result = await storage.getElogiosSeparados({
      motorista,
      cidade,
      page: 1,
      limit: 100000,
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Elogios";

    // ===== Aba 1: Internos (inclui Gestão)
    const wsInternos = workbook.addWorksheet("Internos");
    wsInternos.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Tipo", key: "tipo", width: 12 },      // interno/gestao
      { header: "Pontos", key: "pontos", width: 10 },
      { header: "Motorista", key: "motorista", width: 28 },
      { header: "Cidade", key: "cidade", width: 18 },
      { header: "Estado", key: "estado", width: 10 },
      { header: "Data", key: "data", width: 18 },
      { header: "Descrição", key: "descricao", width: 50 },
    ];

    (result.internos.data ?? []).forEach((e: any) => {
      wsInternos.addRow({
        id: e.id,
        tipo: (e.tipo ?? "interno"),        // se seu getElogiosSeparados não manda tipo, ajusta lá
        pontos: Number(e.pontos ?? 0),
        motorista: e.motorista,
        cidade: e.cidade ?? "",
        estado: e.estado ?? "",
        data: e.data ? new Date(e.data).toLocaleString("pt-BR") : "",
        descricao: e.descricao ?? "",
      });
    });

    wsInternos.getRow(1).font = { bold: true };

    // ===== Aba 2: Motoristas (Estrada/Externo)
    const wsMotoristas = workbook.addWorksheet("Motoristas");
    wsMotoristas.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Tipo", key: "tipo", width: 12 },
      { header: "Pontos", key: "pontos", width: 10 },
      { header: "Motorista", key: "motorista", width: 28 },
      { header: "Cidade", key: "cidade", width: 18 },
      { header: "Estado", key: "estado", width: 10 },
      { header: "Placa", key: "carreta", width: 18 }, // novo
      { header: "Data", key: "data", width: 18 },
      { header: "Descrição", key: "descricao", width: 50 },
    ];

    (result.motoristas.data ?? []).forEach((e: any) => {
      wsMotoristas.addRow({
        id: e.id,
        tipo: e.tipo ?? "externo",
        pontos: Number(e.pontos ?? 0),
        motorista: e.motorista,
        cidade: e.cidade ?? "",
        estado: e.estado ?? "",
        carreta: e.carreta ?? "", // novo
        data: e.data ? new Date(e.data).toLocaleString("pt-BR") : "",
        descricao: e.descricao ?? "",
      });
    });

    wsMotoristas.getRow(1).font = { bold: true };

    // Header de download
    const filename = `elogios_${new Date().toISOString().slice(0, 10)}.xlsx`;
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err: any) {
    console.error("ERRO export xlsx:", err);
    return res.status(500).json({
      message: "Erro ao exportar XLSX",
      error: err?.message ?? String(err),
    });
  }
});



  // ==========================
// ELOGIOS (VOTAÇÃO - escrita)
// ==========================
  app.post("/api/elogios/votacao", async (req, res) => {
  const auth = String(req.headers.authorization || "");
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  // 1) decodifica token -> username
  let username = "";
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [usernameRaw] = decoded.split(":");
    username = (usernameRaw ?? "").trim().toLowerCase();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }


 // 2) carrega usuário real do banco (sem admin fixo)
if (!username || username === "undefined") {
  return res.status(401).json({ message: "Usuário ou senha inválidos" });
}

const user = await storage.getUserByUsername(username);
if (!user) {
  return res.status(401).json({ message: "Usuário ou senha inválidos" });
}

if (!user.role) {
  return res.status(500).json({ message: "Usuário sem role definida" });
}

const role = String(user.role).trim().toLowerCase();
  
  


  // 3) valida body
  const { type, motorista, cidade, estado, descricao, status, frotaId, placaFrota, matricula, carreta, telefone } = req.body ?? {};

  console.log("BODY RECEBIDO:", req.body);
  console.log("MATRICULA RECEBIDA:", matricula, "tipo:", typeof matricula);


  const frotaFinal = frotaId ?? placaFrota; // ✅ aceita qualquer um



  if (!type || !motorista || !descricao) {
    return res.status(400).json({
      message: "Campos obrigatórios: type, motorista, descricao",
      received: req.body,
    });
  }

  const elogioTypeRaw = String(type)
  .trim()
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "");


  if (!isElogioType(elogioTypeRaw)) {
    return res.status(400).json({ message: "type inválido", received: req.body });
  }

  const elogioType: ElogioType = elogioTypeRaw; // ✅ agora é union literal


  // 4) permissão gestão
  const canGestao = role === "admin" || role === "gestor" || role === "contabilizacao";
  if (elogioType === "gestao" && !canGestao) {
    return res.status(403).json({ message: "Sem permissão para voto de gestão." });
  }

  // 5) monta payload
 const base = {
  type: elogioType,
  motorista: String(motorista),
  cidade: cidade ? String(cidade) : null,
  estado: estado ? String(estado) : null,
  descricao: String(descricao),
  status: status ? String(status) : "ativo",
  createdBy: username,
  createdRole: role,

  // ✅ novos
  tokenAvaliador: username,
  userAgent: String(req.headers["user-agent"] || ""),
  };


  try {
    // Interno/Gestão -> precisa matricula
if (elogioType === "interno" || elogioType === "gestao") {
  const matriculaFinal = String(matricula ?? "").trim();
  if (!matriculaFinal) {
    return res.status(400).json({
      message: "Campo obrigatório para Interno/Gestão: matricula",
      received: req.body,
    });
  }

  const payload = {
    ...base,
    matricula: matriculaFinal,
  };

  console.log("PAYLOAD PARA STORAGE (gestao/interno):", payload);

  const saved = await storage.createElogioVotacao(payload as any);
  return res.status(201).json(saved ?? { success: true });
}


// Estrada/Externo -> precisa frotaId + carreta + telefone
if (elogioType === "estrada" || elogioType === "externo") {
  if (!frotaFinal || !carreta || !telefone) {
    return res.status(400).json({
      message: "Campos obrigatórios para Estrada/Externo: frotaId (ou placaFrota), carreta, telefone",
      received: req.body,
    });
  }

  

  const saved = await storage.createElogioVotacao({
    ...base,
    frotaId: String(frotaFinal),
    carreta: String(carreta),
    telefone: String(telefone),
  });

  return res.status(201).json(saved ?? { success: true });
}



    return res.status(400).json({ message: "type inválido", received: req.body });
  } catch (err: any) {
    return res.status(500).json({
      message: "Erro ao registrar votação",
      error: err?.message ?? String(err),
    });
  }
});


  

    // ==========================
    // SETTINGS
    // ==========================
    app.get(api.settings.getWeights.path, async (_req, res) => {
      try {
        const weights = await storage.getWeights();
        return res.json(weights);
      } catch (err: any) {
        console.error("ERRO GET /api/settings/weights:", err);
        return res.status(500).json({
          message: "Erro ao buscar weights",
          error: err?.message ?? String(err),
        });
      }
    });

    // ✅ ADICIONA ESSE BLOCO AQUI (logo abaixo do GET)
    app.put(api.settings.updateWeights.path, async (req, res) => {
      try {
        // valida com o schema que você já definiu no @shared/routes
        const input = api.settings.updateWeights.input.parse(req.body);

        // chama o método do storage (tem que existir: updateWeights)
        await storage.updateWeights(input);

        return res.json({ success: true });
      } catch (err: any) {
        console.error("ERRO PUT /api/settings/weights:", err);
        return res.status(400).json({
          message: "Erro ao atualizar weights",
          error: err?.issues ?? err?.message ?? String(err),
          received: req.body,
        });
      }
    });



  // Seed (deixe comentado pra não inserir dados fake no DW)
  // await storage.seed();

    // ==========================
  // AUTH (mock simples)
  // ==========================

  
app.post(api.auth.login.path, async (req, res) => {
  console.log("REQUISIÇÃO DE LOGIN RECEBIDA!", req.body);

  try {
    const input = api.auth.login.input.parse(req.body);

    const username = input.username.trim().toLowerCase();
    const password = String(input.password ?? "").trim();

    if (!password) {
      return res.status(400).json({ message: "Senha obrigatória" });
    }

    const user = await storage.getUserByUsername(username);

    if (!user) {
      return res.status(401).json({ message: "Usuário ou senha inválidos" });
    }

    if (String(user.password) !== password) {
      return res.status(401).json({ message: "Usuário ou senha inválidos" });
    }

    const iat = Date.now();
    const token = Buffer.from(`${user.username}:${user.role}:${iat}`).toString("base64");

    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        isManager: user.isManager,
      },
    });
  } catch (err: any) {
    console.error("ERRO LOGIN COMPLETO:", err);
    return res.status(400).json({
      message: err?.message ?? "Invalid request",
      error: err?.sqlMessage ?? err?.cause?.message ?? null,
      code: err?.code ?? null,
    });
  }
});


  app.post(api.auth.logout.path, async (_req, res) => {
  return res.json({ success: true });
});


    app.get(api.auth.me.path, async (req, res) => {
      const auth = (req.headers.authorization || "").toString();
      const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";

      if (!token) return res.status(401).json({ message: "Unauthorized" });

      try {
        const decoded = Buffer.from(token, "base64").toString("utf-8");
        const [usernameRaw] = decoded.split(":");

        const username = (usernameRaw ?? "").trim().toLowerCase();
        if (!username) return res.status(401).json({ message: "Unauthorized" });

        // ✅ somente banco
        const user = await storage.getUserByUsername(username);
        if (!user) return res.status(401).json({ message: "Unauthorized" });

        return res.json({
          user: {
            id: user.id,
            username: user.username,
            role: user.role,
            isManager: user.isManager,
          },
        });
      } catch {
        return res.status(401).json({ message: "Unauthorized" });
      }
    });




  return httpServer;
}
