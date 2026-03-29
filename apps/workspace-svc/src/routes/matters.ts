import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { z } from "zod";

const MatterSchema = z.object({
  title: z.string().min(5),
  clientId: z.string().uuid(),
  matterType: z.enum(["CRIMINAL", "CIVIL", "CORPORATE", "FAMILY", "TAX"]),
  courtCode: z.string().optional(),
  caseNumber: z.string().optional(),
  description: z.string(),
});

export const matterRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // CREATE MATTER
  fastify.post("/", async (request, reply) => {
    try {
      const data = MatterSchema.parse(request.body);

      // TODO: Insert into Drizzle DB and link to client + tenant
      
      return reply.status(201).send({
        success: true,
        message: `Matter '${data.title}' created successfully`,
        matterId: "temp-uuid-generated-by-db",
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
    // TODO: Fetch from Drizzle DB using Tenant ID
    return { matters: [] };
  });
};
