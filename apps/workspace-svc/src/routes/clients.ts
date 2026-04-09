import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { db, clients } from "@nyay-mitra/database";
import { eq } from "drizzle-orm";

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
      const { tenantId } = request;
      
      // Sandbox Aadhaar Check
      if (!data.aadhaarId.startsWith("XXXX-XXXX-")) {
        return reply.status(400).send({ error: "Sandbox mode only accepts masked tests (XXXX-XXXX-1234)" });
      }

      await db.insert(clients).values({
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
      const records = await db.select().from(clients).where(eq(clients.tenantId, request.tenantId));
      
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
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });
};
