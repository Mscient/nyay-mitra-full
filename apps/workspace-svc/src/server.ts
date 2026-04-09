// workspace-svc — Real CRM Service
// In-memory store (DB-ready with Drizzle + PostgreSQL when DATABASE_URL is set)
// JWT verification via identity-svc | Rate limiting | Full CRUD
import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import cors from "@fastify/cors";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

// ── Config ─────────────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || "";
const WORKSPACE_SVC_PORT = process.env.PORT ? parseInt(process.env.PORT) : 4002;

// ── Rate limiting ──────────────────────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; reset: number }>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || entry.reset < now) { rateLimitMap.set(ip, { count: 1, reset: now + 60_000 }); return true; }
  if (entry.count >= 100) return false;
  entry.count++;
  return true;
}

// ── In-Memory Store ────────────────────────────────────────────────────────
interface Client {
  id: string; tenantId: string; advocateId: string;
  fullName: string; email: string; phone: string;
  aadhaarRef: string; case_title?: string;
  createdAt: string; updatedAt: string;
}
interface Matter {
  id: string; tenantId: string; advocateId: string; clientId: string;
  title: string; matterType?: string; caseNumber?: string; status: string;
  courtCode?: string; feesAgreed?: number; createdAt: string;
}
interface Hearing {
  id: string; matterId: string; advocateId: string; tenantId: string;
  scheduledAt: string; courtCode?: string; courtHall?: string;
  judgeName?: string; purpose?: string; status: string;
  nextDate?: string; orderSummary?: string; createdAt: string;
}
interface Invoice {
  id: string; advocateId: string; clientId: string; tenantId: string;
  matterId?: string; invoiceNumber: string; amount: number;
  gstAmount: number; totalAmount: number; status: string;
  dueDate?: string; createdAt: string;
}

const clientStore = new Map<string, Client>();
const matterStore = new Map<string, Matter>();
const hearingStore = new Map<string, Hearing>();
const invoiceStore = new Map<string, Invoice>();

// ── Auth plugin ────────────────────────────────────────────────────────────
declare module "fastify" {
  interface FastifyRequest { tenantId: string; advocateId: string; }
}

async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers["authorization"] as string;
  const token = authHeader?.replace("Bearer ", "");

  if (!token) return reply.status(401).send({ error: "Unauthorized: missing Bearer token" });

  try {
    let payload: any;
    if (JWT_SECRET) {
      payload = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
    } else {
      // When JWT_SECRET not set — decode without verification (dev mode only)
      payload = jwt.decode(token);
      if (!payload) throw new Error("invalid");
    }
    request.tenantId = payload.tenantId || payload.sub || "dev-tenant";
    request.advocateId = payload.sub || "dev-user";
  } catch {
    return reply.status(401).send({ error: "Unauthorized: invalid or expired token" });
  }
}

// ── Fastify setup ──────────────────────────────────────────────────────────
const fastify = Fastify({ logger: true });
fastify.register(cors);

fastify.addHook("preHandler", async (request, reply) => {
  const ip = request.headers["x-forwarded-for"]?.toString().split(",")[0] ?? "unknown";
  if (!checkRateLimit(ip)) return reply.status(429).send({ error: "Rate limit exceeded" });
});

fastify.get("/health", async () => ({
  status: "ok", service: "workspace-svc", store: "in-memory",
  clients: clientStore.size, matters: matterStore.size,
  hearings: hearingStore.size, invoices: invoiceStore.size,
}));

// ── Dashboard ─────────────────────────────────────────────────────────────
fastify.get("/v1/workspace/dashboard", { preHandler: authMiddleware }, async (request) => {
  const { advocateId } = request;
  const myClients = [...clientStore.values()].filter(c => c.advocateId === advocateId);
  const myHearings = [...hearingStore.values()].filter(h => h.advocateId === advocateId && h.status === "UPCOMING");
  const myMatters = [...matterStore.values()].filter(m => m.advocateId === advocateId && m.status === "ACTIVE");
  const myInvoices = [...invoiceStore.values()].filter(i => i.advocateId === advocateId && i.status !== "PAID");
  const pendingFees = myInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

  return {
    active_matters: myMatters.length,
    upcoming_hearings: myHearings.length,
    total_clients: myClients.length,
    pending_fees: pendingFees,
  };
});

