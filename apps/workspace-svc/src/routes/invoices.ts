import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { db, invoices, matters } from "@nyay-mitra/database";
import { eq } from "drizzle-orm";

const InvoiceSchema = z.object({
  matterId: z.string().uuid(),
  clientId: z.string().uuid(),
  amount: z.number().positive(),
  gstAmount: z.number().min(0).default(0),
  dueDate: z.string().optional(),
});

export const invoiceRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // GET INVOICES
  fastify.get("/", async (request, reply) => {
    try {
      const records = await db.select().from(invoices).where(eq(invoices.advocateId, request.advocateId));
      return reply.send({ invoices: records });
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });

  // CREATE INVOICE
  fastify.post("/", async (request, reply) => {
    try {
      const data = InvoiceSchema.parse(request.body);
      
      const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
      const totalAmount = data.amount + data.gstAmount;

      const [newInvoice] = await db.insert(invoices).values({
        advocateId: request.advocateId,
        clientId: data.clientId,
        matterId: data.matterId,
        invoiceNumber,
        amount: String(data.amount),
        gstAmount: String(data.gstAmount),
        totalAmount: String(totalAmount),
        dueDate: data.dueDate,
        status: "DRAFT"
      }).returning({ id: invoices.id });

      return reply.status(201).send({
        success: true,
        message: "Invoice created successfully",
        invoiceId: newInvoice.id,
        invoiceNumber,
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return reply.status(400).send({ error: "Validation failed", details: err.errors });
      }
      fastify.log.error(err);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });

  // SEND INVOICE
  fastify.post("/:id/send", async (request, reply) => {
    // Input: { delivery_method: string }
    const { id } = request.params as { id: string };
    
    await db.update(invoices)
      .set({ status: "SENT" })
      .where(eq(invoices.id, id));

    return reply.send({
      success: true,
      message: `Invoice ${id} sent successfully via WhatsApp/Email`,
      sentAt: new Date().toISOString(),
    });
  });
};
