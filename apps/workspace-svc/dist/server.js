// workspace-svc — Production CRM Service
// Full Drizzle ORM persistence · PostgreSQL · JWT verification
// Clients, Matters, Hearings, Invoices · Pagination · Dashboard aggregates
import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";
import { z } from "zod";
import { eq, and, desc, asc, gte, lte, like, or, count, sum } from "drizzle-orm";
import { db, clients, matters, hearings, invoices, documents } from "@nyay-mitra/database";
dotenv.config();
// ── Config ─────────────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET)
    throw new Error("JWT_SECRET must be set");
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4002;
// ── Rate limiting ──────────────────────────────────────────────────────────
const rateLimitMap = new Map();
function checkRateLimit(ip) {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);
    if (!entry || entry.reset < now) {
        rateLimitMap.set(ip, { count: 1, reset: now + 60_000 });
        return true;
    }
    if (entry.count >= 100)
        return false;
    entry.count++;
    return true;
}
// ── Fastify setup ──────────────────────────────────────────────────────────
const fastify = Fastify({ logger: { level: process.env.LOG_LEVEL ?? "info" } });
await fastify.register(cors, { origin: true, credentials: true });
await fastify.register(helmet, { contentSecurityPolicy: false });
fastify.addHook("preHandler", async (request, reply) => {
    const ip = request.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() ?? "unknown";
    if (!checkRateLimit(ip))
        return reply.status(429).send({ error: "Rate limit exceeded" });
});
async function authMiddleware(request, reply) {
    const token = request.headers["authorization"]?.replace("Bearer ", "");
    if (!token)
        return reply.status(401).send({ error: "Unauthorized: missing Bearer token" });
    try {
        const payload = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
        request.tenantId = payload.tenantId || "unknown";
        request.advocateId = payload.sub || "unknown";
    }
    catch {
        return reply.status(401).send({ error: "Unauthorized: invalid or expired token" });
    }
}
// ── Health ─────────────────────────────────────────────────────────────────
fastify.get("/health", async () => {
    try {
        await db.select().from(clients).limit(1);
        return { status: "ok", service: "workspace-svc", db: "connected", store: "postgresql" };
    }
    catch {
        return { status: "degraded", service: "workspace-svc", db: "disconnected" };
    }
});
// ── Dashboard ─────────────────────────────────────────────────────────────
fastify.get("/v1/workspace/dashboard", { preHandler: authMiddleware }, async (request) => {
    const { advocateId, tenantId } = request;
    const [activeMatters] = await db
        .select({ count: count() })
        .from(matters)
        .where(and(eq(matters.advocateId, advocateId), eq(matters.status, "ACTIVE")));
    const [upcomingHearings] = await db
        .select({ count: count() })
        .from(hearings)
        .where(and(eq(hearings.advocateId, advocateId), eq(hearings.status, "UPCOMING")));
    const [totalClients] = await db
        .select({ count: count() })
        .from(clients)
        .where(and(eq(clients.advocateId, advocateId), eq(clients.isActive, true)));
    const pendingInvoicesResult = await db
        .select({ total: sum(invoices.totalAmount) })
        .from(invoices)
        .where(and(eq(invoices.advocateId, advocateId), or(eq(invoices.status, "DRAFT"), eq(invoices.status, "SENT"), eq(invoices.status, "OVERDUE"))));
    // Recent hearings (next 7 days)
    const recentHearings = await db
        .select()
        .from(hearings)
        .where(and(eq(hearings.advocateId, advocateId), eq(hearings.status, "UPCOMING")))
        .orderBy(asc(hearings.scheduledAt))
        .limit(5);
    return {
        active_matters: activeMatters.count,
        upcoming_hearings: upcomingHearings.count,
        total_clients: totalClients.count,
        pending_fees: parseFloat(pendingInvoicesResult[0]?.total ?? "0"),
        recent_hearings: recentHearings,
    };
});
// ── Helpers ────────────────────────────────────────────────────────────────
function parsePage(query) {
    const page = Math.max(1, parseInt(query.page ?? "1"));
    const limit = Math.min(50, Math.max(1, parseInt(query.limit ?? "20")));
    const offset = (page - 1) * limit;
    return { page, limit, offset };
}
// ─────────────────────────────────────────────────────────────────────────────
// CLIENTS ROUTES
// ─────────────────────────────────────────────────────────────────────────────
const clientRoutes = async (fastify) => {
    fastify.addHook("preHandler", authMiddleware);
    // GET all clients with pagination + search
    fastify.get("/", async (request) => {
        const { page, limit, offset } = parsePage(request.query);
        const { q } = request.query;
        const baseCondition = and(eq(clients.advocateId, request.advocateId), eq(clients.isActive, true));
        const query = db.select().from(clients)
            .where(q
            ? and(baseCondition, or(like(clients.fullName, `%${q}%`), like(clients.caseTitle, `%${q}%`)))
            : baseCondition)
            .orderBy(desc(clients.createdAt))
            .limit(limit)
            .offset(offset);
        const [result, totalResult] = await Promise.all([
            query,
            db.select({ count: count() }).from(clients).where(baseCondition),
        ]);
        return { clients: result, total: totalResult[0].count, page, limit };
    });
    // GET single client
    fastify.get("/:id", async (request, reply) => {
        const { id } = request.params;
        const [client] = await db.select().from(clients)
            .where(and(eq(clients.id, id), eq(clients.advocateId, request.advocateId)))
            .limit(1);
        if (!client)
            return reply.status(404).send({ error: "Client not found" });
        return { client };
    });
    // POST create client
    const CreateClientSchema = z.object({
        fullName: z.string().min(1).max(200).trim(),
        email: z.string().email().optional(),
        phone: z.string().regex(/^[6-9]\d{9}$/).optional(),
        aadhaarId: z.string().length(12).optional(),
        caseTitle: z.string().max(500).optional(),
        notes: z.string().max(2000).optional(),
    });
    fastify.post("/", async (request, reply) => {
        const parse = CreateClientSchema.safeParse(request.body);
        if (!parse.success)
            return reply.status(400).send({ error: parse.error.errors[0]?.message });
        const { fullName, email, phone, aadhaarId, caseTitle, notes } = parse.data;
        const clientIdGen = crypto.randomUUID();
        await db.insert(clients).values({
            id: clientIdGen,
            tenantId: request.tenantId,
            advocateId: request.advocateId,
            fullName,
            email: email?.toLowerCase(),
            phone,
            aadhaarRef: aadhaarId?.slice(-4),
            caseTitle,
            notes,
        });
        const [client] = await db.select().from(clients).where(eq(clients.id, clientIdGen)).limit(1);
        return reply.status(201).send({ success: true, clientId: client.id, client });
    });
    // PATCH update client
    fastify.patch("/:id", async (request, reply) => {
        const { id } = request.params;
        const [existing] = await db.select({ id: clients.id }).from(clients)
            .where(and(eq(clients.id, id), eq(clients.advocateId, request.advocateId))).limit(1);
        if (!existing)
            return reply.status(404).send({ error: "Client not found" });
        const { fullName, email, phone, caseTitle, notes } = request.body;
        const updates = { updatedAt: new Date() };
        if (fullName?.trim())
            updates.fullName = fullName.trim();
        if (email)
            updates.email = email.toLowerCase();
        if (phone)
            updates.phone = phone;
        if (caseTitle !== undefined)
            updates.caseTitle = caseTitle;
        if (notes !== undefined)
            updates.notes = notes;
        await db.update(clients).set(updates).where(eq(clients.id, id));
        const [updated] = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
        return reply.send({ success: true, client: updated });
    });
    // DELETE client (soft delete)
    fastify.delete("/:id", async (request, reply) => {
        const { id } = request.params;
        const [existing] = await db.select({ id: clients.id }).from(clients)
            .where(and(eq(clients.id, id), eq(clients.advocateId, request.advocateId))).limit(1);
        if (!existing)
            return reply.status(404).send({ error: "Client not found" });
        await db.update(clients).set({ isActive: false, updatedAt: new Date() }).where(eq(clients.id, id));
        return reply.send({ success: true });
    });
};
// ─────────────────────────────────────────────────────────────────────────────
// MATTERS ROUTES
// ─────────────────────────────────────────────────────────────────────────────
const matterRoutes = async (fastify) => {
    fastify.addHook("preHandler", authMiddleware);
    fastify.get("/", async (request) => {
        const { page, limit, offset } = parsePage(request.query);
        const { status } = request.query;
        const baseCondition = and(eq(matters.advocateId, request.advocateId), ...(status ? [eq(matters.status, status)] : []));
        const [result, totalResult] = await Promise.all([
            db.select().from(matters).where(baseCondition).orderBy(desc(matters.createdAt)).limit(limit).offset(offset),
            db.select({ count: count() }).from(matters).where(baseCondition),
        ]);
        return { matters: result, total: totalResult[0].count, page, limit };
    });
    fastify.get("/:id", async (request, reply) => {
        const { id } = request.params;
        const [matter] = await db.select().from(matters)
            .where(and(eq(matters.id, id), eq(matters.advocateId, request.advocateId))).limit(1);
        if (!matter)
            return reply.status(404).send({ error: "Matter not found" });
        const matterHearings = await db.select().from(hearings)
            .where(eq(hearings.matterId, id)).orderBy(asc(hearings.scheduledAt));
        const matterInvoices = await db.select().from(invoices)
            .where(eq(invoices.matterId, id)).orderBy(desc(invoices.createdAt));
        return { matter, hearings: matterHearings, invoices: matterInvoices };
    });
    fastify.post("/", async (request, reply) => {
        const { clientId, title, matterType, caseNumber, courtCode, feesAgreed } = request.body;
        if (!clientId || !title)
            return reply.status(400).send({ error: "clientId and title are required" });
        const [client] = await db.select({ id: clients.id }).from(clients)
            .where(and(eq(clients.id, clientId), eq(clients.advocateId, request.advocateId))).limit(1);
        if (!client)
            return reply.status(404).send({ error: "Client not found" });
        const matterIdGen = crypto.randomUUID();
        await db.insert(matters).values({
            id: matterIdGen,
            tenantId: request.tenantId,
            advocateId: request.advocateId,
            clientId,
            title: title.trim(),
            matterType,
            caseNumber,
            courtCode,
            feesAgreed: feesAgreed ? feesAgreed.toString() : null,
        });
        const [matter] = await db.select().from(matters).where(eq(matters.id, matterIdGen)).limit(1);
        return reply.status(201).send({ success: true, matterId: matter.id, matter });
    });
    fastify.patch("/:id", async (request, reply) => {
        const { id } = request.params;
        const [existing] = await db.select({ id: matters.id }).from(matters)
            .where(and(eq(matters.id, id), eq(matters.advocateId, request.advocateId))).limit(1);
        if (!existing)
            return reply.status(404).send({ error: "Matter not found" });
        const { title, matterType, caseNumber, status, courtCode, feesAgreed } = request.body;
        const updates = { updatedAt: new Date() };
        if (title)
            updates.title = title.trim();
        if (matterType)
            updates.matterType = matterType;
        if (caseNumber)
            updates.caseNumber = caseNumber;
        if (status)
            updates.status = status;
        if (courtCode)
            updates.courtCode = courtCode;
        if (feesAgreed !== undefined)
            updates.feesAgreed = feesAgreed.toString();
        await db.update(matters).set(updates).where(eq(matters.id, id));
        const [updated] = await db.select().from(matters).where(eq(matters.id, id)).limit(1);
        return reply.send({ success: true, matter: updated });
    });
    fastify.delete("/:id", async (request, reply) => {
        const { id } = request.params;
        const [existing] = await db.select({ id: matters.id }).from(matters)
            .where(and(eq(matters.id, id), eq(matters.advocateId, request.advocateId))).limit(1);
        if (!existing)
            return reply.status(404).send({ error: "Matter not found" });
        await db.delete(matters).where(eq(matters.id, id));
        return reply.send({ success: true });
    });
};
// ─────────────────────────────────────────────────────────────────────────────
// HEARINGS ROUTES
// ─────────────────────────────────────────────────────────────────────────────
const hearingRoutes = async (fastify) => {
    fastify.addHook("preHandler", authMiddleware);
    fastify.get("/", async (request) => {
        const { page, limit, offset } = parsePage(request.query);
        const { status, from, to } = request.query;
        const conditions = [eq(hearings.advocateId, request.advocateId)];
        if (status)
            conditions.push(eq(hearings.status, status));
        if (from)
            conditions.push(gte(hearings.scheduledAt, new Date(from)));
        if (to)
            conditions.push(lte(hearings.scheduledAt, new Date(to)));
        const [result, totalResult] = await Promise.all([
            db.select().from(hearings).where(and(...conditions)).orderBy(asc(hearings.scheduledAt)).limit(limit).offset(offset),
            db.select({ count: count() }).from(hearings).where(and(...conditions)),
        ]);
        return { hearings: result, total: totalResult[0].count, page, limit };
    });
    fastify.post("/", async (request, reply) => {
        const { matterId, scheduledAt, courtCode, courtHall, judgeName, purpose } = request.body;
        if (!scheduledAt)
            return reply.status(400).send({ error: "scheduledAt is required" });
        const hearingIdGen = crypto.randomUUID();
        await db.insert(hearings).values({
            id: hearingIdGen,
            matterId: matterId || crypto.randomUUID(),
            advocateId: request.advocateId,
            tenantId: request.tenantId,
            scheduledAt: new Date(scheduledAt),
            courtCode,
            courtHall,
            judgeName,
            purpose,
        });
        const [hearing] = await db.select().from(hearings).where(eq(hearings.id, hearingIdGen)).limit(1);
        return reply.status(201).send({ success: true, hearingId: hearing.id, hearing });
    });
    fastify.patch("/:id", async (request, reply) => {
        const { id } = request.params;
        const [existing] = await db.select({ id: hearings.id }).from(hearings)
            .where(and(eq(hearings.id, id), eq(hearings.advocateId, request.advocateId))).limit(1);
        if (!existing)
            return reply.status(404).send({ error: "Hearing not found" });
        const { status, nextDate, orderSummary, scheduledAt, judgeName, courtHall } = request.body;
        const updates = {};
        if (status)
            updates.status = status;
        if (nextDate)
            updates.nextDate = nextDate;
        if (orderSummary)
            updates.orderSummary = orderSummary;
        if (scheduledAt)
            updates.scheduledAt = new Date(scheduledAt);
        if (judgeName)
            updates.judgeName = judgeName;
        if (courtHall)
            updates.courtHall = courtHall;
        await db.update(hearings).set(updates).where(eq(hearings.id, id));
        const [updated] = await db.select().from(hearings).where(eq(hearings.id, id)).limit(1);
        return reply.send({ success: true, hearing: updated });
    });
    fastify.delete("/:id", async (request, reply) => {
        const { id } = request.params;
        const [existing] = await db.select({ id: hearings.id }).from(hearings)
            .where(and(eq(hearings.id, id), eq(hearings.advocateId, request.advocateId))).limit(1);
        if (!existing)
            return reply.status(404).send({ error: "Hearing not found" });
        await db.delete(hearings).where(eq(hearings.id, id));
        return reply.send({ success: true });
    });
    // Calendar view — hearings in a date range
    fastify.get("/calendar", async (request) => {
        const { from, to } = request.query;
        const start = from ? new Date(from) : new Date();
        const end = to ? new Date(to) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const result = await db.select().from(hearings)
            .where(and(eq(hearings.advocateId, request.advocateId), gte(hearings.scheduledAt, start), lte(hearings.scheduledAt, end)))
            .orderBy(asc(hearings.scheduledAt))
            .limit(100);
        return { hearings: result, from: start.toISOString(), to: end.toISOString() };
    });
};
// ─────────────────────────────────────────────────────────────────────────────
// INVOICES ROUTES
// ─────────────────────────────────────────────────────────────────────────────
const invoiceRoutes = async (fastify) => {
    fastify.addHook("preHandler", authMiddleware);
    fastify.get("/", async (request) => {
        const { page, limit, offset } = parsePage(request.query);
        const { status } = request.query;
        const conditions = [eq(invoices.advocateId, request.advocateId)];
        if (status)
            conditions.push(eq(invoices.status, status));
        const [result, totalResult] = await Promise.all([
            db.select().from(invoices).where(and(...conditions)).orderBy(desc(invoices.createdAt)).limit(limit).offset(offset),
            db.select({ count: count() }).from(invoices).where(and(...conditions)),
        ]);
        return { invoices: result, total: totalResult[0].count, page, limit };
    });
    fastify.post("/", async (request, reply) => {
        const { clientId, matterId, amount, gstPercent = 18, dueDate, notes } = request.body;
        if (!clientId || !amount)
            return reply.status(400).send({ error: "clientId and amount are required" });
        const gstAmount = parseFloat(((amount * gstPercent) / 100).toFixed(2));
        const totalAmount = parseFloat((Number(amount) + gstAmount).toFixed(2));
        const invoiceNumber = `INV-${Date.now()}`;
        const invoiceIdGen = crypto.randomUUID();
        await db.insert(invoices).values({
            id: invoiceIdGen,
            advocateId: request.advocateId,
            clientId,
            tenantId: request.tenantId,
            matterId: matterId || null,
            invoiceNumber,
            amount: amount.toString(),
            gstAmount: gstAmount.toString(),
            totalAmount: totalAmount.toString(),
            dueDate,
            notes,
        });
        const [invoice] = await db.select().from(invoices).where(eq(invoices.id, invoiceIdGen)).limit(1);
        return reply.status(201).send({ success: true, invoiceId: invoice.id, invoice });
    });
    fastify.patch("/:id/status", async (request, reply) => {
        const { id } = request.params;
        const { status } = request.body;
        const [existing] = await db.select({ id: invoices.id }).from(invoices)
            .where(and(eq(invoices.id, id), eq(invoices.advocateId, request.advocateId))).limit(1);
        if (!existing)
            return reply.status(404).send({ error: "Invoice not found" });
        const updates = { status, updatedAt: new Date() };
        if (status === "PAID")
            updates.paidAt = new Date();
        await db.update(invoices).set(updates).where(eq(invoices.id, id));
        const [updated] = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
        return reply.send({ success: true, invoice: updated });
    });
};
// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENTS ROUTES
// ─────────────────────────────────────────────────────────────────────────────
const documentRoutes = async (fastify) => {
    fastify.addHook("preHandler", authMiddleware);
    fastify.get("/", async (request) => {
        const { page, limit, offset } = parsePage(request.query);
        const [result, totalResult] = await Promise.all([
            db.select().from(documents).where(eq(documents.advocateId, request.advocateId)).orderBy(desc(documents.createdAt)).limit(limit).offset(offset),
            db.select({ count: count() }).from(documents).where(eq(documents.advocateId, request.advocateId)),
        ]);
        return { documents: result, total: totalResult[0].count, page, limit };
    });
    fastify.post("/", async (request, reply) => {
        const { clientId, matterId, docType, title, htmlContent, aiGenerated } = request.body;
        if (!docType || !title)
            return reply.status(400).send({ error: "docType and title are required" });
        const docIdGen = crypto.randomUUID();
        await db.insert(documents).values({
            id: docIdGen,
            advocateId: request.advocateId,
            tenantId: request.tenantId,
            clientId: clientId || null,
            matterId: matterId || null,
            docType,
            title,
            htmlContent,
            aiGenerated: aiGenerated || false,
        });
        const [doc] = await db.select().from(documents).where(eq(documents.id, docIdGen)).limit(1);
        return reply.status(201).send({ success: true, documentId: doc.id, document: doc });
    });
    fastify.delete("/:id", async (request, reply) => {
        const { id } = request.params;
        const [existing] = await db.select({ id: documents.id }).from(documents)
            .where(and(eq(documents.id, id), eq(documents.advocateId, request.advocateId))).limit(1);
        if (!existing)
            return reply.status(404).send({ error: "Document not found" });
        await db.delete(documents).where(eq(documents.id, id));
        return reply.send({ success: true });
    });
};
// ── Global search ─────────────────────────────────────────────────────────
fastify.get("/v1/workspace/search", { preHandler: authMiddleware }, async (request) => {
    const { q } = request.query;
    if (!q || q.trim().length < 2)
        return { results: [] };
    const [foundClients, foundMatters] = await Promise.all([
        db.select().from(clients).where(and(eq(clients.advocateId, request.advocateId), or(like(clients.fullName, `%${q}%`), like(clients.caseTitle, `%${q}%`)))).limit(5),
        db.select().from(matters).where(and(eq(matters.advocateId, request.advocateId), like(matters.title, `%${q}%`))).limit(5),
    ]);
    return {
        results: [
            ...foundClients.map(c => ({ type: "client", ...c })),
            ...foundMatters.map(m => ({ type: "matter", ...m })),
        ],
    };
});
// ── Register all route groups ─────────────────────────────────────────────
fastify.register(clientRoutes, { prefix: "/v1/workspace/clients" });
fastify.register(matterRoutes, { prefix: "/v1/workspace/matters" });
fastify.register(hearingRoutes, { prefix: "/v1/workspace/hearings" });
fastify.register(invoiceRoutes, { prefix: "/v1/workspace/invoices" });
fastify.register(documentRoutes, { prefix: "/v1/workspace/documents" });
// ── Start ─────────────────────────────────────────────────────────────────
const start = async () => {
    try {
        await fastify.listen({ port: PORT, host: "0.0.0.0" });
        console.log(`✅ workspace-svc running on port ${PORT} [PRODUCTION — MySQL]`);
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
