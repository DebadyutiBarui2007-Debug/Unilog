import fs from 'fs';

const code = `import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, MousePointerClick, ArrowRight, X, ChevronRight, 
  ChevronLeft, Info, BookOpen, Sparkles, Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Tab } from '../App';

export interface TutorialStep {
  id: number;
  title: string;
  description: string;
  expectedActionMessage: string;
  elementId?: string;
  tabRequirement?: Tab;
  simulateAction: () => void;
  learnMoreTitle: string;
  learnMoreMarkdown: string;
}

interface InteractiveTutorialProps {
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
  setInput: (t: string) => void;
  handleEnrich: () => void;
  setPipelineViewMode: (mode: 'split' | 'comparison') => void;
  setShowCatalogModal: (s: boolean) => void;
  onClose: () => void;
  isLight?: boolean;
}

export default function InteractiveTutorial({
  activeTab,
  setActiveTab,
  setInput,
  handleEnrich,
  setPipelineViewMode,
  setShowCatalogModal,
  onClose,
  isLight = false
}: InteractiveTutorialProps) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [showLearnMore, setShowLearnMore] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number; position: 'top' | 'bottom' | 'right' | 'left' | 'center' }>({ top: 0, left: 0, position: 'center' });

  const tutorialSteps: TutorialStep[] = [
    {
      id: 1,
      title: "1. Unilog Product Intelligence Suite",
      description: "Welcome! This is an interactive, guided onboarding tour. We will walk you through the primary buttons and live features. Follow the glowing highlighted regions and click on elements to see the system work in real-time!",
      expectedActionMessage: "Click 'Start Hands-on Tour' to begin the walk-through.",
      simulateAction: () => {},
      learnMoreTitle: "Master Data Management (MDM) & ETIM 9.0 Standard",
      learnMoreMarkdown: \`### The Master Data Management Problem in MRO
Industrial distributors deal with billions of SKU descriptions originating from thousands of different manufacturers. These raw strings are loaded with abbreviations, OCR errors, and unstructured specifications.

### How Unilog Resolves This:
1. **Multi-Pass Neural Classification**: We utilize custom-tuned LLMs (Gemini 3.6 Flash) as semantic categorizers to route raw text to specific physical asset domains.
2. **Taxonomy Encoding (UNSPSC)**: Automatically maps items to the United Nations Standard Products and Services Code (UNSPSC) up to Level 4 Commodity depth.
3. **ETIM & GS1 Attribute Standardization**: Extracts granular values like *Pressure*, *Thread Size*, *Body Material*, and *Connection Type* and maps them against strict standard lists.\`,
    },
    {
      id: 2,
      title: "2. Load Benchmark Industrial Samples",
      elementId: "preset-samples-container",
      tabRequirement: "pipeline",
      description: "Distributors feed raw, noisy manufacturer catalog sheets into the ingestion area. To test, click on any of the 'Try Industrial Samples' buttons highlighted below.",
      expectedActionMessage: "Click on any industrial preset button (e.g. 'Parker Valve') below to automatically load sample text.",
      simulateAction: () => {
        setInput("Parker 1/2 in brass ball valve NPT female 600 PSI WOG 200 WSP forged body B505 alloy");
      },
      learnMoreTitle: "Why Is Raw Ingestion Difficult?",
      learnMoreMarkdown: \`### The Complexity of Industrial Nomenclature
Unlike standard B2C retail commodities, industrial products are specified by multiple mathematical, physical, and chemical formulas. 

### Why Simple Keyword Matchers Fail:
- **String Delimiters**: A slash (/), hyphen (-), or space can represent completely different parameters depending on whether it lies next to an integer or abbreviation.
- **Context-Sensitive Measurements**: The term 1/2 in could represent pipe nominal size, shank diameter, port width, or keyway dimension. 
- **Non-Standardized Abbreviations**: Manufacturers describe the same material as BRS, BRASS, BRZ, BR, or Alloy 360.\`,
    },
    {
      id: 3,
      title: "3. Raw Supplier Ingestion Input",
      elementId: "pipeline-raw-input",
      tabRequirement: "pipeline",
      description: "This is the primary ingestion area where unstructured supplier specifications are dumped, either individually or copy-pasted directly from legacy ERP records.",
      expectedActionMessage: "Type or check the text inside the raw supplier input textarea.",
      simulateAction: () => {
        setInput("Goulds 1/2HP 115V Submersible Sump Pump 3887NO 50 GPM 1-1/2 discharge cast iron");
      },
      learnMoreTitle: "Text Processing Pre-conditions",
      learnMoreMarkdown: \`### Raw Input Sanitation
The raw input parser automatically strips control characters, formats nested lines, and prepares the payload for tokenized analysis by the Gemini pipeline.\`,
    },
    {
      id: 4,
      title: "4. Run AI Enrichment Pipeline",
      elementId: "execute-enrich-btn",
      tabRequirement: "pipeline",
      description: "Trigger the enrichment engine! Click the highlighted 'Run Pipeline' button at the top to send the text to our Gemini 3.6 Flash neural categorizer.",
      expectedActionMessage: "Click the pulsing 'Run Pipeline' button in the header bar.",
      simulateAction: () => {
        handleEnrich();
      },
      learnMoreTitle: "Gemini 3.6 Flash Multi-Modal Parse Engine",
      learnMoreMarkdown: \`### Real-time High-Fidelity Extraction Pipeline
When you trigger the enrichment pipeline, the system orchestrates a multi-step semantic translation:

1. **JSON Schema Enforcement**: The unstructured input is processed with schema constraints matching our TypeScript definitions.
2. **RAG Taxonomy Alignment**: Standardizing classification using pre-cached lists of values (LOV).
3. **Calculated Confidence**: Scoring each output vector based on token probabilities, enabling automatic ingestion of high-scoring items (above threshold).\`,
    },
    {
      id: 5,
      title: "5. Granular Feedback & Caching",
      elementId: "execute-enrich-btn",
      tabRequirement: "pipeline",
      description: "Run the pipeline again on the exact same input! Notice the Granular Progress bar that appears, stepping through 'Analyzing...', 'Standardizing...', and 'Validating...'. Also notice the result appears instantly because of our LRU in-memory Server-Side Caching mechanism.",
      expectedActionMessage: "Click the 'Run Pipeline' button again to see the progress bar and fast cache retrieval.",
      simulateAction: () => {
        handleEnrich();
      },
      learnMoreTitle: "In-Memory Server-Side Caching & UX",
      learnMoreMarkdown: \`### Granular Execution Feedback
Instead of a generic loading spinner, the UI steps sequentially through actual pipeline phases.

### LRU-style In-Memory Caching
We implemented an air-gapped Map-based caching layer on the server (24h TTL). Redundant inferences (exact same manufacturer descriptions) return instantly, bypassing the model entirely and saving compute cycles, while maintaining strict data isolation (zero persistence in databases).\`,
    },
    {
      id: 6,
      title: "6. Compare View (Side-by-Side Mode)",
      elementId: "view-comparison-btn",
      tabRequirement: "pipeline",
      description: "Verify your data structure! Click the highlighted 'Side-by-Side Comparison' button to compare the messy raw vendor specs side-by-side with the parsed master records.",
      expectedActionMessage: "Click 'Side-by-Side Comparison' button below the presets.",
      simulateAction: () => {
        setPipelineViewMode("comparison");
      },
      learnMoreTitle: "Human-in-the-Loop Side-by-Side Governance",
      learnMoreMarkdown: \`### Human-in-the-Loop Side-by-Side Governance
High-volume industrial systems require rigorous diagnostic dashboards. The Side-by-Side Comparison interface allows Master Data Librarians to:

1. **Verify Lineage**: Trace every standardized property back to the exact substring in the supplier raw data sheet.
2. **Contrast Multi-Model Outputs**: Contrast output from different neural checkpoints (e.g., v3.1-recursive-baseline vs v3.4-recursive-ft).
3. **Measure Token Recall**: Observe OCR alignment and highlight structural mismatches directly to prevent corrupt catalog writes.\`,
    },
    {
      id: 7,
      title: "7. Return to Split View",
      elementId: "view-split-btn",
      tabRequirement: "pipeline",
      description: "Now click on the highlighted 'Split View' button to return to our primary catalog entry panel.",
      expectedActionMessage: "Click 'Split View' to restore the dual panels.",
      simulateAction: () => {
        setPipelineViewMode("split");
      },
      learnMoreTitle: "The Unified Schema Workstation",
      learnMoreMarkdown: \`### High-Efficiency Workspace
By displaying the input buffer on the left and the interactive form schema on the right, data librarians can rapidly view and patch AI extraction faults.\`,
    },
    {
      id: 8,
      title: "8. Bulk Catalog Batch Ingestion",
      elementId: "tab-batch",
      tabRequirement: "batch",
      description: "Let's explore high-volume processing. Switch to the 'Bulk Catalog Batch' tab on the left sidebar.",
      expectedActionMessage: "Click the Bulk Catalog Batch button in the left navigation sidebar.",
      simulateAction: () => {
        setActiveTab("batch");
      },
      learnMoreTitle: "High-Throughput Batch Processing",
      learnMoreMarkdown: \`### Scale up to Thousands of SKUs
Distributors process master catalogs via asynchronous jobs. The Bulk Ingestion engine processes parallel streams through specialized worker clusters.\`,
    },
    {
      id: 9,
      title: "9. Traceability Audit Trails",
      elementId: "tab-history",
      tabRequirement: "history",
      description: "Governance requires proof. Switch to the 'Traceability Audit Logs' tab on the left sidebar to inspect the immutable ledger of modifications.",
      expectedActionMessage: "Click 'Traceability Audit Logs' in the left navigation sidebar.",
      simulateAction: () => {
        setActiveTab("history");
      },
      learnMoreTitle: "Immutable Log Linage",
      learnMoreMarkdown: \`### Compliance Auditing
Every enrichment step, model decision path, confidence calculation, and human override is recorded securely with matching timestamps.\`,
    },
    {
      id: 10,
      title: "10. Market Intelligence Insights",
      elementId: "tab-market-intelligence",
      tabRequirement: "market-intelligence",
      description: "Time for high-level business insights! Click on the 'Market Intelligence' tab on the left sidebar to access our strategic advisor.",
      expectedActionMessage: "Click 'Market Intelligence' in the left navigation sidebar.",
      simulateAction: () => {
        setActiveTab("market-intelligence");
      },
      learnMoreTitle: "Market Intelligence & Competitor Tracking",
      learnMoreMarkdown: \`### Strategic Procurement & Analytics
The Market Intelligence tab connects directly to Gemini 3.6 Flash using Google Search Grounding to generate real-time competitor metrics.

### Capabilities:
- **Direct Competitor Line-ups**: Compares SKF, Parker, Allen-Bradley, Festo, and other leading brands instantly.
- **Comparative Technical Matrices**: Evaluates specifications like Operating Temperature, Load Capacity, and Life Cycle MTBF side-by-side.
- **Executive Business Growth Strategy**: Generates a robust marketing and business growth strategy tailored for Industry Leaders to scale operations and dominate key sectors.\`,
    },
    {
      id: 11,
      title: "11. Executive Business Strategy",
      tabRequirement: "market-intelligence",
      description: "Here in the Market Intelligence tab, you can search for a product (e.g. 'Festo DFSP-20-15-PS-A pneumatic cylinder') and receive a fully structured Market Intelligence Report. Notice the newly implemented 'Executive Business & Growth Strategy' section at the end of the analysis, which acts as a 30+ year Business Analytics Expert to guide Industry Leaders on scaling operations and market positioning.",
      expectedActionMessage: "Click on a preset model in the Market Intelligence tab to trigger an advisory analysis.",
      simulateAction: () => {},
      learnMoreTitle: "30+ Years Experience Persona Integration",
      learnMoreMarkdown: \`### Advanced Persona Prompting
By instructing Gemini 3.6 Flash to act as a *'Business Analytics Industry Expert with 30+ years of Industrial and Business experience'*, the generated output shifts from basic specs comparison to actionable C-level guidance.

This ensures the marketing strategy provides flawless, error-free executive advice covering:
- Market Positioning
- Scaling Operations
- Sector Targeting
- Supply Chain Innovations\`,
    },
    {
      id: 12,
      title: "12. Recursive Learning Studio & Baselines",
      elementId: "tab-recursive-ml",
      tabRequirement: "recursive-ml",
      description: "Navigate to our Machine Learning center. Click on the highlighted 'Recursive ML & 1K Dataset' navigation button in the left sidebar.",
      expectedActionMessage: "Click 'Recursive ML & 1K Dataset' tab in the sidebar.",
      simulateAction: () => {
        setActiveTab("recursive-ml");
      },
      learnMoreTitle: "Recursive Self-Correction & Epoch Validation Loop",
      learnMoreMarkdown: \`### What is Recursive Learning?
Recursive learning is an advanced architecture where the model generates structured data, automatically runs validators against it (such as length boundaries, uppercase rules, and LOV matchers), and feeds the discovered anomalies back into its own prompt system as negative constraints.

### Key Capabilities:
- **Baseline Report**: Running 1,000+ catalog items through the pipeline to output a comprehensive accuracy and compliance audit report.
- **Checkpoints Registry**: Instantly roll back, activate, or compare performance across multiple training checkpoints.\`,
    },
    {
      id: 13,
      title: "13. Monitor System Telemetry",
      elementId: "tab-system-health",
      tabRequirement: "system-health",
      description: "Ensure enterprise-grade operational visibility. Switch to the 'System Health Dashboard' tab on the left sidebar to monitor API latency, model confidence trends, and enrichment throughput.",
      expectedActionMessage: "Click 'System Health Dashboard' in the left navigation sidebar.",
      simulateAction: () => {
        setActiveTab("system-health");
      },
      learnMoreTitle: "Air-Gapped Telemetry & Observability",
      learnMoreMarkdown: \`### Enterprise Operational Visibility
The System Health Dashboard is engineered strictly for pipeline monitoring and guarantees zero visibility into proprietary training datasets.
It tracks:
- **API Latency & Confidence**: Real-time trends of execution speed and prediction certainty.
- **Throughput Profiling**: Total items processed per hour without referencing raw MRO descriptions or MPNs.\`,
    },
    {
      id: 14,
      title: "14. Pending Flagged Reviews",
      tabRequirement: "system-health",
      description: "Notice the new 'Pending Flagged Reviews (Last 24h)' panel at the bottom of the System Health Dashboard! This newly implemented feature tracks low-confidence or ambiguous matches, allowing human operators to quickly review, verify, and resolve anomalies within a 24-hour SLA.",
      expectedActionMessage: "Scroll down to view the Pending Flagged Reviews panel, and click 'Review' on a flagged record to resolve it.",
      simulateAction: () => {},
      learnMoreTitle: "24-Hour SLA Flagged Records Resolution",
      learnMoreMarkdown: \`### Resolving AI Anomalies
While the AI pipeline auto-approves items with >90% confidence, edge cases (e.g., 'Ambiguous taxonomy match' or 'Legacy format') are flagged for human-in-the-loop validation.

### Real-time Filtering:
The dashboard dynamically filters records from the last 24 hours that haven't been reviewed yet, allowing data librarians to keep the ingestion queue unblocked. Interacting with the 'Review' button seamlessly resolves the anomaly without disrupting overall throughput.\`,
    },
    {
      id: 15,
      title: "15. System Engine Settings",
      elementId: "tab-settings",
      tabRequirement: "settings",
      description: "Control your governance pipeline. Switch to the 'Engine Configuration' tab on the left sidebar.",
      expectedActionMessage: "Click the 'Engine Configuration' button in the sidebar.",
      simulateAction: () => {
        setActiveTab("settings");
      },
      learnMoreTitle: "System Engine Adjustments",
      learnMoreMarkdown: \`### Tailored System Behavior
Set automatic thresholds for validation errors, configure fuzzy match sensitivities for major brands, and synchronize with your S3 or Azure Master Data repositories.\`,
    },
    {
      id: 16,
      title: "16. Secure Security Profile",
      elementId: "tab-profile",
      tabRequirement: "profile",
      description: "Keep your workspace hack-proof. Under the 'Security Profile' tab, you can view your active database sync details, unlink or link your Google account to your email securely, and sign out.",
      expectedActionMessage: "Click the 'Security Profile' button on the left sidebar.",
      simulateAction: () => {
        setActiveTab("profile");
      },
      learnMoreTitle: "Enterprise Identity & Google Linking",
      learnMoreMarkdown: \`### Hack-Proof Identity Integration
To prevent phishing, session hijacking, and credential leaks, the platform implements strict client-side OAuth 2.0 flow mechanisms combined with direct Firebase link-with-popup APIs.

### Key Security Benefits:
- **Immutable Association**: Association between Google and custom email-password logins is validated by Firebase's serverless OAuth state.
- **Biometric & 2FA Readiness**: Passing Google's gateway automatically binds Google's robust Two-Factor Authentication defenses onto your custom Unilog session.\`,
    },
    {
      id: 17,
      title: "17. Onboarding Completed Successfully!",
      description: "Awesome job! You have completed the comprehensive guided tour of Unilog Catalog Intelligence Core, including the new Executive Business Growth Strategy and 24-Hour Flagged Records features! You are now fully equipped to utilize this state-of-the-art enterprise system.",
      expectedActionMessage: "Click 'Finish and Explore' below to start using Unilog.",
      simulateAction: () => {},
      learnMoreTitle: "Next Steps to Master Data",
      learnMoreMarkdown: \`### Recommended Next Steps
1. **Connect Authentication**: Sign in using Firebase in the header to ensure persistent audit histories and user overrides.
2. **Run the New Market Advisory**: Query an industrial model to generate C-level business strategies.
3. **Clear Flagged Records**: Monitor your System Health dashboard daily to resolve 24-hour flagged bottlenecks!\`,
    }
  ];

  const currentStep = tutorialSteps[currentStepIdx];

  useEffect(() => {
    if (currentStep.tabRequirement && activeTab !== currentStep.tabRequirement) {
      setActiveTab(currentStep.tabRequirement);
    }
  }, [currentStepIdx, activeTab]);

  const updateTargetCoordinates = () => {
    if (!currentStep.elementId) {
      setTargetRect(null);
      setTooltipPos({
        top: window.innerHeight / 2 - 120,
        left: window.innerWidth / 2 - 200,
        position: 'center'
      });
      return;
    }

    const element = document.getElementById(currentStep.elementId);
    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetRect(rect);

      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const spaceRight = window.innerWidth - rect.right;
      const spaceLeft = rect.left;

      let top = rect.bottom + 14;
      let left = Math.max(16, rect.left + rect.width / 2 - 180);
      let position: 'top' | 'bottom' | 'right' | 'left' | 'center' = 'bottom';

      if (spaceBelow < 220 && spaceAbove > 220) {
        top = rect.top - 210;
        position = 'top';
      } else if (spaceRight > 380) {
        top = rect.top + rect.height / 2 - 100;
        left = rect.right + 16;
        position = 'right';
      }

      left = Math.min(left, window.innerWidth - 380);
      top = Math.min(top, window.innerHeight - 260);

      setTooltipPos({ top, left, position });
    } else {
      setTargetRect(null);
      setTooltipPos({
        top: window.innerHeight / 2 - 120,
        left: window.innerWidth / 2 - 190,
        position: 'center'
      });
    }
  };

  useEffect(() => {
    window.addEventListener('resize', updateTargetCoordinates);
    window.addEventListener('scroll', updateTargetCoordinates, true);
    return () => {
      window.removeEventListener('resize', updateTargetCoordinates);
      window.removeEventListener('scroll', updateTargetCoordinates, true);
    };
  }, [currentStepIdx]);

  useEffect(() => {
    setTimeout(updateTargetCoordinates, 80);
  }, [currentStepIdx, activeTab]);

  const handleNext = () => {
    if (currentStepIdx < tutorialSteps.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
      setShowLearnMore(false);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(prev => prev - 1);
      setShowLearnMore(false);
    }
  };

  const handleSimulateAndProceed = () => {
    currentStep.simulateAction();
    setTimeout(() => {
      handleNext();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[60] pointer-events-none font-mono flex items-center justify-center">
      <div className="absolute inset-0 bg-[#060913]/70 backdrop-blur-sm pointer-events-auto transition-all duration-500" />

      {targetRect && (
        <motion.div
          layoutId="tutorialSpotlight"
          initial={false}
          animate={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="fixed border-2 border-cyan-400 rounded-xl shadow-[0_0_30px_rgba(34,211,238,0.4)] bg-cyan-400/10 animate-pulse pointer-events-none z-[61] flex items-center justify-center"
        >
          <div className="absolute -bottom-10 right-1/2 translate-x-1/2 text-cyan-950 font-black bg-cyan-400 border border-cyan-200 px-3 py-1 rounded-md text-[10px] flex items-center gap-1.5 uppercase tracking-wider shadow-xl animate-bounce whitespace-nowrap">
            <MousePointerClick size={12} />
            <span>Interactive Action</span>
          </div>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStepIdx}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: 0,
            top: tooltipPos.top,
            left: tooltipPos.left
          }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 250, damping: 25 }}
          className={\`fixed w-[400px] max-h-[85vh] overflow-y-auto global-scroll-container bg-slate-900 border border-slate-700 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-[62] pointer-events-auto flex flex-col \${
            isLight ? 'bg-white border-blue-600 text-slate-800 shadow-2xl' : 'text-gray-100'
          }\`}
          style={{ position: 'fixed' }}
        >
          <div className="w-full h-1.5 bg-slate-800 rounded-t-2xl overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500"
              initial={{ width: 0 }}
              animate={{ width: \`\${((currentStepIdx + 1) / tutorialSteps.length) * 100}%\` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between border-b border-slate-700/50 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-cyan-500/20 rounded-lg border border-cyan-500/30">
                  <Sparkles className="text-cyan-400 animate-pulse" size={16} />
                </div>
                <span className="text-[11px] font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 uppercase tracking-widest">
                  Expert Tutorial
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-cyan-300 font-bold bg-cyan-900/40 border border-cyan-800 px-2.5 py-1 rounded-full shadow-inner">
                  {currentStepIdx + 1} of {tutorialSteps.length}
                </span>
                <button 
                  onClick={onClose}
                  className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-slate-800"
                  title="Exit Tutorial"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <h4 className={\`text-[15px] font-black mb-3 tracking-wide leading-tight \${isLight ? 'text-indigo-600' : 'text-white'}\`}>
              {currentStep.title}
            </h4>

            <p className={\`text-[12px] leading-relaxed mb-5 \${isLight ? 'text-slate-600' : 'text-slate-300'}\`}>
              {currentStep.description}
            </p>

            <div className={\`bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-5 shadow-inner \${isLight ? 'bg-slate-50 border-slate-200' : ''}\`}>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 uppercase font-black mb-2 tracking-wider">
                <CheckCircle2 size={12} /> Expected Action
              </div>
              <div className={\`text-[11px] leading-relaxed flex items-start gap-2 \${isLight ? 'text-slate-700' : 'text-slate-200'} font-semibold\`}>
                <ArrowRight size={13} className="text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
                <span>{currentStep.expectedActionMessage}</span>
              </div>

              {currentStep.elementId && (
                <button
                  onClick={handleSimulateAndProceed}
                  className="mt-4 w-full bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white py-2 px-3 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all shadow-md hover:shadow-lg"
                >
                  <Cpu size={12} className="text-cyan-400" /> Auto-Simulate & Proceed
                </button>
              )}
            </div>

            <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-700/50">
              <button
                onClick={() => setShowLearnMore(true)}
                className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors px-2 py-1.5 -ml-2 rounded-lg hover:bg-cyan-500/10"
              >
                <Info size={13} />
                Architecture Deep Dive
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  disabled={currentStepIdx === 0}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-slate-300 transition-colors"
                  title="Previous Step"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-[11px] font-bold px-4 py-1.5 rounded-lg uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-cyan-500/20 transition-all transform hover:scale-105 active:scale-95"
                >
                  <span>{currentStepIdx === tutorialSteps.length - 1 ? "Finish & Explore" : "Next Step"}</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showLearnMore && (
          <div className="fixed inset-0 z-[70] bg-[#060913]/90 backdrop-blur-md flex justify-end pointer-events-auto">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="w-full max-w-lg bg-[#0C101C] border-l border-cyan-500/30 h-full p-8 flex flex-col justify-between overflow-y-auto text-slate-300 shadow-2xl"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-5 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
                      <BookOpen size={20} className="text-indigo-400" />
                    </div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest font-mono">
                      Engineering Architecture Log
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowLearnMore(false)}
                    className="text-slate-500 hover:text-white p-1.5 rounded-md hover:bg-slate-800 transition-colors bg-slate-900 border border-slate-800"
                  >
                    <X size={18} />
                  </button>
                </div>

                <h2 className="text-lg font-black text-cyan-400 tracking-wide mb-6">
                  {currentStep.learnMoreTitle}
                </h2>

                <div className="text-[13px] leading-relaxed space-y-5 font-mono text-slate-400">
                  {currentStep.learnMoreMarkdown.split('\\n\\n').map((paragraph, pIdx) => {
                    if (paragraph.startsWith('###')) {
                      return (
                        <h4 key={pIdx} className="text-sm font-black text-white uppercase border-b border-slate-800 pb-2 pt-4 flex items-center gap-2">
                          <span className="w-1.5 h-4 bg-cyan-500 rounded-sm inline-block"></span>
                          {paragraph.replace('###', '').trim()}
                        </h4>
                      );
                    }
                    if (paragraph.startsWith('-') || paragraph.startsWith('*') || /^\\d\\./.test(paragraph)) {
                      return (
                        <ul key={pIdx} className="space-y-2 pl-2">
                          {paragraph.split('\\n').map((item, itemIdx) => (
                            <li key={itemIdx} className="flex items-start gap-2">
                              <span className="text-cyan-500 mt-1 shrink-0">•</span>
                              <span className="text-slate-300">{item.replace(/^-\\s*|^\\*\\s*|^\\d\\.\\s*/, '').trim()}</span>
                            </li>
                          ))}
                        </ul>
                      );
                    }
                    return <p key={pIdx} className="text-slate-300 bg-slate-900/50 p-4 rounded-xl border border-slate-800/50 shadow-inner">{paragraph}</p>;
                  })}
                </div>
              </div>

              <div className="pt-8 border-t border-slate-800 mt-8 flex justify-end">
                <button
                  onClick={() => setShowLearnMore(false)}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-lg transition-colors flex items-center gap-2"
                >
                  <ArrowRight size={14} /> Return to Tutorial
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
`

fs.writeFileSync('src/components/InteractiveTutorial.tsx', code);
