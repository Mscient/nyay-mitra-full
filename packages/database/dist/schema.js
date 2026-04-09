"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.casesRelations = exports.hearingsRelations = exports.mattersRelations = exports.clientsRelations = exports.stampDutyRules = exports.cases = exports.invoices = exports.hearings = exports.matters = exports.courts = exports.clients = exports.advocateProfiles = exports.users = exports.tenants = exports.stampBasisEnum = exports.copStatusEnum = exports.caseStatusEnum = exports.courtTierEnum = exports.invoiceStatusEnum = exports.hearingStatusEnum = exports.matterStatusEnum = exports.kycLevelEnum = exports.userTypeEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
// Custom type for AES-256 encrypted fields mapped as bytea in postgres
const bytea = (0, pg_core_1.customType)({
    dataType() {
        return 'bytea';
    },
});
// ENUMS
exports.userTypeEnum = (0, pg_core_1.pgEnum)('user_type', ['CITIZEN', 'ADVOCATE', 'STUDENT', 'ORG_ADMIN', 'PLATFORM_ADMIN']);
exports.kycLevelEnum = (0, pg_core_1.pgEnum)('kyc_level', ['NONE', 'PHONE_OTP', 'AADHAAR', 'BCI_VERIFIED']);
exports.matterStatusEnum = (0, pg_core_1.pgEnum)('matter_status', ['ACTIVE', 'DISPOSED', 'STAYED', 'WITHDRAWN']);
exports.hearingStatusEnum = (0, pg_core_1.pgEnum)('hearing_status', ['UPCOMING', 'HEARD', 'ADJOURNED', 'PART_HEARD']);
exports.invoiceStatusEnum = (0, pg_core_1.pgEnum)('invoice_status', ['DRAFT', 'SENT', 'PAID', 'OVERDUE']);
exports.courtTierEnum = (0, pg_core_1.pgEnum)('court_tier', ['SUPREME', 'HIGH', 'DISTRICT', 'TAHSIL', 'TRIBUNAL']);
exports.caseStatusEnum = (0, pg_core_1.pgEnum)('case_status', ['PENDING', 'DISPOSED', 'DISMISSED', 'ALLOWED', 'TRANSFERRED']);
exports.copStatusEnum = (0, pg_core_1.pgEnum)('cop_status', ['VALID', 'EXPIRED', 'SUSPENDED', 'CANCELLED']);
exports.stampBasisEnum = (0, pg_core_1.pgEnum)('stamp_basis', ['PERCENTAGE', 'FIXED', 'SLAB']);
// TABLES
exports.tenants = (0, pg_core_1.pgTable)('tenants', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
});
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)('tenant_id').notNull().references(() => exports.tenants.id),
    email: (0, pg_core_1.text)('email').notNull().unique(),
    phoneEnc: bytea('phone_enc'),
    fullNameEnc: bytea('full_name_enc'),
    userType: (0, exports.userTypeEnum)('user_type'),
    kycLevel: (0, exports.kycLevelEnum)('kyc_level').default('NONE'),
    aadhaarRef: (0, pg_core_1.varchar)('aadhaar_ref', { length: 4 }), // Only last 4
    bciNumber: (0, pg_core_1.text)('bci_number'),
    bciVerified: (0, pg_core_1.boolean)('bci_verified').default(false),
    bciState: (0, pg_core_1.text)('bci_state'),
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
});
exports.advocateProfiles = (0, pg_core_1.pgTable)('advocate_profiles', {
    userId: (0, pg_core_1.uuid)('user_id').primaryKey().references(() => exports.users.id),
    bciNumber: (0, pg_core_1.text)('bci_number').notNull().unique(),
    enrollmentDate: (0, pg_core_1.date)('enrollment_date'),
    stateBarCouncil: (0, pg_core_1.text)('state_bar_council').notNull(),
    copExpiry: (0, pg_core_1.date)('cop_expiry'),
    copStatus: (0, exports.copStatusEnum)('cop_status').default('VALID'),
    practiceAreas: (0, pg_core_1.text)('practice_areas').array(), // string[]
    courtsRegular: (0, pg_core_1.text)('courts_regular').array(),
    languages: (0, pg_core_1.text)('languages').array(),
    yearsPractice: (0, pg_core_1.integer)('years_practice'),
    aboutText: (0, pg_core_1.text)('about_text'),
    feeConsultation: (0, pg_core_1.numeric)('fee_consultation', { precision: 8, scale: 2 }),
    isPublic: (0, pg_core_1.boolean)('is_public').default(true),
    profileComplete: (0, pg_core_1.integer)('profile_complete').default(0),
    verifiedAt: (0, pg_core_1.timestamp)('verified_at'),
    city: (0, pg_core_1.text)('city'),
    district: (0, pg_core_1.text)('district'),
    stateCode: (0, pg_core_1.text)('state_code'),
    lat: (0, pg_core_1.numeric)('lat', { precision: 9, scale: 6 }),
    lng: (0, pg_core_1.numeric)('lng', { precision: 9, scale: 6 }),
});
exports.clients = (0, pg_core_1.pgTable)('clients', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)('tenant_id').notNull().references(() => exports.tenants.id),
    fullNameEnc: bytea('full_name_enc'),
    emailEnc: bytea('email_enc'),
    phoneEnc: bytea('phone_enc'),
    aadhaarRef: (0, pg_core_1.varchar)('aadhaar_ref', { length: 4 }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
});
exports.courts = (0, pg_core_1.pgTable)('courts', {
    courtCode: (0, pg_core_1.text)('court_code').primaryKey(),
    courtName: (0, pg_core_1.text)('court_name').notNull(),
    courtTier: (0, exports.courtTierEnum)('court_tier'),
    stateCode: (0, pg_core_1.text)('state_code'),
    districtCode: (0, pg_core_1.text)('district_code'),
    ecourtsId: (0, pg_core_1.text)('ecourts_id'),
    njdgEnabled: (0, pg_core_1.boolean)('njdg_enabled').default(false),
    websiteUrl: (0, pg_core_1.text)('website_url'),
    address: (0, pg_core_1.text)('address'),
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
});
exports.matters = (0, pg_core_1.pgTable)('matters', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)('tenant_id').notNull().references(() => exports.tenants.id),
    advocateId: (0, pg_core_1.uuid)('advocate_id').notNull().references(() => exports.users.id),
    clientId: (0, pg_core_1.uuid)('client_id').notNull().references(() => exports.clients.id),
    title: (0, pg_core_1.text)('title').notNull(),
    matterType: (0, pg_core_1.text)('matter_type'),
    courtCode: (0, pg_core_1.text)('court_code').references(() => exports.courts.courtCode),
    caseNumber: (0, pg_core_1.text)('case_number'),
    filingDate: (0, pg_core_1.date)('filing_date'),
    status: (0, exports.matterStatusEnum)('status').default('ACTIVE'),
    descriptionEnc: bytea('description_enc'),
    feesAgreed: (0, pg_core_1.numeric)('fees_agreed', { precision: 12, scale: 2 }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
});
exports.hearings = (0, pg_core_1.pgTable)('hearings', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    matterId: (0, pg_core_1.uuid)('matter_id').notNull().references(() => exports.matters.id),
    scheduledAt: (0, pg_core_1.timestamp)('scheduled_at').notNull(),
    courtCode: (0, pg_core_1.text)('court_code'),
    courtHall: (0, pg_core_1.text)('court_hall'),
    judgeName: (0, pg_core_1.text)('judge_name'),
    status: (0, exports.hearingStatusEnum)('status').default('UPCOMING'),
    nextDate: (0, pg_core_1.date)('next_date'),
    orderSummary: (0, pg_core_1.text)('order_summary'),
    ecourtsSync: (0, pg_core_1.boolean)('ecourts_sync').default(false),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
});
exports.invoices = (0, pg_core_1.pgTable)('invoices', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    matterId: (0, pg_core_1.uuid)('matter_id').references(() => exports.matters.id),
    advocateId: (0, pg_core_1.uuid)('advocate_id').notNull().references(() => exports.users.id),
    clientId: (0, pg_core_1.uuid)('client_id').notNull().references(() => exports.clients.id),
    invoiceNumber: (0, pg_core_1.text)('invoice_number').notNull().unique(),
    amount: (0, pg_core_1.numeric)('amount', { precision: 12, scale: 2 }).notNull(),
    gstAmount: (0, pg_core_1.numeric)('gst_amount', { precision: 12, scale: 2 }),
    totalAmount: (0, pg_core_1.numeric)('total_amount', { precision: 12, scale: 2 }).notNull(),
    status: (0, exports.invoiceStatusEnum)('status').default('DRAFT'),
    dueDate: (0, pg_core_1.date)('due_date'),
    paidAt: (0, pg_core_1.timestamp)('paid_at'),
    razorpayRef: (0, pg_core_1.text)('razorpay_ref'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
});
exports.cases = (0, pg_core_1.pgTable)('cases', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    courtCode: (0, pg_core_1.text)('court_code').notNull().references(() => exports.courts.courtCode),
    caseNumber: (0, pg_core_1.text)('case_number').notNull(),
    caseType: (0, pg_core_1.text)('case_type'),
    year: (0, pg_core_1.integer)('year'),
    petitionerEnc: bytea('petitioner_enc'),
    respondentEnc: bytea('respondent_enc'),
    filingDate: (0, pg_core_1.date)('filing_date'),
    disposalDate: (0, pg_core_1.date)('disposal_date'),
    status: (0, exports.caseStatusEnum)('status'),
    nextHearing: (0, pg_core_1.date)('next_hearing'),
    bench: (0, pg_core_1.text)('bench'),
    subject: (0, pg_core_1.text)('subject'),
    actsInvolved: (0, pg_core_1.text)('acts_involved').array(),
    source: (0, pg_core_1.text)('source'),
    esIndexed: (0, pg_core_1.boolean)('es_indexed').default(false),
    fullTextUrl: (0, pg_core_1.text)('full_text_url'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
});
exports.stampDutyRules = (0, pg_core_1.pgTable)('stamp_duty_rules', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    stateCode: (0, pg_core_1.text)('state_code').notNull(),
    docType: (0, pg_core_1.text)('doc_type').notNull(),
    basis: (0, exports.stampBasisEnum)('basis'),
    rate: (0, pg_core_1.numeric)('rate', { precision: 6, scale: 4 }),
    fixedAmount: (0, pg_core_1.numeric)('fixed_amount', { precision: 10, scale: 2 }),
    minDuty: (0, pg_core_1.numeric)('min_duty', { precision: 10, scale: 2 }),
    maxDuty: (0, pg_core_1.numeric)('max_duty', { precision: 10, scale: 2 }),
    effectiveFrom: (0, pg_core_1.date)('effective_from').notNull(),
    gazetteRef: (0, pg_core_1.text)('gazette_ref'),
});
// RELATIONS
exports.clientsRelations = (0, drizzle_orm_1.relations)(exports.clients, ({ many }) => ({
    matters: many(exports.matters),
}));
exports.mattersRelations = (0, drizzle_orm_1.relations)(exports.matters, ({ one, many }) => ({
    client: one(exports.clients, {
        fields: [exports.matters.clientId],
        references: [exports.clients.id],
    }),
    advocate: one(exports.users, {
        fields: [exports.matters.advocateId],
        references: [exports.users.id],
    }),
    court: one(exports.courts, {
        fields: [exports.matters.courtCode],
        references: [exports.courts.courtCode],
    }),
    hearings: many(exports.hearings),
    invoices: many(exports.invoices),
}));
exports.hearingsRelations = (0, drizzle_orm_1.relations)(exports.hearings, ({ one }) => ({
    matter: one(exports.matters, {
        fields: [exports.hearings.matterId],
        references: [exports.matters.id],
    }),
}));
exports.casesRelations = (0, drizzle_orm_1.relations)(exports.cases, ({ one }) => ({
    court: one(exports.courts, {
        fields: [exports.cases.courtCode],
        references: [exports.courts.courtCode],
    }),
}));
