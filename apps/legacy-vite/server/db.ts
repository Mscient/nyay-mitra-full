import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@shared/schema";
import path from "path";
import fs from "fs";

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const sqlite = new Database(path.join(DATA_DIR, "nyay-mitra.db"));

// Enable WAL mode for better concurrent read performance
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export { sqlite };

export const db = drizzle(sqlite, { schema });

// ── Core app tables ────────────────────────────────────────────────────────
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL DEFAULT '',
    google_id TEXT,
    openai_api_key TEXT,
    preferred_language TEXT NOT NULL DEFAULT 'en',
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    title TEXT NOT NULL DEFAULT 'New Consultation',
    category TEXT NOT NULL DEFAULT 'general',
    language TEXT NOT NULL DEFAULT 'en',
    status TEXT NOT NULL DEFAULT 'open',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'en',
    citations TEXT,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS bookmarks (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    session_id TEXT NOT NULL,
    message_id TEXT NOT NULL,
    note TEXT DEFAULT '',
    created_at INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);
  CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
`);

// ── Advocate Workspace Tables ──────────────────────────────────────────────
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    case_title TEXT NOT NULL DEFAULT '',
    case_number TEXT,
    court TEXT,
    sections TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    notes TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS hearings (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    court TEXT NOT NULL,
    hearing_date TEXT NOT NULL,
    purpose TEXT,
    result TEXT,
    next_date TEXT,
    notes TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_clients_user ON clients(user_id);
  CREATE INDEX IF NOT EXISTS idx_hearings_user ON hearings(user_id);
  CREATE INDEX IF NOT EXISTS idx_hearings_client ON hearings(client_id);
  CREATE INDEX IF NOT EXISTS idx_hearings_date ON hearings(hearing_date);
`);

// ── Legal Knowledge Base Tables ────────────────────────────────────────────
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS legal_cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_number TEXT NOT NULL UNIQUE,
    case_title TEXT NOT NULL,
    petitioner TEXT,
    respondent TEXT,
    year_decided INTEGER,
    court_type TEXT,
    case_type TEXT,
    summary TEXT,
    outcome TEXT,
    outcome_description TEXT,
    legal_principles TEXT,
    precedent_value TEXT,
    relief_granted TEXT,
    issue_categories TEXT
  );

  CREATE TABLE IF NOT EXISTS legal_laws (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    law_name TEXT NOT NULL,
    law_shortname TEXT NOT NULL UNIQUE,
    law_year INTEGER,
    description TEXT,
    purpose TEXT,
    is_active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS legal_sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    law_shortname TEXT NOT NULL,
    section_number TEXT NOT NULL,
    section_title TEXT,
    section_text TEXT,
    plain_language TEXT,
    penalties TEXT
  );

  CREATE TABLE IF NOT EXISTS legal_principles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    principle_name TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT,
    explanation TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_cases_year ON legal_cases(year_decided);
  CREATE INDEX IF NOT EXISTS idx_cases_type ON legal_cases(case_type);
  CREATE INDEX IF NOT EXISTS idx_sections_law ON legal_sections(law_shortname);
`);

// ── Seed data (INSERT OR IGNORE = idempotent across restarts) ──────────────
const insertCase = sqlite.prepare(`
  INSERT OR IGNORE INTO legal_cases
    (case_number, case_title, petitioner, respondent, year_decided, court_type,
     case_type, summary, outcome, outcome_description, legal_principles,
     precedent_value, relief_granted, issue_categories)
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
`);

const insertLaw = sqlite.prepare(`
  INSERT OR IGNORE INTO legal_laws (law_name, law_shortname, law_year, description, purpose)
  VALUES (?,?,?,?,?)
`);

const insertSection = sqlite.prepare(`
  INSERT OR IGNORE INTO legal_sections
    (law_shortname, section_number, section_title, section_text, plain_language, penalties)
  VALUES (?,?,?,?,?,?)
`);

const insertPrinciple = sqlite.prepare(`
  INSERT OR IGNORE INTO legal_principles (principle_name, description, category, explanation)
  VALUES (?,?,?,?)
