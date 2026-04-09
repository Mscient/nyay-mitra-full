import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { db, hearings, matters } from "@nyay-mitra/database";
import { eq, and } from "drizzle-orm";

const CreateHearingSchema = z.object({
  matterId: z.string().uuid(),
  scheduledAt: z.string().datetime(),
  courtCode: z.string().optional(),
  courtHall: z.string().optional(),
  judgeName: z.string().optional(),
  purpose: z.string().optional(), // UI-friendly alias for orderSummary
});

const HearingSchema = z.object({
  status: z.enum(["UPCOMING", "HEARD", "ADJOURNED", "PART_HEARD"]),
  nextDate: z.string().optional(),
  orderSummary: z.string().optional(),
});

export const hearingRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // CREATE HEARING
  fastify.post("/", async (request, reply) => {
    try {
      const data = CreateHearingSchema.parse(request.body);
      const { advocateId } = request;

      // Verify the matter belongs to this advocate
      const [matter] = await db.select({ id: matters.id })
        .from(matters)
        .where(and(eq(matters.id, data.matterId), eq(matters.advocateId, advocateId)));

      if (!matter) {
        return reply.status(404).send({ error: "Matter not found or not owned by this advocate" });
      }

      const [newHearing] = await db.insert(hearings).values({
        matterId: data.matterId,
        scheduledAt: new Date(data.scheduledAt),
        courtCode: data.courtCode,
        courtHall: data.courtHall,
        judgeName: data.judgeName,
        orderSummary: data.purpose,
        status: "UPCOMING",
      }).returning({ id: hearings.id });

      return reply.status(201).send({ success: true, hearingId: newHearing.id });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
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
      const matterIdFilter = (request.query as { matter_id?: string }).matter_id;

      let query = db.select({
        id: hearings.id,
        scheduledAt: hearings.scheduledAt,
        status: hearings.status,
        courtCode: hearings.courtCode,
        matterId: hearings.matterId,
        matterTitle: matters.title
      })
      .from(hearings)
      .leftJoin(matters, eq(hearings.matterId, matters.id))
      .where(eq(matters.advocateId, advocateId));

      await query;
      // Drizzle ORM doesn't easily chain optional wheres dynamically like Knex without building an array of conditions,
      // but for MVP we will fetch all that belong to the advocate.
      
      const records = await query;
      
      // Filter logically if matter_id provided
      const filtered = matterIdFilter 
        ? records.filter(r => r.matterId === matterIdFilter)
        : records;

      return reply.send({ hearings: filtered });
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });

  // UPDATE HEARING
  fastify.post("/:id/update", async (request, reply) => {
    try {
      const data = HearingSchema.parse(request.body);
      const { id } = request.params as { id: string };

      await db.update(hearings)
        .set({
          status: data.status,
          nextDate: data.nextDate,
          orderSummary: data.orderSummary,
        })
        .where(eq(hearings.id, id));
      
      return reply.send({
        success: true,
        message: `Hearing ${id} updated successfully`,
        hearing: { id, ...data },
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
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
