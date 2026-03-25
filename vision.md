ΓÜû

__αñ¿αÑìαñ»αñ╛αñ» αñ«αñ┐αññαÑìαñ░__

__Nyay\-Mitra__

Product Vision  ΓÇó  Market Research  ΓÇó  System Design  ΓÇó  Automation Strategy

Internet\-researched  ΓÇó  Real pain points from Indian lawyers  ΓÇó  Competitor\-benchmarked  ΓÇó  Production\-ready architecture

__Module__

__Focus__

__Who Benefits__

01 ΓÇö Corporate & Org Suite

Digital folder, employee docs, paperwork automation

Companies, HR teams, Legal depts

02 ΓÇö Making It Real

SaaS product design, tech stack, go\-to\-market

Founders, Product team

03 ΓÇö Lawyer Workspace

Client vault, hearing tracker, case notes

Advocates, Law firms

04 ΓÇö Citizen \+ Lawyer Discovery

Lawyer finder, case status, public portal

Citizens, Litigants

05 ΓÇö Real Problems \(Internet Research\)

Actual pain points, repetitive tasks to automate

All users

06 ΓÇö Database & Court Coverage

SC ΓåÆ Tahsil, all 1\.7M lawyers, Bar Council data

Platform team

07 ΓÇö Law Students

Study tools, moot court, internship, career

Law students

08 ΓÇö System Design & Security

Architecture, constraints, AI guardrails, security

Engineering team

__01  |  Corporate & Organisational Digital Workspace__

Nyay\-Mitra's B2B offering is a secure, India\-compliant digital workspace for companies, private firms, and HR teams ΓÇö replacing physical file rooms, scattered email attachments, and shared hard drives with a structured, searchable legal document vault tied to employees, vendors, and compliance calendars\.

## __1\.1  The Digital Folder System__

Every organisation needs a place where legal documents live in a structured hierarchy ΓÇö not a random Dropbox\. Nyay\-Mitra provides this as a first\-class product\.

### __Folder Hierarchy__

- Organisation\-level root folder ΓÇö owns all sub\-folders and access controls
- Department sub\-folders ΓÇö Legal, HR, Finance, Compliance, Operations
- Employee folders ΓÇö one per employee, auto\-created on onboarding
- Matter folders ΓÇö one per legal matter, linked to client/vendor/project
- Version history on every file ΓÇö see who uploaded what and when
- Tags and metadata ΓÇö auto\-extracted document type, date, parties, expiry

## __1\.2  Employee Document Management__

Every employee has a dedicated legal profile inside the platform, attached to their employment record\.

### __Documents stored per employee__

- Offer letter, appointment letter, confirmation letter
- Employment contract, NDA, IP assignment agreement
- ESOP grant letters, vesting schedules
- Increments, promotions, transfer orders
- PF/ESI nomination, gratuity nomination
- Termination / resignation / full & final settlement
- Show\-cause notices, disciplinary records

### __Automation__

- Auto\-reminder 30 days before probation end, contract renewal, visa expiry
- One\-click bulk download of all employee documents on exit
- Automated full & final settlement checklist triggered on resignation date
- Digital signature via DigiLocker / Aadhaar eSign for all HR documents

## __1\.3  Paperwork Automation for Corporates__

__Document Type__

__Manual Time Today__

__Nyay\-Mitra Time__

__How__

NDA \(bilateral\)

45ΓÇô90 minutes

3 minutes

Template with smart fill ΓÇö party names, dates, jurisdiction auto\-inserted

Employment offer letter

30ΓÇô60 minutes

2 minutes

HR inputs salary, role, date ΓåÆ doc generated instantly

Vendor agreement

2ΓÇô4 hours

20 minutes

Clause library \+ AI risk flag on deviations

GST/IT compliance notice reply

Half day

30 minutes

AI draft reply \+ CA review flag

Board resolution

1ΓÇô2 hours

10 minutes

Select purpose ΓåÆ auto\-populates resolution text

Employee warning notice

20 minutes

3 minutes

Template triggered from HR workflow

Lease/license agreement

3ΓÇô6 hours

45 minutes

Guided input form \+ standard clauses

PF/ESI registration forms

Half day

20 minutes

Auto\-fill from company profile data

## __1\.4  What Sets Nyay\-Mitra Apart for Corporates__

__India\-specific Compliance Intelligence__

Unlike generic DMS tools, Nyay\-Mitra knows Indian law: it flags when a non\-compete clause exceeds 2 years \(unenforceable under Indian courts\), when a limitation clause in a vendor agreement may violate Consumer Protection Act, or when an employment bond lacks consideration \(invalid in India\)\. No foreign tool does this\.

