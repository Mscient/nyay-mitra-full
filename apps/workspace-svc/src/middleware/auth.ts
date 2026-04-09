import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

// Extend fastify request to hold tenant and user ids
declare module "fastify" {
  interface FastifyRequest {
    tenantId: string;
    advocateId: string;
  }
}

export async function mockAuthMiddleware(request: FastifyRequest, reply: FastifyReply) {
  // Read mock headers to simulate JWT payload decoding
  const tenantId = request.headers["x-tenant-id"] as string;
  const advocateId = request.headers["x-user-id"] as string;

  if (!tenantId || !advocateId) {
    return reply.status(401).send({ error: "Unauthorized", details: "Missing X-Tenant-Id or X-User-Id header" });
  }

  // Attach to request scope
  request.tenantId = tenantId;
  request.advocateId = advocateId;
}
