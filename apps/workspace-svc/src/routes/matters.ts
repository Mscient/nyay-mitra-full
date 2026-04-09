import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { db, matters } from "@nyay-mitra/database";
import { eq, and } from "drizzle-orm";

const MatterSchema = z.object({
  title: z.string().min(5),
  clientId: z.string().uuid(),
  matterType: z.enum(["CRIMINAL", "CIVIL", "CORPORATE", "FAMILY", "TAX"]),
  courtCode: z.string().optional(),
  caseNumber: z.string().optional(),
  description: z.string().optional(),
  feesAgreed: z.string().optional(),
});

export const matterRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // CREATE MATTER
  fastify.post("/", async (request, reply) => {
    try {
      const data = MatterSchema.parse(request.body);
      const { tenantId, advocateId } = request;

      const [newMatter] = await db.insert(matters).values({
        tenantId,
        advocateId,
        clientId: data.clientId,
        title: data.title,
        matterType: data.matterType,
        courtCode: data.courtCode,
        caseNumber: data.caseNumber,
        descriptionEnc: data.description ? Buffer.from(data.description) : null,
        feesAgreed: data.feesAgreed || null,
      }).returning({ id: matters.id });

      return reply.status(201).send({
        success: true,
        message: `Matter '${data.title}' created successfully`,
        matterId: newMatter.id,
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return reply.status(400).send({ error: "Validation failed", details: err.errors });
      }
      fastify.log.error(err);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });

  // GET MATTERS
  fastify.get("/", async (request, reply) => {
    try {
      const records = await db.select().from(matters)
        .where(
          and(
            eq(matters.tenantId, request.tenantId),
            eq(matters.advocateId, request.advocateId)
          )
        );
      
      const mapped = records.map(m => ({
        ...m,
        descriptionEnc: m.descriptionEnc ? m.descriptionEnc.toString() : "",
      }));

      return reply.send({ matters: mapped });
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });
};
