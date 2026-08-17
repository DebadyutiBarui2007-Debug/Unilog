import React, { useState, useEffect, useRef } from 'react';
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
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number; placement: 'top' | 'bottom' | 'right' | 'left' | 'center' }>({ top: 0, left: 0, placement: 'center' });
  const [isElementVisible, setIsElementVisible] = useState(true);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const tutorialSteps: TutorialStep[] = [
    {
      id: 1,
      title: "1. Unilog Product Intelligence Suite",
      description: "Welcome to the guided onboarding! We will walk you through the primary features and capabilities. Follow the glowing highlighted regions and interact with the elements. We will explore every tab in detail.",
      expectedActionMessage: "Click 'Start Hands-on Tour' to begin the walk-through.",
      simulateAction: () => {},
      learnMoreTitle: "Master Data Management (MDM) & ETIM 9.0",
      learnMoreMarkdown: `### The Master Data Management Problem in MRO
Industrial distributors deal with billions of SKU descriptions originating from thousands of different manufacturers. These raw strings are loaded with abbreviations, OCR errors, and unstructured specifications.

### How Unilog Resolves This:
1. **Multi-Pass Neural Classification**: We utilize custom-tuned LLMs (Gemini 3.6 Flash) as semantic categorizers.
2. **Taxonomy Encoding (UNSPSC)**: Automatically maps items up to Level 4 Commodity depth.
3. **ETIM & GS1 Attribute Standardization**: Extracts granular values like *Pressure*, *Thread Size*, etc.`,
    },
    {
      id: 2,
      title: "2. Pipeline: Load Industrial Samples",
      elementId: "preset-samples-container",
      tabRequirement: "pipeline",
      description: "The Pipeline is where individual SKUs are processed. Distributors feed raw, noisy catalog sheets here. Try loading a sample.",
      expectedActionMessage: "Click on any industrial preset button (e.g. 'Parker Valve') below.",
      simulateAction: () => { setInput("Parker 1/2 in brass ball valve NPT female 600 PSI WOG 200 WSP forged body B505 alloy"); },
      learnMoreTitle: "Why Is Raw Ingestion Difficult?",
      learnMoreMarkdown: `### The Complexity of Industrial Nomenclature
Unlike retail commodities, industrial products are specified by multiple mathematical and physical formulas.

### Why Simple Keyword Matchers Fail:
- **String Delimiters**: A slash (/) can represent completely different parameters.
- **Context-Sensitive Measurements**: 1/2 in could be pipe size, shank diameter, etc.`,
    },
    {
      id: 3,
      title: "3. Pipeline: Raw Supplier Input",
      elementId: "pipeline-raw-input",
      tabRequirement: "pipeline",
      description: "This is the primary ingestion area. You can dump unstructured specs or copy-paste from ERPs directly into this buffer.",
      expectedActionMessage: "Review the raw supplier input textarea.",
      simulateAction: () => { setInput("Goulds 1/2HP 115V Submersible Sump Pump 3887NO 50 GPM 1-1/2 discharge cast iron"); },
      learnMoreTitle: "Text Processing Pre-conditions",
      learnMoreMarkdown: `### Raw Input Sanitation
The raw input parser automatically strips control characters, formats nested lines, and prepares the payload for tokenized analysis by the Gemini pipeline.`,
    },
    {
      id: 4,
      title: "4. Pipeline: Run Enrichment",
      elementId: "execute-enrich-btn",
      tabRequirement: "pipeline",
      description: "Trigger the enrichment engine! Click the 'Run Pipeline' button to send the text to our Gemini 3.6 Flash categorizer.",
      expectedActionMessage: "Click the pulsing 'Run Pipeline' button in the header bar.",
      simulateAction: () => { handleEnrich(); },
      learnMoreTitle: "Gemini 3.6 Flash Parse Engine",
      learnMoreMarkdown: `### High-Fidelity Extraction Pipeline
The system orchestrates a multi-step semantic translation:
1. **JSON Schema Enforcement**: Processed with strict constraints.
2. **RAG Taxonomy Alignment**: Standardizing classification.
3. **Calculated Confidence**: Scoring each output vector based on token probabilities.`,
    },
    {
      id: 5,
      title: "5. Pipeline: Interactive Catalog Form",
      elementId: "catalog-form-container",
      tabRequirement: "pipeline",
      description: "After processing, the extracted values populate this interactive form. Data librarians can manually override any AI-extracted attribute here if needed.",
      expectedActionMessage: "Review the populated Master Catalog Record form on the right.",
      simulateAction: () => {},
      learnMoreTitle: "Human-in-the-loop Editing",
      learnMoreMarkdown: `### Interactive Overrides
Users can correct misidentified attributes. Any manual changes are logged in the audit trail, ensuring traceability. The schema enforces standard data types automatically.`,
    },
    {
      id: 6,
      title: "6. Pipeline: Expert Rationale",
      elementId: "expert-rationale-container",
      tabRequirement: "pipeline",
      description: "The AI explains its reasoning! The Expert Rationale block details exactly how it determined the category and specifications from the raw string.",
      expectedActionMessage: "Read the AI reasoning block below the form.",
      simulateAction: () => {},
      learnMoreTitle: "Explainable AI (XAI)",
      learnMoreMarkdown: `### Transparent Decision Making
Black-box AI is unacceptable in Master Data. The model outputs a step-by-step chain of thought, explaining how it resolved ambiguous terms to standard ETIM classes.`,
    },
    {
      id: 7,
      title: "7. Batch: High-Volume Ingestion",
      elementId: "tab-batch",
      tabRequirement: "batch",
      description: "Let's explore high-volume processing. Switch to the 'Bulk Catalog Batch' tab on the left sidebar.",
      expectedActionMessage: "Click the Bulk Catalog Batch button in the left navigation sidebar.",
      simulateAction: () => { setActiveTab("batch"); },
      learnMoreTitle: "High-Throughput Batch Processing",
      learnMoreMarkdown: `### Scale up to Thousands of SKUs
Distributors process master catalogs via asynchronous jobs. The Bulk Ingestion engine processes parallel streams through specialized worker clusters.`,
    },
    {
      id: 8,
      title: "8. Batch: Quality Statistics",
      elementId: "batch-stats-container",
      tabRequirement: "batch",
      description: "Once a batch is run, these statistics monitor the health of current queues, tracking total rows, confidence average, and auto-approval rates.",
      expectedActionMessage: "Review the quality statistics metrics dashboard cards.",
      simulateAction: () => {},
      learnMoreTitle: "Batch Performance Metrics",
      learnMoreMarkdown: `### Confidence and Validation Thresholds
Metrics are computed in real-time as background threads complete parsing steps. Items exceeding the confidence threshold are routed automatically to master tables.`,
    },
    {
      id: 9,
      title: "9. History: Traceability Logs",
      elementId: "tab-history",
      tabRequirement: "history",
      description: "Governance requires proof. Switch to the 'Traceability Audit Logs' tab to inspect the immutable ledger of all system modifications and AI actions.",
      expectedActionMessage: "Click 'Traceability Audit Logs' in the left navigation sidebar.",
      simulateAction: () => { setActiveTab("history"); },
      learnMoreTitle: "Immutable Log Linage",
      learnMoreMarkdown: `### Compliance Auditing
Every enrichment step, model decision path, confidence calculation, and human override is recorded securely with matching timestamps.`,
    },
    {
      id: 10,
      title: "10. AI Tools: Specialized Capabilities",
      elementId: "tab-ai-tools",
      tabRequirement: "ai-tools",
      description: "We offer domain-specific Multi-Modal tools. Switch to the 'Multi-modal AI Tools' tab.",
      expectedActionMessage: "Click 'Multi-modal AI Tools' in the sidebar.",
      simulateAction: () => { setActiveTab("ai-tools"); },
      learnMoreTitle: "Specialized Core Models",
      learnMoreMarkdown: `### Context-Specific Pipelines
Each tool implements specialized prompt systems:
- **Voice Agent**: Transcribes voice recordings of maintenance logs.
- **Grounded Search**: Fetches live manufacturer specs online.
- **Facility Finder**: Coordinates warehouses.
- **Image Studio**: Identifies part numbers from photos.`,
    },
    {
      id: 11,
      title: "11. Market Intelligence & Elasticity Engine",
      elementId: "tab-market-intelligence",
      tabRequirement: "market-intelligence",
      description: "Explore econometric pricing power! The Market Intelligence suite models Price Elasticity of Demand (PED), continuous revenue/profit curves, 4-quadrant strategic matrices, and live Google Search Grounded intelligence.",
      expectedActionMessage: "Click 'Market Intelligence' in the left navigation sidebar.",
      simulateAction: () => { setActiveTab("market-intelligence"); },
      learnMoreTitle: "Econometric Modeling & Microeconomic Theory",
      learnMoreMarkdown: `### The Microeconomic Foundation
In B2B Industrial Distribution, pricing mistakes cost millions. Unilog integrates microeconomic Price Elasticity of Demand (PED):
$$\\varepsilon = -\\frac{\\% \\Delta Q}{\\% \\Delta P} = -\\frac{\\partial Q}{\\partial P} \\times \\frac{P}{Q}$$

### Strategic Value:
1. **Inelastic SKUs ($\\varepsilon < 1$)**: High switching costs & OEM lock-in allow distributors to expand margins without risking volume attrition.
2. **Elastic SKUs ($\\varepsilon > 1$)**: Highly competitive commodities require dynamic indexing to protect market share against spot competitors.`,
    },
    {
      id: 12,
      title: "12. Intelligence: Industrial SKU Benchmarks",
      elementId: "market-preset-skus",
      tabRequirement: "market-intelligence",
      description: "Quick-load real-world industrial SKU benchmarks with pre-calibrated elasticity coefficients—from proprietary Rockwell PLC processors to commodity Grade 8 Fasteners.",
      expectedActionMessage: "Click any SKU chip (e.g., 'Rockwell PLC CPU' or 'SKF Bearing') in the ribbon.",
      simulateAction: () => {},
      learnMoreTitle: "Catalog SKU Archetypes & Elasticity Calibration",
      learnMoreMarkdown: `### Calibrated Industrial Archetypes
- **Rockwell 1756-L83E CPU** ($\\varepsilon = 0.42$): Mission-critical automation controller with proprietary ecosystem lock-in.
- **SKF 6205-2RSH Bearing** ($\\varepsilon = 1.15$): Precision bearing with brand preference but viable alternatives from NSK/FAG.
- **Parker 1/2\\" Brass Valve** ($\\varepsilon = 0.78$): Critical fluid control assembly with medium switching friction.
- **Festo DSNU Cylinder** ($\\varepsilon = 1.35$): Pneumatic actuator facing direct interchangeable catalog competition.
- **Grade 8 Hex Cap Screws** ($\\varepsilon = 2.40$): High-velocity fungible commodity vulnerable to spot price shopping.`,
    },
    {
      id: 13,
      title: "13. Intelligence: Real-Time KPI HUD",
      elementId: "market-kpi-hud",
      tabRequirement: "market-intelligence",
      description: "The Executive KPI HUD calculates real-time profit optimization metrics: Baseline Unit Price ($P_0$), AI Optimal Price ($P^*$), Profit Maximization Delta ($+\\Delta\\Pi$), and Elasticity Coefficient ($\\varepsilon$).",
      expectedActionMessage: "Review the 4 real-time KPI metric cards at the top.",
      simulateAction: () => { document.getElementById('market-subtab-curves')?.click(); },
      learnMoreTitle: "Profit Maximization Mathematical Proof",
      learnMoreMarkdown: `### Optimization Target ($P^*$)
The engine calculates Total Profit $\\Pi(P) = (P - c) \\cdot Q(P)$, where $c$ is the Unit COGS.

At the profit-maximizing peak:
$$\\frac{d\\Pi}{dP} = Q(P) + (P - c)\\frac{dQ}{dP} = 0$$

$$\\implies P^* = \\frac{\\varepsilon}{\\varepsilon - 1} \\cdot c \\quad (\\text{for } \\varepsilon > 1)$$

The HUD calculates whether your current pricing is below or above this optimal profit frontier!`,
    },
    {
      id: 14,
      title: "14. Intelligence: Dynamic HUD Sliders",
      elementId: "market-ped-sliders",
      tabRequirement: "market-intelligence",
      description: "Experiment in real-time! Adjust Baseline Price, Unit COGS, Annual Volume, Elasticity ($\\varepsilon$), and Competitor Pressure index to see how curves shift instantly.",
      expectedActionMessage: "Drag any slider in the Elasticity & Cost Parameters HUD on the left.",
      simulateAction: () => { document.getElementById('market-subtab-curves')?.click(); },
      learnMoreTitle: "Real-Time Sensitivity Testing",
      learnMoreMarkdown: `### Interactive Parametric Modeling
Distributor pricing teams can run instant 'what-if' analyses:
- What happens to gross profit if raw material COGS rises 12%?
- If competitor pressure jumps to 85%, how much volume will we surrender at current price?
- Can we safely execute a 5% margin increase without triggering customer attrition?`,
    },
    {
      id: 15,
      title: "15. Intelligence: Profit Optimization Curves",
      elementId: "market-price-curves-chart",
      tabRequirement: "market-intelligence",
      description: "Dual-axis econometric visualization charting continuous Gross Revenue ($k), Gross Profit ($k), and Quantity Demand across the price spectrum, marking the optimal $P^*$ peak.",
      expectedActionMessage: "Examine the interactive Area and Line charts.",
      simulateAction: () => { document.getElementById('market-subtab-curves')?.click(); },
      learnMoreTitle: "Dual-Axis Visualization Architecture",
      learnMoreMarkdown: `### Interpreting the Visual Curves
- **Emerald Green Area**: Gross Profit ($\\\\Pi$). The vertical peak highlights the mathematical profit apex ($P^*$).
- **Indigo Area**: Gross Top-line Revenue ($R = P \\times Q$).
- **Purple Line**: Downward-sloping Demand Curve ($Q(P)$).
- **Amber Dotted Line**: Current baseline price ($P_0$), showing exactly where you are operating today relative to the optimal frontier.`,
    },
    {
      id: 16,
      title: "16. Intelligence: 4-Quadrant Elasticity Matrix",
      elementId: "market-subtab-matrix",
      tabRequirement: "market-intelligence",
      description: "Switch to the 4-Quadrant Elasticity Matrix! It categorizes catalog items into Strategic Moat, Differentiated Precision, Essential MRO Staple, and Fungible Commodity.",
      expectedActionMessage: "Click the '4-Quadrant Matrix' sub-tab button.",
      simulateAction: () => { document.getElementById('market-subtab-matrix')?.click(); },
      learnMoreTitle: "The Industrial 4-Quadrant Framework",
      learnMoreMarkdown: `### Strategic Matrix Categorization
1. **Quadrant I: Strategic Moat** (High Margin • $\\varepsilon < 1$): Proprietary OEM systems. Strategy: *Value-based premium pricing & SLA lock-in*.
2. **Quadrant II: Differentiated Precision** (High Margin • $\\varepsilon > 1$): Precision engineered components. Strategy: *Dynamic catalog indexing & volume tiering*.
3. **Quadrant III: Essential MRO Staple** (Low Margin • $\\varepsilon < 1$): Critical valves & gaskets. Strategy: *Cost-plus formula indexing & vendor-managed inventory (VMI)*.
4. **Quadrant IV: Fungible Commodity** (Low Margin • $\\varepsilon > 2$): Fasteners & wiring. Strategy: *Automated programmatic spot-bidding & bulk logistics*.`,
    },
    {
      id: 17,
      title: "17. Intelligence: Sensitivity & Scenario Matrix",
      elementId: "market-subtab-scenarios",
      tabRequirement: "market-intelligence",
      description: "Switch to the Scenario Matrix! Compare 6 discrete pricing strategies (Liquidation, Competitive Penetration, Baseline, AI Optimal, Margin Expansion, Skimming) and export to CSV.",
      expectedActionMessage: "Click the 'Scenario Matrix' sub-tab button.",
      simulateAction: () => { document.getElementById('market-subtab-scenarios')?.click(); },
      learnMoreTitle: "Scenario Planning & CSV Governance",
      learnMoreMarkdown: `### Multi-Scenario Decision Governance
Each scenario models forecasted demand, projected revenue, net profit delta, margin percentages, and empirical risk ratings.

The **Export Scenario CSV** button generates an audit-ready spreadsheet ready for ERP import (SAP, Epicor Prophet 21, Infor) or executive board review.`,
    },
    {
      id: 18,
      title: "18. Intelligence: Live AI Grounded Advisory",
      elementId: "market-subtab-ai",
      tabRequirement: "market-intelligence",
      description: "Switch to Executive AI Advisory! Powered by Gemini 3.6 with real-time Google Search Grounding to scrape distributor catalogs, analyze competitor pricing, and output executive strategies.",
      expectedActionMessage: "Click the 'Executive AI Advisory' sub-tab button.",
      simulateAction: () => { document.getElementById('market-subtab-ai')?.click(); },
      learnMoreTitle: "Google Search Grounding & Executive Persona",
      learnMoreMarkdown: `### Live Web Grounding Intelligence
- **Live Competitor Scraping**: Queries Grainger, McMaster-Carr, Motion Industries, and RS Components in real time.
- **Supply Chain Risk Signals**: Tracks lead times, tariff impacts, and component shortages.
- **30+ Year C-Level Executive Advisory**: Generates actionable procurement frameworks, margin protection strategies, and negotiation playbooks.`,
    },
    {
      id: 19,
      title: "19. ML Studio: Recursive Baselines",
      elementId: "tab-recursive-ml",
      tabRequirement: "recursive-ml",
      description: "Navigate to the Machine Learning center. Click on the 'Recursive ML & 1K Dataset' tab to inspect self-correcting neural loops.",
      expectedActionMessage: "Click 'Recursive ML & 1K Dataset' tab in the sidebar.",
      simulateAction: () => { setActiveTab("recursive-ml"); },
      learnMoreTitle: "Recursive Self-Correction & Epochs",
      learnMoreMarkdown: `### What is Recursive Learning?
Recursive learning generates structured data, automatically runs validators against it, and feeds anomalies back into its prompt system as negative constraints to self-correct.`,
    },
    {
      id: 20,
      title: "20. Health: System Telemetry",
      elementId: "tab-system-health",
      tabRequirement: "system-health",
      description: "Switch to the 'System Health Dashboard' tab to monitor API latency, model confidence trends, and pipeline throughput.",
      expectedActionMessage: "Click 'System Health Dashboard' in the sidebar.",
      simulateAction: () => { setActiveTab("system-health"); },
      learnMoreTitle: "Air-Gapped Telemetry & Observability",
      learnMoreMarkdown: `### Enterprise Operational Visibility
The dashboard tracks latency and throughput profiling strictly for pipeline monitoring, guaranteeing zero visibility into proprietary training datasets.`,
    },
    {
      id: 21,
      title: "21. Health: Flagged Reviews (SLA)",
      elementId: "pending-flagged-reviews",
      tabRequirement: "system-health",
      description: "The 'Pending Flagged Reviews (Last 24h)' panel tracks low-confidence matches. It allows human operators to quickly review, verify, and resolve anomalies within a 24-hour SLA.",
      expectedActionMessage: "Review the Pending Flagged Reviews panel.",
      simulateAction: () => {},
      learnMoreTitle: "24-Hour SLA Flagged Records Resolution",
      learnMoreMarkdown: `### Resolving AI Anomalies
While the AI auto-approves items with >90% confidence, edge cases are flagged for human validation. The dashboard dynamically filters recent records to keep the ingestion queue unblocked.`,
    },
    {
      id: 22,
      title: "22. Settings: Engine Configuration",
      elementId: "tab-settings",
      tabRequirement: "settings",
      description: "Control your governance pipeline. Switch to the 'Engine Configuration' tab.",
      expectedActionMessage: "Click the 'Engine Configuration' button.",
      simulateAction: () => { setActiveTab("settings"); },
      learnMoreTitle: "System Engine Adjustments",
      learnMoreMarkdown: `### Tailored System Behavior
Set automatic thresholds for validation errors, configure fuzzy match sensitivities, and synchronize with your Master Data repositories.`,
    },
    {
      id: 23,
      title: "23. Profile: Secure Identity",
      elementId: "tab-profile",
      tabRequirement: "profile",
      description: "Keep your workspace hack-proof. Under the 'Security Profile' tab, you can manage active database syncs and link your Google account securely.",
      expectedActionMessage: "Click the 'Security Profile' button.",
      simulateAction: () => { setActiveTab("profile"); },
      learnMoreTitle: "Enterprise Identity & Google Linking",
      learnMoreMarkdown: `### Hack-Proof Identity Integration
The platform implements strict client-side OAuth 2.0 flow mechanisms combined with Firebase APIs to prevent phishing and session hijacking.`,
    },
    {
      id: 24,
      title: "24. Onboarding Completed!",
      description: "Awesome job! You have explored all the powerful tabs and features of the Unilog Product Intelligence Suite, including the newly integrated Econometric Market Intelligence & Elasticity Matrix.",
      expectedActionMessage: "Click 'Finish and Explore' below to start using Unilog.",
      simulateAction: () => {},
      learnMoreTitle: "Next Steps",
      learnMoreMarkdown: `### Recommended Next Steps
1. **Simulate Price Elasticity**: Select industrial SKUs and tune cost/price sliders to find $P^*$.
2. **Review Strategic Matrix**: Position your high-margin vs commodity catalog lines.
3. **Run Batch Processing**: Process 100+ raw strings and track system health!`,
    },
  ];

  const currentStep = tutorialSteps[currentStepIdx];

  useEffect(() => {
    if (currentStep.tabRequirement && activeTab !== currentStep.tabRequirement) {
      setActiveTab(currentStep.tabRequirement);
    }

    // Auto-switch Market Intelligence sub-tabs if the target element belongs to a specific sub-tab
    const timer = setTimeout(() => {
      if (currentStep.elementId === 'market-quadrant-matrix' || currentStep.elementId === 'market-subtab-matrix') {
        document.getElementById('market-subtab-matrix')?.click();
      } else if (currentStep.elementId === 'market-scenario-table' || currentStep.elementId === 'market-subtab-scenarios') {
        document.getElementById('market-subtab-scenarios')?.click();
      } else if (currentStep.elementId === 'market-ai-advisory-container' || currentStep.elementId === 'market-subtab-ai') {
        document.getElementById('market-subtab-ai')?.click();
      } else if (
        currentStep.elementId === 'market-price-curves-chart' || 
        currentStep.elementId === 'market-ped-sliders' || 
        currentStep.elementId === 'market-kpi-hud' ||
        currentStep.elementId === 'market-subtab-curves'
      ) {
        document.getElementById('market-subtab-curves')?.click();
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [currentStepIdx, activeTab]);

  const updateTargetCoordinates = () => {
    if (!currentStep.elementId) {
      setTargetRect(null);
      setIsElementVisible(true);
      setTooltipPos({
        top: Math.max(40, window.innerHeight / 2 - 190),
        left: Math.max(16, window.innerWidth / 2 - 200),
        placement: 'center'
      });
      return;
    }

    const element = document.getElementById(currentStep.elementId);
    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetRect(rect);

      const inViewport = rect.bottom > 40 && rect.top < window.innerHeight - 40;
      setIsElementVisible(inViewport);

      const tooltipWidth = cardRef.current?.offsetWidth || 400;
      const tooltipHeight = cardRef.current?.offsetHeight || 420;

      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const spaceRight = window.innerWidth - rect.right;
      const spaceLeft = rect.left;

      let top = rect.bottom + 14;
      let left = Math.max(16, rect.left + (rect.width / 2) - (tooltipWidth / 2));
      let placement: 'top' | 'bottom' | 'right' | 'left' | 'center' = 'bottom';

      if (spaceBelow < tooltipHeight + 16 && spaceAbove >= tooltipHeight + 16) {
        top = rect.top - tooltipHeight - 14;
        placement = 'top';
      } else if (spaceBelow < tooltipHeight + 16 && spaceRight >= tooltipWidth + 16) {
        top = Math.max(16, rect.top);
        left = rect.right + 14;
        placement = 'right';
      } else if (spaceBelow < tooltipHeight + 16 && spaceLeft >= tooltipWidth + 16) {
        top = Math.max(16, rect.top);
        left = rect.left - tooltipWidth - 14;
        placement = 'left';
      } else if (spaceBelow < tooltipHeight + 16 && spaceAbove < tooltipHeight + 16) {
        if (spaceRight >= tooltipWidth + 16) {
          top = Math.max(16, (window.innerHeight - tooltipHeight) / 2);
          left = rect.right + 14;
          placement = 'right';
        } else if (spaceLeft >= tooltipWidth + 16) {
          top = Math.max(16, (window.innerHeight - tooltipHeight) / 2);
          left = rect.left - tooltipWidth - 14;
          placement = 'left';
        } else {
          top = Math.max(16, (window.innerHeight - tooltipHeight) / 2);
          left = Math.max(16, (window.innerWidth - tooltipWidth) / 2);
          placement = 'center';
        }
      }

      // Clamp within safe viewport borders
      left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));
      top = Math.max(16, Math.min(top, window.innerHeight - tooltipHeight - 16));

      setTooltipPos({ top, left, placement });
    } else {
      setTargetRect(null);
      setIsElementVisible(true);
      setTooltipPos({
        top: Math.max(40, window.innerHeight / 2 - 190),
        left: Math.max(16, window.innerWidth / 2 - 200),
        placement: 'center'
      });
    }
  };

  // High-performance real-time scroll and resize tracking
  useEffect(() => {
    let animationFrameId: number;

    const handleScrollOrResize = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(updateTargetCoordinates);
    };

    window.addEventListener('resize', handleScrollOrResize, { passive: true });
    window.addEventListener('scroll', handleScrollOrResize, { capture: true, passive: true });

    // Initial check
    updateTargetCoordinates();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, { capture: true });
    };
  }, [currentStepIdx, currentStep.elementId]);

  // Smooth scroll into view when changing steps
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep.elementId) {
        const element = document.getElementById(currentStep.elementId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      updateTargetCoordinates();
    }, 120);

    return () => clearTimeout(timer);
  }, [currentStepIdx, activeTab]);

  const scrollToCurrentElement = () => {
    if (currentStep.elementId) {
      const element = document.getElementById(currentStep.elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(updateTargetCoordinates, 250);
      }
    }
  };

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

  const hasTarget = Boolean(currentStep.elementId && targetRect);

  return (
    <div className="fixed inset-0 z-[60] pointer-events-none font-mono">
      {/* Background layer: NO BLUR. Only subtle clear dim on intro/outro, fully transparent on element explanations */}
      {!hasTarget ? (
        <div className="absolute inset-0 bg-[#060913]/40 pointer-events-none transition-all duration-300" />
      ) : (
        <div className="absolute inset-0 bg-transparent pointer-events-none" />
      )}

      {/* Target Element Spotlight (Tracks scrolling in real-time) */}
      {hasTarget && targetRect && (
        <div
          style={{
            position: 'fixed',
            top: `${targetRect.top - 6}px`,
            left: `${targetRect.left - 6}px`,
            width: `${targetRect.width + 12}px`,
            height: `${targetRect.height + 12}px`,
          }}
          className="border-2 border-cyan-400 rounded-xl shadow-[0_0_25px_rgba(34,211,238,0.5)] bg-cyan-400/10 pointer-events-none z-[61] transition-[width,height] duration-150 flex items-center justify-center"
        >
          <div className="absolute -bottom-8 right-1/2 translate-x-1/2 text-cyan-950 font-black bg-cyan-400 border border-cyan-200 px-2.5 py-0.5 rounded text-[9px] flex items-center gap-1 uppercase tracking-wider shadow-lg whitespace-nowrap">
            <MousePointerClick size={11} />
            <span>Target Feature</span>
          </div>
        </div>
      )}

      {/* Tutorial Popup Card (Anchored dynamically & moves synchronously with scrolling) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStepIdx}
          ref={cardRef}
          drag
          dragMomentum={false}
          dragConstraints={{ left: -100, top: -100, right: window.innerWidth - 300, bottom: window.innerHeight - 300 }}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          style={{
            position: 'fixed',
            top: `${tooltipPos.top}px`,
            left: `${tooltipPos.left}px`,
          }}
          className={`w-[400px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-32px)] bg-slate-900/95 border border-slate-700 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] z-[62] pointer-events-auto flex flex-col backdrop-blur-none cursor-default overflow-hidden ${
            isLight ? 'bg-white/95 border-blue-600 text-slate-800 shadow-2xl' : 'text-gray-100'
          }`}
        >
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-slate-800 shrink-0 overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStepIdx + 1) / tutorialSteps.length) * 100}%` }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-700/50 p-4 pb-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-cyan-500/20 rounded-lg border border-cyan-500/30">
                <Sparkles className="text-cyan-400" size={15} />
              </div>
              <span className="text-[11px] font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 uppercase tracking-widest">
                Industrial Tour
              </span>
            </div>
            <div className="flex items-center gap-2">
              {!isElementVisible && currentStep.elementId && (
                <button
                  onClick={scrollToCurrentElement}
                  className="text-[9px] bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold px-2 py-0.5 rounded hover:bg-amber-500/30 transition-colors"
                >
                  Scroll to Target
                </button>
              )}
              <span className="text-[10px] text-cyan-300 font-bold bg-cyan-900/40 border border-cyan-800 px-2.5 py-0.5 rounded-full shadow-inner">
                {currentStepIdx + 1} / {tutorialSteps.length}
              </span>
              <button 
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-slate-800"
                title="Exit Tutorial"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 global-scroll-container">
            <h4 className={`text-[14px] font-black tracking-wide leading-tight ${isLight ? 'text-indigo-600' : 'text-white'}`}>
              {currentStep.title}
            </h4>

            <p className={`text-[12px] leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              {currentStep.description}
            </p>
          </div>

          {/* Pinned Action & Controls Footer */}
          <div className={`shrink-0 border-t border-slate-700/50 p-4 space-y-3 ${isLight ? 'bg-slate-50/95 border-slate-200' : 'bg-slate-900/95'}`}>
            {/* Expected Action / Instruction Card */}
            <div className={`bg-slate-800/60 border border-slate-700/80 rounded-xl p-3 shadow-inner ${isLight ? 'bg-white border-slate-200' : ''}`}>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 uppercase font-black mb-1 tracking-wider">
                <CheckCircle2 size={12} /> Expected Action
              </div>
              <div className={`text-[11px] leading-relaxed flex items-start gap-2 ${isLight ? 'text-slate-700' : 'text-slate-200'} font-semibold`}>
                <ArrowRight size={13} className="text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
                <span>{currentStep.expectedActionMessage}</span>
              </div>

              {currentStep.elementId && (
                <button
                  onClick={handleSimulateAndProceed}
                  className="mt-2.5 w-full bg-slate-700/80 hover:bg-slate-600 border border-slate-600/90 text-white py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all shadow-md hover:shadow-lg"
                >
                  <Cpu size={12} className="text-cyan-400" /> Auto-Simulate & Proceed
                </button>
              )}
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => setShowLearnMore(true)}
                className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors px-2 py-1 -ml-2 rounded-lg hover:bg-cyan-500/10"
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
                  <ChevronLeft size={15} />
                </button>
                <button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-[11px] font-bold px-3.5 py-1.5 rounded-lg uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-cyan-500/20 transition-all transform hover:scale-105 active:scale-95"
                >
                  <span>{currentStepIdx === tutorialSteps.length - 1 ? "Finish & Explore" : "Next Step"}</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Deep Dive Modal */}
      <AnimatePresence>
        {showLearnMore && (
          <div className="fixed inset-0 z-[70] bg-[#060913]/80 flex justify-end pointer-events-auto">
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
                  {currentStep.learnMoreMarkdown.split('\n\n').map((paragraph, pIdx) => {
                    if (paragraph.startsWith('###')) {
                      return (
                        <h4 key={pIdx} className="text-sm font-black text-white uppercase border-b border-slate-800 pb-2 pt-4 flex items-center gap-2">
                          <span className="w-1.5 h-4 bg-cyan-500 rounded-sm inline-block"></span>
                          {paragraph.replace('###', '').trim()}
                        </h4>
                      );
                    }
                    if (paragraph.startsWith('-') || paragraph.startsWith('*') || /^\d\./.test(paragraph)) {
                      return (
                        <ul key={pIdx} className="space-y-2 pl-2">
                          {paragraph.split('\n').map((item, itemIdx) => (
                            <li key={itemIdx} className="flex items-start gap-2">
                              <span className="text-cyan-500 mt-1 shrink-0">•</span>
                              <span className="text-slate-300">{item.replace(/^-\s*|^\*\s*|^\d\.\s*/, '').trim()}</span>
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