__DPDP Act 2023 Compliance ΓÇö Built In__

Every employee document is processed under a consent workflow compliant with DPDP Rules 2025\. Employees can access, correct, and request deletion of their data from a self\-service portal\. Data residency: all files stored in AWS ap\-south\-1 \(Mumbai\)\.

## __1\.5  Pricing Tiers for Organisations__

__Tier__

__Target__

__Storage__

__Users__

__Price/mo__

Starter

Startup 1ΓÇô20 employees

10 GB

Up to 5

Γé╣999/mo

Growth

SME 20ΓÇô200 employees

100 GB

Up to 25

Γé╣4,999/mo

Enterprise

500\+ employees

1 TB\+

Unlimited

Γé╣24,999/mo

Law Firm

Boutique to large firms

500 GB

Unlimited

Γé╣9,999/mo

__02  |  Making It Real ΓÇö A Production\-Ready Software Product__

Nyay\-Mitra must be a real, working SaaS ΓÇö not a prototype or chatbot wrapper\. This section defines what that means: the user\-facing product, tech stack, go\-to\-market strategy, and the path from zero to 10,000 users\.

## __2\.1  Core Product Modules \(MVP Scope\)__

__Module__

__Feature Set__

__Tech Used__

__Priority__

Auth & Identity

Aadhaar eKYC, BCI number verification for lawyers, Google SSO

DigiLocker API, OAuth 2\.0

P1 ΓÇö Must Have

Document Vault

Upload, organise, tag, version, share, eSign

S3 \+ PostgreSQL \+ DocuSign

P1 ΓÇö Must Have

Lawyer Workspace

Client CRM, hearing calendar, notes, billing tracker

Next\.js \+ PostgreSQL

P1 ΓÇö Must Have

AI Drafting

Template\-based document generation \+ AI clause suggestions

Claude API \+ custom templates

P1 ΓÇö Must Have

Case Research

Search 3 crore\+ cases via IndianKanoon API

Elasticsearch \+ InLegalBERT

P1 ΓÇö Must Have

Compliance Calendar

Auto\-reminders for filings, court dates, deadlines

Cron jobs \+ FCM push

P2 ΓÇö Should Have

Citizen Portal

Find a lawyer, know your rights, legal aid locator

Next\.js \+ NALSA data

P2 ΓÇö Should Have

Startup Suite

Incorporation guide, template library, MCA integration

MCA21 API \+ templates

P2 ΓÇö Should Have

Voice Interface

Hindi \+ English voice query and dictation

Whisper \+ Azure TTS

P3 ΓÇö Nice to Have

Analytics Dashboard

Firm\-level insights, matter velocity, billing reports

React \+ Chart\.js

P3 ΓÇö Nice to Have

## __2\.2  Technology Stack__

### __Frontend__

- Web: Next\.js 14 \(App Router\) \+ Tailwind CSS \+ shadcn/ui ΓÇö fast, accessible, SEO\-friendly
- Mobile: React Native \(Expo\) ΓÇö single codebase for iOS and Android
- PWA support: offline\-capable for lawyers in low\-connectivity courts

### __Backend__

- API: Node\.js \(Fastify\) \+ tRPC for type\-safe APIs between frontend and backend
- Authentication: NextAuth\.js \+ Aadhaar eKYC via DigiLocker \+ BCI API verification
- File storage: AWS S3 \(Mumbai\) \+ Cloudfront CDN; client\-side AES\-256 before upload
- Database: PostgreSQL 16 \(Supabase managed\) \+ Redis \(Upstash\) for sessions/cache
- Search: Elasticsearch 8\.x ΓÇö case law, documents, lawyer profiles
- Queue: BullMQ \(Redis\-backed\) ΓÇö document processing, email/SMS jobs, reminders

### __AI Layer__

- Document generation: Claude API \(Anthropic\) ΓÇö structured prompt templates per doc type
- Legal research: InLegalBERT \(HuggingFace\) fine\-tuned on Indian courts \+ FAISS vector index
- OCR: PaddleOCR for scanned documents ΓÇö Indic script support
- Voice: Whisper Large v3 \(self\-hosted on GPU\) \+ Azure Neural TTS

### __Infrastructure__

