"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockAuthMiddleware = mockAuthMiddleware;
async function mockAuthMiddleware(request, reply) {
    // Read mock headers to simulate JWT payload decoding
    const tenantId = request.headers["x-tenant-id"];
    const advocateId = request.headers["x-user-id"];
    if (!tenantId || !advocateId) {
        return reply.status(401).send({ error: "Unauthorized", details: "Missing X-Tenant-Id or X-User-Id header" });
    }
    // Attach to request scope
    request.tenantId = tenantId;
    request.advocateId = advocateId;
}
