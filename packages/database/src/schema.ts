import { pgTable, uuid, text, boolean, timestamp, varchar, pgEnum, customType } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Custom type for AES-256 encrypted fields mapped as bytea in postgres
const bytea = customType<{ data: Buffer, notNull: false, default: false }>({
  dataType() {
    return 'bytea';
  },
});

export const userTypeEnum = pgEnum('user_type', ['CITIZEN', 'ADVOCATE', 'STUDENT', 'ORG_ADMIN', 'PLATFORM_ADMIN']);
export const kycLevelEnum = pgEnum('kyc_level', ['NONE', 'PHONE_OTP', 'AADHAAR', 'BCI_VERIFIED']);

export const tenants = pgTable('tenants', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  email: text('email').notNull().unique(),
  phoneEnc: bytea('phone_enc'),
  fullNameEnc: bytea('full_name_enc'),
  userType: userTypeEnum('user_type'),
  kycLevel: kycLevelEnum('kyc_level').default('NONE'),
  aadhaarRef: varchar('aadhaar_ref', { length: 4 }), // Only last 4
  bciNumber: text('bci_number'),
  bciVerified: boolean('bci_verified').default(false),
  bciState: text('bci_state'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const clients = pgTable('clients', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  fullNameEnc: bytea('full_name_enc'),
  emailEnc: bytea('email_enc'),
  phoneEnc: bytea('phone_enc'),
  aadhaarRef: varchar('aadhaar_ref', { length: 4 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const matters = pgTable('matters', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  advocateId: uuid('advocate_id').notNull().references(() => users.id),
  clientId: uuid('client_id').notNull().references(() => clients.id),
  title: text('title').notNull(),
  matterType: text('matter_type'),
  courtCode: text('court_code'),
  caseNumber: text('case_number'),
  descriptionEnc: bytea('description_enc'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const clientsRelations = relations(clients, ({ many }) => ({
  matters: many(matters),
}));

export const mattersRelations = relations(matters, ({ one }) => ({
  client: one(clients, {
    fields: [matters.clientId],
    references: [clients.id],
  }),
  advocate: one(users, {
    fields: [matters.advocateId],
    references: [users.id],
  }),
}));
