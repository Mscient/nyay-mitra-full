"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matterRoutes = void 0;
const zod_1 = require("zod");
const database_1 = require("@nyay-mitra/database");
const drizzle_orm_1 = require("drizzle-orm");
const MatterSchema = zod_1.z.object({
    title: zod_1.z.string().min(5),
    clientId: zod_1.z.string().uuid(),
    matterType: zod_1.z.enum(["CRIMINAL", "CIVIL", "CORPORATE", "FAMILY", "TAX"]),
    courtCode: zod_1.z.string().optional(),
    caseNumber: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    feesAgreed: zod_1.z.string().optional(),
});
const matterRoutes = async (fastify) => {
    // CREATE MATTER
    fastify.post("/", async (request, reply) => {
        try {
            const data = MatterSchema.parse(request.body);
            const { tenantId, advocateId } = request;
            const [newMatter] = await database_1.db.insert(database_1.matters).values({
                tenantId,
                advocateId,
                clientId: data.clientId,
                title: data.title,
                matterType: data.matterType,
                courtCode: data.courtCode,
                caseNumber: data.caseNumber,
                descriptionEnc: data.description ? Buffer.from(data.description) : null,
                feesAgreed: data.feesAgreed || null,
            }).returning({ id: database_1.matters.id });
            return reply.status(201).send({
                success: true,
                message: `Matter '${data.title}' created successfully`,
                matterId: newMatter.id,
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
    // GET MATTERS
    fastify.get("/", async (request, reply) => {
        try {
            const records = await database_1.db.select().from(database_1.matters)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.matters.tenantId, request.tenantId), (0, drizzle_orm_1.eq)(database_1.matters.advocateId, request.advocateId)));
            const mapped = records.map(m => ({
                ...m,
                descriptionEnc: m.descriptionEnc ? m.descriptionEnc.toString() : "",
            }));
            return reply.send({ matters: mapped });
        }
        catch (err) {
            fastify.log.error(err);
            return reply.status(500).send({ error: "Internal server error" });
        }
    });
};
exports.matterRoutes = matterRoutes;