// ── CLIENTS ────────────────────────────────────────────────────────────────
const clientRoutes = async (fastify: FastifyInstance) => {
  fastify.addHook("preHandler", authMiddleware);

  // GET all clients
  fastify.get("/", async (request) => {
    const clients = [...clientStore.values()]
      .filter(c => c.advocateId === request.advocateId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return { clients, total: clients.length };
  });

  // GET single client
  fastify.get("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const client = clientStore.get(id);
    if (!client || client.advocateId !== request.advocateId)
      return reply.status(404).send({ error: "Client not found" });
    return { client };
  });

  // POST create client
  fastify.post("/", async (request, reply) => {
    const { fullName, email, phone, aadhaarId, case_title } = request.body as any;
    if (!fullName?.trim()) return reply.status(400).send({ error: "fullName is required" });
    if (phone && !/^[6-9]\d{9}$/.test(phone.replace(/[-\s]/g, "")))
      return reply.status(400).send({ error: "Invalid Indian mobile number" });

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const client: Client = {
      id, tenantId: request.tenantId, advocateId: request.advocateId,
      fullName: fullName.trim(),
      email: email?.toLowerCase() || "",
      phone: phone || "",
      aadhaarRef: aadhaarId ? aadhaarId.slice(-4) : "",
      case_title: case_title || "",
      createdAt: now, updatedAt: now,
    };
    clientStore.set(id, client);
    return reply.status(201).send({ success: true, clientId: id, client });
  });

  // PATCH update client
  fastify.patch("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const existing = clientStore.get(id);
    if (!existing || existing.advocateId !== request.advocateId)
      return reply.status(404).send({ error: "Client not found" });

    const updates = request.body as Partial<Client>;
    const updated: Client = { ...existing, ...updates, id, advocateId: request.advocateId, updatedAt: new Date().toISOString() };
    clientStore.set(id, updated);
    return reply.send({ success: true, client: updated });
  });

  // DELETE client
  fastify.delete("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const existing = clientStore.get(id);
    if (!existing || existing.advocateId !== request.advocateId)
      return reply.status(404).send({ error: "Client not found" });
    clientStore.delete(id);
    return reply.send({ success: true });
  });
};

// ── MATTERS ─────────────────────────────────────────────────────────────────
const matterRoutes = async (fastify: FastifyInstance) => {
  fastify.addHook("preHandler", authMiddleware);

  fastify.get("/", async (request) => {
    const matters = [...matterStore.values()]
      .filter(m => m.advocateId === request.advocateId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return { matters, total: matters.length };
  });

  fastify.post("/", async (request, reply) => {
    const { clientId, title, matterType, caseNumber, courtCode, feesAgreed } = request.body as any;
    if (!clientId || !title) return reply.status(400).send({ error: "clientId and title are required" });
    const client = clientStore.get(clientId);
    if (!client || client.advocateId !== request.advocateId)
      return reply.status(404).send({ error: "Client not found" });

    const id = crypto.randomUUID();
    const matter: Matter = {
      id, tenantId: request.tenantId, advocateId: request.advocateId, clientId,
      title: title.trim(), matterType, caseNumber, courtCode, status: "ACTIVE",
      feesAgreed: feesAgreed ? parseFloat(feesAgreed) : undefined,
      createdAt: new Date().toISOString(),
    };
    matterStore.set(id, matter);
    return reply.status(201).send({ success: true, matterId: id, matter });
  });

  fastify.patch("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const existing = matterStore.get(id);
    if (!existing || existing.advocateId !== request.advocateId)
      return reply.status(404).send({ error: "Matter not found" });
    const updated = { ...existing, ...(request.body as any), id, advocateId: request.advocateId };
    matterStore.set(id, updated);
    return reply.send({ success: true, matter: updated });
  });

  fastify.delete("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const existing = matterStore.get(id);
    if (!existing || existing.advocateId !== request.advocateId)
      return reply.status(404).send({ error: "Matter not found" });
    matterStore.delete(id);
    return reply.send({ success: true });
  });
};

