"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientRoutes = void 0;
const zod_1 = require("zod");
const database_1 = require("@nyay-mitra/database");
const drizzle_orm_1 = require("drizzle-orm");
const ClientSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().min(10),
    aadhaarId: zod_1.z.string().regex(/^\d{4}-\d{4}-\d{4}$/, "Must be format XXXX-XXXX-1234"),
});
const clientRoutes = async (fastify) => {
    // CREATE CLIENT
    fastify.post("/", async (request, reply) => {
        try {
            const data = ClientSchema.parse(request.body);
            const { tenantId } = request;
            // Sandbox Aadhaar Check
            if (!data.aadhaarId.startsWith("XXXX-XXXX-")) {
                return reply.status(400).send({ error: "Sandbox mode only accepts masked tests (XXXX-XXXX-1234)" });
            }
            await database_1.db.insert(database_1.clients).values({
                tenantId,
                fullNameEnc: Buffer.from(data.fullName),
                emailEnc: Buffer.from(data.email),
                phoneEnc: Buffer.from(data.phone),
                aadhaarRef: data.aadhaarId.slice(-4),
            });
            return reply.status(201).send({
                success: true,
                message: "Client onboarded and Aadhaar verified via sandbox",
                clientData: {
                    fullName: data.fullName,
                    aadhaarRef: data.aadhaarId.slice(-4)
                }
            });
        }
        catch (err) {
            if (err instanceof zod_1.z.ZodError) {
                return reply.status(400).send({ error: "Validation failed", details: err.errors });
            }
            fastify.log.error(err);
            return reply.status(500).send({ error: "Internal server error" });
        }
    });
    // GET CLIENTS
    fastify.get("/", async (request, reply) => {
        try {
            const records = await database_1.db.select().from(database_1.clients).where((0, drizzle_orm_1.eq)(database_1.clients.tenantId, request.tenantId));
            // Map Buffer back to string for response (MVP Phase 1)
            const mapped = records.map(c => ({
                id: c.id,
                fullName: c.fullNameEnc ? c.fullNameEnc.toString() : "Unknown",
                email: c.emailEnc ? c.emailEnc.toString() : "",
                phone: c.phoneEnc ? c.phoneEnc.toString() : "",
                aadhaarRef: c.aadhaarRef,
                createdAt: c.createdAt,
            }));
            return reply.send({ clients: mapped });
        }
        catch (err) {
            fastify.log.error(err);
            return reply.status(500).send({ error: "Internal server error" });
        }
    });
};
exports.clientRoutes = clientRoutes;
