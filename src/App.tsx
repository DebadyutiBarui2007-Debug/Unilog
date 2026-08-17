import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Image as ImageIcon, LogIn, LogOut, CheckCircle, AlertOctagon, Copy, Check, Sparkles, ChevronDown, ChevronRight, ShieldCheck, Database, Layers, GitCompare, Edit2, Plus, Trash2, Save, X, Type, RefreshCw, BrainCircuit, Palette, Search, Filter, BookOpen, HelpCircle, Activity, UserCircle, TrendingUp, Download } from 'lucide-react';
import { exportSingleEnrichmentCSV } from './utils/csvExportUtils';
import AITools from './components/AITools';
import MarketIntelligence from './components/MarketIntelligence';
import BatchProcessing from './components/BatchProcessing';
import SideBySideComparison from './components/SideBySideComparison';
import RecursiveLearningStudio from './components/RecursiveLearningStudio';
import InteractiveTutorial from './components/InteractiveTutorial';
import { AuthGate } from "./components/AuthGate";
import { SystemHealthDashboard } from './components/SystemHealthDashboard';
import { ProfileTab } from './components/ProfileTab';
import { INDUSTRIAL_DATASET_1000, IndustrialCatalogItem } from './data/industrialDataset1000';
import { auth, logout, db, subscribeAuthState } from './firebase';
import { User } from 'firebase/auth';

export type Tab = 'pipeline' | 'batch' | 'history' | 'settings' | 'ai-tools' | 'recursive-ml' | 'system-health' | 'profile' | 'market-intelligence';

interface EnrichmentResult {
  classpath: string;
  unspscCode: string;
  brand: string;
  mpn: string;
  invoiceDesc: string;
  mobileDesc: string;
  productTitle: string;
  longDescription: string;
  confidenceScore: number;
  completenessScore: number;
  attributes: { name: string; value: string; uom?: string }[];
  validationFlags: { rule: string; status: string; details: string }[];
  auditTrail: { step: string; method: string; outputSummary: string; confidence: number }[];
}

const PRESET_PRODUCT_INPUTS = [
  { name: 'Parker Brass Valve', text: 'Parker 1/2 in brass ball valve NPT female 600 PSI WOG 200 WSP forged body' },
  { name: 'Goulds Sump Pump', text: 'Goulds 1/2HP 115V Submersible Sump Pump 3887NO 50 GPM 1-1/2 discharge cast iron' },
  { name: 'Square D Breaker', text: 'Square D QO120 20A single pole circuit breaker 120V 10kAIC plug-in QO series' },
  { name: 'Milwaukee Hammer Drill', text: 'Milwaukee 2804-20 M18 FUEL 1/2 in Hammer Drill Bare Tool Brushless 1200 in-lbs' },
  { name: 'Eaton Safety Switch', text: 'Eaton HD36132 30A 600V 3P Heavy Duty Safety Switch Fused NEMA 1 enclosure' }
];

