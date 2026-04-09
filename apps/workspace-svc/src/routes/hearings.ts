import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { z } from "zod";
import crypto from "crypto";

const CreateHearingSchema = z.object({
  matterId: z.string().uuid(),
  scheduledAt: z.string().datetime(),
  courtCode: z.string().optional(),
  courtHall: z.string().optional(),
  judgeName: z.string().optional(),
  purpose: z.string().optional(),
});

const HearingSchema = z.object({
  status: z.enum(["UPCOMING", "HEARD", "ADJOURNED", "PART_HEARD"]),
  nextDate: z.string().optional(),
  orderSummary: z.string().optional(),
});

interface Hearing {
  id: string;
  matterId: string;
  advocateId: string;
  scheduledAt: string;
  courtCode?: string;
  courtHall?: string;
  judgeName?: string;
  orderSummary?: string;
  status: string;
  nextDate?: string;
  createdAt: string;
}

const hearingStore = new Map<string, Hearing>();

export const hearingRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // CREATE HEARING
  fastify.post("/", async (request, reply) => {
    try {
      const data = CreateHearingSchema.parse(request.body);
      const { advocateId } = request;

      const id = crypto.randomUUID();
      const hearing: Hearing = {
        id,
        matterId: data.matterId,
        advocateId,
        scheduledAt: data.scheduledAt,
        courtCode: data.courtCode,
        courtHall: data.courtHall,
        judgeName: data.judgeName,
        orderSummary: data.purpose,
        status: "UPCOMING",
        createdAt: new Date().toISOString(),
      };
      hearingStore.set(id, hearing);

      return reply.status(201).send({ success: true, hearingId: id });
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

      const records = [...hearingStore.values()].filter(h => h.advocateId === advocateId);

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

      const existing = hearingStore.get(id);
      if (existing) {
        hearingStore.set(id, { ...existing, ...data });
      }

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
  fastify.get("/sync-ecourts", async (_request, reply) => {
    return reply.send({
      success: true,
      data: { synced_count: 0, new_dates: [] },
    });
  });
};