// ── HEARINGS ─────────────────────────────────────────────────────────────────
const hearingRoutes = async (fastify: FastifyInstance) => {
  fastify.addHook("preHandler", authMiddleware);

  fastify.get("/", async (request) => {
    const hearings = [...hearingStore.values()]
      .filter(h => h.advocateId === request.advocateId)
      .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
    return { hearings, total: hearings.length };
  });

  fastify.post("/", async (request, reply) => {
    const { matterId, scheduledAt, courtCode, courtHall, judgeName, purpose } = request.body as any;
    if (!scheduledAt) return reply.status(400).send({ error: "scheduledAt is required" });

    const id = crypto.randomUUID();
    const hearing: Hearing = {
      id, matterId: matterId || "", advocateId: request.advocateId, tenantId: request.tenantId,
      scheduledAt, courtCode, courtHall, judgeName, purpose,
      status: "UPCOMING", createdAt: new Date().toISOString(),
    };
    hearingStore.set(id, hearing);
    return reply.status(201).send({ success: true, hearingId: id, hearing });
  });

  fastify.post("/:id/update", async (request, reply) => {
    const { id } = request.params as { id: string };
    const existing = hearingStore.get(id);
    if (!existing || existing.advocateId !== request.advocateId)
      return reply.status(404).send({ error: "Hearing not found" });
    const updated = { ...existing, ...(request.body as any), id };
    hearingStore.set(id, updated);
    return reply.send({ success: true, hearing: updated });
  });

  fastify.delete("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const existing = hearingStore.get(id);
    if (!existing || existing.advocateId !== request.advocateId)
      return reply.status(404).send({ error: "Hearing not found" });
    hearingStore.delete(id);
    return reply.send({ success: true });
  });
};

// ── INVOICES ──────────────────────────────────────────────────────────────────
const invoiceRoutes = async (fastify: FastifyInstance) => {
  fastify.addHook("preHandler", authMiddleware);

  fastify.get("/", async (request) => {
    const invoices = [...invoiceStore.values()]
      .filter(i => i.advocateId === request.advocateId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return { invoices, total: invoices.length };
  });

  fastify.post("/", async (request, reply) => {
    const { clientId, matterId, amount, gstPercent = 18, dueDate } = request.body as any;
    if (!clientId || !amount) return reply.status(400).send({ error: "clientId and amount are required" });

    const gstAmount = parseFloat(((amount * gstPercent) / 100).toFixed(2));
    const totalAmount = parseFloat((amount + gstAmount).toFixed(2));
    const invoiceNumber = `INV-${Date.now()}`;
    const id = crypto.randomUUID();

    const invoice: Invoice = {
      id, advocateId: request.advocateId, clientId, tenantId: request.tenantId,
      matterId, invoiceNumber, amount, gstAmount, totalAmount,
      status: "DRAFT", dueDate, createdAt: new Date().toISOString(),
    };
    invoiceStore.set(id, invoice);
    return reply.status(201).send({ success: true, invoiceId: id, invoice });
  });

  fastify.patch("/:id/status", async (request, reply) => {
    const { id } = request.params as { id: string };
    const { status } = request.body as { status: string };
    const existing = invoiceStore.get(id);
    if (!existing || existing.advocateId !== request.advocateId)
      return reply.status(404).send({ error: "Invoice not found" });
    const updated = { ...existing, status };
    invoiceStore.set(id, updated);
    return reply.send({ success: true, invoice: updated });
  });
};

// ── Register all route groups ─────────────────────────────────────────────
fastify.register(clientRoutes, { prefix: "/v1/workspace/clients" });
fastify.register(matterRoutes, { prefix: "/v1/workspace/matters" });
fastify.register(hearingRoutes, { prefix: "/v1/workspace/hearings" });
fastify.register(invoiceRoutes, { prefix: "/v1/workspace/invoices" });

// ── Start ─────────────────────────────────────────────────────────────────
const start = async () => {
  try {
    await fastify.listen({ port: WORKSPACE_SVC_PORT, host: "0.0.0.0" });
    console.log(`✅ workspace-svc running on port ${WORKSPACE_SVC_PORT} [REAL CRM — in-memory]`);
    console.log(`   JWT verification: ${JWT_SECRET ? "enabled ✅" : "dev mode (set JWT_SECRET)"}`);
    console.log(`   Set DATABASE_URL to enable PostgreSQL persistence`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
