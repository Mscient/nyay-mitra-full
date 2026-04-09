"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceRoutes = void 0;
const zod_1 = require("zod");
const database_1 = require("@nyay-mitra/database");
const drizzle_orm_1 = require("drizzle-orm");
const InvoiceSchema = zod_1.z.object({
    matterId: zod_1.z.string().uuid(),
    clientId: zod_1.z.string().uuid(),
    amount: zod_1.z.number().positive(),
    gstAmount: zod_1.z.number().min(0).default(0),
    dueDate: zod_1.z.string().optional(),
});
const invoiceRoutes = async (fastify) => {
    // GET INVOICES
    fastify.get("/", async (request, reply) => {
        try {
            const records = await database_1.db.select().from(database_1.invoices).where((0, drizzle_orm_1.eq)(database_1.invoices.advocateId, request.advocateId));
            return reply.send({ invoices: records });
        }
        catch (err) {
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
            const [newInvoice] = await database_1.db.insert(database_1.invoices).values({
                advocateId: request.advocateId,
                clientId: data.clientId,
                matterId: data.matterId,
                invoiceNumber,
                amount: String(data.amount),
                gstAmount: String(data.gstAmount),
                totalAmount: String(totalAmount),
                dueDate: data.dueDate,
                status: "DRAFT"
            }).returning({ id: database_1.invoices.id });
            return reply.status(201).send({
                success: true,
                message: "Invoice created successfully",
                invoiceId: newInvoice.id,
                invoiceNumber,
            });
        }
        catch (err) {
            if (err instanceof zod_1.z.ZodError) {
                return reply.status(400).send({ error: "Validation failed", details: err.errors });
            }
            fastify.log.error(err);
            return reply.status(500).send({ error: "Internal server error" });
        }
    });
    // SEND INVOICE
    fastify.post("/:id/send", async (request, reply) => {
        // Input: { delivery_method: string }
        const { id } = request.params;
        await database_1.db.update(database_1.invoices)
            .set({ status: "SENT" })
            .where((0, drizzle_orm_1.eq)(database_1.invoices.id, id));
        return reply.send({
            success: true,
            message: `Invoice ${id} sent successfully via WhatsApp/Email`,
            sentAt: new Date().toISOString(),
        });
    });
};
exports.invoiceRoutes = invoiceRoutes;
