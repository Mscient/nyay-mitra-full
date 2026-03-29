import Fastify from "fastify";
import cors from "@fastify/cors";
import { clientRoutes } from "./routes/clients";
import { matterRoutes } from "./routes/matters";

const fastify = Fastify({
  logger: true,
});

fastify.register(cors);

fastify.get("/health", async (request, reply) => {
  return { status: "ok", service: "workspace-svc" };
});

fastify.register(clientRoutes, { prefix: "/v1/clients" });
fastify.register(matterRoutes, { prefix: "/v1/matters" });

const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 4002;
    await fastify.listen({ port, host: "0.0.0.0" });
    console.log(`workspace-svc running on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
