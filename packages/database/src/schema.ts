// Nyay Mitra — Production MySQL Schema via Drizzle ORM
// MySQL 8.0 · utf8mb4 · InnoDB · UUIDs as varchar(36)
import {
  mysqlTable, mysqlEnum, varchar, text, boolean,
  timestamp, date, decimal, int, index, unique,
} from 'drizzle-orm/mysql-core';
import { relations, sql } from 'drizzle-orm';

// ── Enums ─────────────────────────────────────────────────────────────────────
export const userTypeEnum       = mysqlEnum('user_type', ['CITIZEN','ADVOCATE','STUDENT','ORG_ADMIN','PLATFORM_ADMIN']);
export const kycLevelEnum       = mysqlEnum('kyc_level', ['NONE','PHONE_OTP','AADHAAR','BCI_VERIFIED']);
export const matterStatusEnum   = mysqlEnum('matter_status', ['ACTIVE','DISPOSED','STAYED','WITHDRAWN']);
export const hearingStatusEnum  = mysqlEnum('hearing_status', ['UPCOMING','HEARD','ADJOURNED','PART_HEARD']);
export const invoiceStatusEnum  = mysqlEnum('invoice_status', ['DRAFT','SENT','PAID','OVERDUE']);
export const courtTierEnum      = mysqlEnum('court_tier', ['SUPREME','HIGH','DISTRICT','TAHSIL','TRIBUNAL']);
export const caseStatusEnum     = mysqlEnum('case_status', ['PENDING','DISPOSED','DISMISSED','ALLOWED','TRANSFERRED']);
export const copStatusEnum      = mysqlEnum('cop_status', ['VALID','EXPIRED','SUSPENDED','CANCELLED']);
export const auditActionEnum    = mysqlEnum('audit_action', ['CREATE','READ','UPDATE','DELETE','LOGIN','LOGOUT','EXPORT']);
export const notifTypeEnum      = mysqlEnum('notification_type', ['HEARING_REMINDER','INVOICE_DUE','CASE_UPDATE','SYSTEM']);

// Helper: UUID default via MySQL UUID()
const uuidDefault = () => sql`(UUID())`;