export default function App() {
  const [theme, setTheme] = useState<'cyber-cobalt' | 'clean-slate' | 'titanium-amber' | 'nordic-frost' | 'matcha-latte'>('cyber-cobalt');
  const [themeToast, setThemeToast] = useState<string | null>(null);

  // 4-second Startup Booting / Loader Animation State
  const [isBooting, setIsBooting] = useState<boolean>(true);
  const [bootProgress, setBootProgress] = useState<number>(0);
  const [bootLogs, setBootLogs] = useState<string[]>([]);
  
  // Interactive Guided Onboarding Tutorial State
  const [showTutorial, setShowTutorial] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Core Neural Network Particles Simulation Loop
  useEffect(() => {
    if (!isBooting) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (canvas) {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    const nodes: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      charge: number;
      label: string;
      color: string;
    }> = [];

    const taxonomies = ["VALVE", "PUMP", "BREAKER", "CONDUIT", "BRASS", "LOV_ETIM", "UNSPSC", "GS1", "MRO"];

    for (let i = 0; i < 65; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        radius: Math.random() * 3 + 1.5,
        charge: Math.random() * 100,
        label: i % 7 === 0 ? taxonomies[Math.floor(Math.random() * taxonomies.length)] : "",
        color: Math.random() > 0.5 ? '#6366F1' : '#14B8A6'
      });
    }

    let mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      if (!ctx || !canvas) return;
      ctx.fillStyle = 'rgba(7, 9, 19, 0.22)';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle grid network lines
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.05)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Update & Draw Nodes
      nodes.forEach((n, idx) => {
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        const dxMouse = n.x - mouse.x;
        const dyMouse = n.y - mouse.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        if (distMouse < 180) {
          n.x -= (dxMouse / distMouse) * 0.8;
          n.y -= (dyMouse / distMouse) * 0.8;

          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(99, 102, 241, ${0.12 * (1 - distMouse / 180)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.fill();

        if (n.label && distMouse < 250) {
          ctx.fillStyle = 'rgba(148, 163, 184, 0.65)';
          ctx.font = '8px monospace';
          ctx.fillText(n.label, n.x + 8, n.y + 3);
        }

        for (let j = idx + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = n.x - n2.x;
          const dy = n.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = `rgba(129, 140, 248, ${0.18 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.55;
            ctx.stroke();
          }
        }
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, [isBooting]);

  // Boot telemetry effect
  useEffect(() => {
    if (!isBooting) return;

    const startTime = Date.now();
    const duration = 4000;

    const systemLogs = [
      "⚙️ [BOOT] Initializing Unilog Product Intelligence Core Kernel...",
      "📦 [SYS] Mounting Master Ingestion Pipeline v4.5 Client Layer...",
      "📚 [DICT] Compiling ETIM 9.0 Standard Attribute Mapping Schema...",
      "📊 [DICT] Indexing GS1 Global Product Dictionary Master Tables (341,200 entities)...",
      "🛡️ [GOV] Parsing UNSPSC V26.0 Multi-Tier Taxonomy Mapping Tree...",
      "🗄️ [SECURE] Synchronizing credentials with Firebase Firestore persistent backend...",
      "🧪 [DATASET] Loading 1,024 High-Fidelity Catalog Benchmark Records...",
      "🤖 [AI-MODEL] Handshaking with Gemini 3.6 Flash Multi-Modal Parse Engine...",
      "🚀 [SYS] Pre-warming prompt templates & structural rule governance trees...",
      "🎯 [BOOT] System Handshake Complete. Initializing Master Operator Console..."
    ];

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(Math.round((elapsed / duration) * 100), 100);
      setBootProgress(pct);

      // Append logs sequentially matching elapsed milestones
      const logIdx = Math.min(Math.floor((elapsed / duration) * systemLogs.length), systemLogs.length - 1);
      setBootLogs(systemLogs.slice(0, logIdx + 1));

      if (elapsed >= duration) {
        clearInterval(timer);
        setTimeout(() => {
          setIsBooting(false);
          // Auto-trigger tutorial unconditionally after loading animation
          setShowTutorial(true);
        }, 150);
      }
    }, 50);

    return () => clearInterval(timer);
  }, []);

  const [isThemeTransitioning, setIsThemeTransitioning] = useState(false);
  const [transitionTarget, setTransitionTarget] = useState<'cyber-cobalt' | 'clean-slate' | 'titanium-amber' | 'nordic-frost' | 'matcha-latte' | null>(null);
  
  const handleThemeChange = (newTheme: 'cyber-cobalt' | 'clean-slate' | 'titanium-amber' | 'nordic-frost' | 'matcha-latte') => {
    if (newTheme === theme) return;
    setTransitionTarget(newTheme);
    setIsThemeTransitioning(true);
    
    // Framer motion fade sequence:
    setTimeout(() => {
      setTheme(newTheme); // underlying theme changes while hidden
      setTimeout(() => {
        setIsThemeTransitioning(false);
        setTransitionTarget(null);
      }, 50);
    }, 300); // Wait 300ms for overlay to fade in completely

    const themeLabels = {
      'cyber-cobalt': 'Cyber Obsidian Dark',
      'clean-slate': 'Executive Light',
      'titanium-amber': 'Titanium Amber Industrial',
      'nordic-frost': 'Nordic Frost',
      'matcha-latte': 'Matcha Latte'
    };
    setThemeToast(themeLabels[newTheme]);
    setTimeout(() => setThemeToast(null), 2200);
  };
  const [input, setInput] = useState(PRESET_PRODUCT_INPUTS[0].text);
  const [loading, setLoading] = useState(false);
  const [pipelineStage, setPipelineStage] = useState('');
  const [pipelineProgress, setPipelineProgress] = useState(0);
  const [result, setResult] = useState<EnrichmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('pipeline');
  const [user, setUser] = useState<User | null>(null);
  const [authSkipped, setAuthSkipped] = useState(false);
  const [copiedUnspsc, setCopiedUnspsc] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<'PENDING' | 'APPROVED' | 'FLAGGED'>('PENDING');
  const [showAuditTrail, setShowAuditTrail] = useState(true);
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);
  const [pipelineViewMode, setPipelineViewMode] = useState<'split' | 'comparison'>('split');

  // 1,024 Catalog Dataset Picker State
  const [showCatalogModal, setShowCatalogModal] = useState<boolean>(false);
  const [catalogSectorFilter, setCatalogSectorFilter] = useState<string>('All');
  const [catalogSearchQuery, setCatalogSearchQuery] = useState<string>('');
  const [activeModelCheckpoint, setActiveModelCheckpoint] = useState<string>('v3.4-recursive-1000plus-ft');

  // Bulk Edit Attributes State
  const [isBulkEditingAttrs, setIsBulkEditingAttrs] = useState(false);
  const [editableAttrs, setEditableAttrs] = useState<{ name: string; value: string; uom?: string }[]>([]);

  const handleStartBulkEditAttrs = () => {
    if (result?.attributes) {
      setEditableAttrs(result.attributes.map(a => ({ ...a })));
      setIsBulkEditingAttrs(true);
    }
  };

  const handleAttrChange = (index: number, field: 'name' | 'value' | 'uom', val: string) => {
    setEditableAttrs(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  const handleAddAttrRow = () => {
    setEditableAttrs(prev => [...prev, { name: 'SPEC_ATTRIBUTE', value: '', uom: 'TEXT' }]);
  };

  const handleRemoveAttrRow = (index: number) => {
    setEditableAttrs(prev => prev.filter((_, i) => i !== index));
  };

  const handleUppercaseAllAttrs = () => {
    setEditableAttrs(prev => prev.map(a => ({ ...a, value: a.value.toUpperCase() })));
  };

  const handleClearEmptyAttrs = () => {
    setEditableAttrs(prev => prev.filter(a => a.name.trim() !== '' && a.value.trim() !== ''));
  };

  const handleSaveBulkEditAttrs = (updated?: { name: string; value: string; uom?: string }[]) => {
    const finalAttrs = updated || editableAttrs;
    if (!result) return;
    
    const updatedAuditTrail = [
      ...(result.auditTrail || []),
      {
        step: 'Human Governance Override',
        method: 'Manual Attribute Bulk Edit',
        outputSummary: `Bulk updated ${finalAttrs.length} attribute specifications prior to approval.`,
        confidence: 1.0
      }
    ];

    setResult({
      ...result,
      attributes: finalAttrs,
      auditTrail: updatedAuditTrail
    });
    setIsBulkEditingAttrs(false);
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 3000);
  };

  // Theme Styling Helpers
  const isLight = theme === 'clean-slate' || theme === 'matcha-latte';
  const isAmber = theme === 'titanium-amber';
  const isNordic = theme === 'nordic-frost';
  const isMatcha = theme === 'matcha-latte';
  
  // Overlay Helper for smooth cross-fade
  const tTheme = transitionTarget || theme;
  const overlayBg = tTheme === 'matcha-latte' ? 'bg-[#F4F7F4]' : tTheme === 'nordic-frost' ? 'bg-[#ECEFF4]' : tTheme === 'clean-slate' ? 'bg-[#F8FAFC]' : tTheme === 'titanium-amber' ? 'bg-[#101114]' : 'bg-[#0A0D14]';

  const themeStyles = {
    bg: isMatcha ? 'bg-[#F4F7F4] text-slate-800' : isNordic ? 'bg-[#ECEFF4] text-[#2E3440]' : isLight ? 'bg-[#F8FAFC] text-slate-800' : isAmber ? 'bg-[#101114] text-gray-200' : 'bg-[#0A0D14] text-gray-200',
    headerBg: isMatcha ? 'bg-[#E8EDE8] border-[#D1DDD1] text-slate-900 shadow-sm' : isNordic ? 'bg-[#E5E9F0] border-[#D8DEE9] text-[#2E3440] shadow-sm' : isLight ? 'bg-white border-slate-200 text-slate-900 shadow-sm' : isAmber ? 'bg-[#18191E] border-[#2A2D35] text-white' : 'bg-[#0F131E] border-[#1E2638] text-white',
    cardBg: isMatcha ? 'bg-white border-[#D1DDD1] text-slate-800 shadow-sm' : isNordic ? 'bg-[#ECEFF4] border-[#D8DEE9] text-[#3B4252] shadow-sm' : isLight ? 'bg-white border-slate-200 text-slate-800 shadow-sm' : isAmber ? 'bg-[#1A1C22] border-[#2B2E38]' : 'bg-[#121622] border-[#1E2638]',
    innerBg: isMatcha ? 'bg-[#F9FAF9] border-[#D1DDD1] text-slate-900' : isNordic ? 'bg-[#FFFFFF] border-[#D8DEE9] text-[#2E3440]' : isLight ? 'bg-[#F1F5F9] border-slate-200 text-slate-900' : isAmber ? 'bg-[#111216] border-[#2B2E38] text-white' : 'bg-[#0A0D14] border-[#1E2638] text-white',
    textMain: isMatcha ? 'text-slate-900' : isNordic ? 'text-[#2E3440]' : isLight ? 'text-slate-900' : 'text-white',
    textMuted: isMatcha ? 'text-slate-500' : isNordic ? 'text-[#4C566A]' : isLight ? 'text-slate-500' : 'text-gray-400',
    accentBtn: isMatcha ? 'bg-[#6D9F71] hover:bg-[#5C8960] text-white shadow-sm' : isNordic ? 'bg-[#5E81AC] hover:bg-[#81A1C1] text-white shadow-sm' : isLight ? 'bg-blue-600 hover:bg-blue-700 text-white' : isAmber ? 'bg-amber-500 hover:bg-amber-600 text-black font-bold' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.4)]',
    accentText: isMatcha ? 'text-[#6D9F71]' : isNordic ? 'text-[#5E81AC]' : isLight ? 'text-blue-600' : isAmber ? 'text-amber-400' : 'text-blue-400',
    accentBorder: isMatcha ? 'border-[#6D9F71]' : isNordic ? 'border-[#5E81AC]' : isLight ? 'border-blue-600' : isAmber ? 'border-amber-500' : 'border-blue-500',
    navBg: isMatcha ? 'bg-[#E8EDE8] border-[#D1DDD1]' : isNordic ? 'bg-[#E5E9F0] border-[#D8DEE9]' : isLight ? 'bg-slate-100 border-slate-200' : isAmber ? 'bg-[#131418] border-[#2B2E38]' : 'bg-[#0B0E17] border-[#1E2638]'
  };

  // Settings State
  const [autoApproveScore, setAutoApproveScore] = useState('95');
  const [fuzzyMatchSensitivity, setFuzzyMatchSensitivity] = useState('80');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = subscribeAuthState((currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setAuthSkipped(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setPipelineStage('Running Vision OCR analysis on uploaded datasheet/photo...');
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64 = (reader.result as string).split(',')[1];
          const res = await fetch('/api/analyze-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: base64,
              mimeType: file.type || 'image/jpeg'
            })
          });
          const data = await res.json();
          if (res.ok && (data.text || data.data)) {
            const extractedText = data.text || (data.data ? `Brand: ${data.data.brand || 'N/A'} | Model: ${data.data.model || 'N/A'} | MPN: ${data.data.mpn || 'N/A'}\nDescription: ${data.data.description || ''}` : 'OCR extraction finished.');
            
            setInput((prev) => {
              const cleanPrev = prev.trim();
              return cleanPrev 
                ? `${cleanPrev}\n\n[Vision AI Analysis]:\n${extractedText}` 
                : `[Vision AI Analysis]:\n${extractedText}`;
            });
          } else {
            setError(`Vision OCR Error: ${data.error || 'Failed to extract text from image.'}`);
          }
        } catch (err: any) {
          setError(`Image processing error: ${err.message || 'Unknown error'}`);
        } finally {
          setLoading(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(`File reading error: ${err.message || 'Unknown error'}`);
      setLoading(false);
    }
  };

  const handleEnrich = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    setPipelineStage('Analyzing raw input...');
    setPipelineProgress(15);
    setError(null);
    setResult(null);
    setApprovalStatus('PENDING');

    // Simulate progress stages
    const progressInterval = setInterval(() => {
      setPipelineProgress(prev => {
        if (prev < 40) {
          setPipelineStage('Standardizing attributes...');
          return prev + 15;
        } else if (prev < 70) {
          setPipelineStage('Validating taxonomies...');
          return prev + 20;
        } else if (prev < 90) {
          setPipelineStage('Finalizing enrichment...');
          return prev + 10;
        }
        return prev;
      });
    }, 600);

    try {
      // First try recursive multi-pass self-correction model endpoint
      let response = await fetch('/api/recursive-enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          description: input, 
          maxPasses: 3, 
          modelVersion: activeModelCheckpoint 
        }),
      });

      let data: EnrichmentResult;

      if (response.ok) {
        const resJson = await response.json();
        data = resJson.finalResult || resJson;
      } else {
        // Fallback to standard endpoint
        response = await fetch('/api/enrich', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description: input }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to enrich data');
        }
        data = await response.json();
      }

      setResult(data);
      
      // Auto-approve if above threshold
      if (data.confidenceScore >= (parseFloat(autoApproveScore) / 100)) {
        setApprovalStatus('APPROVED');
      }

      // Log activity in Firestore
      if (auth.currentUser) {
        import('firebase/firestore').then(({ addDoc, collection, serverTimestamp }) => {
          addDoc(collection(db, 'users', auth.currentUser!.uid, 'messages'), {
            text: `Enriched Product Intelligence (${activeModelCheckpoint}):\nTitle: ${data.productTitle}\nUNSPSC: ${data.unspscCode}\nBrand: ${data.brand} | MPN: ${data.mpn}\nConfidence: ${(data.confidenceScore * 100).toFixed(1)}%`,
            sender: 'system',
            createdAt: serverTimestamp(),
            userId: auth.currentUser!.uid
          }).catch(e => console.error("Logging failed", e));
        });
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      clearInterval(progressInterval);
      setPipelineProgress(100);
      setPipelineStage('Complete');
      setTimeout(() => {
        setLoading(false);
        setPipelineStage('');
        setPipelineProgress(0);
      }, 500);
    }
  };

  const copyUnspsc = () => {
    if (!result?.unspscCode) return;
    navigator.clipboard.writeText(result.unspscCode);
    setCopiedUnspsc(true);
    setTimeout(() => setCopiedUnspsc(false), 2000);
  };

  const handleApproveRecord = async () => {
    setApprovalStatus('APPROVED');
    if (auth.currentUser && result) {
      const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
      await addDoc(collection(db, 'users', auth.currentUser.uid, 'messages'), {
        text: `HUMAN APPROVED RECORD: ${result.productTitle} (MPN: ${result.mpn})`,
        sender: 'human_reviewer',
        createdAt: serverTimestamp(),
        userId: auth.currentUser.uid
      });
    }
  };

  const handleFlagRecord = async () => {
    setApprovalStatus('FLAGGED');
    if (auth.currentUser && result) {
      const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
      await addDoc(collection(db, 'users', auth.currentUser.uid, 'messages'), {
        text: `HUMAN FLAGGED RECORD FOR REVIEW: ${result.productTitle}`,
        sender: 'human_reviewer',
        createdAt: serverTimestamp(),
        userId: auth.currentUser.uid
      });
    }
  };

  const saveSettings = () => {
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 3000);
  };

  return (
    <motion.div 
      key={theme}
      initial={{ opacity: 0.92 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`flex flex-col min-h-screen w-full ${themeStyles.bg} font-sans transition-colors duration-500 overflow-y-auto global-scroll-container relative`}
    >
      {/* Theme Transition Notification Toast */}
      <AnimatePresence>
        {themeToast && (
          <motion.div
            initial={{ opacity: 0, y: -25, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -25, scale: 0.9 }}
            transition={{ duration: 0.25, type: 'spring', stiffness: 350, damping: 25 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#121622]/95 border border-indigo-500/60 text-white px-4 py-2 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-2 text-xs font-mono font-bold"
          >
            <Palette size={14} className="text-indigo-400 animate-pulse" />
            <span>Theme Applied: <span className="text-indigo-300">{themeToast}</span></span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Executive Glass Header */}
      <header className={`flex items-center justify-between px-6 py-3.5 border-b ${themeStyles.headerBg} backdrop-blur-md transition-colors duration-500`}>
        <div className="flex items-center space-x-4">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-white shadow-lg transition-all duration-500 ${
            isAmber 
              ? 'bg-gradient-to-tr from-amber-600 to-yellow-500 text-black shadow-amber-500/20' 
              : isLight 
              ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-blue-500/20' 
              : 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 shadow-indigo-500/30'
          }`}>
            U
          </div>
          <div>
            <h1 className={`text-base font-bold tracking-tight flex items-center gap-2.5 ${themeStyles.textMain}`}>
              UNILOG <span className="font-light opacity-80">PRODUCT INTELLIGENCE</span>
              <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border transition-all duration-500 ${
                isLight 
                  ? 'bg-blue-50 text-blue-700 border-blue-200' 
                  : isAmber 
                  ? 'bg-amber-950/60 text-amber-400 border-amber-800' 
                  : 'bg-indigo-950/60 text-indigo-300 border-indigo-800/60'
              }`}>
                ENTERPRISE v4.5
              </span>
            </h1>
            <p className={`text-[11px] font-mono ${themeStyles.textMuted}`}>Automated Catalog Generation • UNSPSC Governance • RAG Tracing</p>
          </div>
        </div>

        {/* Theme Chooser Bar with Sliding Motion Pill */}
        <div className={`flex items-center gap-1 p-1 rounded-xl border ${themeStyles.navBg} backdrop-blur-md transition-colors duration-500 overflow-x-auto max-w-full custom-scrollbar`}>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 text-gray-400 font-mono flex items-center gap-1 whitespace-nowrap">
            <Palette size={12} className={themeStyles.accentText} />
            Theme:
          </span>
          <button
            onClick={() => handleThemeChange('cyber-cobalt')}
            className={`relative px-3 py-1 text-[11px] font-mono rounded-lg font-semibold transition-colors duration-200 z-10 whitespace-nowrap ${
              theme === 'cyber-cobalt' ? 'text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {theme === 'cyber-cobalt' && (
              <motion.div
                layoutId="activeThemeHighlight"
                className="absolute inset-0 bg-indigo-600 rounded-lg shadow-md shadow-indigo-600/30 -z-10"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            Cyber Obsidian
          </button>
          <button
            onClick={() => handleThemeChange('clean-slate')}
            className={`relative px-3 py-1 text-[11px] font-mono rounded-lg font-semibold transition-colors duration-200 z-10 whitespace-nowrap ${
              theme === 'clean-slate' ? 'text-white' : 'text-gray-400 hover:text-slate-900'
            }`}
          >
            {theme === 'clean-slate' && (
              <motion.div
                layoutId="activeThemeHighlight"
                className="absolute inset-0 bg-slate-900 rounded-lg shadow-md -z-10"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            Executive Light
          </button>
          <button
            onClick={() => handleThemeChange('titanium-amber')}
            className={`relative px-3 py-1 text-[11px] font-mono rounded-lg font-semibold transition-colors duration-200 z-10 whitespace-nowrap ${
              theme === 'titanium-amber' ? 'text-black font-bold' : 'text-gray-400 hover:text-amber-400'
            }`}
          >
            {theme === 'titanium-amber' && (
              <motion.div
                layoutId="activeThemeHighlight"
                className="absolute inset-0 bg-amber-500 rounded-lg shadow-md shadow-amber-500/20 -z-10"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            Titanium Amber
          </button>
          <button
            onClick={() => handleThemeChange('nordic-frost')}
            className={`relative px-3 py-1 text-[11px] font-mono rounded-lg font-semibold transition-colors duration-200 z-10 whitespace-nowrap ${
              theme === 'nordic-frost' ? 'text-white' : 'text-gray-400 hover:text-[#5E81AC]'
            }`}
          >
            {theme === 'nordic-frost' && (
              <motion.div
                layoutId="activeThemeHighlight"
                className="absolute inset-0 bg-[#5E81AC] rounded-lg shadow-md shadow-[#5E81AC]/20 -z-10"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            Nordic Frost
          </button>
          <button
            onClick={() => handleThemeChange('matcha-latte')}
            className={`relative px-3 py-1 text-[11px] font-mono rounded-lg font-semibold transition-colors duration-200 z-10 whitespace-nowrap ${
              theme === 'matcha-latte' ? 'text-white' : 'text-gray-400 hover:text-[#6D9F71]'
            }`}
          >
            {theme === 'matcha-latte' && (
              <motion.div
                layoutId="activeThemeHighlight"
                className="absolute inset-0 bg-[#6D9F71] rounded-lg shadow-md shadow-[#6D9F71]/20 -z-10"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            Matcha Latte
          </button>
        </div>

        {/* Top Indicators & Actions */}
        <div className="flex space-x-6 items-center">
          <div className="text-right">
            <div className={`text-[10px] uppercase tracking-wider font-semibold ${themeStyles.textMuted}`}>Taxonomy Match</div>
            <div className="text-sm font-mono text-emerald-500 font-bold flex items-center justify-end gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> 99.18%
            </div>
          </div>
          <div className="text-right border-l border-gray-700/30 pl-5 pr-5 border-r">
            <div className={`text-[10px] uppercase tracking-wider font-semibold ${themeStyles.textMuted}`}>Catalog Queue</div>
            <div className={`text-sm font-mono font-bold ${themeStyles.textMain}`}>14,202</div>
          </div>
          {user ? (
            <div className="flex items-center gap-2.5">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-xl border hover:bg-slate-500/10 transition-colors ${isLight ? 'bg-slate-100 border-slate-200 text-slate-800' : 'bg-slate-800/40 border-slate-700/50 text-slate-200'}`}
                title="View Security Profile"
              >
                <UserCircle size={15} className="text-indigo-400" />
                <span>{user.displayName || user.email}</span>
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-white hover:bg-red-600 px-3 py-1.5 rounded-xl border border-red-500/30 hover:border-red-600 transition-all shadow-sm"
                title="Sign Out of Account"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <button onClick={() => setAuthSkipped(false)} className={`flex items-center gap-2 border ${themeStyles.cardBg} px-3.5 py-1.5 text-xs font-semibold rounded-lg uppercase tracking-wider hover:opacity-80 transition-all`}>
              <LogIn size={14} /> Sign In
            </button>
          )}
          <button 
            id="tutorial-trigger-btn"
            onClick={() => setShowTutorial(true)}
            className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 border rounded-xl hover:bg-slate-800/20 hover:text-white transition-all shadow-sm ${
              isLight 
                ? 'bg-white border-slate-300 text-indigo-600 hover:border-indigo-500 hover:bg-slate-50' 
                : 'bg-slate-900/60 border-slate-800/80 text-indigo-400 hover:border-slate-700'
            }`}
            title="Launch Hands-On Practical Tutorial"
          >
            <HelpCircle size={15} className="text-indigo-400 animate-pulse" />
            <span>Interactive Tutorial</span>
          </button>
          <div className="relative">
            <button 
              id="execute-enrich-btn"
              onClick={handleEnrich}
              disabled={loading || !input.trim()}
              className={`${themeStyles.accentBtn} px-5 py-2 text-xs font-bold rounded-xl uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-md`}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {loading ? 'Processing Pipeline...' : 'Run Pipeline'}
            </button>
            {loading && pipelineProgress > 0 && (
              <div className="absolute -bottom-8 right-0 w-48 z-10">
                <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  <span>{pipelineStage}</span>
                  <span>{pipelineProgress}%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 dark:bg-indigo-400 transition-all duration-300 ease-out"
                    style={{ width: `${pipelineProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Layout with Expanded Sidebar Navigation */}
      <main className="flex flex-1 overflow-hidden">
        <nav className={`w-60 ${themeStyles.navBg} border-r flex flex-col justify-between p-4 transition-colors duration-200 overflow-y-auto global-scroll-container shrink-0`}>
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 px-3 py-2 font-mono">Workspace Navigation</div>
            {(
              [
                { id: 'pipeline', label: 'Single Item Pipeline', icon: <Database size={16} /> },
                { id: 'batch', label: 'Bulk Catalog Batch', icon: <Layers size={16} /> },
                { id: 'history', label: 'Traceability Audit Logs', icon: <ShieldCheck size={16} /> },
                { id: 'ai-tools', label: 'Multi-modal AI Tools', icon: <Sparkles size={16} /> },
                { id: 'market-intelligence', label: 'Market Intelligence', icon: <TrendingUp size={16} />, customColor: 'indigo' },
                { id: 'recursive-ml', label: 'Recursive ML & 1K Dataset', icon: <BrainCircuit size={16} />, customColor: 'purple' },
                { id: 'system-health', label: 'System Health Dashboard', icon: <Activity size={16} />, customColor: 'emerald' },
                { id: 'settings', label: 'Engine Configuration', icon: <span className="text-sm">⚙</span> },
                { id: 'profile', label: 'Security Profile', icon: <UserCircle size={16} /> }
              ] as Array<{ id: Tab; label: string; icon: React.ReactNode; customColor?: string }>
            ).map((item) => {
              const isActive = activeTab === item.id;
              
              const getIndicatorColor = () => {
                if (isAmber) return 'bg-amber-500';
                if (item.id === 'recursive-ml') return 'bg-purple-600';
                if (item.id === 'system-health') return 'bg-emerald-600';
                return 'bg-indigo-600';
              };

              const getIndicatorShadow = () => {
                if (isAmber) return 'shadow-md';
                if (item.id === 'recursive-ml') return 'shadow-lg shadow-purple-600/30';
                if (item.id === 'system-health') return 'shadow-lg shadow-emerald-600/30';
                return 'shadow-lg shadow-indigo-600/30';
              };

              const getTextColor = () => {
                if (isActive) {
                  return isAmber ? 'text-black font-bold' : 'text-white font-bold';
                }
                if (item.id === 'recursive-ml') return 'text-purple-400 hover:bg-purple-950/20 hover:text-white';
                if (item.id === 'system-health') return 'text-emerald-500 hover:bg-emerald-950/20 hover:text-white';
                return 'text-gray-400 hover:bg-slate-800/30 hover:text-white';
              };

              // Safely clone and pass style props to Lucide icons
              const iconElement = React.isValidElement(item.icon)
                ? React.cloneElement(item.icon as any, {
                    className: isActive 
                      ? (isAmber ? 'text-black' : 'text-white')
                      : (item.customColor === 'purple' 
                          ? 'text-purple-400' 
                          : item.customColor === 'emerald' 
                          ? 'text-emerald-500' 
                          : 'text-gray-400')
                  })
                : item.icon;

              return (
                <button 
                  key={item.id}
                  id={`tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group z-10 ${getTextColor()}`}
                >
                  {/* Sliding Active Background Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeSidebarIndicator"
                      className={`absolute inset-0 rounded-xl -z-10 ${getIndicatorColor()} ${getIndicatorShadow()}`}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  {iconElement}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className={`p-3 rounded-xl border text-[10px] font-mono space-y-1 ${themeStyles.cardBg}`}>
            <span className="font-bold text-emerald-500 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> Gemini 3.6 Flash Active
            </span>
            <p className={themeStyles.textMuted}>UNSPSC V26.0 • ETIM 9.0 Standard</p>
          </div>
        </nav>

        {activeTab === 'pipeline' && (
          <div className="flex-1 flex flex-col p-6 space-y-5 overflow-y-auto global-scroll-container">
            {error && (
              <div className="bg-red-900/40 border border-red-500/80 text-red-200 px-4 py-3 rounded-xl text-xs font-mono flex items-center justify-between shadow-lg">
                <span>⚠️ {error}</span>
                <button onClick={() => setError(null)} className="text-xs hover:underline font-bold">Dismiss</button>
              </div>
            )}

            {/* Presets Selector & View Mode Bar */}
            <div className={`flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3.5 rounded-2xl border ${themeStyles.cardBg} backdrop-blur-md`}>
              <div className="flex items-center gap-3 overflow-x-auto flex-wrap" id="preset-samples-container">
                <span className={`text-[11px] font-bold uppercase tracking-wider whitespace-nowrap ${themeStyles.textMuted}`}>Try Industrial Samples:</span>
                <div className="flex items-center gap-2 py-0.5 flex-wrap">
                  {PRESET_PRODUCT_INPUTS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(preset.text)}
                      className={`px-3 py-1.5 border hover:border-indigo-500 ${isLight ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-slate-800/60 border-slate-700/80 text-gray-200'} text-xs rounded-xl font-medium whitespace-nowrap transition-all hover:scale-[1.02] shadow-sm`}
                    >
                      {preset.name}
                    </button>
                  ))}

                  {/* Catalog Dataset Browser button removed */}
                </div>
              </div>

              {/* View Mode Switcher */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-slate-800 shadow-inner self-end md:self-auto shrink-0">
                <button
                  id="view-split-btn"
                  onClick={() => setPipelineViewMode('split')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    pipelineViewMode === 'split' 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Database size={14} /> Split View
                </button>
                <button
                  id="view-comparison-btn"
                  onClick={() => setPipelineViewMode('comparison')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    pipelineViewMode === 'comparison' 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <GitCompare size={14} /> Side-by-Side Comparison
                </button>
              </div>
            </div>

            {/* View Mode Switching: Split View vs Side-by-Side Comparison Mode */}
            {pipelineViewMode === 'comparison' ? (
              <SideBySideComparison 
                rawInput={input}
                result={result}
                loading={loading}
                themeStyles={themeStyles}
                isLight={isLight}
                isAmber={isAmber}
                onUpdateAttributes={(updated) => handleSaveBulkEditAttrs(updated)}
              />
            ) : (
              <>
                {/* Split Screen: Input vs Structured Intelligence Output */}
                <section className="grid grid-cols-2 gap-5 min-h-[350px]">
                  {/* Raw Supplier Input Card */}
                  <div className={`border ${themeStyles.cardBg} rounded-2xl p-5 flex flex-col shadow-xl`}>
                    <div className="flex justify-between items-center mb-3">
                      <h2 className={`text-xs uppercase font-bold tracking-wider flex items-center gap-2 ${themeStyles.textMain}`}>
                        <span className="w-2.5 h-2.5 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.6)]"></span> Unstructured Supplier Raw Input
                      </h2>
                      <span className="text-[10px] font-mono text-gray-400 bg-gray-800/40 px-2.5 py-0.5 rounded-full border border-gray-700/50">DATASHEET / OCR SNIPPET</span>
                    </div>
                    <div className={`flex-1 p-4 rounded-xl border ${themeStyles.innerBg} font-mono text-xs leading-relaxed flex flex-col relative`}>
                      <textarea 
                        id="pipeline-raw-input"
                        className="w-full flex-1 bg-transparent border-none outline-none resize-none font-mono text-xs leading-relaxed"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Paste raw description, specs sheet text, or upload product photo..."
                      />
                      <div className="flex items-center justify-between pt-3 border-t border-slate-700/30 mt-2">
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                        >
                          <ImageIcon size={14} /> Multimodal Vision OCR
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                        
                        {result && (
                          <span className="text-[11px] font-mono text-indigo-400 font-semibold">
                            Taxonomy: {result.classpath || 'Valves & Fittings'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Structured Commerce Output Card */}
                  <div className={`border ${result ? 'border-indigo-500/80 shadow-[0_0_20px_rgba(99,102,241,0.15)]' : themeStyles.cardBg} rounded-2xl p-5 flex flex-col relative overflow-hidden transition-all shadow-xl`}>
                    {result && (
                      <div className="absolute top-0 right-0">
                        {approvalStatus === 'APPROVED' && (
                          <span className="bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1 shadow-md">
                            <Check size={12} /> HUMAN VERIFIED
                          </span>
                        )}
                        {approvalStatus === 'FLAGGED' && (
                          <span className="bg-amber-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1 shadow-md">
                            <AlertOctagon size={12} /> FLAGGED FOR REVIEW
                          </span>
                        )}
                        {approvalStatus === 'PENDING' && (
                          <span className="bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-md">
                            AUTO-GENERATED
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between items-center mb-3 pr-28">
                      <h2 className={`text-xs uppercase font-bold tracking-wider flex items-center gap-2 ${result ? 'text-indigo-400' : themeStyles.textMuted}`}>
                        <span className={`w-2.5 h-2.5 ${result ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-gray-600'} rounded-full`}></span> Commerce-Ready Product Intelligence
                      </h2>
                      {result && !loading && (
                        <button
                          onClick={() => exportSingleEnrichmentCSV(result, input)}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1 shadow-sm transition-all"
                          title="Download standardized master header CSV"
                        >
                          <Download size={12} /> Download CSV
                        </button>
                      )}
                    </div>
                    
                    {!result && !loading && (
                       <div className="flex-1 flex flex-col items-center justify-center text-xs text-gray-500 font-mono space-y-2">
                         <Database size={32} className="opacity-30" />
                         <span>Awaiting input. Click "Run Pipeline" above to enrich product data.</span>
                       </div>
                    )}
                    
                    {loading && (
                       <div className="flex-1 flex flex-col items-center justify-center text-xs text-indigo-400 font-mono space-y-3">
                         <Loader2 size={32} className="animate-spin" />
                         <span className="font-semibold">Executing Gemini 3.6 Flash Multi-modal Extraction...</span>
                       </div>
                    )}

                    {result && !loading && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="flex-1 space-y-3 overflow-y-auto pr-1"
                      >
                        <div className="grid grid-cols-3 gap-2.5">
                          <div className={`p-2.5 rounded-xl border ${themeStyles.innerBg}`}>
                            <label className="text-[9px] uppercase font-bold text-gray-400 block mb-0.5">Canonical Brand</label>
                            <span className="text-xs font-bold uppercase text-indigo-400">{result.brand}</span>
                          </div>
                          <div className={`p-2.5 rounded-xl border ${themeStyles.innerBg}`}>
                            <label className="text-[9px] uppercase font-bold text-gray-400 block mb-0.5">MPN</label>
                            <span className="text-xs font-mono font-bold">{result.mpn}</span>
                          </div>
                          <div className={`p-2.5 rounded-xl border ${themeStyles.innerBg} flex flex-col justify-between`}>
                            <label className="text-[9px] uppercase font-bold text-gray-400 block">UNSPSC Code</label>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs font-mono text-purple-400 font-bold">{result.unspscCode}</span>
                              <button onClick={copyUnspsc} className="text-gray-400 hover:text-white p-0.5" title="Copy UNSPSC">
                                {copiedUnspsc ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className={`p-3 rounded-xl border ${themeStyles.innerBg}`}>
                          <label className="text-[9px] uppercase font-bold text-gray-400 block mb-1">Canonical Title (Title Case)</label>
                          <span className="text-xs leading-snug font-semibold">{result.productTitle}</span>
                        </div>

                        <div className={`p-3 rounded-xl border ${themeStyles.innerBg}`}>
                          <label className="text-[9px] uppercase font-bold text-gray-400 block mb-1">Long Technical Overview</label>
                          <p className="text-[11px] leading-relaxed font-mono opacity-90">"{result.longDescription}"</p>
                        </div>

                        {/* Human Review Controls */}
                        <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-700/50 bg-slate-900/50 mt-2">
                          <span className="text-[10px] font-mono text-gray-300">Human Governance Review:</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => exportSingleEnrichmentCSV(result, input)}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 text-[10px] font-bold rounded-lg uppercase tracking-wider flex items-center gap-1 shadow-sm transition-all"
                              title="Export current enrichment in standardized master CSV format"
                            >
                              <Download size={12} /> Download CSV
                            </button>
                            <button 
                              onClick={handleApproveRecord}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-[10px] font-bold rounded-lg uppercase tracking-wider flex items-center gap-1 shadow-sm transition-all"
                            >
                              <CheckCircle size={12} /> Approve
                            </button>
                            <button 
                              onClick={handleFlagRecord}
                              className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 text-[10px] font-bold rounded-lg uppercase tracking-wider flex items-center gap-1 shadow-sm transition-all"
                            >
                              <AlertOctagon size={12} /> Flag Expert
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </section>

                {/* Bottom Panel: Attributes Table + Validation Health + Audit Rationale Trail */}
                <section className="flex-1 grid grid-cols-4 gap-4 min-h-[300px]">
                  <div className="col-span-3 bg-[#12141A] border border-[#2D2F36] rounded overflow-hidden flex flex-col relative">
                    {/* Saved Toast Banner */}
                    {settingsSavedToast && (
                      <div className="absolute top-2 right-2 z-20 bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded shadow-lg flex items-center gap-1 animate-fade-in">
                        <Check size={12} /> Attributes Bulk-Updated & Governed!
                      </div>
                    )}

                    <div className="px-3 py-2 bg-[#1C1E26] border-b border-[#2D2F36] flex flex-wrap items-center justify-between gap-2">
                       <div className="flex items-center gap-2">
                         <span className="text-[10px] font-bold uppercase text-gray-400">Normalized Technical Attributes & Standards</span>
                         <span className="text-[9px] bg-blue-900/40 border border-blue-800 text-blue-400 px-2 py-0.5 rounded font-mono">ETIM / GS1 COMPLIANT</span>
                         {result && (
                           <span className="text-[9px] text-gray-400 font-mono">({isBulkEditingAttrs ? editableAttrs.length : (result.attributes?.length || 0)} Attributes)</span>
                         )}
                       </div>

                       <div className="flex items-center gap-2">
                         {result && !isBulkEditingAttrs && (
                           <button
                             onClick={handleStartBulkEditAttrs}
                             className="text-[10px] bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/50 text-indigo-300 px-2.5 py-1 rounded font-mono font-bold flex items-center gap-1 transition-all"
                           >
                             <Edit2 size={11} /> Bulk Edit Attributes
                           </button>
                         )}

                         {isBulkEditingAttrs && (
                           <div className="flex items-center gap-1.5 flex-wrap">
                             <button
                               onClick={handleAddAttrRow}
                               className="text-[9px] bg-slate-800 hover:bg-slate-700 text-gray-200 border border-slate-700 px-2 py-0.5 rounded font-mono flex items-center gap-1"
                             >
                               <Plus size={10} className="text-emerald-400" /> Add Row
                             </button>
                             <button
                               onClick={handleUppercaseAllAttrs}
                               className="text-[9px] bg-slate-800 hover:bg-slate-700 text-gray-200 border border-slate-700 px-2 py-0.5 rounded font-mono flex items-center gap-1"
                               title="Uppercase all values"
                             >
                               <Type size={10} className="text-indigo-400" /> Uppercase
                             </button>
                             <button
                               onClick={handleClearEmptyAttrs}
                               className="text-[9px] bg-slate-800 hover:bg-slate-700 text-gray-200 border border-slate-700 px-2 py-0.5 rounded font-mono flex items-center gap-1"
                               title="Clean empty rows"
                             >
                               <RefreshCw size={10} className="text-amber-400" /> Clean
                             </button>
                             <button
                               onClick={() => handleSaveBulkEditAttrs()}
                               className="text-[9px] bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-0.5 rounded font-mono font-bold flex items-center gap-1 shadow-sm"
                             >
                               <Save size={10} /> Save All
                             </button>
                             <button
                               onClick={() => setIsBulkEditingAttrs(false)}
                               className="text-[9px] bg-gray-700 hover:bg-gray-600 text-gray-200 px-2 py-0.5 rounded font-mono flex items-center gap-1"
                             >
                               <X size={10} /> Cancel
                             </button>
                           </div>
                         )}

                         <button 
                           onClick={() => setShowAuditTrail(!showAuditTrail)} 
                           className="text-[10px] font-mono text-blue-400 hover:underline flex items-center gap-1"
                         >
                           {showAuditTrail ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                           {showAuditTrail ? 'Hide Audit Trail' : 'Show Audit Trail'}
                         </button>
                       </div>
                    </div>

                    <div className="flex-1 overflow-y-auto font-mono text-[10px]">
                      {isBulkEditingAttrs ? (
                        <div className="p-3 bg-[#0D0F14] space-y-2">
                          <div className="text-[10px] text-amber-400 bg-amber-950/20 border border-amber-800/30 p-2 rounded flex items-center justify-between">
                            <span>✏️ <strong>Manual Bulk Attribute Override:</strong> Edit, add, or delete technical specifications prior to record approval.</span>
                            <span className="text-[9px] text-gray-500">Live Workspace Sync</span>
                          </div>

                          <table className="w-full text-left">
                            <thead className="bg-[#1C1E26] text-gray-400 border-b border-[#2D2F36]">
                              <tr>
                                <th className="p-2 font-normal w-1/3">Attribute Name</th>
                                <th className="p-2 font-normal w-1/3">Standardized Value</th>
                                <th className="p-2 font-normal w-1/4">UOM</th>
                                <th className="p-2 font-normal text-center w-12">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#1F2937]">
                              {editableAttrs.map((attr, i) => (
                                <tr key={i} className="hover:bg-[#1A1C23]">
                                  <td className="p-1.5">
                                    <input
                                      type="text"
                                      value={attr.name}
                                      onChange={(e) => handleAttrChange(i, 'name', e.target.value)}
                                      className="w-full bg-[#12141A] border border-[#2D2F36] focus:border-indigo-500 rounded px-2 py-1 text-indigo-300 font-semibold outline-none text-[10px]"
                                      placeholder="ATTRIBUTE_NAME"
                                    />
                                  </td>
                                  <td className="p-1.5">
                                    <input
                                      type="text"
                                      value={attr.value}
                                      onChange={(e) => handleAttrChange(i, 'value', e.target.value)}
                                      className="w-full bg-[#12141A] border border-[#2D2F36] focus:border-indigo-500 rounded px-2 py-1 text-white font-bold outline-none text-[10px]"
                                      placeholder="Attribute Value"
                                    />
                                  </td>
                                  <td className="p-1.5">
                                    <input
                                      type="text"
                                      value={attr.uom || ''}
                                      onChange={(e) => handleAttrChange(i, 'uom', e.target.value)}
                                      className="w-full bg-[#12141A] border border-[#2D2F36] focus:border-indigo-500 rounded px-2 py-1 text-yellow-400 font-bold outline-none text-[10px]"
                                      placeholder="PSI / IN / TEXT"
                                    />
                                  </td>
                                  <td className="p-1.5 text-center">
                                    <button
                                      onClick={() => handleRemoveAttrRow(i)}
                                      className="text-gray-500 hover:text-red-400 p-1"
                                      title="Delete Row"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                              {editableAttrs.length === 0 && (
                                <tr>
                                  <td colSpan={4} className="p-4 text-center text-gray-500 italic">No attributes in list. Click "Add Row".</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <table className="w-full text-left">
                          <thead className="sticky top-0 bg-[#1C1E26] shadow-sm">
                            <tr className="text-gray-500 border-b border-[#2D2F36]">
                              <th className="p-2 font-normal">Attribute Specification</th>
                              <th className="p-2 font-normal">Extracted & Standardized Value</th>
                              <th className="p-2 font-normal">UOM</th>
                              <th className="p-2 font-normal">Confidence</th>
                            </tr>
                          </thead>
                          <tbody className="text-gray-300 divide-y divide-[#1F2937]">
                            {result ? (
                              <>
                                <tr>
                                  <td className="p-2 text-blue-400">Invoice Desc (≤40 Upper)</td>
                                  <td className="p-2 text-white font-bold">{result.invoiceDesc}</td>
                                  <td className="p-2 text-gray-500">TEXT</td>
                                  <td className="p-2 font-mono text-green-400">1.000</td>
                                </tr>
                                <tr>
                                  <td className="p-2 text-blue-400">Mobile Desc (60-80 Title)</td>
                                  <td className="p-2 text-white">{result.mobileDesc}</td>
                                  <td className="p-2 text-gray-500">TEXT</td>
                                  <td className="p-2 font-mono text-green-400">1.000</td>
                                </tr>
                                {result.attributes?.map((attr, i) => (
                                  <tr key={i} className="hover:bg-[#1A1C23]">
                                    <td className="p-2 text-gray-300">{attr.name}</td>
                                    <td className="p-2 text-white">{attr.value}</td>
                                    <td className="p-2 text-yellow-400 font-bold">{attr.uom || '--'}</td>
                                    <td className="p-2 font-mono text-green-400">0.985</td>
                                  </tr>
                                ))}
                              </>
                            ) : (
                              <tr>
                                <td colSpan={4} className="p-6 text-center text-gray-600 italic">No attributes generated. Click "Run Intelligence Pipeline".</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      )}
                    </div>

                    {/* Audit Trail Accordion Drawer */}
                    {showAuditTrail && result && result.auditTrail && (
                      <div className="border-t border-[#2D2F36] bg-[#0A0B0E] p-3 space-y-2">
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                          <Layers size={12} className="text-blue-500" /> Pipeline Rationale & Traceability Log
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {result.auditTrail.map((trail, idx) => (
                            <div key={idx} className="bg-[#12141A] p-2 rounded border border-[#2D2F36] text-[9px] font-mono">
                              <div className="text-blue-400 font-bold mb-0.5">{trail.step}</div>
                              <div className="text-gray-400">{trail.outputSummary}</div>
                              <div className="text-gray-600 text-[8px] mt-1">Method: {trail.method}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Validation & Health Metrics */}
                  <div className="bg-[#12141A] border border-[#2D2F36] rounded p-3 flex flex-col overflow-hidden justify-between">
                    <div>
                      <h3 className="text-[10px] font-bold uppercase text-gray-400 mb-3 flex items-center justify-between border-b border-[#2D2F36] pb-1.5">
                        <span>Quality & Governance Health</span>
                        <ShieldCheck size={14} className="text-green-500" />
                      </h3>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-[10px] text-gray-400">Extraction Confidence</span>
                            <span className="text-[10px] font-mono text-green-400 font-bold">
                              {result ? `${(result.confidenceScore * 100).toFixed(1)}%` : '--'}
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-[#1F2937] rounded-full overflow-hidden">
                            <div className="h-full bg-green-500" style={{ width: result ? `${result.confidenceScore * 100}%` : '0%' }}></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-[10px] text-gray-400">Attribute Completeness</span>
                            <span className="text-[10px] font-mono text-blue-400 font-bold">
                              {result ? `${result.completenessScore}%` : '--'}
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-[#1F2937] rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: result ? `${result.completenessScore}%` : '0%' }}></div>
                          </div>
                        </div>

                        <div className="pt-2">
                          <span className="text-[9px] uppercase font-bold text-gray-500 block mb-1.5">Rule Compliance Matrix</span>
                          <div className="space-y-1.5">
                            {result?.validationFlags ? (
                              result.validationFlags.map((flag, i) => (
                                <div key={i} className="flex items-center justify-between text-[9px] font-mono bg-[#0A0B0E] p-1.5 rounded border border-[#2D2F36]">
                                  <span className="text-gray-300 truncate max-w-[120px]">{flag.rule}</span>
                                  <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold ${
                                    flag.status === 'PASS' ? 'bg-green-900/40 text-green-400 border border-green-800' : 'bg-yellow-900/40 text-yellow-400 border border-yellow-800'
                                  }`}>
                                    {flag.status}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <span className="text-[10px] text-gray-600 font-mono italic">Awaiting pipeline run...</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#1C1E26] p-2 rounded text-[9px] text-gray-400 border border-[#2D2F36] mt-3">
                      <strong className="text-white uppercase block mb-0.5">Traceable Audit Guarantee:</strong>
                      All generated attributes are validated against distributor master LOVs and recorded in Firebase Firestore.
                    </div>
                  </div>
                </section>
              </>
            )}          </div>
        )}

        {activeTab === 'batch' && <BatchProcessing />}

        {activeTab === 'history' && (
          <div className="flex-1 flex flex-col p-8 space-y-6 overflow-y-auto global-scroll-container">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg text-white font-semibold uppercase tracking-wider">Traceability & System Audit Trail</h2>
                <p className="text-xs text-gray-500 font-mono">Immutable record of human approvals, API enrichments, and taxonomy mappings</p>
              </div>
              <div className="flex gap-2">
                <input type="text" placeholder="Search audit logs..." className="bg-[#0A0B0E] border border-[#2D2F36] rounded-sm px-3 py-1.5 text-xs text-white outline-none focus:border-[#3B82F6]" />
                <button className="border border-[#2D2F36] bg-[#12141A] text-white px-3 py-1.5 text-xs font-bold rounded-sm uppercase tracking-wider hover:bg-[#1F2937]">Filter</button>
              </div>
            </div>
            
            <div className="bg-[#12141A] border border-[#2D2F36] rounded overflow-hidden flex-1 flex flex-col">
              <div className="overflow-y-auto global-scroll-container flex-1">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#0A0B0E] text-gray-500 border-b border-[#2D2F36] sticky top-0">
                    <tr>
                      <th className="p-3 font-normal">Timestamp</th>
                      <th className="p-3 font-normal">User / Session ID</th>
                      <th className="p-3 font-normal">Event Category</th>
                      <th className="p-3 font-normal">Operation Summary</th>
                      <th className="p-3 font-normal">Governance Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F2937] text-gray-300">
                    <tr className="hover:bg-[#16181D]">
                      <td className="p-3 text-gray-500">2026-08-10 07:48:12</td>
                      <td className="p-3 text-blue-400 font-bold">{user ? user.uid.substring(0,8).toUpperCase() : 'PRO_DEV_ANALYST_99'}</td>
                      <td className="p-3 text-purple-400">SINGLE_ITEM_PIPELINE</td>
                      <td className="p-3">Generated Product Intelligence for Parker 1/2 in brass ball valve (UNSPSC: 40141607)</td>
                      <td className="p-3 text-green-400 font-bold">VERIFIED</td>
                    </tr>
                    <tr className="hover:bg-[#16181D]">
                      <td className="p-3 text-gray-500">2026-08-10 07:35:00</td>
                      <td className="p-3 text-purple-400">SYSTEM_BATCH_ENGINE</td>
                      <td className="p-3">BULK_CATALOG_ENRICHMENT</td>
                      <td className="p-3">Processed 5 supplier catalog items. 4 auto-approved, 1 flagged for human review</td>
                      <td className="p-3 text-green-400 font-bold">COMPLETED</td>
                    </tr>
                    <tr className="hover:bg-[#16181D]">
                      <td className="p-3 text-gray-500">2026-08-10 07:15:00</td>
                      <td className="p-3 text-yellow-400">MASTER_DATA_GOVERNANCE</td>
                      <td className="p-3">LOV_DICTIONARY_SYNC</td>
                      <td className="p-3">Updated Valve & Fitting LOVs with GS1 Standard Attributes</td>
                      <td className="p-3 text-green-400 font-bold">SUCCESS</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="flex-1 flex flex-col p-8 space-y-6 overflow-y-auto global-scroll-container">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg text-white font-semibold uppercase tracking-wider">Engine & Governance Configuration</h2>
                <p className="text-xs text-gray-500 font-mono">Fine-tune confidence thresholds, LOV strictness, and PIM sync parameters</p>
              </div>
              {settingsSavedToast && (
                <div className="bg-green-900/60 border border-green-500 text-green-200 px-4 py-2 rounded text-xs font-mono flex items-center gap-2 animate-bounce">
                  <CheckCircle size={14} /> Governance Configuration Saved Successfully!
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#12141A] border border-[#2D2F36] rounded p-6 space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-[#2D2F36] pb-2 mb-4">Pipeline Thresholds</h3>
                
                <div>
                  <label className="text-[10px] uppercase text-gray-500 block mb-1">Auto-Approve Confidence Threshold</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      min="70" 
                      max="100" 
                      value={autoApproveScore} 
                      onChange={e => setAutoApproveScore(e.target.value)} 
                      className="flex-1 accent-[#3B82F6]" 
                    />
                    <span className="text-xs font-mono text-white font-bold">{autoApproveScore}%</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-[10px] uppercase text-gray-500 block mb-1">Fuzzy Match Sensitivity (Brand/Mfg LOV)</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      min="50" 
                      max="100" 
                      value={fuzzyMatchSensitivity} 
                      onChange={e => setFuzzyMatchSensitivity(e.target.value)} 
                      className="flex-1 accent-[#3B82F6]" 
                    />
                    <span className="text-xs font-mono text-white font-bold">{fuzzyMatchSensitivity}%</span>
                  </div>
                </div>
                
                <div className="pt-2 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded bg-[#0A0B0E] border border-[#2D2F36] text-[#3B82F6] focus:ring-0 w-4 h-4" />
                    <span className="text-xs text-gray-300">Flag missing UNSPSC classification codes as errors</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded bg-[#0A0B0E] border border-[#2D2F36] text-[#3B82F6] focus:ring-0 w-4 h-4" />
                    <span className="text-xs text-gray-300">Enforce strict 40-character maximum on Invoice Descriptions</span>
                  </label>
                </div>
              </div>
              
              <div className="bg-[#12141A] border border-[#2D2F36] rounded p-6 space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-[#2D2F36] pb-2 mb-4">PIM & Master Data Integrations</h3>
                
                <div>
                  <label className="text-[10px] uppercase text-gray-500 block mb-1">PIM Ingestion Endpoint</label>
                  <input type="text" defaultValue="https://api.unilog.com/v1/pim/ingest" className="w-full bg-[#0A0B0E] border border-[#2D2F36] rounded-sm px-3 py-2 text-xs font-mono text-white outline-none focus:border-[#3B82F6]" />
                </div>
                
                <div>
                  <label className="text-[10px] uppercase text-gray-500 block mb-1">Master LOV Data Source</label>
                  <input type="text" defaultValue="s3://unilog-master-data/lov/current/" className="w-full bg-[#0A0B0E] border border-[#2D2F36] rounded-sm px-3 py-2 text-xs font-mono text-white outline-none focus:border-[#3B82F6]" />
                </div>
                
                <div className="pt-2 flex justify-end">
                  <button id="save-settings-btn" onClick={saveSettings} className="bg-[#3B82F6] text-white px-5 py-2 text-xs font-bold rounded-sm uppercase tracking-wider hover:bg-blue-600">Save Governance Rules</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ai-tools' && <AITools />}

        {activeTab === 'market-intelligence' && <MarketIntelligence />}

        {activeTab === 'recursive-ml' && (
          <RecursiveLearningStudio 
            themeStyles={themeStyles}
            isLight={isLight}
            isAmber={isAmber}
            onSelectProductForPipeline={(rawDesc) => {
              setInput(rawDesc);
              setActiveTab('pipeline');
            }}
          />
        )}

        {activeTab === 'system-health' && (
          <SystemHealthDashboard 
            isAmber={isAmber} 
            isDark={!isLight} 
          />
        )}

        {activeTab === 'profile' && (
          user ? (
            <ProfileTab 
              user={user}
              themeStyles={themeStyles}
              isLight={isLight}
              isAmber={isAmber}
            />
          ) : (
            <div className={`p-8 rounded-3xl border ${themeStyles.cardBg} w-full max-w-md mx-auto text-center space-y-6 mt-16 shadow-xl`}>
              <div className="mx-auto w-14 h-14 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <UserCircle size={32} />
              </div>
              <div className="space-y-2">
                <h3 className={`text-xl font-bold ${themeStyles.textMain}`}>Security Profile Locked</h3>
                <p className={`text-sm ${themeStyles.textMuted}`}>Please sign in or create an account to view and configure your identity integration options.</p>
              </div>
              <button 
                onClick={() => setAuthSkipped(false)}
                className={`w-full py-3 px-4 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all`}
              >
                Open Authentication Gate
              </button>
            </div>
          )
        )}

      </main>

      {/* Catalog Item Selection Modal removed for privacy and data governance */}

      <footer className="px-4 py-2 bg-[#0F1116] border-t border-[#2D2F36] flex items-center justify-between text-[10px] text-gray-600 font-mono">
        <div className="flex space-x-4">
          <span>ENV: STAGING_2</span>
          <span>DB: UNICAT_MASTER_V1.1</span>
          <span className="text-[#3B82F6]">ACTIVE SESSION: {user ? user.uid.substring(0,8).toUpperCase() : 'ANONYMOUS_DEV'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span>SYSTEMS OPERATIONAL • GEMINI 3.6 FLASH ENRICHMENT READY</span>
        </div>
      </footer>

      {/* 4-second Startup Booting / Loader Animation */}
      <AnimatePresence>
        {isBooting && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.03, filter: "blur(6px)" }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-50 bg-[#060812] flex flex-col items-center justify-center p-8 font-mono select-none overflow-hidden"
          >
            {/* Interactive Neural Canvas background */}
            <canvas 
              ref={canvasRef} 
              className="absolute inset-0 z-0 pointer-events-auto cursor-crosshair opacity-70"
            />

            {/* Ambient decorative background grids and visual vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(rgba(99,102,241,0.08)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none z-1" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#04050a] via-transparent to-[#04050a] pointer-events-none z-1" />
            
            {/* Core telemetry engine logo and dials */}
            <div className="relative z-10 flex flex-col items-center max-w-2xl w-full space-y-6 text-center bg-slate-950/80 backdrop-blur-xl p-8 rounded-3xl border-2 border-indigo-500/20 shadow-2xl shadow-indigo-500/20">
              
              {/* Spinning/pulsing neon circular portal with central neural icon */}
              <div className="relative flex items-center justify-center w-40 h-40">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-4 border-dashed border-indigo-500/30 pointer-events-none"
                />
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                  className="absolute inset-3 rounded-full border-2 border-teal-400/50 border-t-transparent border-b-transparent pointer-events-none"
                />
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                  className="absolute inset-6 rounded-full border border-amber-400/40 border-l-transparent pointer-events-none"
                />
                <motion.div 
                  animate={{ scale: [0.93, 1.07, 0.93], opacity: [0.5, 0.9, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="absolute inset-8 rounded-full bg-indigo-500/10 blur-lg pointer-events-none"
                />
                
                {/* Visual Icon + Progress inside the circular portal */}
                <div className="absolute flex flex-col items-center justify-center">
                  <BrainCircuit 
                    size={38} 
                    className={`transition-colors duration-500 ${
                      bootProgress < 25 ? "text-indigo-400 animate-pulse" :
                      bootProgress < 50 ? "text-teal-400 animate-bounce" :
                      bootProgress < 75 ? "text-purple-400 animate-spin" :
                      "text-amber-400 animate-pulse"
                    }`}
                  />
                  <span className="text-2xl font-black text-white leading-none tracking-tight mt-1">
                    {bootProgress}%
                  </span>
                  <span className="text-[8px] text-gray-400 font-bold tracking-widest uppercase mt-0.5">
                    PARSING
                  </span>
                </div>
              </div>

              {/* Welcome Loader Header */}
              <div className="space-y-4">
                <motion.h1 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="text-3xl font-black text-white tracking-wider"
                >
                  Welcome to <span className="font-light text-indigo-400">Unilog</span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className="text-slate-300 font-sans text-lg"
                >
                  We're preparing your Product Intelligence Workspace...
                </motion.p>
                
                {/* Dynamic Status Readout */}
                <div className="h-6 flex items-center justify-center mt-4">
                  <span className={`text-[11px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full border transition-colors duration-500 ${
                    bootProgress < 25 ? "bg-indigo-950/80 text-indigo-300 border-indigo-800/50" :
                    bootProgress < 50 ? "bg-teal-950/80 text-teal-300 border-teal-800/50" :
                    bootProgress < 75 ? "bg-purple-950/80 text-purple-300 border-purple-800/50" :
                    "bg-amber-950/80 text-amber-300 border-amber-800/50"
                  }`}>
                    {bootProgress < 25 && "Gathering your tools..."}
                    {bootProgress >= 25 && bootProgress < 50 && "Loading intelligence models..."}
                    {bootProgress >= 50 && bootProgress < 75 && "Organizing your dashboard..."}
                    {bootProgress >= 75 && "Almost there..."}
                  </span>
                </div>
              </div>

              {/* Dynamic Enriched Milestone Badges */}
              <div className="grid grid-cols-4 gap-2 w-full max-w-lg">
                <div className={`p-2 rounded-xl border font-mono text-[9px] flex flex-col items-center gap-1 transition-all ${
                  bootProgress >= 15 
                    ? "bg-indigo-950/40 border-indigo-500/50 text-indigo-300 font-bold shadow-[0_0_8px_rgba(99,102,241,0.2)]" 
                    : "bg-[#0E1220]/60 border-slate-900 text-gray-600"
                }`}>
                  <Layers size={12} className={bootProgress >= 15 ? "text-indigo-400 animate-bounce" : "text-gray-700"} />
                  <span>1. INGESTION</span>
                </div>
                <div className={`p-2 rounded-xl border font-mono text-[9px] flex flex-col items-center gap-1 transition-all ${
                  bootProgress >= 40 
                    ? "bg-teal-950/40 border-teal-500/50 text-teal-300 font-bold shadow-[0_0_8px_rgba(20,184,166,0.2)]" 
                    : "bg-[#0E1220]/60 border-slate-900 text-gray-600"
                }`}>
                  <Database size={12} className={bootProgress >= 40 ? "text-teal-400 animate-pulse" : "text-gray-700"} />
                  <span>2. ETIM SCHEMA</span>
                </div>
                <div className={`p-2 rounded-xl border font-mono text-[9px] flex flex-col items-center gap-1 transition-all ${
                  bootProgress >= 65 
                    ? "bg-purple-950/40 border-purple-500/50 text-purple-300 font-bold shadow-[0_0_8px_rgba(168,85,247,0.2)]" 
                    : "bg-[#0E1220]/60 border-slate-900 text-gray-600"
                }`}>
                  <ShieldCheck size={12} className={bootProgress >= 65 ? "text-purple-400 animate-bounce" : "text-gray-700"} />
                  <span>3. UNSPSC GOV</span>
                </div>
                <div className={`p-2 rounded-xl border font-mono text-[9px] flex flex-col items-center gap-1 transition-all ${
                  bootProgress >= 85 
                    ? "bg-amber-950/40 border-amber-500/50 text-amber-300 font-bold shadow-[0_0_8px_rgba(245,158,11,0.2)]" 
                    : "bg-[#0E1220]/60 border-slate-900 text-gray-600"
                }`}>
                  <Sparkles size={12} className={bootProgress >= 85 ? "text-amber-400 animate-pulse" : "text-gray-700"} />
                  <span>4. GEMINI CORE</span>
                </div>
              </div>

              {/* Progress Slider */}
              <div className="w-full max-w-md bg-[#0D0F1C]/95 border border-[#1E2339] h-3 rounded-full overflow-hidden relative shadow-inner p-[2px]">
                <motion.div 
                  className="bg-gradient-to-r from-indigo-600 via-teal-400 via-purple-500 to-amber-500 h-full rounded-full shadow-[0_0_14px_rgba(99,102,241,0.7)]"
                  initial={{ width: "0%" }}
                  animate={{ width: `${bootProgress}%` }}
                  transition={{ duration: 0.1, ease: "easeOut" }}
                />
              </div>

              {/* Rolling System Logs Terminal */}
              <div className="w-full bg-[#03040A]/95 border border-[#1C2033] rounded-xl p-4 text-left font-mono text-[10px] leading-relaxed text-gray-300 min-h-[140px] max-h-[140px] overflow-y-auto space-y-1 select-text scrollbar-thin scrollbar-thumb-indigo-950">
                <div className="text-[9px] text-gray-500 uppercase font-black border-b border-[#141829] pb-1 flex items-center justify-between mb-2">
                  <span>🛰️ Core System Handshake Telemetry logs</span>
                  <span className="text-indigo-400 animate-pulse font-bold">LIVE SYSTEM BOOT</span>
                </div>
                {bootLogs.map((log, lIdx) => (
                  <div key={lIdx} className="flex gap-2.5">
                    <span className="text-indigo-500/80 font-bold">[{(lIdx * 0.4).toFixed(1)}s]</span>
                    <span className={lIdx === bootLogs.length - 1 ? "text-teal-400 font-bold" : "text-gray-300"}>
                      {log}
                    </span>
                  </div>
                ))}
              </div>

              {/* Secondary details footer inside loading screen */}
              <div className="flex justify-between w-full max-w-md text-[9px] text-gray-500 uppercase font-bold tracking-wider pt-2 border-t border-indigo-950/50">
                <span>Memory Heap: 48.2MB</span>
                <span>DB Conn: Secure SSL</span>
                <span>Active Core: Gemini 3.6</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Secure Auth Gate for New Users */}
      <AnimatePresence>
        {!isBooting && !user && !authSkipped && (
          <AuthGate 
            onSuccess={() => setAuthSkipped(true)} 
            onSkip={() => setAuthSkipped(true)} 
            themeStyles={themeStyles} 
            isLight={isLight} 
            isAmber={isAmber} 
          />
        )}
      </AnimatePresence>

      {/* Onboarding Interactive Tutorial Portal Overlay */}
      {showTutorial && (
        <InteractiveTutorial 
          activeTab={activeTab}
          setActiveTab={(tab) => setActiveTab(tab)}
          setInput={(txt) => setInput(txt)}
          handleEnrich={() => handleEnrich()}
          setPipelineViewMode={(mode) => setPipelineViewMode(mode)}
          setShowCatalogModal={(show) => setShowCatalogModal(show)}
          onClose={() => {
            setShowTutorial(false);
            localStorage.setItem('unilog_tutorial_completed', 'true');
          }}
          isLight={isLight}
        />
      )}
    </motion.div>
  );
}

