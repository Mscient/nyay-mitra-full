≡ƒôÜ

__LexAI__

Complete Resource Directory

APIs ΓÇó Datasets ΓÇó Models ΓÇó Tools ΓÇó Portals ΓÇó Compliance References

All resources verified and fetched in March 2025  |  URLs live\-checked  |  Pricing current as of fetch date

__Module__

__Resources Count__

__Priority__

Voice Agent \(ASR / TTS / VAD\)

8 resources

P1 ΓÇö Q1 2025

Indian Legal NLP Models

6 resources

P1 ΓÇö Q1 2025

Court Data & APIs

7 resources

P1 ΓÇö Q1 2025

Legal News & Digital Media

6 resources

P2 ΓÇö Q2 2025

Startup Legal & MCA Portals

7 resources

P2 ΓÇö Q2 2025

Financial Aid & Tax Portals

6 resources

P2 ΓÇö Q2 2025

Security & DPDP Compliance

6 resources

P1 ΓÇö Ongoing

Infrastructure & Database Tools

6 resources

P1 ΓÇö Q1 2025

__01  |  Voice Agent ΓÇö ASR, TTS & VAD Resources__

These are the core libraries, APIs, and models needed to build the voice pipeline ΓÇö from microphone input to speech output\. All are either open\-source or have Indian language support\.

__OpenAI Whisper Large v3  __\[Open\-Source Model\]__  Free \(self\-hosted\) / $0\.006/min via API__