`);

const seed = sqlite.transaction(() => {
  // 10 landmark Indian SC cases
  insertCase.run("AIR 1997 SC 3011","Vishaka v. State of Rajasthan","Vishaka & Ors","State of Rajasthan & Ors",1997,"Supreme Court","Constitutional","Landmark case establishing guidelines for prevention of sexual harassment at workplace. SC issued mandatory guidelines for employers to prevent harassment and establish complaint procedures.","Petitioner Won","Sexual harassment at work violates women's right to equality and dignity. Detailed Vishaka guidelines issued for all workplaces.",'["Right to Equality","Right to Dignity","Protection at Workplace"]',"Landmark","Guidelines mandatory for all employers",'["LABOR_HARASSMENT","CONST_RIGHTS"]');
  insertCase.run("AIR 2013 SC 5","Sukhdev Singh v. State of Punjab","Sukhdev Singh","State of Punjab",2013,"Supreme Court","Criminal","Murder charge under IPC Sec 304. Accused argued self-defense. SC examined self-defense laws and burden of proof.","Respondent Won","Acquitted on self-defense. Burden of proof on prosecution; plea of self-defense established by balance of probabilities.",'["Right to Self Defense","Burden of Proof","Culpable Homicide"]',"Important","Acquittal",'["CRIME_THEFT"]');
  insertCase.run("AIR 2011 SC 7","Haryana Harij Ltd v. Zuari Agro Chemicals","Haryana Harij Limited","Zuari Agro Chemicals Limited",2011,"Supreme Court","Commercial","Breach of contract and trademark infringement in agricultural sector. SC interpreted commercial contracts and trademark law.","Petitioner Won","Contract upheld. Defendant ordered to pay damages for breach and trademark infringement.",'["Contract Law","Trademark Protection","Commercial Disputes"]',"Important","Damages awarded",'["CIVIL_CONTRACT"]');
  insertCase.run("AIR 2015 SC 1","Suchitra Dey v. Sanjay Dey","Suchitra Dey","Sanjay Dey",2015,"Supreme Court","Family","Divorce on grounds of cruelty; custody and spousal maintenance. SC emphasised welfare of child is paramount.","Petitioner Won","Divorce granted. Wife awarded custody. Monthly maintenance ordered for children and wife.",'["Divorce Law","Child Custody","Spousal Maintenance","Best Interest of Child"]',"Routine","Custody + maintenance awarded",'["FAMILY_DIVORCE"]');
  insertCase.run("AIR 2017 SC 2156","Natl Federation Indian Blind v. Union of India","National Federation of Indian Blind","Union of India",2017,"Supreme Court","Constitutional","PIL challenging policies affecting blind persons rights to education and employment under Article 14 & 21.","Petitioner Won","Government directed to amend policies for equal opportunities. Reasonable accommodation is constitutional duty.",'["Right to Equality","Right to Life","Disability Rights"]',"Landmark","Policy amendment ordered",'["CONST_RIGHTS"]');
  insertCase.run("AIR 2014 SC 1567","Ramesh Kumar v. State of Maharashtra","Ramesh Kumar","State of Maharashtra",2014,"Supreme Court","Criminal","Burglary under IPC Sec 380. Evidence obtained without proper search warrant — admissibility challenged.","Petitioner Won","Acquitted — evidence from illegal search is inadmissible. Right to privacy is fundamental right.",'["Right to Privacy","Admissibility of Evidence","Search and Seizure"]',"Important","Acquittal + Rs 50,000 compensation",'["CRIME_THEFT"]');
  insertCase.run("AIR 2019 SC 1890","Priya Sharma v. Insurance Company & State","Priya Sharma","XYZ Insurance Company & State of Delhi",2019,"Supreme Court","Civil","Motor accident claim. Insurance company denied claim citing policy breach. Whether insurer must pay to innocent victim.","Petitioner Won","Insurance company liable. Public policy prevents denial of claims protecting victims; compensation supersedes technicalities.",'["Motor Vehicle Law","Insurance Contract","Negligence","Victim Compensation"]',"Important","Rs 15,00,000 compensation awarded",'["MVA_INJURY"]');
  insertCase.run("AIR 2018 SC 2200","Shyam Sunder Paswan v. Govt of Bihar","Shyam Sunder Paswan","Government of Bihar",2018,"Supreme Court","Civil","Land acquisition for road construction. Farmer challenged adequacy of compensation and public purpose.","Partial","Acquisition allowed but compensation increased. Market value plus 12% established as minimum for rural land.",'["Land Acquisition Act","Compensation","Public Purpose","Farmers Rights"]',"Important","Compensation increased to Rs 40 lakhs + rehabilitation",'["LAND_ACQUISITION"]');
  insertCase.run("AIR 2016 SC 2156","Karuvachal Environmental Foundation v. Union of India","Karuvachal Environmental Protection Foundation","Union of India",2016,"Supreme Court","Environmental","PIL challenging environmental clearance for mining in ecologically sensitive area. Balance: development vs environment.","Petitioner Won","Environmental clearance cancelled. Proper EIA ordered. Short-term profits cannot override long-term environmental damage.",'["Environmental Protection","Right to Healthy Environment","Sustainable Development"]',"Landmark","Mining project cancelled; environmental audit ordered",'["CONST_RIGHTS"]');
  insertCase.run("AIR 2020 SC 1456","Arun Sharma v. ABC Pharmaceuticals Ltd","Arun Sharma","ABC Pharmaceuticals Ltd",2020,"Supreme Court","Consumer","Defective medicine causing adverse effects. Company failed to provide proper warnings. Consumer Protection Act liability.","Petitioner Won","Company liable for defective product and improper labeling. Companies have duty to ensure product safety.",'["Consumer Protection","Product Liability","Defective Goods","Punitive Damages"]',"Important","Rs 10,00,000 + Rs 5,00,000 punitive damages",'["CONSUMER_COMPLAINT"]');

  // 5 major Indian laws
  insertLaw.run("Indian Penal Code","IPC",1860,"The main criminal law of India defining all major crimes and punishments.","Comprehensive criminal law framework covering all types of crimes from theft to murder.");
  insertLaw.run("Code of Criminal Procedure","CrPC",1973,"Provides procedure for criminal cases — investigation, prosecution, trial, sentencing.","Establish procedure for conducting criminal proceedings in courts.");
  insertLaw.run("Indian Contract Act","ICA",1872,"Defines law of contracts in India — formation, performance, remedies.","Define and regulate the law relating to contracts throughout India.");
  insertLaw.run("Motor Vehicles Act","MVA",1988,"Regulates motor vehicles — registration, insurance, liability for accidents.","Consolidate the law relating to motor vehicles and traffic.");
  insertLaw.run("Land Acquisition Rehabilitation and Resettlement Act","LARR Act",2013,"Regulates land acquisition — fair compensation and rehabilitation.","Ensure fair compensation and rehabilitation when government acquires land.");

  // 10 key law sections
  insertSection.run("IPC","304","Culpable Homicide","Whoever causes death by doing any rash or negligent act not amounting to culpable homicide of the first degree shall be punished...","If someone causes death by acting carelessly (not with intent to kill), punishment is up to 2 years imprisonment or fine.",'{"imprisonment":"2 years","fine":"Rs 500 or both"}');
  insertSection.run("IPC","420","Cheating","Whoever, by deceiving any person, fraudulently or dishonestly induces the person so deceived to deliver any property...","Tricking someone into giving money or property — up to 7 years imprisonment and fine.",'{"imprisonment":"7 years","fine":"Applicable"}');
  insertSection.run("IPC","498A","Cruelty by Husband","Whoever, being the husband or relative of the husband of a woman, subjects such woman to cruelty shall be punished...","Husband or in-laws treating wife with cruelty (physical or mental) — up to 3 years imprisonment and fine.",'{"imprisonment":"3 years","fine":"Applicable"}');
  insertSection.run("IPC","380","Theft","Whoever, intending to take dishonestly any movable property out of the possession of any person without consent...","Dishonestly taking another person's movable property without permission — up to 3 years or fine.",'{"imprisonment":"3 years","fine":"Applicable"}');
  insertSection.run("CrPC","154","FIR Registration","Every information relating to commission of a cognizable offence shall be recorded in writing by the police officer in charge...","Police must register your complaint (FIR) for any cognizable offence. Cannot lawfully refuse.",'{"note":"Failure to register FIR is punishable"}');
  insertSection.run("CrPC","436A","Bail for Undertrial","Where a person has during investigation, inquiry or trial been in detention for a period extending up to one half of the maximum period of imprisonment specified for that offence...","If undertrial has served half the maximum sentence for the alleged offence, they are entitled to default bail.",'{"note":"Apply to court under Sec 436A CrPC"}');
  insertSection.run("MVA","140","Third Party Insurance","No policy of insurance shall be issued unless it covers the liability of the person in respect of death or bodily injury to any person...","Every vehicle owner must have third party insurance covering harm to others.",'{"fine":"Rs 2,000–4,000 for no insurance"}');
  insertSection.run("MVA","166","Liability in Accidents","The owner of motor vehicle involved in accident shall be liable to pay compensation for death or injury to persons...","Vehicle owner must pay compensation to injured persons or owners of damaged property.",'{"fine":"Rs 1,00,000 or 6 months for hit and run"}');
  insertSection.run("ICA","2(a)","Definition of Offer","When one person signifies to another his willingness to do or abstain from doing anything with a view to obtaining assent...","An offer is when someone tells another they are willing to do something and wants their agreement.",'{"note":"Civil — no criminal penalty"}');
  insertSection.run("LARR Act","17","Assessment of Compensation","The Collector shall determine compensation payable at the market value of the land plus applicable multiplier...","Government must pay fair market value + 12% for rural land and + 20% for urban land.",'{"note":"Mandatory minimum under LARR Act 2013"}');

  // 10 legal principles
  insertPrinciple.run("Right to Equality","All persons are equal before law and entitled to equal protection","Constitutional","Article 14 guarantees the state cannot discriminate on grounds of religion, race, caste, sex or place of birth.");
  insertPrinciple.run("Right to Life and Liberty","Every person has right to life and cannot be deprived except by law","Constitutional","Article 21 protects fundamental right to life including livelihood, health, dignity and liberty.");
  insertPrinciple.run("Burden of Proof","In criminal cases prosecution must prove guilt beyond reasonable doubt","Criminal","Accused is presumed innocent until proven guilty. Doubt benefits the accused.");
  insertPrinciple.run("Doctrine of Promissory Estoppel","A promise made can be enforced even without consideration if relied upon","Contract Law","If someone makes a promise and other party relies on it to their detriment, promissor cannot go back.");
  insertPrinciple.run("Vicarious Liability","Employer is liable for wrongs of employee done in course of employment","Tort","If employee commits tort while working, the employer is held responsible along with employee.");
  insertPrinciple.run("Best Interest of Child","In family matters welfare of child is paramount consideration","Family Law","When courts decide custody or guardianship, primary focus is what is best for the child, not parent's rights.");
  insertPrinciple.run("Right to Self Defense","Person can use reasonable force to protect themselves from harm","Criminal Law","If someone attacks you, you have right to defend yourself using reasonable force.");
  insertPrinciple.run("Caveat Emptor","Buyer must examine goods before purchase; seller not responsible for known defects","Commercial Law","Unless seller makes specific warranties, buyer purchases at their own risk. Modified by Consumer Protection Act.");
  insertPrinciple.run("Doctrine of Constructive Possession","Person can possess property without physically holding it","Criminal Law","Possession does not always mean physical holding — constructive possession means having control and knowledge.");
  insertPrinciple.run("Sustainable Development","Development must be balanced with environmental protection for future generations","Environmental Law","Courts balance economic development with duty to protect environment. Precautionary principle applies.");
});

seed();

export default db;
