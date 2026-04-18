"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentsRelations = exports.invoicesRelations = exports.hearingsRelations = exports.mattersRelations = exports.clientsRelations = exports.sessionsRelations = exports.usersRelations = exports.tenantsRelations = exports.stampDutyRules = exports.documents = exports.notifications = exports.invoices = exports.hearings = exports.matters = exports.clients = exports.courts = exports.advocateProfiles = exports.auditLogs = exports.sessions = exports.users = exports.tenants = exports.notifTypeEnum = exports.auditActionEnum = exports.copStatusEnum = exports.caseStatusEnum = exports.courtTierEnum = exports.invoiceStatusEnum = exports.hearingStatusEnum = exports.matterStatusEnum = exports.kycLevelEnum = exports.userTypeEnum = void 0;
// Nyay Mitra — Production MySQL Schema via Drizzle ORM
// MySQL 8.0 · utf8mb4 · InnoDB · UUIDs as varchar(36)
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
// ── Enums ─────────────────────────────────────────────────────────────────────
exports.userTypeEnum = (0, mysql_core_1.mysqlEnum)('user_type', ['CITIZEN', 'ADVOCATE', 'STUDENT', 'ORG_ADMIN', 'PLATFORM_ADMIN']);
exports.kycLevelEnum = (0, mysql_core_1.mysqlEnum)('kyc_level', ['NONE', 'PHONE_OTP', 'AADHAAR', 'BCI_VERIFIED']);
exports.matterStatusEnum = (0, mysql_core_1.mysqlEnum)('matter_status', ['ACTIVE', 'DISPOSED', 'STAYED', 'WITHDRAWN']);
exports.hearingStatusEnum = (0, mysql_core_1.mysqlEnum)('hearing_status', ['UPCOMING', 'HEARD', 'ADJOURNED', 'PART_HEARD']);
exports.invoiceStatusEnum = (0, mysql_core_1.mysqlEnum)('invoice_status', ['DRAFT', 'SENT', 'PAID', 'OVERDUE']);
exports.courtTierEnum = (0, mysql_core_1.mysqlEnum)('court_tier', ['SUPREME', 'HIGH', 'DISTRICT', 'TAHSIL', 'TRIBUNAL']);
exports.caseStatusEnum = (0, mysql_core_1.mysqlEnum)('case_status', ['PENDING', 'DISPOSED', 'DISMISSED', 'ALLOWED', 'TRANSFERRED']);
exports.copStatusEnum = (0, mysql_core_1.mysqlEnum)('cop_status', ['VALID', 'EXPIRED', 'SUSPENDED', 'CANCELLED']);
exports.auditActionEnum = (0, mysql_core_1.mysqlEnum)('audit_action', ['CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT']);
exports.notifTypeEnum = (0, mysql_core_1.mysqlEnum)('notification_type', ['HEARING_REMINDER', 'INVOICE_DUE', 'CASE_UPDATE', 'SYSTEM']);
// Helper: UUID default via MySQL UUID()
const uuidDefault = () => (0, drizzle_orm_1.sql) `(UUID())`;
// ── TENANTS ───────────────────────────────────────────────────────────────────
exports.tenants = (0, mysql_core_1.mysqlTable)('tenants', {
    id: (0, mysql_core_1.varchar)('id', { length: 36 }).primaryKey().default((0, drizzle_orm_1.sql) `(UUID())`),
    name: (0, mysql_core_1.text)('name').notNull(),
    plan: (0, mysql_core_1.varchar)('plan', { length: 20 }).default('free'),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow(),
});
// ── USERS ─────────────────────────────────────────────────────────────────────
exports.users = (0, mysql_core_1.mysqlTable)('users', {
    id: (0, mysql_core_1.varchar)('id', { length: 36 }).primaryKey().default((0, drizzle_orm_1.sql) `(UUID())`),
    tenantId: (0, mysql_core_1.varchar)('tenant_id', { length: 36 }).notNull().references(() => exports.tenants.id),
    email: (0, mysql_core_1.varchar)('email', { length: 320 }).notNull(),
    passwordHash: (0, mysql_core_1.text)('password_hash'),
    fullName: (0, mysql_core_1.text)('full_name'),
    userType: (0, mysql_core_1.mysqlEnum)('user_type', ['CITIZEN', 'ADVOCATE', 'STUDENT', 'ORG_ADMIN', 'PLATFORM_ADMIN']).default('CITIZEN'),
    kycLevel: (0, mysql_core_1.mysqlEnum)('kyc_level', ['NONE', 'PHONE_OTP', 'AADHAAR', 'BCI_VERIFIED']).default('NONE'),
    aadhaarRef: (0, mysql_core_1.varchar)('aadhaar_ref', { length: 4 }),
    bciNumber: (0, mysql_core_1.varchar)('bci_number', { length: 50 }),
    bciVerified: (0, mysql_core_1.boolean)('bci_verified').default(false),
    bciState: (0, mysql_core_1.varchar)('bci_state', { length: 50 }),
    googleId: (0, mysql_core_1.varchar)('google_id', { length: 120 }),
    avatarUrl: (0, mysql_core_1.text)('avatar_url'),
    preferredLang: (0, mysql_core_1.varchar)('preferred_lang', { length: 10 }).default('en'),
    isActive: (0, mysql_core_1.boolean)('is_active').default(true),
    lastLoginAt: (0, mysql_core_1.timestamp)('last_login_at'),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow(),
}, (t) => ({
    emailUnique: (0, mysql_core_1.unique)('users_email_unique').on(t.email),
    tenantIdx: (0, mysql_core_1.index)('users_tenant_idx').on(t.tenantId),
    emailIdx: (0, mysql_core_1.index)('users_email_idx').on(t.email),
}));
// ── SESSIONS (refresh tokens) ─────────────────────────────────────────────────
exports.sessions = (0, mysql_core_1.mysqlTable)('sessions', {
    id: (0, mysql_core_1.varchar)('id', { length: 36 }).primaryKey().default((0, drizzle_orm_1.sql) `(UUID())`),
    userId: (0, mysql_core_1.varchar)('user_id', { length: 36 }).notNull().references(() => exports.users.id),
    tenantId: (0, mysql_core_1.varchar)('tenant_id', { length: 36 }).notNull().references(() => exports.tenants.id),
    refreshToken: (0, mysql_core_1.text)('refresh_token').notNull(),
    userAgent: (0, mysql_core_1.text)('user_agent'),
    ipAddress: (0, mysql_core_1.varchar)('ip_address', { length: 45 }),
    expiresAt: (0, mysql_core_1.timestamp)('expires_at').notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
}, (t) => ({
    userIdx: (0, mysql_core_1.index)('sessions_user_idx').on(t.userId),
}));
// ── AUDIT LOGS ────────────────────────────────────────────────────────────────
exports.auditLogs = (0, mysql_core_1.mysqlTable)('audit_logs', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    userId: (0, mysql_core_1.varchar)('user_id', { length: 36 }).references(() => exports.users.id),
    tenantId: (0, mysql_core_1.varchar)('tenant_id', { length: 36 }).references(() => exports.tenants.id),
    action: (0, mysql_core_1.mysqlEnum)('action', ['CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT']).notNull(),
    entityType: (0, mysql_core_1.varchar)('entity_type', { length: 50 }),
    entityId: (0, mysql_core_1.varchar)('entity_id', { length: 36 }),
    ipAddress: (0, mysql_core_1.varchar)('ip_address', { length: 45 }),
    userAgent: (0, mysql_core_1.text)('user_agent'),
    meta: (0, mysql_core_1.text)('meta'),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
}, (t) => ({
    userIdx: (0, mysql_core_1.index)('audit_user_idx').on(t.userId),
    tenantIdx: (0, mysql_core_1.index)('audit_tenant_idx').on(t.tenantId),
    createdIdx: (0, mysql_core_1.index)('audit_created_idx').on(t.createdAt),
}));
// ── ADVOCATE PROFILE ──────────────────────────────────────────────────────────
exports.advocateProfiles = (0, mysql_core_1.mysqlTable)('advocate_profiles', {
    userId: (0, mysql_core_1.varchar)('user_id', { length: 36 }).primaryKey().references(() => exports.users.id),
    bciNumber: (0, mysql_core_1.varchar)('bci_number', { length: 50 }).notNull(),
    enrollmentDate: (0, mysql_core_1.date)('enrollment_date'),
    stateBarCouncil: (0, mysql_core_1.varchar)('state_bar_council', { length: 100 }).notNull().default(''),
    copExpiry: (0, mysql_core_1.date)('cop_expiry'),
    copStatus: (0, mysql_core_1.mysqlEnum)('cop_status', ['VALID', 'EXPIRED', 'SUSPENDED', 'CANCELLED']).default('VALID'),
    practiceAreas: (0, mysql_core_1.text)('practice_areas'), // JSON array stored as text
    courtsRegular: (0, mysql_core_1.text)('courts_regular'),
    languages: (0, mysql_core_1.text)('languages'),
    yearsPractice: (0, mysql_core_1.int)('years_practice'),
    aboutText: (0, mysql_core_1.text)('about_text'),
    feeConsultation: (0, mysql_core_1.decimal)('fee_consultation', { precision: 8, scale: 2 }),
    isPublic: (0, mysql_core_1.boolean)('is_public').default(true),
    profileComplete: (0, mysql_core_1.int)('profile_complete').default(0),
    verifiedAt: (0, mysql_core_1.timestamp)('verified_at'),
    city: (0, mysql_core_1.varchar)('city', { length: 100 }),
    district: (0, mysql_core_1.varchar)('district', { length: 100 }),
    stateCode: (0, mysql_core_1.varchar)('state_code', { length: 10 }),
});
// ── COURTS ────────────────────────────────────────────────────────────────────
exports.courts = (0, mysql_core_1.mysqlTable)('courts', {
    courtCode: (0, mysql_core_1.varchar)('court_code', { length: 20 }).primaryKey(),
    courtName: (0, mysql_core_1.text)('court_name').notNull(),
    courtTier: (0, mysql_core_1.mysqlEnum)('court_tier', ['SUPREME', 'HIGH', 'DISTRICT', 'TAHSIL', 'TRIBUNAL']),
    stateCode: (0, mysql_core_1.varchar)('state_code', { length: 10 }),
    districtCode: (0, mysql_core_1.varchar)('district_code', { length: 20 }),
    ecourtsId: (0, mysql_core_1.varchar)('ecourts_id', { length: 50 }),
    njdgEnabled: (0, mysql_core_1.boolean)('njdg_enabled').default(false),
    websiteUrl: (0, mysql_core_1.text)('website_url'),
    address: (0, mysql_core_1.text)('address'),
    isActive: (0, mysql_core_1.boolean)('is_active').default(true),
});
// ── CLIENTS ───────────────────────────────────────────────────────────────────
exports.clients = (0, mysql_core_1.mysqlTable)('clients', {
    id: (0, mysql_core_1.varchar)('id', { length: 36 }).primaryKey().default((0, drizzle_orm_1.sql) `(UUID())`),
    tenantId: (0, mysql_core_1.varchar)('tenant_id', { length: 36 }).notNull().references(() => exports.tenants.id),
    advocateId: (0, mysql_core_1.varchar)('advocate_id', { length: 36 }).notNull().references(() => exports.users.id),
    fullName: (0, mysql_core_1.text)('full_name').notNull(),
    email: (0, mysql_core_1.varchar)('email', { length: 320 }),
    phone: (0, mysql_core_1.varchar)('phone', { length: 15 }),
    aadhaarRef: (0, mysql_core_1.varchar)('aadhaar_ref', { length: 4 }),
    caseTitle: (0, mysql_core_1.text)('case_title'),
    notes: (0, mysql_core_1.text)('notes'),
    isActive: (0, mysql_core_1.boolean)('is_active').default(true),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow(),
}, (t) => ({
    tenantIdx: (0, mysql_core_1.index)('clients_tenant_idx').on(t.tenantId),
    advocateIdx: (0, mysql_core_1.index)('clients_advocate_idx').on(t.advocateId),
}));
// ── MATTERS ───────────────────────────────────────────────────────────────────
exports.matters = (0, mysql_core_1.mysqlTable)('matters', {
    id: (0, mysql_core_1.varchar)('id', { length: 36 }).primaryKey().default((0, drizzle_orm_1.sql) `(UUID())`),
    tenantId: (0, mysql_core_1.varchar)('tenant_id', { length: 36 }).notNull().references(() => exports.tenants.id),
    advocateId: (0, mysql_core_1.varchar)('advocate_id', { length: 36 }).notNull().references(() => exports.users.id),
    clientId: (0, mysql_core_1.varchar)('client_id', { length: 36 }).notNull().references(() => exports.clients.id),
    title: (0, mysql_core_1.text)('title').notNull(),
    matterType: (0, mysql_core_1.varchar)('matter_type', { length: 100 }),
    courtCode: (0, mysql_core_1.varchar)('court_code', { length: 20 }).references(() => exports.courts.courtCode),
    caseNumber: (0, mysql_core_1.varchar)('case_number', { length: 100 }),
    filingDate: (0, mysql_core_1.date)('filing_date'),
    status: (0, mysql_core_1.mysqlEnum)('status', ['ACTIVE', 'DISPOSED', 'STAYED', 'WITHDRAWN']).default('ACTIVE'),
    description: (0, mysql_core_1.text)('description'),
    feesAgreed: (0, mysql_core_1.decimal)('fees_agreed', { precision: 12, scale: 2 }),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow(),
}, (t) => ({
    tenantIdx: (0, mysql_core_1.index)('matters_tenant_idx').on(t.tenantId),
    advocateIdx: (0, mysql_core_1.index)('matters_advocate_idx').on(t.advocateId),
    statusIdx: (0, mysql_core_1.index)('matters_status_idx').on(t.status),
}));
// ── HEARINGS ──────────────────────────────────────────────────────────────────
exports.hearings = (0, mysql_core_1.mysqlTable)('hearings', {
    id: (0, mysql_core_1.varchar)('id', { length: 36 }).primaryKey().default((0, drizzle_orm_1.sql) `(UUID())`),
    matterId: (0, mysql_core_1.varchar)('matter_id', { length: 36 }).references(() => exports.matters.id),
    advocateId: (0, mysql_core_1.varchar)('advocate_id', { length: 36 }).notNull().references(() => exports.users.id),
    tenantId: (0, mysql_core_1.varchar)('tenant_id', { length: 36 }).notNull().references(() => exports.tenants.id),
    scheduledAt: (0, mysql_core_1.timestamp)('scheduled_at').notNull(),
    courtCode: (0, mysql_core_1.varchar)('court_code', { length: 20 }),
    courtHall: (0, mysql_core_1.varchar)('court_hall', { length: 50 }),
    judgeName: (0, mysql_core_1.varchar)('judge_name', { length: 200 }),
    purpose: (0, mysql_core_1.varchar)('purpose', { length: 500 }),
    status: (0, mysql_core_1.mysqlEnum)('status', ['UPCOMING', 'HEARD', 'ADJOURNED', 'PART_HEARD']).default('UPCOMING'),
    nextDate: (0, mysql_core_1.date)('next_date'),
    orderSummary: (0, mysql_core_1.text)('order_summary'),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
}, (t) => ({
    tenantIdx: (0, mysql_core_1.index)('hearings_tenant_idx').on(t.tenantId),
    advocateIdx: (0, mysql_core_1.index)('hearings_advocate_idx').on(t.advocateId),
    scheduledIdx: (0, mysql_core_1.index)('hearings_scheduled_idx').on(t.scheduledAt),
}));
// ── INVOICES ──────────────────────────────────────────────────────────────────
exports.invoices = (0, mysql_core_1.mysqlTable)('invoices', {
    id: (0, mysql_core_1.varchar)('id', { length: 36 }).primaryKey().default((0, drizzle_orm_1.sql) `(UUID())`),
    matterId: (0, mysql_core_1.varchar)('matter_id', { length: 36 }).references(() => exports.matters.id),
    advocateId: (0, mysql_core_1.varchar)('advocate_id', { length: 36 }).notNull().references(() => exports.users.id),
    clientId: (0, mysql_core_1.varchar)('client_id', { length: 36 }).notNull().references(() => exports.clients.id),
    tenantId: (0, mysql_core_1.varchar)('tenant_id', { length: 36 }).notNull().references(() => exports.tenants.id),
    invoiceNumber: (0, mysql_core_1.varchar)('invoice_number', { length: 50 }).notNull(),
    amount: (0, mysql_core_1.decimal)('amount', { precision: 12, scale: 2 }).notNull(),
    gstAmount: (0, mysql_core_1.decimal)('gst_amount', { precision: 12, scale: 2 }),
    totalAmount: (0, mysql_core_1.decimal)('total_amount', { precision: 12, scale: 2 }).notNull(),
    status: (0, mysql_core_1.mysqlEnum)('status', ['DRAFT', 'SENT', 'PAID', 'OVERDUE']).default('DRAFT'),
    dueDate: (0, mysql_core_1.date)('due_date'),
    paidAt: (0, mysql_core_1.timestamp)('paid_at'),
    razorpayRef: (0, mysql_core_1.varchar)('razorpay_ref', { length: 100 }),
    notes: (0, mysql_core_1.text)('notes'),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow(),
}, (t) => ({
    tenantIdx: (0, mysql_core_1.index)('invoices_tenant_idx').on(t.tenantId),
    statusIdx: (0, mysql_core_1.index)('invoices_status_idx').on(t.status),
    invoiceNumUniq: (0, mysql_core_1.unique)('invoices_num_unique').on(t.invoiceNumber),
}));
// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
exports.notifications = (0, mysql_core_1.mysqlTable)('notifications', {
    id: (0, mysql_core_1.varchar)('id', { length: 36 }).primaryKey().default((0, drizzle_orm_1.sql) `(UUID())`),
    userId: (0, mysql_core_1.varchar)('user_id', { length: 36 }).notNull().references(() => exports.users.id),
    tenantId: (0, mysql_core_1.varchar)('tenant_id', { length: 36 }).notNull().references(() => exports.tenants.id),
    type: (0, mysql_core_1.mysqlEnum)('type', ['HEARING_REMINDER', 'INVOICE_DUE', 'CASE_UPDATE', 'SYSTEM']).notNull(),
    title: (0, mysql_core_1.varchar)('title', { length: 200 }).notNull(),
    body: (0, mysql_core_1.text)('body').notNull(),
    entityType: (0, mysql_core_1.varchar)('entity_type', { length: 50 }),
    entityId: (0, mysql_core_1.varchar)('entity_id', { length: 36 }),
    isRead: (0, mysql_core_1.boolean)('is_read').default(false),
    scheduledFor: (0, mysql_core_1.timestamp)('scheduled_for'),
    sentAt: (0, mysql_core_1.timestamp)('sent_at'),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
}, (t) => ({
    userIdx: (0, mysql_core_1.index)('notifications_user_idx').on(t.userId),
    isReadIdx: (0, mysql_core_1.index)('notifications_read_idx').on(t.isRead),
}));
// ── DOCUMENTS (DRAFT STUDIO) ──────────────────────────────────────────────────
exports.documents = (0, mysql_core_1.mysqlTable)('documents', {
    id: (0, mysql_core_1.varchar)('id', { length: 36 }).primaryKey().default((0, drizzle_orm_1.sql) `(UUID())`),
    tenantId: (0, mysql_core_1.varchar)('tenant_id', { length: 36 }).notNull().references(() => exports.tenants.id),
    advocateId: (0, mysql_core_1.varchar)('advocate_id', { length: 36 }).notNull().references(() => exports.users.id),
    clientId: (0, mysql_core_1.varchar)('client_id', { length: 36 }).references(() => exports.clients.id),
    matterId: (0, mysql_core_1.varchar)('matter_id', { length: 36 }).references(() => exports.matters.id),
    docType: (0, mysql_core_1.varchar)('doc_type', { length: 100 }).notNull(),
    title: (0, mysql_core_1.varchar)('title', { length: 200 }).notNull(),
    htmlContent: (0, mysql_core_1.text)('html_content'),
    aiGenerated: (0, mysql_core_1.boolean)('ai_generated').default(false),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow(),
}, (t) => ({
    tenantIdx: (0, mysql_core_1.index)('docs_tenant_idx').on(t.tenantId),
    advocateIdx: (0, mysql_core_1.index)('docs_advocate_idx').on(t.advocateId),
}));
// ── STAMP DUTY RULES ──────────────────────────────────────────────────────────
exports.stampDutyRules = (0, mysql_core_1.mysqlTable)('stamp_duty_rules', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    stateCode: (0, mysql_core_1.varchar)('state_code', { length: 10 }).notNull(),
    docType: (0, mysql_core_1.varchar)('doc_type', { length: 100 }).notNull(),
    rate: (0, mysql_core_1.decimal)('rate', { precision: 6, scale: 4 }),
    fixedAmount: (0, mysql_core_1.decimal)('fixed_amount', { precision: 10, scale: 2 }),
    minDuty: (0, mysql_core_1.decimal)('min_duty', { precision: 10, scale: 2 }),
    maxDuty: (0, mysql_core_1.decimal)('max_duty', { precision: 10, scale: 2 }),
    effectiveFrom: (0, mysql_core_1.date)('effective_from').notNull(),
    gazetteRef: (0, mysql_core_1.varchar)('gazette_ref', { length: 200 }),
});
// ── RELATIONS ─────────────────────────────────────────────────────────────────
exports.tenantsRelations = (0, drizzle_orm_1.relations)(exports.tenants, ({ many }) => ({
    users: many(exports.users),
    clients: many(exports.clients),
    matters: many(exports.matters),
}));
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, ({ one, many }) => ({
    tenant: one(exports.tenants, { fields: [exports.users.tenantId], references: [exports.tenants.id] }),
    advocateProfile: one(exports.advocateProfiles, { fields: [exports.users.id], references: [exports.advocateProfiles.userId] }),
    sessions: many(exports.sessions),
    clients: many(exports.clients),
    matters: many(exports.matters),
    notifications: many(exports.notifications),
}));
exports.sessionsRelations = (0, drizzle_orm_1.relations)(exports.sessions, ({ one }) => ({
    user: one(exports.users, { fields: [exports.sessions.userId], references: [exports.users.id] }),
}));
exports.clientsRelations = (0, drizzle_orm_1.relations)(exports.clients, ({ one, many }) => ({
    tenant: one(exports.tenants, { fields: [exports.clients.tenantId], references: [exports.tenants.id] }),
    advocate: one(exports.users, { fields: [exports.clients.advocateId], references: [exports.users.id] }),
    matters: many(exports.matters),
}));
exports.mattersRelations = (0, drizzle_orm_1.relations)(exports.matters, ({ one, many }) => ({
    client: one(exports.clients, { fields: [exports.matters.clientId], references: [exports.clients.id] }),
    advocate: one(exports.users, { fields: [exports.matters.advocateId], references: [exports.users.id] }),
    court: one(exports.courts, { fields: [exports.matters.courtCode], references: [exports.courts.courtCode] }),
    hearings: many(exports.hearings),
    invoices: many(exports.invoices),
}));
exports.hearingsRelations = (0, drizzle_orm_1.relations)(exports.hearings, ({ one }) => ({
    matter: one(exports.matters, { fields: [exports.hearings.matterId], references: [exports.matters.id] }),
    advocate: one(exports.users, { fields: [exports.hearings.advocateId], references: [exports.users.id] }),
}));
exports.invoicesRelations = (0, drizzle_orm_1.relations)(exports.invoices, ({ one }) => ({
    matter: one(exports.matters, { fields: [exports.invoices.matterId], references: [exports.matters.id] }),
    advocate: one(exports.users, { fields: [exports.invoices.advocateId], references: [exports.users.id] }),
    client: one(exports.clients, { fields: [exports.invoices.clientId], references: [exports.clients.id] }),
}));
exports.documentsRelations = (0, drizzle_orm_1.relations)(exports.documents, ({ one }) => ({
    matter: one(exports.matters, { fields: [exports.documents.matterId], references: [exports.matters.id] }),
    advocate: one(exports.users, { fields: [exports.documents.advocateId], references: [exports.users.id] }),
    client: one(exports.clients, { fields: [exports.documents.clientId], references: [exports.clients.id] }),
}));
