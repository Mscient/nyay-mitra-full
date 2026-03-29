import Fastify from "fastify";
import cors from "@fastify/cors";

const fastify = Fastify({
  logger: true,
});

fastify.register(cors);

fastify.get("/health", async (request, reply) => {
  return { status: "ok", service: "identity-svc" };
});

const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 4001;
    await fastify.listen({ port, host: "0.0.0.0" });
    console.log(`identity-svc running on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