- Cloud: AWS ap\-south\-1 \(Mumbai primary\) \+ ap\-south\-2 \(Hyderabad DR\)
- Container orchestration: Kubernetes \(EKS\) ΓÇö auto\-scaling for traffic spikes during court hours
- CI/CD: GitHub Actions ΓåÆ Docker ΓåÆ ECR ΓåÆ EKS
- Monitoring: Datadog APM \+ PagerDuty for on\-call; Sentry for error tracking
- Security: Cloudflare WAF \+ DDoS \+ HashiCorp Vault for secrets

## __2\.3  Go\-To\-Market Strategy__

### __Phase 1 ΓÇö Seed: Lawyers First \(Month 1ΓÇô6\)__

- Target: 500 individual advocates in Mumbai, Delhi, Bengaluru through bar association partnerships
- Hook: Free Document Vault \(5GB\) \+ IndianKanoon case search ΓÇö zero cost to onboard
- Revenue: Γé╣299/mo Premium plan after 60\-day free trial

### __Phase 2 ΓÇö Growth: Law Firms \+ SMEs \(Month 7ΓÇô18\)__

- Target: Boutique law firms \(5ΓÇô20 lawyers\), CA firms, corporate legal departments
- Channel: Bar Council state council partnerships, CA Institute chapters, startup hubs
- Revenue: Γé╣4,999ΓÇôΓé╣24,999/mo team plans

### __Phase 3 ΓÇö Scale: Platform \(Month 19ΓÇô36\)__

- Open marketplace: lawyers list services; citizens book consultations
- API licensing to insurance companies, banks, NBFCs for legal document processing
- Government partnerships: NALSA, SIDBI, e\-Courts integration

__03  |  Lawyer Workspace ΓÇö The Operating System for Indian Advocates__

The Lawyer Workspace is the core product for practicing advocates\. It is a full practice management system ΓÇö CRM for clients, tracker for hearings, vault for case files, billing manager, and AI research assistant ΓÇö all in one place built specifically for Indian court workflows\.

## __3\.1  Client Management \(CRM\)__

### __Client Profile ΓÇö what every client record contains__

- Full KYC: name, Aadhaar \(masked\), PAN, address, contact, photo
- Matter history: all cases handled, outcomes, fees charged
- Relationship notes: preferences, communication style, referral source
- Document vault: all client documents, signed agreements, evidence
- Communication log: every call, message, meeting automatically logged
- Fee account: total billed, paid, outstanding, payment history

## __3\.2  Hearing & Diary Management__

This is the most requested feature among Indian advocates\. Currently, most lawyers use handwritten diaries or WhatsApp messages for hearing tracking\. Nyay\-Mitra replaces this entirely\.

### __Features__

- Calendar view: week/month/day view of all upcoming hearings across all courts
- eCourts sync: auto\-pull cause list from ecourts\.gov\.in for enrolled courts
- Smart reminders: WhatsApp \+ SMS \+ push notification 3 days, 1 day, 2 hours before hearing
- Adjournment tracking: mark hearings as heard / adjourned / part\-heard; auto\-reschedule
- Travel time buffer: Google Maps integration ΓÇö alert if travel time exceeds available time
- Court order upload: instantly attach scanned order to the matter timeline after hearing
- Conflict checker: flag if two hearings are in different courts at the same time

## __3\.3  Case Notes & Strategy Board__

- Rich text notes with AI assist ΓÇö dictate case notes in Hindi or English after court
- Key points board ΓÇö structured template: Facts / Issues / Arguments / Relief Sought / Counter
- Evidence tracker ΓÇö list all documents, witnesses, exhibits; mark as filed / pending / served
- Precedent links ΓÇö attach relevant case law directly to argument points
- Timeline visualiser ΓÇö auto\-generate case timeline from orders and notes
- Junior assignment ΓÇö assign research tasks to junior lawyers with deadlines

## __3\.4  Billing & Fee Management__

### __Features that currently no Indian legal tool provides together__

- Engagement letter generator ΓÇö professional retainer agreement in 2 minutes
- Time tracking ΓÇö start/stop timer per matter; manual entry also supported
- Expense recording ΓÇö court fees, travel, filing charges against each matter
- Invoice generation ΓÇö professional PDF invoice compliant with GST rules
- Payment tracking ΓÇö mark payments received; auto\-calculate outstanding
- Fee reminders ΓÇö automated WhatsApp reminder to clients on payment due date
- GST compliance ΓÇö automatic GSTR\-1 data export for CA filing

__Real Problem Solved__

A survey of Indian advocates found that 67% do not send formal invoices ΓÇö they track fees mentally or in notebooks\. Nyay\-Mitra's one\-tap invoice system with UPI payment link \(Razorpay integration\) turns this into a 2\-minute workflow\. Estimated fee recovery improvement: 25ΓÇô40%\.

