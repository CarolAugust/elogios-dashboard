import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import https from "https";
import fs from "fs";
import path from "path";
import cors from "cors";

const app = express();

// CORS (quando o front for servido pelo mesmo host/porta, você pode remover)
if (process.env.NODE_ENV !== "production") {
  app.use(cors());
}

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      (req as any).rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const reqPath = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (reqPath.startsWith("/api")) {
      let logLine = `${req.method} ${reqPath} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      log(logLine);
    }
  });

  next();
});

(async () => {
  const keyPath = "C:/Users/administrador/Desktop/certificados pizzatto/origin-key.pem";
  const certPath = "C:/Users/administrador/Desktop/certificados pizzatto/origin-cert.pem";

  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    console.error("❌ ERRO: Arquivos de certificado SSL não encontrados.");
    process.exit(1);
  }

  const sslOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };

  const httpsServer = https.createServer(sslOptions, app);

  // rotas /api (provavelmente registradas aqui)
  await registerRoutes(httpsServer, app);

  // ------------------------------
  // FRONT em PRODUÇÃO (Vite build)
  // ------------------------------
 if (process.env.NODE_ENV === "production") {
  const publicPath = path.resolve(process.cwd(), "dist", "public");

  app.use("/elogios/dashboard", express.static(publicPath));

  app.get("/elogios/dashboard/*", (_req, res) => {
    res.sendFile(path.join(publicPath, "index.html"));
  });
} else {
  const { setupVite } = await import("./vite");
  await setupVite(httpsServer, app);
}

  // 404 apenas para /api não encontrada (depois do registerRoutes)
  app.use("/api", (_req, res) => {
    res.status(404).json({ message: "API route not found" });
  });

  // Error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

const port = Number(process.env.PORT || 8443);

httpsServer.listen(port, "0.0.0.0", () => {
  console.log(`Servidor HTTPS rodando no IP 192.168.10.25:${port}`);
});
})();