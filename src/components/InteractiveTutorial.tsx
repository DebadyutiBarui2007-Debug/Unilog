import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, BookOpen, ChevronRight, ChevronLeft, X, Check, HelpCircle, 
  Database, Layers, ShieldCheck, BrainCircuit, Play, ArrowRight, Info,
  Lightbulb, Cpu, FileSpreadsheet, Settings, Terminal, MousePointerClick, CheckCircle2
} from 'lucide-react';

interface InteractiveTutorialProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  setInput: (text: string) => void;
  handleEnrich: () => void;
  setPipelineViewMode: (mode: 'split' | 'comparison') => void;
  setShowCatalogModal: (show: boolean) => void;
  onClose: () => void;
  isLight?: boolean;
}

interface TutorialStep {
  id: number;
  title: string;
  elementId?: string; // Target selector for visual focus helper
  description: string;
  expectedActionMessage: string;
  tabRequirement?: string; // Tab that needs to be active for this element to exist
  simulateAction: () => void;
  learnMoreTitle: string;
  learnMoreMarkdown: string;
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
      learnMoreMarkdown: `### The Master Data Management Problem in MRO
Industrial distributors deal with billions of SKU descriptions originating from thousands of different manufacturers. These raw strings are loaded with abbreviations, OCR errors, and unstructured specifications.

### How Unilog Resolves This:
1. **Multi-Pass Neural Classification**: We utilize custom-tuned LLMs (Gemini 3.6 Flash) as semantic categorizers to route raw text to specific physical asset domains.
2. **Taxonomy Encoding (UNSPSC)**: Automatically maps items to the United Nations Standard Products and Services Code (UNSPSC) up to Level 4 Commodity depth.
3. **ETIM & GS1 Attribute Standardization**: Extracts granular values like *Pressure*, *Thread Size*, *Body Material*, and *Connection Type* and maps them against strict standard lists.`,
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
      learnMoreMarkdown: `### The Complexity of Industrial Nomenclature
Unlike standard B2C retail commodities, industrial products are specified by multiple mathematical, physical, and chemical formulas. 

### Why Simple Keyword Matchers Fail:
- **String Delimiters**: A slash (\`/\`), hyphen (\`-\`), or space can represent completely different parameters depending on whether it lies next to an integer or abbreviation.
- **Context-Sensitive Measurements**: The term \`1/2 in\` could represent pipe nominal size, shank diameter, port width, or keyway dimension. 
- **Non-Standardized Abbreviations**: Manufacturers describe the same material as \`BRS\`, \`BRASS\`, \`BRZ\`, \`BR\`, or \`Alloy 360\`.`,
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
      learnMoreMarkdown: `### Raw Input Sanitation
The raw input parser automatically strips control characters, formats nested lines, and prepares the payload for tokenized analysis by the Gemini pipeline.`,
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
      learnMoreMarkdown: `### Real-time High-Fidelity Extraction Pipeline
When you trigger the enrichment pipeline, the system orchestrates a multi-step semantic translation:

1. **JSON Schema Enforcement**: The unstructured input is processed with schema constraints matching our TypeScript definitions.
2. **RAG Taxonomy Alignment**: Standardizing classification using pre-cached lists of values (LOV).
3. **Calculated Confidence**: Scoring each output vector based on token probabilities, enabling automatic ingestion of high-scoring items (above threshold).`,
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
      learnMoreMarkdown: `### Granular Execution Feedback\nInstead of a generic loading spinner, the UI steps sequentially through actual pipeline phases.\n\n### LRU-style In-Memory Caching\nWe implemented an air-gapped \`Map\`-based caching layer on the server (24h TTL). Redundant inferences (exact same manufacturer descriptions) return instantly, bypassing the model entirely and saving compute cycles, while maintaining strict data isolation (zero persistence in databases).`,
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
      learnMoreMarkdown: `### Human-in-the-Loop Side-by-Side Governance
High-volume industrial systems require rigorous diagnostic dashboards. The Side-by-Side Comparison interface allows Master Data Librarians to:

1. **Verify Lineage**: Trace every standardized property back to the exact substring in the supplier raw data sheet.
2. **Contrast Multi-Model Outputs**: Contrast output from different neural checkpoints (e.g., \`v3.1-recursive-baseline\` vs \`v3.4-recursive-ft\`).
3. **Measure Token Recall**: Observe OCR alignment and highlight structural mismatches directly to prevent corrupt catalog writes.`,
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
      learnMoreMarkdown: `### High-Efficiency Workspace
By displaying the input buffer on the left and the interactive form schema on the right, data librarians can rapidly view and patch AI extraction faults.`,
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
      learnMoreMarkdown: `### Scale up to Thousands of SKUs
Distributors process master catalogs via asynchronous jobs. The Bulk Ingestion engine processes parallel streams through specialized worker clusters.`,
    },
    {
      id: 9,
      title: "9. Batch Processing Quality Stats",
      elementId: "batch-stats-container",
      tabRequirement: "batch",
      description: "These statistics monitor the health of current batch queues, tracking total rows, confidence average, and auto-approval rates.",
      expectedActionMessage: "Review the quality statistics metrics dashboard cards.",
      simulateAction: () => {},
      learnMoreTitle: "Batch Performance Metrics",
      learnMoreMarkdown: `### Confidence and Validation Thresholds
Metrics are computed in real-time as background threads complete parsing steps. Items exceeding the confidence threshold are routed automatically to master tables.`,
    },
    {
      id: 10,
      title: "10. Add Custom Rows to Batch Queue",
      elementId: "batch-add-rows-btn",
      tabRequirement: "batch",
      description: "Add a blank row to our staging table. Click the highlighted 'Add Custom Row' button below.",
      expectedActionMessage: "Click 'Add Custom Row' button.",
      simulateAction: () => {
        const btn = document.getElementById("batch-add-rows-btn");
        if (btn) (btn as HTMLButtonElement).click();
      },
      learnMoreTitle: "Flexible Table Overrides",
      learnMoreMarkdown: `### Manual Record Appending
Allows master data librarians to manually append sparse rows or mock records to test parser robustness against unique configurations.`,
    },
    {
      id: 11,
      title: "11. Execute Batch Processing Job",
      elementId: "batch-run-pipeline-btn",
      tabRequirement: "batch",
      description: "Trigger the bulk processing thread! Click the highlighted 'Run Bulk AI Ingestion' button to begin parallel enrichment.",
      expectedActionMessage: "Click the blue 'Run Bulk AI Ingestion' button.",
      simulateAction: () => {
        const btn = document.getElementById("batch-run-pipeline-btn");
        if (btn) (btn as HTMLButtonElement).click();
      },
      learnMoreTitle: "Queue Workers & Load Distribution",
      learnMoreMarkdown: `### Worker Queue Threading
The batch engine queues lines of the table and issues batch requests to the Gemini API, tracking token limits and preventing rate overrides.`,
    },
    {
      id: 12,
      title: "12. Export Normalized Specifications",
      elementId: "batch-export-csv-btn",
      tabRequirement: "batch",
      description: "Once processed, export the schema! Click the highlighted 'Export Master Specs' button to download a standardized CSV catalog ready for ERP ingestion.",
      expectedActionMessage: "Click the emerald 'Export Master Specs' button.",
      simulateAction: () => {
        const btn = document.getElementById("batch-export-csv-btn");
        if (btn) (btn as HTMLButtonElement).click();
      },
      learnMoreTitle: "Standardized Output Schema",
      learnMoreMarkdown: `### System Interoperability
The CSV export maps fully into standard taxonomy formats (ETIM/UNSPSC) guaranteeing perfect compliance when writing to SAP, Oracle, or custom PIM portals.`,
    },
    {
      id: 13,
      title: "13. Traceability Audit Trails",
      elementId: "tab-history",
      tabRequirement: "history",
      description: "Governance requires proof. Switch to the 'Traceability Audit Logs' tab on the left sidebar to inspect the immutable ledger of modifications.",
      expectedActionMessage: "Click 'Traceability Audit Logs' in the left navigation sidebar.",
      simulateAction: () => {
        setActiveTab("history");
      },
      learnMoreTitle: "Immutable Log Linage",
      learnMoreMarkdown: `### Compliance Auditing
Every enrichment step, model decision path, confidence calculation, and human override is recorded securely with matching timestamps.`,
    },
    {
      id: 14,
      title: "14. Multi-modal AI Tools",
      elementId: "tab-ai-tools",
      tabRequirement: "ai-tools",
      description: "Unlock advanced catalog capabilities. Switch to the 'Multi-modal AI Tools' tab on the left sidebar.",
      expectedActionMessage: "Click 'Multi-modal AI Tools' in the left navigation sidebar.",
      simulateAction: () => {
        setActiveTab("ai-tools");
      },
      learnMoreTitle: "Multi-modal Enterprise Utilities",
      learnMoreMarkdown: `### Expanding Beyond Text
Industrial metadata resides in audio tapes, field images, hand-drawn blueprints, and localized facility maps. The Multi-modal platform provides unified access to these contexts.`,
    },
    {
      id: 15,
      title: "15. Select Active AI Utility Tool",
      elementId: "ai-tools-switcher",
      tabRequirement: "ai-tools",
      description: "Toggle through our specialized Multi-modal tools: Voice Agent, Grounded Search, Facility Finder, and Image Studio.",
      expectedActionMessage: "Review the highlighted multi-modal tool tab options.",
      simulateAction: () => {},
      learnMoreTitle: "Specialized Core Models",
      learnMoreMarkdown: `### Context-Specific Pipelines
Each tool implements specialized prompt systems:
- **Voice Agent**: Transcribes voice recordings of maintenance logs.
- **Grounded Search**: Fetches live manufacturer specifications online.
- **Facility Finder**: Coordinates warehouses using location mappings.
- **Image Studio**: Identifies part numbers from hardware photographs.`,
    },
    {
      id: 16,
      title: "16. Recursive Learning Studio & Baselines",
      elementId: "tab-recursive-ml",
      tabRequirement: "recursive-ml",
      description: "Navigate to our Machine Learning center. Click on the highlighted 'Recursive ML & 1K Dataset' navigation button in the left sidebar.",
      expectedActionMessage: "Click 'Recursive ML & 1K Dataset' tab in the sidebar.",
      simulateAction: () => {
        setActiveTab("recursive-ml");
      },
      learnMoreTitle: "Recursive Self-Correction & Epoch Validation Loop",
      learnMoreMarkdown: `### What is Recursive Learning?
Recursive learning is an advanced architecture where the model generates structured data, automatically runs validators against it (such as length boundaries, uppercase rules, and LOV matchers), and feeds the discovered anomalies back into its own prompt system as negative constraints.

### Key Capabilities:
- **Baseline Report**: Running 1,000+ catalog items through the pipeline to output a comprehensive accuracy and compliance audit report.
- **Checkpoints Registry**: Instantly roll back, activate, or compare performance across multiple training checkpoints.`,
    },
    {
      id: 17,
      title: "17. Establish Performance Baselines",
      elementId: "validate-baseline-btn",
      tabRequirement: "recursive-ml",
      description: "Run our self-correction validation script. Click the highlighted 'Validate Baseline Script' button to benchmark model recall across 1,000 catalog entries.",
      expectedActionMessage: "Click the green 'Validate Baseline Script' button inside the workbench panel.",
      simulateAction: () => {
        const btn = document.getElementById("validate-baseline-btn");
        if (btn) {
          (btn as HTMLButtonElement).click();
        }
      },
      learnMoreTitle: "Iterative Validation Runs",
      learnMoreMarkdown: `### Accuracy Benchmarking
Establishing performance baselines guarantees that subsequent re-training passes enhance accuracy metrics without regressing previously established catalog alignments.`,
    },
    {
      id: 18,
      title: "18. Monitor System Telemetry",
      elementId: "tab-system-health",
      tabRequirement: "system-health",
      description: "Ensure enterprise-grade operational visibility. Switch to the 'System Health Dashboard' tab on the left sidebar to monitor API latency, model confidence trends, and enrichment throughput.",
      expectedActionMessage: "Click 'System Health Dashboard' in the left navigation sidebar.",
      simulateAction: () => {
        setActiveTab("system-health");
      },
      learnMoreTitle: "Air-Gapped Telemetry & Observability",
      learnMoreMarkdown: `### Enterprise Operational Visibility\nThe System Health Dashboard is engineered strictly for pipeline monitoring and guarantees zero visibility into proprietary training datasets.\nIt tracks:\n- **API Latency & Confidence**: Real-time trends of execution speed and prediction certainty.\n- **Throughput Profiling**: Total items processed per hour without referencing raw MRO descriptions or MPNs.`,
    },
    {
      id: 19,
      title: "19. System Engine Settings",
      elementId: "tab-settings",
      tabRequirement: "settings",
      description: "Control your governance pipeline. Switch to the 'Engine Configuration' tab on the left sidebar.",
      expectedActionMessage: "Click the 'Engine Configuration' button in the sidebar.",
      simulateAction: () => {
        setActiveTab("settings");
      },
      learnMoreTitle: "System Engine Adjustments",
      learnMoreMarkdown: `### Tailored System Behavior
Set automatic thresholds for validation errors, configure fuzzy match sensitivities for major brands, and synchronize with your S3 or Azure Master Data repositories.`,
    },
    {
      id: 20,
      title: "20. Secure Security Profile & Link Google",
      elementId: "tab-profile",
      tabRequirement: "profile",
      description: "Keep your workspace hack-proof. Under the 'Security Profile' tab, you can view your active database sync details, unlink or link your Google account to your email securely, and sign out.",
      expectedActionMessage: "Click the 'Security Profile' button on the left sidebar to access your encryption registry.",
      simulateAction: () => {
        setActiveTab("profile");
      },
      learnMoreTitle: "Enterprise Identity & Google Linking",
      learnMoreMarkdown: `### Hack-Proof Identity Integration
To prevent phishing, session hijacking, and credential leaks, the platform implements strict client-side OAuth 2.0 flow mechanisms combined with direct Firebase link-with-popup APIs.

### Key Security Benefits:
- **Immutable Association**: Association between Google and custom email-password logins is validated by Firebase's serverless OAuth state.
- **Biometric & 2FA Readiness**: Passing Google's gateway automatically binds Google's robust Two-Factor Authentication defenses (Titan keys, phone prompts) onto your custom Unilog session.
- **Automatic Sync**: Any modifications made are securely isolated and persisted automatically in Firestore.`,
    },
    {
      id: 21,
      title: "21. Onboarding Completed Successfully!",
      description: "Awesome job! You have completed the comprehensive guided tour of Unilog Catalog Intelligence Core. You are now fully equipped to parse raw manufacturer sheets, override incorrect metadata, manage model baselines, and configure governance schemas.",
      expectedActionMessage: "Click 'Finish and Explore' below to start using Unilog.",
      simulateAction: () => {},
      learnMoreTitle: "Next Steps to Master Data",
      learnMoreMarkdown: `### Recommended Next Steps
1. **Connect Authentication**: Sign in using Firebase in the header to ensure persistent audit histories and user overrides.
2. **Import Custom Catalogs**: Use Bulk Catalog Batch to process up to 100 raw strings simultaneously.
3. **Fine-tune checkpoints**: Track the recursive learning curves to see loss reductions across epochs.`,
    }
  ];

  const currentStep = tutorialSteps[currentStepIdx];

  // Auto-enforce tab or state prerequisites for the step to ensure elements exist!
  useEffect(() => {
    if (currentStep.tabRequirement && activeTab !== currentStep.tabRequirement) {
      setActiveTab(currentStep.tabRequirement);
    }
  }, [currentStepIdx, activeTab]);

  // Recalculate target element position periodically or on scroll/resize
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

      // Determine clean floating layout positioning for the tooltip card
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const spaceRight = window.innerWidth - rect.right;
      const spaceLeft = rect.left;

      let top = rect.bottom + 14;
      let left = Math.max(16, rect.left + rect.width / 2 - 180);
      let position: 'top' | 'bottom' | 'right' | 'left' | 'center' = 'bottom';

      // If crowded on the bottom, sit on top
      if (spaceBelow < 220 && spaceAbove > 220) {
        top = rect.top - 210;
        position = 'top';
      } else if (spaceRight > 380) {
        // Sit to the right of vertical items (like sidebar tab!)
        top = rect.top + rect.height / 2 - 100;
        left = rect.right + 16;
        position = 'right';
      }

      // Constrain inside viewport boundaries
      left = Math.min(left, window.innerWidth - 380);
      top = Math.min(top, window.innerHeight - 260);

      setTooltipPos({ top, left, position });
    } else {
      // Element not in DOM yet, place floating center
      setTargetRect(null);
      setTooltipPos({
        top: window.innerHeight / 2 - 120,
        left: window.innerWidth / 2 - 190,
        position: 'center'
      });
    }
  };

  useLayoutEffect(() => {
    // Run coordinate update immediately on step change
    setTimeout(updateTargetCoordinates, 80);
  }, [currentStepIdx, activeTab]);

  useEffect(() => {
    window.addEventListener('resize', updateTargetCoordinates);
    window.addEventListener('scroll', updateTargetCoordinates, true);
    
    // Poll position to catch dynamic DOM movements
    const timer = setInterval(updateTargetCoordinates, 300);

    return () => {
      window.removeEventListener('resize', updateTargetCoordinates);
      window.removeEventListener('scroll', updateTargetCoordinates, true);
      clearInterval(timer);
    };
  }, [currentStepIdx]);

  // Handle global click detection to auto-advance if user clicks the real button!
  useEffect(() => {
    if (!currentStep.elementId) return;

    const handleGlobalClick = (e: MouseEvent) => {
      const targetElement = document.getElementById(currentStep.elementId!);
      if (targetElement && (targetElement.contains(e.target as Node) || e.target === targetElement)) {
        // User clicked the actual target element! Play a short delay to let action complete, then advance!
        setTimeout(() => {
          handleNext();
        }, 350);
      }
    };

    document.addEventListener('mousedown', handleGlobalClick);
    return () => {
      document.removeEventListener('mousedown', handleGlobalClick);
    };
  }, [currentStepIdx]);

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
    handleNext();
  };

  return (
    <div className="fixed inset-0 z-40 pointer-events-none font-mono">
      {/* Dimmed Background Overlay with hole cutout using css masking, or simple shadow overlays */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] pointer-events-auto" />

      {/* Spotlight glowing indicator over the active element */}
      {targetRect && (
        <motion.div
          layoutId="tutorialSpotlight"
          initial={false}
          animate={{
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
          }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="fixed border-2 border-indigo-500 rounded-2xl shadow-[0_0_24px_rgba(99,102,241,0.85)] bg-indigo-500/5 animate-pulse pointer-events-none z-50 flex items-center justify-center"
        >
          {/* Animated pointer finger indicating direct interaction */}
          <div className="absolute -bottom-8 right-1/2 translate-x-1/2 text-white font-bold bg-indigo-600 border border-indigo-400 px-2 py-0.5 rounded text-[8px] flex items-center gap-1 uppercase tracking-wider shadow-lg animate-bounce">
            <MousePointerClick size={10} />
            <span>Click Here</span>
          </div>
        </motion.div>
      )}

      {/* Floating Tutorial Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStepIdx}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: 0,
            top: tooltipPos.top,
            left: tooltipPos.left
          }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 25 }}
          className={`fixed w-[360px] max-h-[85vh] overflow-y-auto global-scroll-container bg-[#0E1220] border-2 border-indigo-500 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.8)] p-5 z-50 pointer-events-auto flex flex-col ${
            isLight ? 'bg-white border-blue-600 text-slate-800 shadow-xl' : 'text-gray-100'
          }`}
          style={{ position: 'fixed' }}
        >
          {/* Arrow Indicator depending on position */}
          {tooltipPos.position === 'bottom' && (
            <div className={`absolute -top-2.5 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 border-t-2 border-l-2 border-indigo-500 bg-[#0E1220] ${isLight ? 'bg-white border-blue-600' : ''}`} />
          )}
          {tooltipPos.position === 'top' && (
            <div className={`absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 border-b-2 border-r-2 border-indigo-500 bg-[#0E1220] ${isLight ? 'bg-white border-blue-600' : ''}`} />
          )}
          {tooltipPos.position === 'right' && (
            <div className={`absolute top-[40px] -left-2.5 w-4 h-4 rotate-45 border-b-2 border-l-2 border-indigo-500 bg-[#0E1220] ${isLight ? 'bg-white border-blue-600' : ''}`} />
          )}

          {/* Header */}
          <div className="flex items-center justify-between border-b border-indigo-900/30 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="text-indigo-400 animate-pulse" size={16} />
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                Interactive Expert Guide
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-[9px] text-gray-400 font-bold bg-[#1B2136] px-2 py-0.5 rounded-full">
                {currentStepIdx + 1} / {tutorialSteps.length}
              </span>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-0.5 rounded-lg hover:bg-slate-800/40"
                title="Exit Tutorial"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Title */}
          <h4 className={`text-[12px] font-black mb-2 uppercase tracking-wide ${isLight ? 'text-indigo-600' : 'text-white'}`}>
            {currentStep.title}
          </h4>

          {/* Description */}
          <p className={`text-[11px] leading-relaxed mb-4 ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>
            {currentStep.description}
          </p>

          {/* Objective Action Box */}
          <div className={`bg-[#080B13] border border-[#1B1F30] rounded-xl p-3 mb-4 ${isLight ? 'bg-slate-50 border-slate-200' : ''}`}>
            <div className="flex items-center gap-1.5 text-[9px] text-amber-400 uppercase font-bold mb-1.5">
              <Terminal size={11} /> Guided Objective
            </div>
            <div className={`text-[10px] leading-relaxed flex items-start gap-1.5 ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
              <ArrowRight size={11} className="text-indigo-400 shrink-0 mt-0.5 animate-pulse" />
              <span>{currentStep.expectedActionMessage}</span>
            </div>

            {/* Quick Simulation Option */}
            {currentStep.elementId && (
              <button
                onClick={handleSimulateAndProceed}
                className="mt-2.5 w-full bg-indigo-600 hover:bg-indigo-500 text-white py-1.5 px-3 rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 shadow transition-all"
              >
                <Cpu size={11} /> Simulate Click & Proceed
              </button>
            )}
          </div>

          {/* Navigation & Tech details */}
          <div className="flex items-center justify-between mt-1 pt-3 border-t border-indigo-900/20">
            <button
              onClick={() => setShowLearnMore(true)}
              className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1"
            >
              <Info size={11} />
              Technical Deep Dive
            </button>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrev}
                disabled={currentStepIdx === 0}
                className="p-1 bg-[#171B2B] hover:bg-[#232A44] disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-gray-300"
                title="Previous Step"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={handleNext}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1"
              >
                <span>{currentStepIdx === tutorialSteps.length - 1 ? "Finish" : "Skip"}</span>
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Slide-out Learn More Tech Deep Dive Panel */}
      <AnimatePresence>
        {showLearnMore && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex justify-end pointer-events-auto">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="w-full max-w-lg bg-[#0C0F17] border-l border-indigo-500/40 h-full p-6 flex flex-col justify-between overflow-y-auto text-gray-200"
            >
              <div>
                <div className="flex items-center justify-between border-b border-indigo-900/60 pb-4 mb-4">
                  <div className="flex items-center gap-2.5">
                    <BookOpen size={20} className="text-indigo-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Technical Deep Dive & Spec Log
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowLearnMore(false)}
                    className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                  >
                    <X size={18} />
                  </button>
                </div>

                <h2 className="text-sm font-black text-white uppercase tracking-wide mb-4 text-indigo-300">
                  {currentStep.learnMoreTitle}
                </h2>

                <div className="text-[11px] leading-relaxed space-y-4 font-mono text-gray-300">
                  {currentStep.learnMoreMarkdown.split('\n\n').map((paragraph, pIdx) => {
                    if (paragraph.startsWith('###')) {
                      return (
                        <h4 key={pIdx} className="text-xs font-bold text-white uppercase border-b border-[#1E2333] pb-1 pt-2">
                          {paragraph.replace('###', '').trim()}
                        </h4>
                      );
                    }
                    if (paragraph.startsWith('-') || paragraph.startsWith('*') || paragraph.match(/^\d\./)) {
                      return (
                        <ul key={pIdx} className="list-disc pl-4 space-y-1">
                          {paragraph.split('\n').map((item, itemIdx) => (
                            <li key={itemIdx}>
                              {item.replace(/^-\s*|^\*\s*|^\d\.\s*/, '').trim()}
                            </li>
                          ))}
                        </ul>
                      );
                    }
                    return <p key={pIdx}>{paragraph}</p>;
                  })}
                </div>
              </div>

              <div className="pt-6 border-t border-indigo-900/40 mt-6 flex justify-end">
                <button
                  onClick={() => setShowLearnMore(false)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-lg text-xs uppercase tracking-wider shadow-md"
                >
                  Return to Tutorial
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