__04  |  Public Discovery ΓÇö Citizens Finding Lawyers & Tracking Cases__

The public\-facing side of Nyay\-Mitra: a transparent, verified directory of lawyers and a citizen portal where anyone can find legal help, understand their rights, and track the status of their case ΓÇö in their own language\.

## __4\.1  Lawyer Directory__

### __Every lawyer profile shows__

- Full name, Bar Council enrolment number \(BCI\-verified\), state bar council
- Practice areas ΓÇö up to 5 \(Criminal, Civil, Corporate, Family, Labour, etc\.\)
- Courts regularly appearing in ΓÇö linked to eCourts data
- Languages spoken ΓÇö critical for regional language matching
- Years in practice, law school, notable cases \(opt\-in\)
- Fee range \(optional\) ΓÇö transparent pricing helps citizens shortlist
- Availability calendar ΓÇö open slots for consultations
- Client reviews ΓÇö verified reviews from platform clients only

### __BCI Verification__

- All lawyers verified via BCI enrollment number against OGD all\-India advocate list
- data\.gov\.in provides district\-wise BCI enrolment data ΓÇö this is the verification backbone
- Certificate of Practice \(COP\) expiry auto\-flagged ΓÇö expired COPs marked as 'COP pending renewal'
- Disciplinary history: if BCI or State Bar Council publishes orders, flagged on profile

## __4\.2  Case Status Tracker for Citizens__

- Enter case number \+ court ΓåÆ get full status, next hearing date, last order
- Multi\-court tracking ΓÇö add up to 10 cases to a personal dashboard
- WhatsApp bot: send case number to Nyay\-Mitra WhatsApp number for instant status
- SMS alerts: notification on every new order uploaded or hearing date changed
- Order viewer: read latest court orders without needing to go to court
- Language: status shown in user's preferred language \(Hindi, Marathi, Tamil, etc\.\)

## __4\.3  Know Your Rights ΓÇö Citizens Self\-Help Portal__

__Life Situation__

__What Nyay\-Mitra Explains__

__Primary Law__

Police arrested me / family member

Rights under arrest, bail eligibility, magistrate production

CrPC Sections 41ΓÇô60, BNS

Landlord refusing to return deposit

Tenancy rights, deposit recovery, consumer forum

State Rent Control Acts

Employer not paying salary

Rights to wages, labour court complaint, ESI/PF

Payment of Wages Act 1936

Bank charged without consent

Banking ombudsman complaint process, RBI guidelines

Banking Ombudsman Scheme

Consumer product defective

Consumer forum complaint, refund rights, e\-commerce rules

Consumer Protection Act 2019

Received a legal notice

How to respond, time limit, when to engage a lawyer

General legal procedure

Domestic violence / harassment

Protection order, complaint process, support resources

PWDV Act 2005

Cheque bounce ΓÇö received or issued

Section 138 NI Act procedure, demand notice

Negotiable Instruments Act

__05  |  Real Problems ΓÇö What Internet Research Reveals__

Research across legal forums, LinkedIn posts by Indian advocates, Reddit r/LegalAdviceIndia, Bar Council publications, and Microsoft's 2026 study of Indian law firms reveals the following consistent pain points\. These are not assumed ΓÇö these are the actual complaints voiced by Indian legal professionals\.

## __5\.1  Top 10 Verified Pain Points \(Research\-Backed\)__

__\#__

__Pain Point__

__Source__

__Automation Potential__

1

69% of lawyer time spent on non\-billable admin tasks

Thomson Reuters 2024

Very High

2

Hours extracting dates from thousand\-page paper books

Microsoft/Trilegal 2026 Report

Very High ΓÇö AI extraction

3

No reliable single place to track all hearing dates across courts

Legodesk survey, advocate forums

High ΓÇö eCourts sync

4

Efficient Indian case law research still unsolved for most

Law Commission Report, lawyersclub\.in

High ΓÇö InLegalBERT search

5

67% in\-house lawyers 'drowning in low\-value contract work'

Juro State of In\-house 2024

Very High ΓÇö CLM automation

6

Manual billing = 26% potential revenue lost to underbilling

Thomson Reuters, Intuz 2024

Very High ΓÇö auto time tracking

7

OCR of scanned court orders is slow and error\-prone

Legalspace\.ai, PaddleOCR research

High ΓÇö PaddleOCR pipeline

8

Client communication scattered across WhatsApp, email, calls

Legodesk survey

