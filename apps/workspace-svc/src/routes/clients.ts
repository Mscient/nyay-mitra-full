import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { z } from "zod";
import crypto from "crypto";

const ClientSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  aadhaarId: z.string().regex(/^\d{4}-\d{4}-\d{4}$/, "Must be format XXXX-XXXX-1234"),
});

interface Client {
  id: string;
  tenantId: string;
  fullName: string;
  email: string;
  phone: string;
  aadhaarRef: string;
  createdAt: string;
}

const clientStore = new Map<string, Client>();

export const clientRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // CREATE CLIENT
  fastify.post("/", async (request, reply) => {
    try {
      const data = ClientSchema.parse(request.body);
      const { tenantId } = request;

      // Sandbox Aadhaar Check
      if (!data.aadhaarId.startsWith("XXXX-XXXX-")) {
        return reply.status(400).send({ error: "Sandbox mode only accepts masked tests (XXXX-XXXX-1234)" });
      }

      const id = crypto.randomUUID();
      const client: Client = {
        id,
        tenantId,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        aadhaarRef: data.aadhaarId.slice(-4),
        createdAt: new Date().toISOString(),
      };
      clientStore.set(id, client);

      return reply.status(201).send({
        success: true,
        message: "Client onboarded and Aadhaar verified via sandbox",
        clientData: {
          fullName: data.fullName,
          aadhaarRef: data.aadhaarId.slice(-4),
        },
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
    try {
      const mapped = [...clientStore.values()]
        .filter(c => c.tenantId === request.tenantId)
        .map(c => ({
          id: c.id,
          fullName: c.fullName,
          email: c.email,
          phone: c.phone,
          aadhaarRef: c.aadhaarRef,
          createdAt: c.createdAt,
        }));

      return reply.send({ clients: mapped });
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });
};
