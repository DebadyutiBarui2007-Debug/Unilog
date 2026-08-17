import json

steps = [
    {
      "id": 1,
      "title": "1. Unilog Product Intelligence Suite",
      "description": "Welcome to the guided onboarding! We will walk you through the primary features and capabilities. Follow the glowing highlighted regions and interact with the elements. We will explore every tab in detail.",
      "expectedActionMessage": "Click 'Start Hands-on Tour' to begin the walk-through.",
      "simulateAction_code": "() => {}",
      "learnMoreTitle": "Master Data Management (MDM) & ETIM 9.0",
      "learnMoreMarkdown": "### The Master Data Management Problem in MRO\nIndustrial distributors deal with billions of SKU descriptions originating from thousands of different manufacturers. These raw strings are loaded with abbreviations, OCR errors, and unstructured specifications.\n\n### How Unilog Resolves This:\n1. **Multi-Pass Neural Classification**: We utilize custom-tuned LLMs (Gemini 3.6 Flash) as semantic categorizers.\n2. **Taxonomy Encoding (UNSPSC)**: Automatically maps items up to Level 4 Commodity depth.\n3. **ETIM & GS1 Attribute Standardization**: Extracts granular values like *Pressure*, *Thread Size*, etc."
    },
    {
      "id": 2,
      "title": "2. Pipeline: Load Industrial Samples",
      "elementId": "preset-samples-container",
      "tabRequirement": "pipeline",
      "description": "The Pipeline is where individual SKUs are processed. Distributors feed raw, noisy catalog sheets here. Try loading a sample.",
      "expectedActionMessage": "Click on any industrial preset button (e.g. 'Parker Valve') below.",
      "simulateAction_code": '() => { setInput("Parker 1/2 in brass ball valve NPT female 600 PSI WOG 200 WSP forged body B505 alloy"); }',
      "learnMoreTitle": "Why Is Raw Ingestion Difficult?",
      "learnMoreMarkdown": "### The Complexity of Industrial Nomenclature\nUnlike retail commodities, industrial products are specified by multiple mathematical and physical formulas.\n\n### Why Simple Keyword Matchers Fail:\n- **String Delimiters**: A slash (/) can represent completely different parameters.\n- **Context-Sensitive Measurements**: 1/2 in could be pipe size, shank diameter, etc."
    },
    {
      "id": 3,
      "title": "3. Pipeline: Raw Supplier Input",
      "elementId": "pipeline-raw-input",
      "tabRequirement": "pipeline",
      "description": "This is the primary ingestion area. You can dump unstructured specs or copy-paste from ERPs directly into this buffer.",
      "expectedActionMessage": "Review the raw supplier input textarea.",
      "simulateAction_code": '() => { setInput("Goulds 1/2HP 115V Submersible Sump Pump 3887NO 50 GPM 1-1/2 discharge cast iron"); }',
      "learnMoreTitle": "Text Processing Pre-conditions",
      "learnMoreMarkdown": "### Raw Input Sanitation\nThe raw input parser automatically strips control characters, formats nested lines, and prepares the payload for tokenized analysis by the Gemini pipeline."
    },
    {
      "id": 4,
      "title": "4. Pipeline: Run Enrichment",
      "elementId": "execute-enrich-btn",
      "tabRequirement": "pipeline",
      "description": "Trigger the enrichment engine! Click the 'Run Pipeline' button to send the text to our Gemini 3.6 Flash categorizer.",
      "expectedActionMessage": "Click the pulsing 'Run Pipeline' button in the header bar.",
      "simulateAction_code": "() => { handleEnrich(); }",
      "learnMoreTitle": "Gemini 3.6 Flash Parse Engine",
      "learnMoreMarkdown": "### High-Fidelity Extraction Pipeline\nThe system orchestrates a multi-step semantic translation:\n1. **JSON Schema Enforcement**: Processed with strict constraints.\n2. **RAG Taxonomy Alignment**: Standardizing classification.\n3. **Calculated Confidence**: Scoring each output vector based on token probabilities."
    },
    {
      "id": 5,
      "title": "5. Pipeline: Interactive Catalog Form",
      "elementId": "catalog-form-container",
      "tabRequirement": "pipeline",
      "description": "After processing, the extracted values populate this interactive form. Data librarians can manually override any AI-extracted attribute here if needed.",
      "expectedActionMessage": "Review the populated Master Catalog Record form on the right.",
      "simulateAction_code": "() => {}",
      "learnMoreTitle": "Human-in-the-loop Editing",
      "learnMoreMarkdown": "### Interactive Overrides\nUsers can correct misidentified attributes. Any manual changes are logged in the audit trail, ensuring traceability. The schema enforces standard data types automatically."
    },
    {
      "id": 6,
      "title": "6. Pipeline: Expert Rationale",
      "elementId": "expert-rationale-container",
      "tabRequirement": "pipeline",
      "description": "The AI explains its reasoning! The Expert Rationale block details exactly how it determined the category and specifications from the raw string.",
      "expectedActionMessage": "Read the AI reasoning block below the form.",
      "simulateAction_code": "() => {}",
      "learnMoreTitle": "Explainable AI (XAI)",
      "learnMoreMarkdown": "### Transparent Decision Making\nBlack-box AI is unacceptable in Master Data. The model outputs a step-by-step chain of thought, explaining how it resolved ambiguous terms to standard ETIM classes."
    },
    {
      "id": 7,
      "title": "7. Batch: High-Volume Ingestion",
      "elementId": "tab-batch",
      "tabRequirement": "batch",
      "description": "Let's explore high-volume processing. Switch to the 'Bulk Catalog Batch' tab on the left sidebar.",
      "expectedActionMessage": "Click the Bulk Catalog Batch button in the left navigation sidebar.",
      "simulateAction_code": '() => { setActiveTab("batch"); }',
      "learnMoreTitle": "High-Throughput Batch Processing",
      "learnMoreMarkdown": "### Scale up to Thousands of SKUs\nDistributors process master catalogs via asynchronous jobs. The Bulk Ingestion engine processes parallel streams through specialized worker clusters."
    },
    {
      "id": 8,
      "title": "8. Batch: Quality Statistics",
      "elementId": "batch-stats-container",
      "tabRequirement": "batch",
      "description": "Once a batch is run, these statistics monitor the health of current queues, tracking total rows, confidence average, and auto-approval rates.",
      "expectedActionMessage": "Review the quality statistics metrics dashboard cards.",
      "simulateAction_code": "() => {}",
      "learnMoreTitle": "Batch Performance Metrics",
      "learnMoreMarkdown": "### Confidence and Validation Thresholds\nMetrics are computed in real-time as background threads complete parsing steps. Items exceeding the confidence threshold are routed automatically to master tables."
    },
    {
      "id": 9,
      "title": "9. History: Traceability Logs",
      "elementId": "tab-history",
      "tabRequirement": "history",
      "description": "Governance requires proof. Switch to the 'Traceability Audit Logs' tab to inspect the immutable ledger of all system modifications and AI actions.",
      "expectedActionMessage": "Click 'Traceability Audit Logs' in the left navigation sidebar.",
      "simulateAction_code": '() => { setActiveTab("history"); }',
      "learnMoreTitle": "Immutable Log Linage",
      "learnMoreMarkdown": "### Compliance Auditing\nEvery enrichment step, model decision path, confidence calculation, and human override is recorded securely with matching timestamps."
    },
    {
      "id": 10,
      "title": "10. AI Tools: Specialized Capabilities",
      "elementId": "tab-ai-tools",
      "tabRequirement": "ai-tools",
      "description": "We offer domain-specific Multi-Modal tools. Switch to the 'Multi-modal AI Tools' tab.",
      "expectedActionMessage": "Click 'Multi-modal AI Tools' in the sidebar.",
      "simulateAction_code": '() => { setActiveTab("ai-tools"); }',
      "learnMoreTitle": "Specialized Core Models",
      "learnMoreMarkdown": "### Context-Specific Pipelines\nEach tool implements specialized prompt systems:\n- **Voice Agent**: Transcribes voice recordings of maintenance logs.\n- **Grounded Search**: Fetches live manufacturer specs online.\n- **Facility Finder**: Coordinates warehouses.\n- **Image Studio**: Identifies part numbers from photos."
    },
    {
      "id": 11,
      "title": "11. Intelligence: Market Advisory",
      "elementId": "tab-market-intelligence",
      "tabRequirement": "market-intelligence",
      "description": "Time for business insights! Click on the 'Market Intelligence' tab to access our strategic advisor.",
      "expectedActionMessage": "Click 'Market Intelligence' in the left navigation sidebar.",
      "simulateAction_code": '() => { setActiveTab("market-intelligence"); }',
      "learnMoreTitle": "Market Intelligence & Competitor Tracking",
      "learnMoreMarkdown": "### Strategic Procurement & Analytics\nThe Market Intelligence tab connects directly to Gemini 3.6 Flash using Google Search Grounding to generate real-time competitor metrics and matrices."
    },
    {
      "id": 12,
      "title": "12. Intelligence: Executive Strategy",
      "elementId": "market-strategy-section",
      "tabRequirement": "market-intelligence",
      "description": "Notice the 'Executive Business & Growth Strategy' section at the end of the analysis. It acts as a 30+ year Business Analytics Expert to guide Industry Leaders on scaling and positioning.",
      "expectedActionMessage": "Review the Executive Strategy section.",
      "simulateAction_code": "() => {}",
      "learnMoreTitle": "30+ Years Experience Persona Integration",
      "learnMoreMarkdown": "### Advanced Persona Prompting\nBy instructing the AI to act as a seasoned executive, the generated output shifts from basic specs comparison to actionable C-level guidance covering scaling, targeting, and supply chain."
    },
    {
      "id": 13,
      "title": "13. ML Studio: Recursive Baselines",
      "elementId": "tab-recursive-ml",
      "tabRequirement": "recursive-ml",
      "description": "Navigate to the Machine Learning center. Click on the 'Recursive ML & 1K Dataset' tab.",
      "expectedActionMessage": "Click 'Recursive ML & 1K Dataset' tab in the sidebar.",
      "simulateAction_code": '() => { setActiveTab("recursive-ml"); }',
      "learnMoreTitle": "Recursive Self-Correction & Epochs",
      "learnMoreMarkdown": "### What is Recursive Learning?\nRecursive learning generates structured data, automatically runs validators against it, and feeds anomalies back into its prompt system as negative constraints to self-correct."
    },
    {
      "id": 14,
      "title": "14. Health: System Telemetry",
      "elementId": "tab-system-health",
      "tabRequirement": "system-health",
      "description": "Switch to the 'System Health Dashboard' tab to monitor API latency, model confidence trends, and throughput.",
      "expectedActionMessage": "Click 'System Health Dashboard' in the sidebar.",
      "simulateAction_code": '() => { setActiveTab("system-health"); }',
      "learnMoreTitle": "Air-Gapped Telemetry & Observability",
      "learnMoreMarkdown": "### Enterprise Operational Visibility\nThe dashboard tracks latency and throughput profiling strictly for pipeline monitoring, guaranteeing zero visibility into proprietary training datasets."
    },
    {
      "id": 15,
      "title": "15. Health: Flagged Reviews (SLA)",
      "elementId": "pending-flagged-reviews",
      "tabRequirement": "system-health",
      "description": "The 'Pending Flagged Reviews (Last 24h)' panel tracks low-confidence matches. It allows human operators to quickly review, verify, and resolve anomalies within a 24-hour SLA.",
      "expectedActionMessage": "Review the Pending Flagged Reviews panel.",
      "simulateAction_code": "() => {}",
      "learnMoreTitle": "24-Hour SLA Flagged Records Resolution",
      "learnMoreMarkdown": "### Resolving AI Anomalies\nWhile the AI auto-approves items with >90% confidence, edge cases are flagged for human validation. The dashboard dynamically filters recent records to keep the ingestion queue unblocked."
    },
    {
      "id": 16,
      "title": "16. Settings: Engine Configuration",
      "elementId": "tab-settings",
      "tabRequirement": "settings",
      "description": "Control your governance pipeline. Switch to the 'Engine Configuration' tab.",
      "expectedActionMessage": "Click the 'Engine Configuration' button.",
      "simulateAction_code": '() => { setActiveTab("settings"); }',
      "learnMoreTitle": "System Engine Adjustments",
      "learnMoreMarkdown": "### Tailored System Behavior\nSet automatic thresholds for validation errors, configure fuzzy match sensitivities, and synchronize with your Master Data repositories."
    },
    {
      "id": 17,
      "title": "17. Profile: Secure Identity",
      "elementId": "tab-profile",
      "tabRequirement": "profile",
      "description": "Keep your workspace hack-proof. Under the 'Security Profile' tab, you can manage active database syncs and link your Google account securely.",
      "expectedActionMessage": "Click the 'Security Profile' button.",
      "simulateAction_code": '() => { setActiveTab("profile"); }',
      "learnMoreTitle": "Enterprise Identity & Google Linking",
      "learnMoreMarkdown": "### Hack-Proof Identity Integration\nThe platform implements strict client-side OAuth 2.0 flow mechanisms combined with Firebase APIs to prevent phishing and session hijacking."
    },
    {
      "id": 18,
      "title": "18. Onboarding Completed!",
      "description": "Awesome job! You have explored all the powerful tabs and features of the Unilog Product Intelligence Suite. You are now ready to scale your catalog governance.",
      "expectedActionMessage": "Click 'Finish and Explore' below to start using Unilog.",
      "simulateAction_code": "() => {}",
      "learnMoreTitle": "Next Steps",
      "learnMoreMarkdown": "### Recommended Next Steps\n1. **Connect Authentication**: Sign in using Firebase.\n2. **Run Batch Processing**: Process 100+ raw strings.\n3. **Clear Flagged Records**: Monitor your System Health daily!"
    }
]

out = "  const tutorialSteps: TutorialStep[] = [\n"
for s in steps:
    out += "    {\n"
    out += f'      id: {s["id"]},\n'
    out += f'      title: "{s["title"]}",\n'
    if "elementId" in s:
        out += f'      elementId: "{s["elementId"]}",\n'
    if "tabRequirement" in s:
        out += f'      tabRequirement: "{s["tabRequirement"]}",\n'
    out += f'      description: "{s["description"]}",\n'
    out += f'      expectedActionMessage: "{s["expectedActionMessage"]}",\n'
    out += f'      simulateAction: {s["simulateAction_code"]},\n'
    out += f'      learnMoreTitle: "{s["learnMoreTitle"]}",\n'
    out += f'      learnMoreMarkdown: `{s["learnMoreMarkdown"]}`,\n'
    out += "    },\n"
out += "  ];\n"

print("Steps generated successfully.")
with open('steps.ts', 'w') as f:
    f.write(out)