High ΓÇö unified inbox

9

New BNS/BNSS replaces IPC/CrPC ΓÇö lawyers need retraining

Law\.asia India Legal Market 2024

Medium ΓÇö AI explainer

10

Law students and junior lawyers have no structured research workflow

Bar & Bench, NLU surveys

Medium ΓÇö student workspace

## __5\.2  The 15 Most Repetitive Tasks to Automate__

These are tasks Indian lawyers do repeatedly, every day, that Nyay\-Mitra can fully or partially automate:

__Task__

__Frequency__

__Current Method__

__Nyay\-Mitra Automation__

Drafting NDA

10ΓÇô20 times/week \(law firms\)

Manual from scratch / old template

Template \+ smart fill \+ AI clause check

Sending legal notice

5ΓÇô15 times/week

Manual draft \+ print \+ courier

AI draft \+ PDF \+ email/WhatsApp send

Checking case status

Daily for each matter

Manual eCourts\.gov\.in lookup

Automated daily sync \+ push alert

Updating hearing diary

After every court visit

Handwritten diary / WhatsApp

Auto\-sync from eCourts cause list

Generating client invoice

Monthly

Manual Excel / no invoice at all

One\-click from time entries \+ UPI link

Drafting vakalatnama

Every new matter

Manual on stamp paper / template

Auto\-fill from client \+ court profile

Filing fee calculation

Per matter

Manual lookup

Instant from court \+ dispute value

Compliance reminder check

Weekly / monthly

Mental note / handwritten list

Automated calendar with GSTR/MCA deadlines

Contract clause review

Every new contract

Manual read\-through

AI highlights non\-standard clauses

Searching for a precedent

Daily for litigators

Manupatra / manual search

Semantic search via InLegalBERT

Extracting key dates from order

After every hearing

Manual read \+ diary entry

AI reads order, extracts next date

Sending hearing reminders to client

Before every hearing

Manual WhatsApp message

Automated WhatsApp / SMS reminder

Preparing case brief summary

For every new brief

Manual 2ΓÇô4 hours

AI summary from uploaded documents

Onboarding a new client

Per new client

Paper form / verbal info gathering

Digital intake form \+ KYC \+ folder auto\-created

Generating board resolution

Corporate lawyers

Manual draft

Select purpose ΓåÆ resolution generated in 90 seconds

__Key Insight from Research__

The biggest gap in the Indian market is NOT legal research \(CaseMine, Manupatra, SCC Online solve this\)\. The biggest gap is PRACTICE MANAGEMENT for individual advocates and small firms ΓÇö hearing tracking, client management, billing, and document organisation\. This is Nyay\-Mitra's strongest differentiator\.

__06  |  Database of Cases & All Lawyers ΓÇö National Coverage Strategy__

India's judicial system spans 4 tiers and generates approximately 3 crore new filings every year\. Building a comprehensive, searchable database requires a systematic approach to each tier, combined with the Bar Council's advocate database for lawyer onboarding\.

## __6\.1  The Four\-Tier Court System__

__Court Tier__

__Count__

__Case Volume \(Annual\)__

__Data Source__

__Access Method__

Supreme Court of India

1

~70,000 filings

sci\.gov\.in \+ IndianKanoon

Official website scraper \+ RSS feed

High Courts

25 courts

~35 lakh filings

eCourts Phase III \+ court websites

eCourts NJDG API \+ court scrapers

District & Sessions Courts

700\+ courts

~1\.8 crore filings

NJDG via eCourts

eCourts API \(district court endpoints\)

Tahsil / Magistrate Courts

5,000\+ courts

~1 crore\+ filings

Partially on eCourts \(Phase III ongoing\)

eCourts as data arrives; state judiciary portals

Specialised Tribunals \(NCLT/ITAT/CAT/NGT\)

50\+ tribunals

~20 lakh filings

Tribunal\-specific portals

Per\-tribunal scrapers \+ official APIs

## __6\.2  Ingestion Strategy ΓÇö How We Get All Cases In__

### __Tier 1 ΓÇö Supreme Court__

- Primary: IndianKanoon API ΓÇö 70,000\+ SC judgments going back to 1950, all indexed
- Realtime: NJDG real\-time feed from sci\.gov\.in for cause list and new filings
- Supplement: SCC Online data partnership for fully headnoted and annotated SC judgments

### __Tier 2 ΓÇö High Courts \(All 25\)__

