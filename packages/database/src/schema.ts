import { pgTable, uuid, text, boolean, timestamp, varchar, pgEnum, customType, date, numeric, integer, serial } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Custom type for AES-256 encrypted fields mapped as bytea in postgres
const bytea = customType<{ data: Buffer, notNull: false, default: false }>({
  dataType() {
    return 'bytea';
  },
});

// ENUMS
export const userTypeEnum = pgEnum('user_type', ['CITIZEN', 'ADVOCATE', 'STUDENT', 'ORG_ADMIN', 'PLATFORM_ADMIN']);
export const kycLevelEnum = pgEnum('kyc_level', ['NONE', 'PHONE_OTP', 'AADHAAR', 'BCI_VERIFIED']);
export const matterStatusEnum = pgEnum('matter_status', ['ACTIVE', 'DISPOSED', 'STAYED', 'WITHDRAWN']);
export const hearingStatusEnum = pgEnum('hearing_status', ['UPCOMING', 'HEARD', 'ADJOURNED', 'PART_HEARD']);
export const invoiceStatusEnum = pgEnum('invoice_status', ['DRAFT', 'SENT', 'PAID', 'OVERDUE']);
export const courtTierEnum = pgEnum('court_tier', ['SUPREME', 'HIGH', 'DISTRICT', 'TAHSIL', 'TRIBUNAL']);
export const caseStatusEnum = pgEnum('case_status', ['PENDING', 'DISPOSED', 'DISMISSED', 'ALLOWED', 'TRANSFERRED']);
export const copStatusEnum = pgEnum('cop_status', ['VALID', 'EXPIRED', 'SUSPENDED', 'CANCELLED']);
export const stampBasisEnum = pgEnum('stamp_basis', ['PERCENTAGE', 'FIXED', 'SLAB']);

// TABLES
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

export const advocateProfiles = pgTable('advocate_profiles', {
  userId: uuid('user_id').primaryKey().references(() => users.id),
  bciNumber: text('bci_number').notNull().unique(),
  enrollmentDate: date('enrollment_date'),
  stateBarCouncil: text('state_bar_council').notNull(),
  copExpiry: date('cop_expiry'),
  copStatus: copStatusEnum('cop_status').default('VALID'),
  practiceAreas: text('practice_areas').array(), // string[]
  courtsRegular: text('courts_regular').array(), 
  languages: text('languages').array(),
  yearsPractice: integer('years_practice'),
  aboutText: text('about_text'),
  feeConsultation: numeric('fee_consultation', { precision: 8, scale: 2 }),
  isPublic: boolean('is_public').default(true),
  profileComplete: integer('profile_complete').default(0),
  verifiedAt: timestamp('verified_at'),
  city: text('city'),
  district: text('district'),
  stateCode: text('state_code'),
  lat: numeric('lat', { precision: 9, scale: 6 }),
  lng: numeric('lng', { precision: 9, scale: 6 }),
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

export const courts = pgTable('courts', {
  courtCode: text('court_code').primaryKey(),
  courtName: text('court_name').notNull(),
  courtTier: courtTierEnum('court_tier'),
  stateCode: text('state_code'),
  districtCode: text('district_code'),
  ecourtsId: text('ecourts_id'),
  njdgEnabled: boolean('njdg_enabled').default(false),
  websiteUrl: text('website_url'),
  address: text('address'),
  isActive: boolean('is_active').default(true),
});

export const matters = pgTable('matters', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  advocateId: uuid('advocate_id').notNull().references(() => users.id),
  clientId: uuid('client_id').notNull().references(() => clients.id),
  title: text('title').notNull(),
  matterType: text('matter_type'),
  courtCode: text('court_code').references(() => courts.courtCode),
  caseNumber: text('case_number'),
  filingDate: date('filing_date'),
  status: matterStatusEnum('status').default('ACTIVE'),
  descriptionEnc: bytea('description_enc'),
  feesAgreed: numeric('fees_agreed', { precision: 12, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const hearings = pgTable('hearings', {
  id: uuid('id').defaultRandom().primaryKey(),
  matterId: uuid('matter_id').notNull().references(() => matters.id),
  scheduledAt: timestamp('scheduled_at').notNull(),
  courtCode: text('court_code'),
  courtHall: text('court_hall'),
  judgeName: text('judge_name'),
  status: hearingStatusEnum('status').default('UPCOMING'),
  nextDate: date('next_date'),
  orderSummary: text('order_summary'),
  ecourtsSync: boolean('ecourts_sync').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const invoices = pgTable('invoices', {
  id: uuid('id').defaultRandom().primaryKey(),
  matterId: uuid('matter_id').references(() => matters.id),
  advocateId: uuid('advocate_id').notNull().references(() => users.id),
  clientId: uuid('client_id').notNull().references(() => clients.id),
  invoiceNumber: text('invoice_number').notNull().unique(),
  amount: numeric('amount', {precision: 12, scale: 2}).notNull(),
  gstAmount: numeric('gst_amount', {precision: 12, scale: 2}),
  totalAmount: numeric('total_amount', {precision: 12, scale: 2}).notNull(),
  status: invoiceStatusEnum('status').default('DRAFT'),
  dueDate: date('due_date'),
  paidAt: timestamp('paid_at'),
  razorpayRef: text('razorpay_ref'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const cases = pgTable('cases', {
  id: uuid('id').defaultRandom().primaryKey(),
  courtCode: text('court_code').notNull().references(() => courts.courtCode),
  caseNumber: text('case_number').notNull(),
  caseType: text('case_type'),
  year: integer('year'),
  petitionerEnc: bytea('petitioner_enc'),
  respondentEnc: bytea('respondent_enc'),
  filingDate: date('filing_date'),
  disposalDate: date('disposal_date'),
  status: caseStatusEnum('status'),
  nextHearing: date('next_hearing'),
  bench: text('bench'),
  subject: text('subject'),
  actsInvolved: text('acts_involved').array(),
  source: text('source'),
  esIndexed: boolean('es_indexed').default(false),
  fullTextUrl: text('full_text_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const stampDutyRules = pgTable('stamp_duty_rules', {
  id: serial('id').primaryKey(),
  stateCode: text('state_code').notNull(),
  docType: text('doc_type').notNull(),
  basis: stampBasisEnum('basis'),
  rate: numeric('rate', { precision: 6, scale: 4 }),
  fixedAmount: numeric('fixed_amount', { precision: 10, scale: 2 }),
  minDuty: numeric('min_duty', { precision: 10, scale: 2 }),
  maxDuty: numeric('max_duty', { precision: 10, scale: 2 }),
  effectiveFrom: date('effective_from').notNull(),
  gazetteRef: text('gazette_ref'),
});

// RELATIONS
export const clientsRelations = relations(clients, ({ many }) => ({
  matters: many(matters),
}));

export const mattersRelations = relations(matters, ({ one, many }) => ({
  client: one(clients, {
    fields: [matters.clientId],
    references: [clients.id],
  }),
  advocate: one(users, {
    fields: [matters.advocateId],
    references: [users.id],
  }),
  court: one(courts, {
    fields: [matters.courtCode],
    references: [courts.courtCode],
  }),
  hearings: many(hearings),
  invoices: many(invoices),
}));

export const hearingsRelations = relations(hearings, ({ one }) => ({
  matter: one(matters, {
    fields: [hearings.matterId],
    references: [matters.id],
  }),
}));

export const casesRelations = relations(cases, ({ one }) => ({
  court: one(courts, {
    fields: [cases.courtCode],
    references: [courts.courtCode],
  }),
}));