[https://huggingface\.co/openai/whisper\-large\-v3](https://huggingface.co/openai/whisper-large-v3)

State\-of\-the\-art ASR trained on 5M\+ hours\. Whisper large\-v3 shows 10ΓÇô20% error reduction vs v2 across all languages\. Supports Hindi, Marathi, Tamil, Telugu, Bengali, Kannada, Malayalam, Gujarati, Punjabi, Urdu and more\.

__Integration: __pip install openai\-whisper\. Fine\-tune on Indian legal audio using HuggingFace Trainer\. Self\-host via whisper\-asr\-webservice Docker image for production\.

__WhisperLive ΓÇö Real\-Time Transcription Server  __\[Open\-Source\]__  Free__

[https://github\.com/collabora/WhisperLive](https://github.com/collabora/WhisperLive)

Near\-live implementation of Whisper with production\-ready Hindi ASR\. WebSocket server for streaming audio\. Supports faster\_whisper, TensorRT and OpenVINO backends\. Ideal for real\-time legal dictation\.

__Integration: __Deploy as WebSocket server\. Connect from web/mobile client\. Use faster\_whisper backend for 4x speed on CPU servers\.

__whisper\.cpp ΓÇö C\+\+ Port for Edge Devices  __\[Open\-Source\]__  Free__

[https://github\.com/ggml\-org/whisper\.cpp](https://github.com/ggml-org/whisper.cpp)

Lightweight C\+\+ port of Whisper\. Runs on iPhone, Android, Raspberry Pi\. Critical for offline legal assistance in low\-connectivity areas\. Supports all Whisper model sizes\.

__Integration: __Integrate via Android NDK or iOS via whisper\.objc\. Use ggml\-small or ggml\-medium model for balance of speed and accuracy on mobile\.

__Silero VAD ΓÇö Voice Activity Detection  __\[Open\-Source\]__  Free__

[https://github\.com/snakers4/silero\-vad](https://github.com/snakers4/silero-vad)

Accurate, lightweight voice activity detection model\. 1MB footprint\. Supports 8kHz and 16kHz\. Used by WhisperLive and most production ASR pipelines\. Critical for detecting speech vs silence in legal call recordings\.

__Integration: __pip install silero\-vad\. Wrap around Whisper ingestion pipeline to segment audio before transcription\. Reduces hallucinations and processing cost significantly\.

__Azure Neural TTS ΓÇö Indian Languages  __\[Commercial API\]__  Γé╣12ΓÇôΓé╣60 per 1M characters__

[https://azure\.microsoft\.com/en\-in/products/ai\-services/text\-to\-speech](https://azure.microsoft.com/en-in/products/ai-services/text-to-speech)

Microsoft Azure Neural TTS supports 12\+ Indian languages with natural\-sounding voices\. Includes Hindi \(Madhur, Swara\), Tamil \(Valluvar, Kalpana\), Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati\. SSML support for legal citation reading style\.

__Integration: __Use Azure Cognitive Services SDK\. Enable SSML for slow, deliberate reading of legal section numbers and case citations\. Cache common phrases \(section names, court names\) to reduce API calls\.

__ElevenLabs TTS ΓÇö Multilingual  __\[Commercial API\]__  Free tier: 10k chars/mo; Starter: $5/mo__

[https://elevenlabs\.io/](https://elevenlabs.io/)

High\-quality TTS with natural prosody\. Multilingual model supports Hindi and English\. Voice cloning available for creating consistent LexAI assistant voice persona\.

__Integration: __Use /v1/text\-to\-speech endpoint\. Create a dedicated LexAI voice via voice cloning for brand consistency\. Combine with Azure for regional languages not on ElevenLabs\.

__Google Speech\-to\-Text ΓÇö Chirp Model  __\[Commercial API\]__  Γé╣0\.004ΓÇôΓé╣0\.016 per 15 seconds__

[https://cloud\.google\.com/speech\-to\-text](https://cloud.google.com/speech-to-text)

Google's Chirp model supports 100\+ languages including all major Indian languages\. Best\-in\-class for noisy environments and telephony audio \(8kHz\)\. Ideal as fallback when Whisper confidence is low\.

__Integration: __Use as fallback ASR with language detection\. Route 8kHz phone audio \(IVR calls\) to Google STT\. Use Whisper for 16kHz microphone audio\. Automatic language detection helps route Hindi vs English queries\.

__WhatsApp Business API \(Meta Cloud API\)  __\[Commercial API\]__  Free for first 1000 conversations/mo; then Γé╣0\.5ΓÇôΓé╣1\.1 per conversation__

[https://developers\.facebook\.com/docs/whatsapp/cloud\-api](https://developers.facebook.com/docs/whatsapp/cloud-api)

Official WhatsApp Business API for sending/receiving messages and voice notes\. Critical for reaching legal users who primarily use WhatsApp\. Supports audio message processing via webhook\.

__Integration: __Register as Meta Business\. Use Webhook to receive voice note URLs\. Download audio via media URL, process with Whisper, respond with text or synthesized audio message\.

__02  |  Indian Legal NLP Models & Datasets__

Pre\-trained transformer models and datasets specifically built on Indian court data\. These are the foundation for legal search, summarization, statute identification, and semantic case matching\.

__InLegalBERT ΓÇö IIT Kharagpur  __\[Open\-Source Model\]__  Free \(MIT License\)__

[https://huggingface\.co/law\-ai/InLegalBERT](https://huggingface.co/law-ai/InLegalBERT)

Best\-performing Indian legal NLP model\. Pre\-trained on 5\.4 million Indian legal documents \(SC \+ High Courts, 1950ΓÇô2019\), 27GB raw text\. Outperforms LegalBERT on all Indian legal tasks: statute identification, semantic segmentation, court judgment prediction\. 1\.8M\+ downloads on HuggingFace\.

__Integration: __pip install transformers\. Load with AutoModel\.from\_pretrained\('law\-ai/InLegalBERT'\)\. Use for: legal entity extraction, case similarity search via FAISS, statute identification from facts, judgment outcome prediction\.

__InLegal\-SBERT ΓÇö Sentence Embeddings  __\[Open\-Source Model\]__  Free__

[https://huggingface\.co/bhavyagiri/InLegal\-Sbert](https://huggingface.co/bhavyagiri/InLegal-Sbert)

Sentence\-transformer variant of InLegalBERT\. Maps legal sentences to 768\-dimensional vectors for semantic search\. Trained on all Indian court judgments\. Ideal for 'find similar cases' and precedent search features\.

__Integration: __Use with sentence\-transformers library\. Index all case summaries via FAISS or Elasticsearch dense\_vector field\. Query with legal fact description to find semantically similar precedents\.

__CustomInLawBERT ΓÇö India\-Specific Vocabulary  __\[Open\-Source Model\]__  Free \(MIT License\)__

[https://huggingface\.co/law\-ai/CustomInLawBERT](https://huggingface.co/law-ai/CustomInLawBERT)

BERT variant with custom tokenizer trained on Indian legal vocabulary\. Better tokenization for Indian legal terms \(IPC, CrPC, Lokpal, vakalatnama, etc\.\)\. Same architecture as BERT\-base ΓÇö 110M parameters\.

__Integration: __Use for tasks where Indian legal terminology tokenization matters: IPC section extraction, legal term NER\. Combine with InLegalBERT ensemble for higher accuracy on Indian\-specific statute tasks\.

__InLegalTrans ΓÇö Legal Translation EnΓåÆ9 Indian Languages  __\[Open\-Source Model \+ Dataset\]__  Free__

[https://sites\.google\.com/site/saptarshighosh/datasets\-codes](https://sites.google.com/site/saptarshighosh/datasets-codes)

Translation model \(1B parameters\) for translating Indian legal text from English to 9 Indian languages\. Published at ACM TALLIP 2024\. Enables multilingual legal document access for non\-English speaking litigants\.

__Integration: __Use to auto\-translate legal judgments, notices, and rights explanations\. Integrate in the citizen\-facing 'Know Your Rights' module for regional language output\.

__ILDC Dataset ΓÇö Indian Legal Document Corpus  __\[Open\-Source Dataset\]__  Free \(Research Use\)__

[https://github\.com/Exploration\-Lab/CJPE](https://github.com/Exploration-Lab/CJPE)

Indian Legal Documents Corpus for court judgment prediction\. Contains annotated Supreme Court cases\. Used for training judgment outcome prediction models\. Published at ACL 2021\.

__Integration: __Use for fine\-tuning InLegalBERT on judgment prediction\. Train a probability\-of\-success classifier for lawyer advisory features: 'Based on precedents, petitions like this succeed 68% of the time at SC\.'

__LeSICiN ΓÇö IPC Statute Identification Model  __\[Open\-Source Model\]__  Free \(MIT License\)__

[https://github\.com/Law\-AI/LeSICiN](https://github.com/Law-AI/LeSICiN)

Heterogeneous graph\-based model for identifying relevant IPC sections from natural language descriptions of situations\. Published at AAAI 2022\. Maps plain\-language crime descriptions to applicable IPC sections\.

__Integration: __Integrate in the FIR assistant: when a citizen describes what happened in plain language, LeSICiN identifies the applicable IPC sections automatically, guiding them on what charges to file\.

__03  |  Court Data, APIs & Official Government Portals__

The core data sources for all Indian court case data ΓÇö from Supreme Court to district level, tribunals, and official government databases\.

__eCourts India API \(ECIAPI\) ΓÇö Third\-Party  __\[Commercial API\]__  Free for personal/education/research; Pay\-per\-request for commercial__

[https://eciapi\.akshit\.me/](https://eciapi.akshit.me/)

Enterprise\-grade API for Indian judicial system data\. Supports District Courts, High Courts, NCLT, Consumer Forum\. Tenancy\-based ΓÇö each client gets a dedicated instance\. 30 free trial requests on signup\. Postman collection available\.

__Integration: __Primary programmatic court data source\. REST endpoints for case status, orders, cause lists\. Register at eciapi\.akshit\.me\. Use eCourts official site \(ecourts\.gov\.in\) as data authority for verified status\.

__eCourts Official Portal & Services  __\[Government Portal\]__  Free__

[https://ecourts\.gov\.in/](https://ecourts.gov.in/)

Official government eCourts portal\. Source of NJDG \(National Judicial Data Grid\) data\. Provides case status, cause lists, orders for all courts connected to the National Case Management System\. Direct integration for verified data\.

__Integration: __Scrape via official web endpoints or use NJDG API \(available via data\.gov\.in\)\. Monitor for official API program ΓÇö MeitY periodically opens new government data APIs\. Combine with ECIAPI for reliability\.

__IndianKanoon API ΓÇö 3 Crore\+ Orders  __\[Commercial API\]__  Γé╣500 free credit on signup; Γé╣10,000/mo free for non\-commercial__

[https://api\.indiankanoon\.org/](https://api.indiankanoon.org/)

Access to the largest Indian legal database ΓÇö 3 crore \(30 million\+\) orders\. Endpoints: search, document retrieval, document fragments\. Returns enriched HTML with metadata\. Official IK search quality\.

__Integration: __4 API endpoints: /search/, /doc/, /docfragment/, /dochighlight/\. Use for precedent search, full judgment retrieval, and showing highlighted relevant passages to lawyers\. Non\-commercial research use is essentially free\.

__kanoon\.dev ΓÇö Alternative IndianKanoon API  __\[Commercial API\]__  Subscription\-based__

[https://docs\.kanoon\.dev/](https://docs.kanoon.dev/)

Alternative API for Indian legal data with official Node\.js library\. Clean developer experience\. Useful as redundancy source alongside official IndianKanoon API\.

__Integration: __npm install kanoon\. Use as backup when IndianKanoon API is throttled\. Good for Node\.js\-native backend services\.

__IndianKanoon RSS Feeds ΓÇö Court Judgments  __\[RSS Feed\]__  Free__

[https://indiankanoon\.org/feeds/](https://indiankanoon.org/feeds/)

Free RSS feeds for new judgments from Supreme Court and High Courts\. Updated in near\-real\-time as new orders are uploaded\. Court\-specific feeds available\.

__Integration: __Subscribe via Kafka RSS connector or Logstash RSS input plugin\. Trigger immediate ingestion of new judgments into Elasticsearch index\. No API key required\.

__Open Government Data \(OGD\) Platform ΓÇö data\.gov\.in  __\[Government API\]__  Free__

[https://data\.gov\.in/](https://data.gov.in/)

Single\-point access to government datasets across all ministries\. Includes judicial data from MoLJ \(Ministry of Law and Justice\), court statistics, legal aid data, NALSA reports\. REST APIs with free API keys\.

__Integration: __Register at data\.gov\.in for API key\. Query justice/courts catalog for pendency data, legal aid statistics, judge vacancy data\. Useful for building analytics dashboards and reports\.

__NALSA ΓÇö National Legal Services Authority Portal  __\[Government Portal\]__  Free__

[https://nalsa\.gov\.in/  |  Application Portal: https://scourtapp\.nic\.in/lsams/](https://nalsa.gov.in/  |  Application Portal: https://scourtapp.nic.in/lsams/)

NALSA provides free legal aid under Legal Services Authorities Act 1987\. 703 District LSAs, 37 State LSAs, 2390 Taluk LSCs\. Application portal at scourtapp\.nic\.in/lsams/ for digital filing\. 80% of India's population is eligible for NALSA legal aid\.

__Integration: __Link to NALSA application portal from LexAI's Legal Aid Finder\. Use NALSA's district office data to build geo\-location finder: 'Find legal aid near me'\. Partner formally with NALSA for co\-branded legal awareness content\.

__04  |  Legal News & Digital Media Sources__

Real\-time legal news, gazette notifications, regulatory updates, and parliamentary tracking sources for the digital media intelligence module\.

__LiveLaw ΓÇö RSS Feed  __\[RSS Feed\]__  Free__

[https://www\.livelaw\.in/  |  RSS: https://www\.livelaw\.in/feed/](https://www.livelaw.in/  |  RSS: https://www.livelaw.in/feed/)

India's leading legal news portal\. Covers SC, High Courts, tribunals, new laws, Bar Council\. Near\-real\-time updates on significant judgments and legal developments\. 628K\+ Twitter followers\.

__Integration: __Subscribe RSS feed via Kafka connector\. Tag each article with NLP: court name, case number, legal area\. Send push alerts to advocate subscribers when tagged with their practice area\.

__Bar & Bench ΓÇö RSS Feed  __\[RSS Feed\]__  Free__

[https://www\.barandbench\.com/  |  RSS: https://prod\-qt\-images\.s3\.amazonaws\.com/](https://www.barandbench.com/  |  RSS: https://prod-qt-images.s3.amazonaws.com/)

Comprehensive legal news for the Indian legal fraternity\. Covers law firms, Supreme Court, High Courts, legislation\. Hindi edition available at hindi\.barandbench\.com\. 668K\+ Twitter, 381K Facebook followers\.

__Integration: __Ingest via RSS\. Use for firm\-level news \(mergers, lateral hires\) to update lawyer profiles\. Hindi edition critical for regional language news module\.

__e\-Gazette India ΓÇö Official Government Notifications  __\[Government Portal\]__  Free__

[https://egazette\.gov\.in/](https://egazette.gov.in/)

Official Gazette of India\. Source for all new Acts, Amendment Acts, rules, regulations, notifications from all ministries\. Extraordinary Gazette for urgent notifications\. Browseable and downloadable PDFs\.

__Integration: __Monitor daily gazette via scraper or NIC API\. Extract new Acts and Amendments\. Trigger automatic updates to the LexAI Acts database when amendments to tracked statutes \(IPC, CrPC, Companies Act\) are published\.

__PRS India ΓÇö Parliamentary Bill Tracker  __\[Web Scraper\]__  Free__

[https://prsindia\.org/](https://prsindia.org/)

PRS Legislative Research tracks all Parliamentary bills, amendments, committee reports, and budget documents\. Machine\-readable legislative history\. Used by researchers, journalists, and legal professionals\.

__Integration: __Scrape bill tracking pages\. Monitor bills in LexAI's practice area registry\. Alert subscribers \(corporate lawyers, compliance teams\) when bills affecting their area pass committee or receive presidential assent\.

__SEBI / RBI / MCA Circular APIs  __\[Government Portals\]__  Free__

[https://www\.sebi\.gov\.in/sebiweb/  |  https://rbi\.org\.in/  |  https://mca\.gov\.in/](https://www.sebi.gov.in/sebiweb/  |  https://rbi.org.in/  |  https://mca.gov.in/)

SEBI, RBI, and MCA publish circulars, regulations, and notifications on their portals\. SEBI has an official API\. MCA21 portal provides company/director data APIs\. Essential for financial module and corporate legal tracking\.

__Integration: __Use SEBI official data API for securities regulations\. Scrape RBI circulars for banking law updates\. Use MCA21 V3 APIs \(available to partners\) for company data verification in startup compliance module\.

__SCC Online / Manupatra ΓÇö Licensed Data Partnership  __\[Licensed Data Partnership\]__  Enterprise Licensing Required__

[https://www\.scconline\.com/  |  https://www\.manupatra\.com/](https://www.scconline.com/  |  https://www.manupatra.com/)

India's two premium legal databases\. Combined coverage of all reported Indian cases since 1890s, international cases, commentaries, journals\. Structured data available via enterprise data feeds\.

__Integration: __Contact SCC Online \(EBC\) and Manupatra for API/data feed licensing\. Use as premium data layer ΓÇö high\-quality annotated case law with headnotes, references\. Essential for the lawyer\-tier premium subscription\.

__05  |  Startup Legal ΓÇö MCA, IP & Compliance Resources__

__MCA21 V3 Portal ΓÇö Company Registration & Filings  __\[Government Portal \+ API\]__  Free \(portal\); Partnership needed for bulk API__

[https://www\.mca\.gov\.in/  |  API: https://www\.mca\.gov\.in/mcafoportal/viewCompanyMasterData\.do](https://www.mca.gov.in/  |  API: https://www.mca.gov.in/mcafoportal/viewCompanyMasterData.do)

Ministry of Corporate Affairs portal for SPICe\+ incorporation, annual filings \(MGT\-7, AOC\-4\), Director KYC, charges registry\. MCA21 V3 is the current system\. Company master data API is public\.

__Integration: __Use public company master data API for startup compliance checker: verify CIN, check filing status, detect defaults\. Guide founders through SPICe\+ form via interactive checklist in the startup module\.

__IP India ΓÇö Trademark & Patent Registry  __\[Government Portal\]__  Free search; Filing fees apply__

[https://ipindia\.gov\.in/  |  Trademark: https://ipindiaonline\.gov\.in/tmrpublicsearch/](https://ipindia.gov.in/  |  Trademark: https://ipindiaonline.gov.in/tmrpublicsearch/)

Office of the Controller General of Patents, Designs and Trade Marks\. TM Public Search for trademark availability\. Patent e\-filing portal\. Design registration\. Geographical Indications registry\.

__Integration: __Integrate TM Public Search API for real\-time trademark availability checking in startup module\. Guide founders through Nice Classification \(45 classes\) for trademark filing\. Link directly to e\-filing portal\.

__GST Portal ΓÇö Registration & Filing  __\[Government Portal \+ Developer API\]__  Free__

[https://www\.gst\.gov\.in/  |  API: https://developer\.gst\.gov\.in/](https://www.gst.gov.in/  |  API: https://developer.gst.gov.in/)

Official GST portal with sandbox and production APIs for taxpayer registration, return filing, e\-invoicing, e\-way bill\. Developer API available with GSP \(GST Suvidha Provider\) registration\.

__Integration: __Integrate GST Taxpayer API for compliance calendar: auto\-fetch GSTIN filing status, upcoming return due dates\. Alert startup founders 7 days before GSTR\-1 and GSTR\-3B deadlines\.

__MSME Udyam Registration Portal  __\[Government Portal\]__  Free__

[https://udyamregistration\.gov\.in/](https://udyamregistration.gov.in/)

Official MSME registration portal\. Udyam certificate is required for MSME benefits, priority sector lending, government procurement preferences\. Self\-certification based on investment and turnover\.

__Integration: __Add Udyam registration as first step in startup onboarding\. Auto\-detect eligibility based on startup's financials\. Link directly to registration portal\.

__IBBI ΓÇö Insolvency & Bankruptcy Board  __\[Government Portal\]__  Free__

[https://ibbi\.gov\.in/](https://ibbi.gov.in/)

Regulatory body for insolvency professionals and IBC proceedings\. Public register of Insolvency Professionals \(IPs\), CIRPs, liquidations\. Data on corporate insolvency, personal insolvency, and pre\-packaged insolvency\.

__Integration: __Integrate IBBI IP register for the financial module: connect distressed startups/MSMEs to registered Insolvency Professionals\. Track active CIRPs for monitoring corporate insolvency news\.

__StartupIndia Portal ΓÇö DPIIT Recognition  __\[Government Portal\]__  Free__

[https://www\.startupindia\.gov\.in/](https://www.startupindia.gov.in/)

DPIIT Startup recognition portal\. StartupIndia recognition gives access to tax exemptions \(80\-IAC\), fast\-track IP, self\-certification under labor laws, and government tender preferences\.

__Integration: __Add StartupIndia recognition as milestone in startup compliance calendar\. Guide founders through eligibility check and application process\. Recognition unlocks significant benefits worth including in LexAI's startup value proposition\.

__DocuSign / DigiLocker API ΓÇö Digital Signatures  __\[Commercial \+ Government APIs\]__  DocuSign: from $10/mo; DigiLocker: Free__

[https://developer\.docusign\.com/  |  https://partners\.digitallocker\.gov\.in/](https://developer.docusign.com/  |  https://partners.digitallocker.gov.in/)

DocuSign for legally binding eSignatures on AI\-generated agreements\. DigiLocker for storing and sharing government\-verified documents \(Aadhaar, PAN, incorporation certificate\)\. Both critical for paperless legal workflow\.

__Integration: __Integrate DocuSign for co\-founder agreements, employment contracts, NDAs\. Use DigiLocker API to fetch verified company documents during onboarding\. Enables fully digital legal document workflow\.

__06  |  Financial Aid & Legal Advisory Resources__

__SARFAESI / DRT ΓÇö Debt Recovery Tribunal Portal  __\[Government Portal\]__  Free__

[https://drt\.gov\.in/](https://drt.gov.in/)

Official Debt Recovery Tribunal portal\. Covers all DRTs and DRATs across India\. Case status, orders, rules\. Critical reference for the SARFAESI and debt recovery module\.

__Integration: __Scrape DRT case status for the financial module\. Build SARFAESI timeline explainer: Day 0 \(demand notice\) ΓåÆ 60 days ΓåÆ possession notice ΓåÆ symbolic possession ΓåÆ DRT challenge window\.

__RBI Banking Ombudsman ΓÇö Complaint Portal  __\[Government Portal\]__  Free__

[https://cms\.rbi\.org\.in/](https://cms.rbi.org.in/)

RBI Centralised Complaint Management System \(CMS\) for banking complaints\. Covers unauthorized transactions, mis\-selling, loan grievances\. Online filing, tracking, and escalation to Banking Ombudsman\.

__Integration: __Link directly from LexAI's banking rights module\. Build step\-by\-step guide for CMS complaint filing\. Track complaint outcome data for analytics on most common banking grievances\.

__IRDAI Bima Bharosa ΓÇö Insurance Complaints  __\[Government Portal\]__  Free__

[https://bimabharosa\.irdai\.gov\.in/](https://bimabharosa.irdai.gov.in/)

IRDAI's integrated grievance management portal for insurance complaints\. Covers all insurers \(life, general, health\)\. Complaint registration, tracking, escalation to Insurance Ombudsman\.

__Integration: __Include in financial module under 'Insurance Disputes'\. Guide users through IRDAI complaint filing\. Integrate complaint tracking via portal scraper for status updates\.

__Income Tax Portal ΓÇö e\-Filing & Notice Reply  __\[Government Portal \+ API\]__  Free__

[https://www\.incometax\.gov\.in/  |  API: https://developer\.incometax\.gov\.in/](https://www.incometax.gov.in/  |  API: https://developer.incometax.gov.in/)

Official IT portal for return filing, notice response, rectification, and appeals\. Developer API available for authorized intermediaries\. e\-Proceedings module handles notice replies for Sections 143\(1\), 148, 263\.

__Integration: __Guide users through notice response via LexAI's tax notice module\. Provide AI\-drafted reply templates\. Integration with IT Developer API \(requires authorized intermediary registration\) for seamless response submission\.

__GSTN Developer APIs  __\[Government API\]__  Free \(GSP registration needed\)__

[https://developer\.gst\.gov\.in/](https://developer.gst.gov.in/)

GSTN provides APIs for GST registration, returns, refunds, e\-invoicing, e\-way bills\. Essential for GST dispute module\. Also provides APIs for fetching notices and demand orders\.

__Integration: __Use for: GST notice retrieval, show\-cause notice status, demand order tracking\. Build automated GST compliance health check for startup clients\.

__CIBIL / Equifax / Experian Credit Report  __\[Commercial API\]__  CIBIL: B2B partnership required__

[https://www\.cibil\.com/  |  https://www\.equifax\.co\.in/](https://www.cibil.com/  |  https://www.equifax.co.in/)

Credit bureau APIs for fetching and disputing credit reports\. CIBIL is primary in India\. Used for the credit score dispute module ΓÇö identifying legal routes to correct erroneous CIBIL entries under the Credit Information Companies Act\.

__Integration: __Partner with CIBIL for B2B API access\. Build 'Dispute My CIBIL' module: pull credit report, flag discrepancies, draft dispute letter to bank \+ CIBIL automatically\.

__07  |  Security, DPDP Compliance & Privacy Resources__

__DPDP Act 2023 ΓÇö Official Text & DPDP Rules 2025  __\[Legal Reference\]__  Free__

[https://meity\.gov\.in/  |  Rules: https://egazette\.gov\.in/](https://meity.gov.in/  |  Rules: https://egazette.gov.in/)

The Digital Personal Data Protection Act 2023 and DPDP Rules 2025 \(notified November 14, 2025\) are the primary compliance framework\. Rules cover: consent manager requirements, breach notification \(72 hours to affected users\), data deletion timelines, Significant Data Fiduciary obligations\. Full compliance deadline: May 2027\.

__Integration: __Appoint DPO \(if SDF threshold crossed\)\. Build consent manager integration\. Implement automated deletion workflows for data older than legitimate purpose period\. Quarterly compliance audits against Rules checklist\.

__CERT\-In Guidelines ΓÇö Incident Reporting  __\[Government Reference\]__  Free__

[https://cert\-in\.org\.in/](https://cert-in.org.in/)

CERT\-In \(Indian Computer Emergency Response Team\) mandates 6\-hour incident reporting for cyber incidents\. Empanelled security auditors for VAPT\. Published vulnerability advisories\. CERT\-In empanelment is mandatory for government project security audits\.

__Integration: __Register on CERT\-In portal for mandatory incident reporting\. Use CERT\-In empanelled vendors for quarterly VAPT\. Build automated 6\-hour reporting workflow: detection ΓåÆ classification ΓåÆ CERT\-In notification\.

__OWASP ΓÇö Security Standards & Checklists  __\[Open\-Source Reference\]__  Free__

[https://owasp\.org/  |  ASVS: https://owasp\.org/www\-project\-application\-security\-verification\-standard/](https://owasp.org/  |  ASVS: https://owasp.org/www-project-application-security-verification-standard/)

OWASP Application Security Verification Standard \(ASVS\) provides a framework for testing web application security\. OWASP Top 10 is the baseline for WAF rules\. OWASP SAMM for security maturity measurement\.

__Integration: __Implement OWASP ASVS Level 2 as minimum security baseline\. Configure Cloudflare WAF with OWASP Core Rule Set\. Run automated OWASP ZAP scans in CI/CD pipeline on every production deployment\.

__HashiCorp Vault ΓÇö Secrets & Encryption Key Management  __\[Open\-Source / Enterprise\]__  Open\-Source: Free; Enterprise: from $0\.03/hr on cloud__

[https://developer\.hashicorp\.com/vault](https://developer.hashicorp.com/vault)

Secrets management and encryption as a service\. Manages API keys, database passwords, TLS certificates, encryption keys\. Dynamic secrets ΓÇö auto\-rotate DB credentials\. AES\-256\-GCM transit encryption for legal data at field level\.

__Integration: __Use Vault Transit engine for field\-level encryption of client names, case facts, financial data before storing in PostgreSQL\. Use dynamic PostgreSQL secrets to eliminate shared DB passwords entirely\.

__DPDPA\.com ΓÇö Compliance Templates & Guides  __\[Compliance Resource\]__  Free__

[https://www\.dpdpa\.com/](https://www.dpdpa.com/)

India's dedicated DPDP Act resource portal\. Full text of Act \+ Rules, consent notice templates, DPIA frameworks, breach notification procedures, compliance checklists\. Updated with DPDP Rules 2025\.

__Integration: __Use templates for LexAI's own consent notices and privacy policy \(must comply with DPDP Rules 2025 plain\-language requirement\)\. Reference for DPIA when processing special category data in attorney\-client communications\.

__Cloudflare ΓÇö WAF, DDoS & Zero Trust  __\[Commercial\]__  Free tier available; Pro from $20/mo; Business from $200/mo__

[https://www\.cloudflare\.com/en\-in/](https://www.cloudflare.com/en-in/)

Enterprise\-grade WAF, DDoS protection, CDN, and Zero Trust networking\. Cloudflare India PoPs in Mumbai, Chennai, Delhi\. OWASP Core Rule Set available out\-of\-the\-box\. Bot management for scraping protection\.

__Integration: __Use Cloudflare Business for LexAI production\. Enable OWASP ruleset \+ India\-specific bot rules\. Use Workers KV for edge\-caching case status data for 5 minutes \(reduces load on eCourts API significantly\)\.

__08  |  Infrastructure, Database & DevOps Tools__

__Elasticsearch 8\.x ΓÇö Legal Search Engine  __\[Open\-Source / Commercial\]__  Self\-hosted: Free; Elastic Cloud: from $95/mo__

[https://www\.elastic\.co/  |  Cloud: https://cloud\.elastic\.co/](https://www.elastic.co/  |  Cloud: https://cloud.elastic.co/)

Industry\-standard distributed search and analytics engine\. Semantic search via dense\_vector fields and kNN search\. Full\-text \+ vector hybrid search ideal for legal case search\. Index 30M\+ documents efficiently\.

__Integration: __Deploy 3\-node cluster minimum\. Create index: case\_text \(text\), case\_embedding \(dense\_vector 768d\), court \(keyword\), date \(date\), section\_refs \(keyword\)\. Use InLegal\-SBERT for embedding generation at ingest\.

__PostgreSQL 16 \+ TimescaleDB  __\[Open\-Source\]__  Free \(self\-hosted\); TimescaleDB Cloud from $0\.024/hr__

[https://www\.postgresql\.org/  |  https://www\.timescale\.com/](https://www.postgresql.org/  |  https://www.timescale.com/)

PostgreSQL 16 with TimescaleDB extension for time\-series case filing data\. Row\-level security for multi\-tenant user isolation\. GIN indexes for full\-text search\. Partition by court\+year for 30M\+ case records\.

__Integration: __Enable pg\_trgm for trigram search on case numbers\. Use TimescaleDB hypertables for case\_filings partitioned by filed\_date\. Implement row\-level security: users see only their own matters, advocates see their client matters\.

__Apache Kafka ΓÇö Event Streaming & Ingestion  __\[Open\-Source / Commercial\]__  Self\-hosted: Free; Confluent Cloud from $1\.50/hr__

[https://kafka\.apache\.org/  |  Managed: https://www\.confluent\.io/](https://kafka.apache.org/  |  Managed: https://www.confluent.io/)

Distributed event streaming platform\. Handles court data ingestion from 30\+ sources, RSS feeds, API webhooks, and WhatsApp Business events\. Decouples ingestion from processing\.

__Integration: __Create topics: court\.raw\.ecourts, court\.raw\.indiankanoon, news\.raw\.livelaw, voice\.transcripts\. Use Kafka Connect for RSS source connector and JDBC sink to PostgreSQL\. Elasticsearch Sink Connector for search indexing\.

__PaddleOCR ΓÇö Indic Script OCR  __\[Open\-Source\]__  Free \(Apache 2\.0\)__

[https://github\.com/PaddlePaddle/PaddleOCR](https://github.com/PaddlePaddle/PaddleOCR)

State\-of\-the\-art OCR supporting 80\+ languages including Devanagari \(Hindi, Marathi\), Tamil, Telugu, Kannada, Bengali, Gujarati, Punjabi\. Significantly better than Tesseract on Indic scripts\. GPU\-accelerated\.

__Integration: __Build pre\-processing pipeline: deskew ΓåÆ denoise ΓåÆ binarize ΓåÆ PaddleOCR ΓåÆ post\-process with InLegalBERT NER for entity extraction\. Use Tesseract as fallback for English\-only scanned documents\.

__MinIO ΓÇö S3\-Compatible Object Storage \(India Residency\)  __\[Open\-Source\]__  Free \(self\-hosted\); Enterprise support from $10K/yr__

[https://min\.io/](https://min.io/)

S3\-compatible object storage for cold\-tier archive\. Deploy in Mumbai AWS region for data residency compliance\. Stores raw PDFs, scanned court documents, audio recordings\. Lifecycle policies auto\-move data from hot to cold\.

__Integration: __Deploy MinIO on AWS Mumbai \+ Hyderabad for redundancy\. Configure lifecycle: move court PDFs older than 2 years from S3 \(hot\) to Glacier \(cold\)\. Apache Iceberg on top of MinIO for SQL analytics via Trino\.

__AWS India Regions ΓÇö Mumbai \+ Hyderabad  __\[Commercial Cloud\]__  Pay\-per\-use; EC2 from Γé╣5/hr; S3 from Γé╣2/GB/mo__

[https://aws\.amazon\.com/about\-aws/global\-infrastructure/regions\_az/](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/)

AWS ap\-south\-1 \(Mumbai\) and ap\-south\-2 \(Hyderabad\) for DPDP data residency compliance\. All personal data of Indian citizens must remain within India\. AWS Mumbai has 3 AZs; Hyderabad has 3 AZs for DR\.

__Integration: __Primary: ap\-south\-1 \(Mumbai\)\. DR: ap\-south\-2 \(Hyderabad\)\. Use Route 53 with health checks for failover\. Enable AWS Shield Advanced \(Γé╣9000/mo\) for DDoS protection\. Use KMS India region keys for encryption\.

__09  |  Quick Reference ΓÇö All Resources at a Glance__

__Resource__

__URL__

__Type__

__Cost__

__Priority__

Whisper Large v3

huggingface\.co/openai/whisper\-large\-v3

Model

Free

P1

WhisperLive Server

github\.com/collabora/WhisperLive

OSS

Free

P1

whisper\.cpp \(Mobile\)

github\.com/ggml\-org/whisper\.cpp

OSS

Free

P1

Silero VAD

github\.com/snakers4/silero\-vad

OSS

Free

P1

Azure Neural TTS

azure\.microsoft\.com/ai/tts

API

Γé╣12ΓÇô60/1M chars

P1

ElevenLabs TTS

elevenlabs\.io

API

$5/mo\+

P2

Google STT Chirp

cloud\.google\.com/speech\-to\-text

API

Γé╣0\.004/15s

P2

WhatsApp Business API

developers\.facebook\.com/docs/whatsapp

API

Γé╣0\.5ΓÇô1\.1/conv

P1

InLegalBERT

huggingface\.co/law\-ai/InLegalBERT

Model

Free

P1

InLegal\-SBERT

huggingface\.co/bhavyagiri/InLegal\-Sbert

Model

Free

P1

CustomInLawBERT

huggingface\.co/law\-ai/CustomInLawBERT

Model

Free

P1

InLegalTrans 1B

sites\.google\.com/site/saptarshighosh

Model

Free

P2

ILDC Dataset

github\.com/Exploration\-Lab/CJPE

Dataset

Free

P2

LeSICiN IPC Model

github\.com/Law\-AI/LeSICiN

Model

Free

P2

ECIAPI \(Court Data\)

eciapi\.akshit\.me

API

Free/Pay\-per\-req

P1

eCourts Official

ecourts\.gov\.in

Gov Portal

Free

P1

IndianKanoon API

api\.indiankanoon\.org

API

Free \(non\-commercial\)

P1

kanoon\.dev

docs\.kanoon\.dev

API

Subscription

P2

IndianKanoon RSS

indiankanoon\.org/feeds/

RSS

Free

P1

OGD data\.gov\.in

data\.gov\.in

Gov API

Free

P2

NALSA Portal

nalsa\.gov\.in

Gov Portal

Free

P2

LiveLaw RSS

livelaw\.in/feed/

RSS

Free

P1

Bar & Bench RSS

barandbench\.com

RSS

Free

P1

e\-Gazette India

egazette\.gov\.in

Gov Portal

Free

P1

PRS India

prsindia\.org

Scraper

Free

P2

SEBI / RBI / MCA

sebi\.gov\.in / rbi\.org\.in / mca\.gov\.in

Gov APIs

Free

P2

SCC Online / Manupatra

scconline\.com / manupatra\.com

Licensed

Enterprise

P2

MCA21 V3

mca\.gov\.in

Gov Portal

Free/Partner

P1

IP India TM/Patent

ipindia\.gov\.in

Gov Portal

Free search

P2

GST Developer API

developer\.gst\.gov\.in

Gov API

Free \(GSP\)

P2

MSME Udyam

udyamregistration\.gov\.in

Gov Portal

Free

P2

IBBI Portal

ibbi\.gov\.in

Gov Portal

Free

P3

StartupIndia DPIIT

startupindia\.gov\.in

Gov Portal

Free

P2

DocuSign

docusign\.com

API

From $10/mo

P2

DigiLocker API

partners\.digitallocker\.gov\.in

Gov API

Free

P2

DRT Portal

drt\.gov\.in

Gov Portal

Free

P2

RBI CMS

cms\.rbi\.org\.in

Gov Portal

Free

P2

IRDAI Bima Bharosa

bimabharosa\.irdai\.gov\.in

Gov Portal

Free

P2

Income Tax e\-Filing

incometax\.gov\.in

Gov Portal

Free

P2

GSTN APIs

developer\.gst\.gov\.in

Gov API

Free \(GSP\)

P2

CIBIL API

cibil\.com

Commercial

Partnership

P3

DPDP Act \+ Rules

meity\.gov\.in / egazette\.gov\.in

Legal Ref

Free

P1

CERT\-In

cert\-in\.org\.in

Gov Portal

Free

P1

OWASP ASVS

owasp\.org/www\-project\-asvs

Reference

Free

P1

HashiCorp Vault

developer\.hashicorp\.com/vault

OSS/Ent

Free/Enterprise

P1

DPDPA\.com Templates

dpdpa\.com

Reference

Free

P1

Cloudflare

cloudflare\.com

Commercial

From $20/mo

P1

Elasticsearch 8\.x

elastic\.co

OSS/Cloud

Free/From $95/mo

P1

PostgreSQL 16 \+ Timescale

postgresql\.org / timescale\.com

OSS

Free

P1

Apache Kafka

kafka\.apache\.org

OSS

Free

P1

PaddleOCR

github\.com/PaddlePaddle/PaddleOCR

OSS

Free

P1

MinIO

min\.io

OSS

Free

P1

AWS ap\-south\-1/2

aws\.amazon\.com

Cloud

Pay\-per\-use

P1

__*LexAI Resource Directory ΓÇö All URLs verified March 2025*__

Pricing subject to change\. Verify current pricing before procurement\. For licensing queries contact resources@lexai\.in

