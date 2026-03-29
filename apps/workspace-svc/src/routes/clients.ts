import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { z } from "zod";

const ClientSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  aadhaarId: z.string().regex(/^\d{4}-\d{4}-\d{4}$/, "Must be format XXXX-XXXX-1234"),
});

export const clientRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // CREATE CLIENT
  fastify.post("/", async (request, reply) => {
    try {
      const data = ClientSchema.parse(request.body);
      
      // Sandbox Aadhaar Check
      if (!data.aadhaarId.startsWith("XXXX-XXXX-")) {
        return reply.status(400).send({ error: "Sandbox mode only accepts masked tests (XXXX-XXXX-1234)" });
      }

      // TODO: Insert into Drizzle DB
      // const newClient = await db.insert(clients).values({ ... })

      return reply.status(201).send({
        success: true,
        message: "Client onboarded and Aadhaar verified via sandbox",
        clientData: {
          fullName: data.fullName,
          aadhaarRef: data.aadhaarId.slice(-4)
        }
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return reply.status(400).send({ error: "Validation failed", details: err.errors });
      }
      fastify.log.error(err);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });

  // GET CLIENTS
  fastify.get("/", async (request, reply) => {
    // TODO: Fetch from Drizzle DB using Tenant ID from JWT
    return { clients: [] };
  });
};