// ── TENANTS ───────────────────────────────────────────────────────────────────
export const tenants = mysqlTable('tenants', {
  id:        varchar('id', { length: 36 }).primaryKey().default(sql`(UUID())`),
  name:      text('name').notNull(),
  plan:      varchar('plan', { length: 20 }).default('free'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// ── USERS ─────────────────────────────────────────────────────────────────────
export const users = mysqlTable('users', {
  id:           varchar('id', { length: 36 }).primaryKey().default(sql`(UUID())`),
  tenantId:     varchar('tenant_id', { length: 36 }).notNull().references(() => tenants.id),
  email:        varchar('email', { length: 320 }).notNull(),
  passwordHash: text('password_hash'),
  fullName:     text('full_name'),
  userType:     mysqlEnum('user_type', ['CITIZEN','ADVOCATE','STUDENT','ORG_ADMIN','PLATFORM_ADMIN']).default('CITIZEN'),
  kycLevel:     mysqlEnum('kyc_level', ['NONE','PHONE_OTP','AADHAAR','BCI_VERIFIED']).default('NONE'),
  aadhaarRef:   varchar('aadhaar_ref', { length: 4 }),
  bciNumber:    varchar('bci_number', { length: 50 }),
  bciVerified:  boolean('bci_verified').default(false),
  bciState:     varchar('bci_state', { length: 50 }),
  googleId:     varchar('google_id', { length: 120 }),
  avatarUrl:    text('avatar_url'),
  preferredLang:varchar('preferred_lang', { length: 10 }).default('en'),
  isActive:     boolean('is_active').default(true),
  lastLoginAt:  timestamp('last_login_at'),
  createdAt:    timestamp('created_at').defaultNow(),
  updatedAt:    timestamp('updated_at').defaultNow().onUpdateNow(),
}, (t) => ({
  emailUnique:  unique('users_email_unique').on(t.email),
  tenantIdx:    index('users_tenant_idx').on(t.tenantId),
  emailIdx:     index('users_email_idx').on(t.email),
}));

// ── SESSIONS (refresh tokens) ─────────────────────────────────────────────────
export const sessions = mysqlTable('sessions', {
  id:           varchar('id', { length: 36 }).primaryKey().default(sql`(UUID())`),
  userId:       varchar('user_id', { length: 36 }).notNull().references(() => users.id),
  tenantId:     varchar('tenant_id', { length: 36 }).notNull().references(() => tenants.id),
  refreshToken: text('refresh_token').notNull(),
  userAgent:    text('user_agent'),
  ipAddress:    varchar('ip_address', { length: 45 }),
  expiresAt:    timestamp('expires_at').notNull(),
  createdAt:    timestamp('created_at').defaultNow(),
}, (t) => ({
  userIdx:  index('sessions_user_idx').on(t.userId),
}));

// ── AUDIT LOGS ────────────────────────────────────────────────────────────────
export const auditLogs = mysqlTable('audit_logs', {
  id:         int('id').autoincrement().primaryKey(),
  userId:     varchar('user_id', { length: 36 }).references(() => users.id),
  tenantId:   varchar('tenant_id', { length: 36 }).references(() => tenants.id),
  action:     mysqlEnum('action', ['CREATE','READ','UPDATE','DELETE','LOGIN','LOGOUT','EXPORT']).notNull(),
  entityType: varchar('entity_type', { length: 50 }),
  entityId:   varchar('entity_id', { length: 36 }),
  ipAddress:  varchar('ip_address', { length: 45 }),
  userAgent:  text('user_agent'),
  meta:       text('meta'),
  createdAt:  timestamp('created_at').defaultNow(),
}, (t) => ({
  userIdx:    index('audit_user_idx').on(t.userId),
  tenantIdx:  index('audit_tenant_idx').on(t.tenantId),
  createdIdx: index('audit_created_idx').on(t.createdAt),
}));

// ── ADVOCATE PROFILE ──────────────────────────────────────────────────────────
export const advocateProfiles = mysqlTable('advocate_profiles', {
  userId:         varchar('user_id', { length: 36 }).primaryKey().references(() => users.id),
  bciNumber:      varchar('bci_number', { length: 50 }).notNull(),
  enrollmentDate: date('enrollment_date'),
  stateBarCouncil:varchar('state_bar_council', { length: 100 }).notNull().default(''),
  copExpiry:      date('cop_expiry'),
  copStatus:      mysqlEnum('cop_status', ['VALID','EXPIRED','SUSPENDED','CANCELLED']).default('VALID'),
  practiceAreas:  text('practice_areas'),   // JSON array stored as text
  courtsRegular:  text('courts_regular'),
  languages:      text('languages'),
  yearsPractice:  int('years_practice'),
  aboutText:      text('about_text'),
  feeConsultation:decimal('fee_consultation', { precision: 8, scale: 2 }),
  isPublic:       boolean('is_public').default(true),
  profileComplete:int('profile_complete').default(0),
  verifiedAt:     timestamp('verified_at'),
  city:           varchar('city', { length: 100 }),
  district:       varchar('district', { length: 100 }),
  stateCode:      varchar('state_code', { length: 10 }),
});

// ── COURTS ────────────────────────────────────────────────────────────────────
export const courts = mysqlTable('courts', {
  courtCode:   varchar('court_code', { length: 20 }).primaryKey(),
  courtName:   text('court_name').notNull(),
  courtTier:   mysqlEnum('court_tier', ['SUPREME','HIGH','DISTRICT','TAHSIL','TRIBUNAL']),
  stateCode:   varchar('state_code', { length: 10 }),
  districtCode:varchar('district_code', { length: 20 }),
  ecourtsId:   varchar('ecourts_id', { length: 50 }),
  njdgEnabled: boolean('njdg_enabled').default(false),
  websiteUrl:  text('website_url'),
  address:     text('address'),
  isActive:    boolean('is_active').default(true),
});

// ── CLIENTS ───────────────────────────────────────────────────────────────────
export const clients = mysqlTable('clients', {
  id:          varchar('id', { length: 36 }).primaryKey().default(sql`(UUID())`),
  tenantId:    varchar('tenant_id', { length: 36 }).notNull().references(() => tenants.id),
  advocateId:  varchar('advocate_id', { length: 36 }).notNull().references(() => users.id),
  fullName:    text('full_name').notNull(),
  email:       varchar('email', { length: 320 }),
  phone:       varchar('phone', { length: 15 }),
  aadhaarRef:  varchar('aadhaar_ref', { length: 4 }),
  caseTitle:   text('case_title'),
  notes:       text('notes'),
  isActive:    boolean('is_active').default(true),
  createdAt:   timestamp('created_at').defaultNow(),
  updatedAt:   timestamp('updated_at').defaultNow().onUpdateNow(),
}, (t) => ({
  tenantIdx:   index('clients_tenant_idx').on(t.tenantId),
  advocateIdx: index('clients_advocate_idx').on(t.advocateId),
}));

// ── MATTERS ───────────────────────────────────────────────────────────────────
export const matters = mysqlTable('matters', {
  id:          varchar('id', { length: 36 }).primaryKey().default(sql`(UUID())`),
  tenantId:    varchar('tenant_id', { length: 36 }).notNull().references(() => tenants.id),
  advocateId:  varchar('advocate_id', { length: 36 }).notNull().references(() => users.id),
  clientId:    varchar('client_id', { length: 36 }).notNull().references(() => clients.id),
  title:       text('title').notNull(),
  matterType:  varchar('matter_type', { length: 100 }),
  courtCode:   varchar('court_code', { length: 20 }).references(() => courts.courtCode),
  caseNumber:  varchar('case_number', { length: 100 }),
  filingDate:  date('filing_date'),
  status:      mysqlEnum('status', ['ACTIVE','DISPOSED','STAYED','WITHDRAWN']).default('ACTIVE'),
  description: text('description'),
  feesAgreed:  decimal('fees_agreed', { precision: 12, scale: 2 }),
  createdAt:   timestamp('created_at').defaultNow(),
  updatedAt:   timestamp('updated_at').defaultNow().onUpdateNow(),
}, (t) => ({
  tenantIdx:   index('matters_tenant_idx').on(t.tenantId),
  advocateIdx: index('matters_advocate_idx').on(t.advocateId),
  statusIdx:   index('matters_status_idx').on(t.status),
}));

// ── HEARINGS ──────────────────────────────────────────────────────────────────
export const hearings = mysqlTable('hearings', {
  id:           varchar('id', { length: 36 }).primaryKey().default(sql`(UUID())`),
  matterId:     varchar('matter_id', { length: 36 }).references(() => matters.id),
  advocateId:   varchar('advocate_id', { length: 36 }).notNull().references(() => users.id),
  tenantId:     varchar('tenant_id', { length: 36 }).notNull().references(() => tenants.id),
  scheduledAt:  timestamp('scheduled_at').notNull(),
  courtCode:    varchar('court_code', { length: 20 }),
  courtHall:    varchar('court_hall', { length: 50 }),
  judgeName:    varchar('judge_name', { length: 200 }),
  purpose:      varchar('purpose', { length: 500 }),
  status:       mysqlEnum('status', ['UPCOMING','HEARD','ADJOURNED','PART_HEARD']).default('UPCOMING'),
  nextDate:     date('next_date'),
  orderSummary: text('order_summary'),
  createdAt:    timestamp('created_at').defaultNow(),
}, (t) => ({
  tenantIdx:     index('hearings_tenant_idx').on(t.tenantId),
  advocateIdx:   index('hearings_advocate_idx').on(t.advocateId),
  scheduledIdx:  index('hearings_scheduled_idx').on(t.scheduledAt),
}));

// ── INVOICES ──────────────────────────────────────────────────────────────────
export const invoices = mysqlTable('invoices', {
  id:            varchar('id', { length: 36 }).primaryKey().default(sql`(UUID())`),
  matterId:      varchar('matter_id', { length: 36 }).references(() => matters.id),
  advocateId:    varchar('advocate_id', { length: 36 }).notNull().references(() => users.id),
  clientId:      varchar('client_id', { length: 36 }).notNull().references(() => clients.id),
  tenantId:      varchar('tenant_id', { length: 36 }).notNull().references(() => tenants.id),
  invoiceNumber: varchar('invoice_number', { length: 50 }).notNull(),
  amount:        decimal('amount', { precision: 12, scale: 2 }).notNull(),
  gstAmount:     decimal('gst_amount', { precision: 12, scale: 2 }),
  totalAmount:   decimal('total_amount', { precision: 12, scale: 2 }).notNull(),
  status:        mysqlEnum('status', ['DRAFT','SENT','PAID','OVERDUE']).default('DRAFT'),
  dueDate:       date('due_date'),
  paidAt:        timestamp('paid_at'),
  razorpayRef:   varchar('razorpay_ref', { length: 100 }),
  notes:         text('notes'),
  createdAt:     timestamp('created_at').defaultNow(),
  updatedAt:     timestamp('updated_at').defaultNow().onUpdateNow(),
}, (t) => ({
  tenantIdx:     index('invoices_tenant_idx').on(t.tenantId),
  statusIdx:     index('invoices_status_idx').on(t.status),
  invoiceNumUniq:unique('invoices_num_unique').on(t.invoiceNumber),
}));

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
export const notifications = mysqlTable('notifications', {
  id:           varchar('id', { length: 36 }).primaryKey().default(sql`(UUID())`),
  userId:       varchar('user_id', { length: 36 }).notNull().references(() => users.id),
  tenantId:     varchar('tenant_id', { length: 36 }).notNull().references(() => tenants.id),
  type:         mysqlEnum('type', ['HEARING_REMINDER','INVOICE_DUE','CASE_UPDATE','SYSTEM']).notNull(),
  title:        varchar('title', { length: 200 }).notNull(),
  body:         text('body').notNull(),
  entityType:   varchar('entity_type', { length: 50 }),
  entityId:     varchar('entity_id', { length: 36 }),
  isRead:       boolean('is_read').default(false),
  scheduledFor: timestamp('scheduled_for'),
  sentAt:       timestamp('sent_at'),
  createdAt:    timestamp('created_at').defaultNow(),
}, (t) => ({
  userIdx:   index('notifications_user_idx').on(t.userId),
  isReadIdx: index('notifications_read_idx').on(t.isRead),
}));

// ── DOCUMENTS (DRAFT STUDIO) ──────────────────────────────────────────────────
export const documents = mysqlTable('documents', {
  id:            varchar('id', { length: 36 }).primaryKey().default(sql`(UUID())`),
  tenantId:      varchar('tenant_id', { length: 36 }).notNull().references(() => tenants.id),
  advocateId:    varchar('advocate_id', { length: 36 }).notNull().references(() => users.id),
  clientId:      varchar('client_id', { length: 36 }).references(() => clients.id),
  matterId:      varchar('matter_id', { length: 36 }).references(() => matters.id),
  docType:       varchar('doc_type', { length: 100 }).notNull(),
  title:         varchar('title', { length: 200 }).notNull(),
  htmlContent:   text('html_content'),
  aiGenerated:   boolean('ai_generated').default(false),
  createdAt:     timestamp('created_at').defaultNow(),
  updatedAt:     timestamp('updated_at').defaultNow().onUpdateNow(),
}, (t) => ({
  tenantIdx:     index('docs_tenant_idx').on(t.tenantId),
  advocateIdx:   index('docs_advocate_idx').on(t.advocateId),
}));

// ── STAMP DUTY RULES ──────────────────────────────────────────────────────────
export const stampDutyRules = mysqlTable('stamp_duty_rules', {
  id:            int('id').autoincrement().primaryKey(),
  stateCode:     varchar('state_code', { length: 10 }).notNull(),
  docType:       varchar('doc_type', { length: 100 }).notNull(),
  rate:          decimal('rate', { precision: 6, scale: 4 }),
  fixedAmount:   decimal('fixed_amount', { precision: 10, scale: 2 }),
  minDuty:       decimal('min_duty', { precision: 10, scale: 2 }),
  maxDuty:       decimal('max_duty', { precision: 10, scale: 2 }),
  effectiveFrom: date('effective_from').notNull(),
  gazetteRef:    varchar('gazette_ref', { length: 200 }),
});

// ── RELATIONS ─────────────────────────────────────────────────────────────────
export const tenantsRelations = relations(tenants, ({ many }) => ({
  users:   many(users),
  clients: many(clients),
  matters: many(matters),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  tenant:           one(tenants, { fields: [users.tenantId], references: [tenants.id] }),
  advocateProfile:  one(advocateProfiles, { fields: [users.id], references: [advocateProfiles.userId] }),
  sessions:         many(sessions),
  clients:          many(clients),
  matters:          many(matters),
  notifications:    many(notifications),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  tenant:   one(tenants, { fields: [clients.tenantId], references: [tenants.id] }),
  advocate: one(users,   { fields: [clients.advocateId], references: [users.id] }),
  matters:  many(matters),
}));

export const mattersRelations = relations(matters, ({ one, many }) => ({
  client:   one(clients,  { fields: [matters.clientId],   references: [clients.id] }),
  advocate: one(users,    { fields: [matters.advocateId], references: [users.id] }),
  court:    one(courts,   { fields: [matters.courtCode],  references: [courts.courtCode] }),
  hearings: many(hearings),
  invoices: many(invoices),
}));

export const hearingsRelations = relations(hearings, ({ one }) => ({
  matter:   one(matters, { fields: [hearings.matterId],   references: [matters.id] }),
  advocate: one(users,   { fields: [hearings.advocateId], references: [users.id] }),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  matter:   one(matters,  { fields: [invoices.matterId],   references: [matters.id] }),
  advocate: one(users,    { fields: [invoices.advocateId], references: [users.id] }),
  client:   one(clients,  { fields: [invoices.clientId],   references: [clients.id] }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  matter:   one(matters,  { fields: [documents.matterId],   references: [matters.id] }),
  advocate: one(users,    { fields: [documents.advocateId], references: [users.id] }),
  client:   one(clients,  { fields: [documents.clientId],   references: [clients.id] }),
}));
