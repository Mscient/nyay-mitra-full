"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hearingRoutes = void 0;
const zod_1 = require("zod");
const database_1 = require("@nyay-mitra/database");
const drizzle_orm_1 = require("drizzle-orm");
const CreateHearingSchema = zod_1.z.object({
    matterId: zod_1.z.string().uuid(),
    scheduledAt: zod_1.z.string().datetime(),
    courtCode: zod_1.z.string().optional(),
    courtHall: zod_1.z.string().optional(),
    judgeName: zod_1.z.string().optional(),
    purpose: zod_1.z.string().optional(), // UI-friendly alias for orderSummary
});
const HearingSchema = zod_1.z.object({
    status: zod_1.z.enum(["UPCOMING", "HEARD", "ADJOURNED", "PART_HEARD"]),
    nextDate: zod_1.z.string().optional(),
    orderSummary: zod_1.z.string().optional(),
});
const hearingRoutes = async (fastify) => {
    // CREATE HEARING
    fastify.post("/", async (request, reply) => {
        try {
            const data = CreateHearingSchema.parse(request.body);
            const { advocateId } = request;
            // Verify the matter belongs to this advocate
            const [matter] = await database_1.db.select({ id: database_1.matters.id })
                .from(database_1.matters)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.matters.id, data.matterId), (0, drizzle_orm_1.eq)(database_1.matters.advocateId, advocateId)));
            if (!matter) {
                return reply.status(404).send({ error: "Matter not found or not owned by this advocate" });
            }
            const [newHearing] = await database_1.db.insert(database_1.hearings).values({
                matterId: data.matterId,
                scheduledAt: new Date(data.scheduledAt),
                courtCode: data.courtCode,
                courtHall: data.courtHall,
                judgeName: data.judgeName,
                orderSummary: data.purpose,
                status: "UPCOMING",
            }).returning({ id: database_1.hearings.id });
            return reply.status(201).send({ success: true, hearingId: newHearing.id });
        }
        catch (err) {
            if (err instanceof zod_1.z.ZodError) {
                return reply.status(400).send({ error: "Validation failed", details: err.errors });
            }
            fastify.log.error(err);
            return reply.status(500).send({ error: "Internal server error" });
        }
    });
    // GET HEARINGS
    fastify.get("/", async (request, reply) => {
        try {
            const { advocateId } = request;
            const matterIdFilter = request.query.matter_id;
            let query = database_1.db.select({
                id: database_1.hearings.id,
                scheduledAt: database_1.hearings.scheduledAt,
                status: database_1.hearings.status,
                courtCode: database_1.hearings.courtCode,
                matterId: database_1.hearings.matterId,
                matterTitle: database_1.matters.title
            })
                .from(database_1.hearings)
                .leftJoin(database_1.matters, (0, drizzle_orm_1.eq)(database_1.hearings.matterId, database_1.matters.id))
                .where((0, drizzle_orm_1.eq)(database_1.matters.advocateId, advocateId));
            await query;
            // Drizzle ORM doesn't easily chain optional wheres dynamically like Knex without building an array of conditions,
            // but for MVP we will fetch all that belong to the advocate.
            const records = await query;
            // Filter logically if matter_id provided
            const filtered = matterIdFilter
                ? records.filter(r => r.matterId === matterIdFilter)
                : records;
            return reply.send({ hearings: filtered });
        }
        catch (err) {
            fastify.log.error(err);
            return reply.status(500).send({ error: "Internal server error" });
        }
    });
    // UPDATE HEARING
    fastify.post("/:id/update", async (request, reply) => {
        try {
            const data = HearingSchema.parse(request.body);
            const { id } = request.params;
            await database_1.db.update(database_1.hearings)
                .set({
                status: data.status,
                nextDate: data.nextDate,
                orderSummary: data.orderSummary,
            })
                .where((0, drizzle_orm_1.eq)(database_1.hearings.id, id));
            return reply.send({
                success: true,
                message: `Hearing ${id} updated successfully`,
                hearing: { id, ...data },
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
    // SYNC ECOURTS
    fastify.get("/sync-ecourts", async (request, reply) => {
        // Input: { matter_id }
        return reply.send({
            success: true,
            data: { synced_count: 0, new_dates: [] }
        });
    });
};
exports.hearingRoutes = hearingRoutes;