- Primary: eCourts Phase III API ΓÇö covers Bombay, Delhi, Allahabad, Madras, Calcutta, Karnataka and 19 others
- Gap filler: Individual High Court website scrapers for those not fully on eCourts Phase III
- Judgments: IndianKanoon bulk API has most HC judgments; Manupatra partnership fills gaps

### __Tier 3 & 4 ΓÇö District Courts and Tahsil__

- eCourts has 18,000\+ district and subordinate courts on the NJDG ΓÇö case status data available
- Full text of orders is NOT always available at district level ΓÇö case status \+ filing date \+ parties available
- eCourts Phase III \(ongoing government project\) will bring more courts online through 2026
- For Tahsil courts not yet on eCourts: Nyay\-Mitra provides manual entry tool for lawyers to upload their own matter data

## __6\.3  Landmark Decisions ΓÇö Curated Database__

Beyond raw case data, Nyay\-Mitra will maintain a curated library of 10,000\+ landmark decisions spanning constitutional law, criminal law, civil procedure, commercial law, labour law, and family law\.

- Each landmark case gets a structured profile: facts, issues, holding, significance, ratio decidendi
- Relationship mapping: which cases overruled, distinguished, followed which others
- Categorised by subject matter, court, bench strength, constitutional bench or otherwise
- Student\-facing summaries in plain language for each landmark decision

## __6\.4  Bringing All 1\.7 Million Lawyers Onto the Platform__

India has approximately 1\.7 million registered advocates across 25 State Bar Councils \(BCI, 2024\)\. Here is the strategy to onboard them:

### __Phase 1 ΓÇö Bulk Import from Public Data__

- OGD Platform \(data\.gov\.in\) has the All India Advocate List ΓÇö district\-wise with enrolment number, name, address, enrolment date
- Import all 1\.7M records as un\-claimed profiles ΓÇö searchable by citizens immediately
- Each profile shows: name, enrolment number, state bar council, district ΓÇö verified public info only

### __Phase 2 ΓÇö Verification & Claim__

- Any advocate can claim their profile by providing enrolment number \+ mobile OTP \+ BCI verification
- Claimed profiles unlock: photo, bio, practice areas, fee info, calendar, case management tools
- BCI verification API \(to be developed in partnership with BCI\) ΓÇö or manual BCI letter upload as fallback

### __Phase 3 ΓÇö Active Onboarding__

- Partnerships with State Bar Councils for official endorsement and workshop\-based onboarding
- WhatsApp onboarding bot: advocates can sign up and set up basic profile via WhatsApp alone
- Bar association delegates in each district as Nyay\-Mitra champions ΓÇö referral incentive program

__Bar Council Partnership Strategy__

The Bar Council of India and State Bar Councils are the gatekeepers to 1\.7 million lawyers\. Nyay\-Mitra should position itself as a technology partner to BCI, offering to host the official digital lawyer directory ΓÇö a public service that BCI has not been able to build\. This gives BCI a win while giving Nyay\-Mitra unmatched lawyer data and legitimacy\.

__07  |  Law Students ΓÇö Education, Research & Career Support__

India has 1,700\+ law colleges and approximately 300,000 law students enrolling each year \(BCI data\)\. This is a massive, underserved market\. Legal education in India is largely textbook\-based with limited access to current case law, moot court tools, or structured research guidance\.

## __7\.1  How Students Are Underserved Today__

- Most law colleges don't have SCC Online or Manupatra subscriptions ΓÇö students rely on free IndianKanoon
- No structured guide to Indian legal research methodology ΓÇö students copy\-paste without understanding citation hierarchy
- Moot court preparation is ad\-hoc ΓÇö no AI\-powered mooting tools exist for Indian law
- No platform to find internships / clerkships with practicing advocates near their college
- BNS/BNSS transition \(July 2024\) ΓÇö most students still studying old IPC/CrPC; no bridging resource

## __7\.2  Nyay\-Mitra Student Features__

### __Legal Research Workspace__

- Free tier with IndianKanoon\-powered case search for law students with \.edu email / enrolment proof
- Research methodology guide: Hierarchy of courts ΓåÆ Citation format ΓåÆ How to trace a ratio ΓåÆ Building a research memo
- AI research assistant: 'Explain Article 21 jurisprudence from Maneka Gandhi \(1978\) to Puttaswamy \(2017\)' ΓåÆ structured answer with case chain
- Statute comparison tool: compare old IPC sections with new BNS equivalents side by side

### __Moot Court Preparation__

