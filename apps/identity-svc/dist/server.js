// identity-svc — Production Auth Service
// MySQL 8.0 persistence via Drizzle ORM  ·  bcrypt cost 12  ·  HS256 JWT
// Refresh token rotation  ·  Zod validation  ·  Rate limiting  ·  Helmet headers
// Complies with .cursor/rules: no hardcoded secrets, PII handling, DPDP Act 2023
// NOTE: MySQL does not support RETURNING — use insert-then-select pattern throughout.
import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, users, tenants, sessions } from "@nyay-mitra/database";
dotenv.config();
// ── Config ────────────────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET)
    throw new Error("JWT_SECRET must be set in environment variables");
const JWT_EXPIRY = "15m";
const REFRESH_EXPIRY_DAYS = 30;
const BCRYPT_COST = 12;
// ── Zod Schemas ───────────────────────────────────────────────────────────────
const RegisterSchema = z.object({
    name: z.string().min(2).max(100).trim(),
    email: z.string().email().toLowerCase(),
    password: z.string().min(8).max(128),
    userType: z.enum(["CITIZEN", "ADVOCATE", "STUDENT", "ORG_ADMIN"]).default("CITIZEN"),
    lang: z.string().default("en"),
    bciNumber: z.string().optional(),
});
const LoginSchema = z.object({
    email: z.string().email().toLowerCase(),
    password: z.string().min(1),
});
// ── Rate limiting (100 req/min per IP) ────────────────────────────────────────
const rateLimitMap = new Map();
function checkRateLimit(ip, limit = 100) {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);
    if (!entry || entry.reset < now) {
        rateLimitMap.set(ip, { count: 1, reset: now + 60_000 });
        return true;
    }
    if (entry.count >= limit)
        return false;
    entry.count++;
    return true;
}
// ── Helpers ───────────────────────────────────────────────────────────────────
function stripPii(text) {
    return text
        .replace(/\b\d{12}\b/g, "[REDACTED]")
        .replace(/\b[6-9]\d{9}\b/g, "[PHONE]")
        .replace(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi, "[EMAIL]");
}
function getIp(request) {
    return request.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() ?? "unknown";
}
function makeAccessToken(user) {
    return jwt.sign({ sub: user.id, tenantId: user.tenantId, email: user.email, userType: user.userType }, JWT_SECRET, { expiresIn: JWT_EXPIRY, algorithm: "HS256" });
}
async function createRefreshToken(userId, tenantId, ip, userAgent) {
    const token = crypto.randomBytes(40).toString("hex");
    const expiresAt = new Date(Date.now() + REFRESH_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    await db.insert(sessions).values({
        userId,
        tenantId,
        refreshToken: token,
        ipAddress: ip,
        userAgent,
        expiresAt,
    });
    return token;
}
// ── Fastify setup ─────────────────────────────────────────────────────────────
const fastify = Fastify({ logger: { level: process.env.LOG_LEVEL ?? "info" } });
await fastify.register(cors, {
    origin: process.env.ALLOWED_ORIGINS?.split(",") ?? true,
    credentials: true,
});
await fastify.register(helmet, { contentSecurityPolicy: false });
// Rate-limit hook
fastify.addHook("preHandler", async (request, reply) => {
    const ip = getIp(request);
    if (!checkRateLimit(ip)) {
        return reply.status(429).send({ error: "Rate limit exceeded. Try again in a minute." });
    }
});
// ── Health ────────────────────────────────────────────────────────────────────
fastify.get("/health", async () => {
    // Quick DB ping
    try {
        await db.select().from(users).limit(1);
        return { status: "ok", service: "identity-svc", db: "connected", store: "postgresql" };
    }
    catch {
        return { status: "degraded", service: "identity-svc", db: "disconnected" };
    }
});
// ── POST /v1/auth/register ────────────────────────────────────────────────────
fastify.post("/v1/auth/register", async (request, reply) => {
    const parse = RegisterSchema.safeParse(request.body);
    if (!parse.success) {
        return reply.status(400).send({ success: false, error: parse.error.errors[0]?.message ?? "Validation failed" });
    }
    const { name, email, password, userType, lang, bciNumber } = parse.data;
    // Check if email already registered
    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
        return reply.status(409).send({ success: false, error: "Email already registered" });
    }
    const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
    // Create tenant for this user (each user gets own tenant)
    // MySQL has no RETURNING — insert then select back by unique key
    const tenantName = `${name}'s Workspace`;
    await db.insert(tenants).values({ name: tenantName });
    const [tenant] = await db.select().from(tenants).where(eq(tenants.name, tenantName)).limit(1);
    // Create user
    await db.insert(users).values({
        tenantId: tenant.id,
        email,
        passwordHash,
        fullName: name,
        userType: userType,
        preferredLang: lang,
        bciNumber: bciNumber || null,
        lastLoginAt: new Date(),
    });
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const accessToken = makeAccessToken({ id: user.id, tenantId: user.tenantId, email: user.email, userType: user.userType });
    const ip = getIp(request);
    const userAgent = request.headers["user-agent"] ?? "";
    const refreshToken = await createRefreshToken(user.id, user.tenantId, ip, userAgent);
    fastify.log.info({ event: "register", userId: user.id, userType: stripPii(userType) });
    return reply.status(201).send({
        success: true,
        token: accessToken,
        refreshToken,
        user: { id: user.id, name, email: user.email, userType: user.userType, lang },
        expiresIn: 900,
    });
});
// ── POST /v1/auth/login ───────────────────────────────────────────────────────
fastify.post("/v1/auth/login", async (request, reply) => {
    const parse = LoginSchema.safeParse(request.body);
    if (!parse.success) {
        return reply.status(400).send({ success: false, error: "Email and password are required" });
    }
    const { email, password } = parse.data;
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user || !user.passwordHash) {
        // Constant-time response to prevent user enumeration
        await bcrypt.hash("dummy_constant_time", BCRYPT_COST);
        return reply.status(401).send({ success: false, error: "Invalid email or password" });
    }
    if (!user.isActive) {
        return reply.status(403).send({ success: false, error: "Account is deactivated. Contact support." });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
        return reply.status(401).send({ success: false, error: "Invalid email or password" });
    }
    // Update last login timestamp
    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));
    const accessToken = makeAccessToken({ id: user.id, tenantId: user.tenantId, email: user.email, userType: user.userType });
    const ip = getIp(request);
    const userAgent = request.headers["user-agent"] ?? "";
    const refreshToken = await createRefreshToken(user.id, user.tenantId, ip, userAgent);
    fastify.log.info({ event: "login", userId: user.id });
    return reply.send({
        success: true,
        token: accessToken,
        refreshToken,
        user: { id: user.id, name: user.fullName, email: user.email, userType: user.userType, lang: user.preferredLang, avatarUrl: user.avatarUrl },
        expiresIn: 900,
    });
});
// ── POST /v1/auth/refresh ─────────────────────────────────────────────────────
fastify.post("/v1/auth/refresh", async (request, reply) => {
    const { refreshToken } = request.body ?? {};
    if (!refreshToken) {
        return reply.status(400).send({ success: false, error: "refreshToken is required" });
    }
    const [session] = await db.select().from(sessions).where(eq(sessions.refreshToken, refreshToken)).limit(1);
    if (!session || session.expiresAt < new Date()) {
        if (session)
            await db.delete(sessions).where(eq(sessions.id, session.id));
        return reply.status(401).send({ success: false, error: "Invalid or expired refresh token" });
    }
    const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
    if (!user || !user.isActive) {
        return reply.status(401).send({ success: false, error: "User not found or deactivated" });
    }
    // Rotate: delete old session, issue new
    await db.delete(sessions).where(eq(sessions.id, session.id));
    const ip = getIp(request);
    const userAgent = request.headers["user-agent"] ?? "";
    const newRefreshToken = await createRefreshToken(user.id, user.tenantId, ip, userAgent);
    const newAccessToken = makeAccessToken({ id: user.id, tenantId: user.tenantId, email: user.email, userType: user.userType });
    return reply.send({ success: true, token: newAccessToken, refreshToken: newRefreshToken, expiresIn: 900 });
});
// ── POST /v1/auth/logout ──────────────────────────────────────────────────────
fastify.post("/v1/auth/logout", async (request, reply) => {
    const { refreshToken } = request.body ?? {};
    if (refreshToken) {
        await db.delete(sessions).where(eq(sessions.refreshToken, refreshToken)).catch(() => { });
    }
    return reply.send({ success: true });
});
// ── POST /v1/auth/verify-token ────────────────────────────────────────────────
fastify.post("/v1/auth/verify-token", async (request, reply) => {
    const authHeader = request.headers["authorization"];
    const token = authHeader?.replace("Bearer ", "");
    if (!token)
        return reply.status(401).send({ valid: false });
    try {
        const payload = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
        return reply.send({ valid: true, userId: payload.sub, tenantId: payload.tenantId, userType: payload.userType });
    }
    catch {
        return reply.status(401).send({ valid: false, error: "Token invalid or expired" });
    }
});
// ── GET /v1/auth/me ───────────────────────────────────────────────────────────
fastify.get("/v1/auth/me", async (request, reply) => {
    const authHeader = request.headers["authorization"];
    const token = authHeader?.replace("Bearer ", "");
    if (!token)
        return reply.status(401).send({ error: "Unauthorized" });
    try {
        const payload = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
        const [user] = await db.select({
            id: users.id,
            email: users.email,
            fullName: users.fullName,
            userType: users.userType,
            kycLevel: users.kycLevel,
            bciVerified: users.bciVerified,
            avatarUrl: users.avatarUrl,
            preferredLang: users.preferredLang,
            createdAt: users.createdAt,
        }).from(users).where(eq(users.id, payload.sub)).limit(1);
        if (!user)
            return reply.status(404).send({ error: "User not found" });
        return reply.send({ user });
    }
    catch {
        return reply.status(401).send({ error: "Invalid token" });
    }
});
// ── PATCH /v1/auth/profile ────────────────────────────────────────────────────
fastify.patch("/v1/auth/profile", async (request, reply) => {
    const authHeader = request.headers["authorization"];
    const token = authHeader?.replace("Bearer ", "");
    if (!token)
        return reply.status(401).send({ error: "Unauthorized" });
    try {
        const payload = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
        const { fullName, preferredLang, avatarUrl } = request.body ?? {};
        const updates = { updatedAt: new Date() };
        if (fullName?.trim())
            updates.fullName = fullName.trim();
        if (preferredLang)
            updates.preferredLang = preferredLang;
        if (avatarUrl)
            updates.avatarUrl = avatarUrl;
        await db.update(users).set(updates).where(eq(users.id, payload.sub));
        return reply.send({ success: true });
    }
    catch {
        return reply.status(401).send({ error: "Invalid token" });
    }
});
// ── POST /v1/auth/send-otp (STUB — SMS provider not yet integrated) ─────────────
fastify.post("/v1/auth/send-otp", async (_request, reply) => {
    // TODO: Integrate Exotel/Twilio/MSG91 for real OTP delivery.
    // Returning 501 so clients know this is not yet live.
    return reply.status(501).send({
        success: false,
        error: "OTP via SMS is not yet implemented. Please use email/password login.",
        code: "OTP_NOT_IMPLEMENTED",
    });
});
// ── POST /v1/auth/bci-verify (STUB — Bar Council API partnership required) ────
fastify.post("/v1/auth/bci-verify", async (request, reply) => {
    const { bci_number } = request.body ?? {};
    // TODO: Integrate real Bar Council of India API when partnership is established.
    // Do NOT return verified:true here — that would grant advocate-level access to unverified users.
    return reply.status(501).send({
        success: false,
        verified: false,
        bci_number,
        error: "BCI verification is not yet live. Real API partnership with Bar Council of India is required.",
        code: "BCI_VERIFICATION_NOT_IMPLEMENTED",
    });
});
// ── DELETE /v1/auth/account ───────────────────────────────────────────────────
fastify.delete("/v1/auth/account", async (request, reply) => {
    const authHeader = request.headers["authorization"];
    const token = authHeader?.replace("Bearer ", "");
    if (!token)
        return reply.status(401).send({ error: "Unauthorized" });
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        // Soft-delete: deactivate user
        await db.update(users).set({ isActive: false, updatedAt: new Date() }).where(eq(users.id, payload.sub));
        // Invalidate all sessions
        await db.delete(sessions).where(eq(sessions.userId, payload.sub));
        return reply.send({ success: true, message: "Account deactivated" });
    }
    catch {
        return reply.status(401).send({ error: "Invalid token" });
    }
});
// ── Start ─────────────────────────────────────────────────────────────────────
const start = async () => {
    try {
        const port = process.env.PORT ? parseInt(process.env.PORT) : 4001;
        await fastify.listen({ port, host: "0.0.0.0" });
        console.log(`✅ identity-svc running on port ${port} [PRODUCTION — PostgreSQL + bcrypt + JWT]`);
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
