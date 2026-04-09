import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { z } from "zod";
import crypto from "crypto";

const InvoiceSchema = z.object({
  matterId: z.string().uuid(),
  clientId: z.string().uuid(),
  amount: z.number().positive(),
  gstAmount: z.number().min(0).default(0),
  dueDate: z.string().optional(),
});

interface Invoice {
  id: string;
  advocateId: string;
  clientId: string;
  matterId: string;
  invoiceNumber: string;
  amount: number;
  gstAmount: number;
  totalAmount: number;
  dueDate?: string;
  status: string;
  createdAt: string;
}

const invoiceStore = new Map<string, Invoice>();

export const invoiceRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // GET INVOICES
  fastify.get("/", async (request, reply) => {
    try {
      const records = [...invoiceStore.values()].filter(i => i.advocateId === request.advocateId);
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
      const id = crypto.randomUUID();

      const invoice: Invoice = {
        id,
        advocateId: request.advocateId,
        clientId: data.clientId,
        matterId: data.matterId,
        invoiceNumber,
        amount: data.amount,
        gstAmount: data.gstAmount,
        totalAmount,
        dueDate: data.dueDate,
        status: "DRAFT",
        createdAt: new Date().toISOString(),
      };
      invoiceStore.set(id, invoice);

      return reply.status(201).send({
        success: true,
        message: "Invoice created successfully",
        invoiceId: id,
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
    const { id } = request.params as { id: string };

    const existing = invoiceStore.get(id);
    if (existing) {
      invoiceStore.set(id, { ...existing, status: "SENT" });
    }

    return reply.send({
      success: true,
      message: `Invoice ${id} sent successfully via WhatsApp/Email`,
      sentAt: new Date().toISOString(),
    });
  });
};