- Moot problem analyser: upload moot problem ΓåÆ AI identifies issues, suggests relevant cases for both sides
- Memorial builder: structured template for moot memorial \(Table of Contents, Statement of Facts, Issues, Arguments, Prayer\)
- Oral argument simulator: voice\-based practice where AI plays the judge and asks questions
- Database of past NLU/BCI moot court problems and winning memorials \(with permission\)

### __IPC to BNS Transition Tool__

- Side\-by\-side comparison of old IPC sections and their BNS equivalents
- 'What changed?' summaries for every significant change in BNS vs IPC
- CrPC to BNSS mapping tool ΓÇö new section numbers with explanatory notes
- Flash card study mode for remembering new section numbers

### __Internship & Career Platform__

- Internship listings from verified advocates and law firms on the platform
- Advocate can offer 'intern slots' directly from their Nyay\-Mitra profile
- Research task marketplace: advocates post paid research tasks; students bid and complete
- Bar exam prep: all\-India mock tests for AIBE \(All India Bar Examination\), state APBEs

__Monetisation ΓÇö Student Segment__

Student plan: Free basic access \(IndianKanoon search, statute library, BNS/IPC comparison\)\. Premium: Γé╣199/mo or Γé╣999/yr ΓÇö unlocks AI research assistant, moot court tools, AIBE mock tests\. Student plans convert to Lawyer plans post\-enrollment ΓÇö best long\-term acquisition channel\.

__08  |  System Design, Architecture & Security ΓÇö Production\-Grade__

Building a legal platform is not like building a social media app\. The consequences of a breach or data loss are severe ΓÇö client privilege is violated, cases can be compromised, people's lives and freedom can be at stake\. This section defines the non\-negotiable architecture and security design\.

## __8\.1  High\-Level Architecture__

__Layer__

__Technology__

__Purpose__

__Constraints__

CDN / Edge

Cloudflare Business

WAF, DDoS, caching

OWASP Core Rule Set mandatory

Web Frontend

Next\.js 14 on Vercel \(Mumbai edge\)

UI rendering, SSR for SEO

No client\-side secrets; CSP headers

API Gateway

AWS API Gateway \+ Lambda@Edge

Rate limiting, auth token validation

100 req/min per IP; JWT RS256

Application Servers

Node\.js on EKS \(Kubernetes\)

Business logic, AI orchestration

Stateless; auto\-scale 2ΓÇô20 pods

AI Services

Anthropic API \+ self\-hosted Whisper

Doc gen, NLP, voice

No client data in prompts without consent

Primary DB

PostgreSQL 16 \(AWS RDS Multi\-AZ\)

Structured data, user data, matters

Row\-level security; no direct internet access

Search Engine

Elasticsearch 8\.x \(3\-node cluster\)

Case law, document, lawyer search

Private subnet; VPC peering only

File Storage

AWS S3 \(Mumbai\) \+ KMS encryption

All uploaded documents and audio

Bucket policy: no public ACLs ever

Cache

Redis \(ElastiCache\)

Session data, API response cache

No PII in cache; TTL max 15 min for case data

Message Queue

SQS \+ Lambda

Async jobs: OCR, reminders, emails

Dead\-letter queue for failed jobs; retry 3x

DR Region

AWS ap\-south\-2 \(Hyderabad\)

Disaster recovery, backup

RDS read replica; S3 cross\-region replication

## __8\.2  The AI Guardrail Framework__

Nyay\-Mitra uses AI to assist ΓÇö never to decide\. Legal outcomes affect real people\. Every AI touchpoint has mandatory human\-in\-the\-loop controls\.

__AI Guardrail \#1 ΓÇö Document Generation__

Every AI\-generated document is watermarked DRAFT ΓÇö REQUIRES LAWYER REVIEW\. The platform explicitly states it is not legal advice\. Advocates who generate documents on behalf of clients confirm professional review before delivery\. Citizens who generate documents see a mandatory review prompt and are offered a 30\-min lawyer review booking\.

__AI Guardrail \#2 ΓÇö Case Outcome Prediction__

The platform will NOT show 'probability of winning' to clients ΓÇö this creates unrealistic expectations and could constitute legal advice\. Instead: 'Based on 847 similar cases at Bombay HC, courts have ruled in favour of tenants in 72% of cases on this specific issue' ΓÇö this is factual pattern data, not a prediction\.

__AI Guardrail \#3 ΓÇö Prompt Data Isolation__

When client documents are processed by Claude API or any external AI, a data processing agreement \(DPA\) is in place\. No client names, case numbers, or identifying information is sent to third\-party AI APIs without explicit opt\-in consent\. Lawyers can choose 'Local AI Only' mode \(self\-hosted Llama\) for highly sensitive matters\.

