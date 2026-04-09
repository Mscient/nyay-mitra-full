import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { z } from "zod";
import crypto from "crypto";

const MatterSchema = z.object({
  title: z.string().min(5),
  clientId: z.string().uuid(),
  matterType: z.enum(["CRIMINAL", "CIVIL", "CORPORATE", "FAMILY", "TAX"]),
  courtCode: z.string().optional(),
  caseNumber: z.string().optional(),
  description: z.string().optional(),
  feesAgreed: z.string().optional(),
});

interface Matter {
  id: string;
  tenantId: string;
  advocateId: string;
  clientId: string;
  title: string;
  matterType: string;
  courtCode?: string;
  caseNumber?: string;
  description?: string;
  feesAgreed?: string;
  createdAt: string;
}

const matterStore = new Map<string, Matter>();

export const matterRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // CREATE MATTER
  fastify.post("/", async (request, reply) => {
    try {
      const data = MatterSchema.parse(request.body);
      const { tenantId, advocateId } = request;

      const id = crypto.randomUUID();
      const matter: Matter = {
        id,
        tenantId,
        advocateId,
        clientId: data.clientId,
        title: data.title,
        matterType: data.matterType,
        courtCode: data.courtCode,
        caseNumber: data.caseNumber,
        description: data.description,
        feesAgreed: data.feesAgreed,
        createdAt: new Date().toISOString(),
      };
      matterStore.set(id, matter);

      return reply.status(201).send({
        success: true,
        message: `Matter '${data.title}' created successfully`,
        matterId: id,
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
      const records = [...matterStore.values()].filter(
        m => m.tenantId === request.tenantId && m.advocateId === request.advocateId
      );

      return reply.send({ matters: records });
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });
};