## __8\.3  Security Architecture ΓÇö Layer by Layer__

### __Identity & Access__

- Aadhaar eKYC via DigiLocker API for citizen verification ΓÇö soft KYC only \(no biometrics stored\)
- BCI enrollment number verification against OGD public data for all advocate accounts
- MFA mandatory for all accounts ΓÇö TOTP \(Google Authenticator\) or OTP via mobile
- JWT access tokens: 15\-minute expiry; refresh tokens: 7\-day expiry with rotation on every use
- Role\-based access control \(RBAC\): Citizen / Advocate / Firm Admin / Org Admin / Platform Admin
- Client data access: advocates can only see their own clients; firm admins see firm\-wide data

### __Data Security__

- All data at rest: AES\-256\-GCM via AWS KMS ΓÇö separate key per tenant
- All data in transit: TLS 1\.3 minimum ΓÇö no TLS 1\.0/1\.1 in any configuration
- Field\-level encryption: client names, phone numbers, Aadhaar references encrypted at DB level
- Attorney\-client privileged conversations: end\-to\-end encrypted ΓÇö server holds no decryption key
- Row\-level security \(PostgreSQL\): every query is filtered by tenant\_id automatically
- No shared database credentials: HashiCorp Vault dynamic secrets for all DB connections

### __Network Security__

- All databases in private subnets ΓÇö no public IP, no direct internet access
- Cloudflare WAF with OWASP Core Rule Set v3\.3 \+ custom Indian legal platform rules
- VPC with separate subnets for app tier / DB tier / AI services ΓÇö no east\-west traffic without security groups
- AWS Shield Advanced for DDoS protection ΓÇö covers court hours peak traffic
- All outbound traffic from app servers through NAT gateway ΓÇö no direct internet from backend

### __Compliance__

- DPDP Act 2023 \+ Rules 2025: Consent Manager integrated into every data collection point
- Data Principal rights portal: users can access, correct, or delete all their data ΓÇö 72\-hour SLA
- All personal data stored exclusively in India ΓÇö AWS ap\-south\-1 and ap\-south\-2 only
- CERT\-In incident reporting: automated alert pipeline triggers 6\-hour notification workflow on detection
- Quarterly VAPT by CERT\-In empanelled auditor ΓÇö required for any government partnership
- Annual ISO 27001 audit roadmap ΓÇö target certification by Year 2

## __8\.4  Critical Constraints & Design Decisions__

__Constraint__

__Decision__

__Reason__

No AI decides legal outcomes

AI outputs are inputs to human decisions only

Legal liability; Advocates Act 1961 boundaries

No biometric storage

Aadhaar used for KYC only; no biometrics stored

UIDAI regulations, DPDP Act

India data residency only

All data in AWS Mumbai \+ Hyderabad

DPDP Act 2023 requirements

Privileged comms E2E encrypted

Zero\-knowledge architecture for marked conversations

Attorney\-client privilege protection

BCI verification mandatory for lawyer accounts

No self\-reported credentials

Prevent impersonation of advocates

No court document manipulation

Platform is read\-only view of court orders

Tampering with court records is criminal

Rate limiting on AI endpoints

Max 10 AI doc generations/hour per free account

Prevent abuse and runaway API costs

Offline capability for mobile

PWA with local SQLite for case notes and diary

Courts often have poor connectivity

Audit log for all data access

Immutable CloudTrail log for every S3 and DB access

Legal discovery requests; compliance

No data sale or advertising

Platform is paid subscription only; no ad model

Legal data cannot be sold; trust is paramount

## __8\.5  Disaster Recovery & Business Continuity__

- RTO \(Recovery Time Objective\): 1 hour ΓÇö platform back online within 60 minutes of major failure
- RPO \(Recovery Point Objective\): 15 minutes ΓÇö maximum 15 minutes of data loss in worst case
- Daily automated backups to S3 with 90\-day retention; hourly RDS snapshots
- Cross\-region replication: all S3 documents replicated to Hyderabad region in real\-time
- Runbook: documented step\-by\-step recovery procedure for every failure scenario
- Chaos engineering: monthly random failure injection in staging to verify recovery procedures

__αñ¿αÑìαñ»αñ╛αñ» αñ«αñ┐αññαÑìαñ░ ΓÇö Nyay\-Mitra__

*Not just a project\. A platform that serves justice\.*

1\.7M lawyers  ΓÇó  3 crore cases/year  ΓÇó  140 crore citizens  ΓÇó  One platform

