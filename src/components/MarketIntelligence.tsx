import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, Search, RefreshCw, BarChart2, ShieldCheck, 
  HelpCircle, ArrowRight, ExternalLink, Award, FileText, Check, Copy, 
  AlertCircle, Compass, Globe, Info, Sliders, DollarSign, Activity, 
  Layers, Target, Zap, Download, ArrowUpRight, ArrowDownRight, ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, LineChart, Line, XAxis, YAxis, 
  Tooltip, CartesianGrid, ReferenceLine, Legend, ScatterChart, Scatter, 
  ZAxis, Cell 
} from 'recharts';

interface KeyValue {
  key: string;
  value: string;
}

interface ParsedItem {
  type: 'h1' | 'h2' | 'h3' | 'paragraph' | 'divider' | 'competitor-card' | 'specs-grid' | 'bullet-list' | 'recommendation-banner';
  text?: string;
  items?: string[];
  keyValues?: KeyValue[];
  recType?: 'BUY' | 'SELL' | 'ACCUMULATE' | 'DISCONTINUE' | 'NEUTRAL';
  recExplanation?: string;
  competitorBrand?: string;
  competitorModel?: string;
  competitorPrice?: string;
  competitorAdv?: string;
  competitorDisadv?: string;
}

interface PresetSKU {
  id: string;
  name: string;
  category: string;
  query: string;
  basePrice: number;
  unitCost: number;
  baseVolume: number;
  elasticity: number;
  competitorPrice: number;
  competitorBrand: string;
  quadrant: 'moat' | 'differentiated' | 'staple' | 'commodity';
}

const PRESET_SKUS: PresetSKU[] = [
  {
    id: 'rockwell-plc',
    name: "Rockwell ControlLogix 1756-L83E",
    category: "Electrical & PLCs",
    query: "Rockwell Allen-Bradley ControlLogix 1756-L83E controller processor module",
    basePrice: 8450,
    unitCost: 3120,
    baseVolume: 650,
    elasticity: 0.42, // Inelastic - high proprietary lock-in
    competitorPrice: 7890,
    competitorBrand: "Siemens S7-1500 / SIMATIC CPU",
    quadrant: 'moat'
  },
  {
    id: 'skf-bearing',
    name: "SKF 6205-2RSH Deep Groove Bearing",
    category: "Bearings & Power Transmission",
    query: "SKF 6205-2RSH Deep Groove Ball Bearing CAD and load ratings",
    basePrice: 24.50,
    unitCost: 8.80,
    baseVolume: 12500,
    elasticity: 1.45, // Moderately elastic - competitive alternatives exist
    competitorPrice: 21.90,
    competitorBrand: "Timken 6205-2RS / NSK 6205DDU",
    quadrant: 'differentiated'
  },
  {
    id: 'parker-valve',
    name: "Parker 1/2\" NPT Brass Ball Valve 600 WOG",
    category: "Valves & Fluid Control",
    query: "Parker 1/2 in NPT female brass ball valve 600 WOG",
    basePrice: 42.00,
    unitCost: 19.50,
    baseVolume: 4200,
    elasticity: 0.85, // Relatively inelastic - strict specs
    competitorPrice: 38.50,
    competitorBrand: "Apollo Valves 70-100 Series",
    quadrant: 'staple'
  },
  {
    id: 'festo-cylinder',
    name: "Festo DFSP-20-15-PS-A Compact Cylinder",
    category: "Pneumatics & Hydraulics",
    query: "Festo DFSP-20-15-PS-A pneumatic compact cylinder stroke specifications",
    basePrice: 195.00,
    unitCost: 74.00,
    baseVolume: 1800,
    elasticity: 1.15,
    competitorPrice: 182.00,
    competitorBrand: "SMC CQ2B20-15D Pneumatic Cylinder",
    quadrant: 'differentiated'
  },
  {
    id: 'grade8-fasteners',
    name: "Grade 8 Zinc-Yellow Hex Cap Screw 1/2\"-13",
    category: "Fasteners & Hardware",
    query: "Grade 8 Zinc Yellow finish hex cap screw 1/2-13 x 2 in fastener specifications",
    basePrice: 1.85,
    unitCost: 0.55,
    baseVolume: 150000,
    elasticity: 2.30, // Highly elastic - fungible commodity
    competitorPrice: 1.62,
    competitorBrand: "Fastenal / McMaster Standard Fasteners",
    quadrant: 'commodity'
  }
];

function renderInlineBolds(text: string) {
  const parts = text.split(/\*\*([\s\S]*?)\*\*/g);
  if (parts.length === 1) return text;
  
  return parts.map((part, idx) => {
    if (idx % 2 === 1) {
      return (
        <strong key={idx} className="font-bold text-white bg-slate-900 border border-slate-800 px-1 py-0.5 rounded font-mono text-[10px] mx-0.5 shadow-sm">
          {part}
        </strong>
      );
    }
    return part;
  });
}

// Specialized Markdown and Advisory Parser for C-level Decision Makers
function ExecutiveAdvisoryFormatter({ text }: { text: string }) {
  if (!text) return null;

  const lines = text.split('\n');
  const parsedItems: ParsedItem[] = [];
  
  let currentKeyValues: KeyValue[] = [];
  let currentBullets: string[] = [];

  const flushKeyValues = () => {
    if (currentKeyValues.length > 0) {
      parsedItems.push({ type: 'specs-grid', keyValues: [...currentKeyValues] });
      currentKeyValues = [];
    }
  };

  const flushBullets = () => {
    if (currentBullets.length > 0) {
      parsedItems.push({ type: 'bullet-list', items: [...currentBullets] });
      currentBullets = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check for Divider
    if (line === '---' || line === '***') {
      flushKeyValues();
      flushBullets();
      parsedItems.push({ type: 'divider' });
      continue;
    }

    // Check for Headings
    if (line.startsWith('# ')) {
      flushKeyValues();
      flushBullets();
      parsedItems.push({ type: 'h1', text: line.replace('# ', '').trim() });
      continue;
    }
    if (line.startsWith('## ')) {
      flushKeyValues();
      flushBullets();
      const headingText = line.replace('## ', '').trim();
      if (headingText.toUpperCase().includes('RECOMMENDATION')) {
        let recType: 'BUY' | 'SELL' | 'ACCUMULATE' | 'DISCONTINUE' | 'NEUTRAL' = 'NEUTRAL';
        if (headingText.toUpperCase().includes('BUY')) recType = 'BUY';
        else if (headingText.toUpperCase().includes('SELL')) recType = 'SELL';
        else if (headingText.toUpperCase().includes('ACCUMULATE')) recType = 'ACCUMULATE';
        else if (headingText.toUpperCase().includes('DISCONTINUE')) recType = 'DISCONTINUE';

        parsedItems.push({ 
          type: 'recommendation-banner', 
          text: headingText, 
          recType 
        });
      } else {
        parsedItems.push({ type: 'h2', text: headingText });
      }
      continue;
    }
    if (line.startsWith('### ')) {
      flushKeyValues();
      flushBullets();
      parsedItems.push({ type: 'h3', text: line.replace('### ', '').trim() });
      continue;
    }

    // Check for Competitor Line-up List items
    const compMatch = line.match(/^\s*[\*\-]\s*\*\*Competitor Brand\*\*:\s*(.*)/i);
    if (compMatch) {
      flushKeyValues();
      flushBullets();
      
      let competitorBrand = compMatch[1].trim();
      let competitorModel = '';
      let competitorPrice = '';
      let competitorAdv = '';
      let competitorDisadv = '';

      while (i + 1 < lines.length && (lines[i+1].trim().startsWith('*') || lines[i+1].trim().startsWith('-') || lines[i+1].trim().startsWith(' '))) {
        i++;
        const subLine = lines[i].trim();
        if (subLine.toUpperCase().includes('MODEL')) {
          competitorModel = subLine.split(':').slice(1).join(':').replace(/\*/g, '').trim();
        } else if (subLine.toUpperCase().includes('PRICE') || subLine.toUpperCase().includes('MSRP')) {
          competitorPrice = subLine.split(':').slice(1).join(':').replace(/\*/g, '').trim();
        } else if (subLine.toUpperCase().includes('ADVANTAGE') && !subLine.toUpperCase().includes('DISADVANTAGE')) {
          competitorAdv = subLine.split(':').slice(1).join(':').replace(/\*/g, '').trim();
        } else if (subLine.toUpperCase().includes('DISADVANTAGE')) {
          competitorDisadv = subLine.split(':').slice(1).join(':').replace(/\*/g, '').trim();
        }
      }

      parsedItems.push({
        type: 'competitor-card',
        competitorBrand,
        competitorModel,
        competitorPrice,
        competitorAdv,
        competitorDisadv
      });
      continue;
    }

    // Check for key-value parameters
    const keyValueMatch = line.match(/^\s*[\*\-]\s*\*\*(.*?)\*\*:\s*(.*)/);
    if (keyValueMatch) {
      flushBullets();
      currentKeyValues.push({
        key: keyValueMatch[1].trim(),
        value: keyValueMatch[2].trim()
      });
      continue;
    }

    // Bullet points
    if (line.startsWith('* ') || line.startsWith('- ')) {
      flushKeyValues();
      const bulletText = line.substring(2).trim();
      if (bulletText) {
        currentBullets.push(bulletText);
      }
      continue;
    }

    // Plain Paragraph text
    if (line) {
      flushKeyValues();
      flushBullets();
      parsedItems.push({ type: 'paragraph', text: line });
    }
  }

  flushKeyValues();
  flushBullets();

  return (
    <div className="space-y-4 text-slate-300">
      {parsedItems.map((item, index) => {
        switch (item.type) {
          case 'h1':
            return (
              <h1 key={index} className="text-sm font-bold text-white border-b border-slate-800 pb-2 mt-4 tracking-tight flex items-center gap-2 font-mono">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                {item.text}
              </h1>
            );
          case 'h2':
            return (
              <h2 key={index} className="text-xs font-bold text-indigo-400 uppercase tracking-wider mt-4 flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-indigo-500 rounded-sm"></span>
                {item.text}
              </h2>
            );
          case 'h3':
            return (
              <h3 key={index} className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-3 border-b border-slate-900 pb-1 flex items-center gap-2">
                <span className="w-1 h-2.5 bg-slate-500 rounded-sm"></span>
                {item.text}
              </h3>
            );
          case 'divider':
            return <div key={index} className="border-t border-slate-900 my-3" />;
          case 'paragraph':
            return (
              <p key={index} className="text-[11px] text-slate-300 leading-relaxed font-sans font-normal antialiased">
                {renderInlineBolds(item.text || '')}
              </p>
            );
          case 'bullet-list':
            return (
              <ul key={index} className="space-y-1.5 pl-1.5">
                {item.items?.map((li, liIdx) => (
                  <li key={liIdx} className="text-[11px] text-slate-300 flex items-start gap-2 leading-relaxed">
                    <span className="mt-1.5 w-1 h-1 bg-indigo-500 rounded-full flex-shrink-0" />
                    <span className="font-sans font-normal antialiased">{renderInlineBolds(li)}</span>
                  </li>
                ))}
              </ul>
            );
          case 'specs-grid':
            return (
              <div key={index} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 my-3">
                {item.keyValues?.map((kv, kvIdx) => (
                  <div key={kvIdx} className="flex flex-col p-2.5 rounded-xl bg-slate-950/80 border border-slate-900/80 hover:border-slate-800/60 transition-all shadow-sm">
                    <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">
                      {kv.key}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-200 font-mono tracking-wide leading-tight">
                      {kv.value}
                    </span>
                  </div>
                ))}
              </div>
            );
          case 'recommendation-banner':
            const isBuy = item.recType === 'BUY' || item.recType === 'ACCUMULATE';
            const isSell = item.recType === 'SELL' || item.recType === 'DISCONTINUE';
            
            return (
              <div key={index} className={`my-4 p-3.5 rounded-xl border ${
                isBuy 
                  ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200 shadow-md shadow-emerald-500/5' 
                  : isSell 
                  ? 'bg-rose-950/30 border-rose-500/30 text-rose-200 shadow-md shadow-rose-500/5' 
                  : 'bg-amber-950/30 border-amber-500/30 text-amber-200 shadow-md shadow-amber-500/5'
              }`}>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span className={`w-2 h-2 rounded-full animate-pulse ${
                    isBuy ? 'bg-emerald-400' : isSell ? 'bg-rose-400' : 'bg-amber-400'
                  }`} />
                  <h2 className="text-xs font-bold uppercase tracking-widest font-mono">
                    {item.text}
                  </h2>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal font-sans">
                  Rigorous grounded market recommendation formulated through cross-referencing distributor pricing indexes and lead-time volatility.
                </p>
              </div>
            );
          case 'competitor-card':
            return (
              <div key={index} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-900 hover:border-indigo-950/60 transition-all my-2.5 shadow-md">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-2.5">
                  <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">{item.competitorBrand}</span>
                  {item.competitorPrice && (
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-lg font-bold font-mono">
                      {item.competitorPrice}
                    </span>
                  )}
                </div>
                <div className="space-y-1.5">
                  {item.competitorModel && (
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest w-16 shrink-0">Model</span>
                      <span className="text-[11px] font-mono font-bold text-slate-300">{item.competitorModel}</span>
                    </div>
                  )}
                  {item.competitorAdv && (
                    <div className="flex items-start gap-2">
                      <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest w-16 shrink-0 mt-0.5">Advantage</span>
                      <span className="text-[11px] text-slate-300 font-sans leading-relaxed">{item.competitorAdv}</span>
                    </div>
                  )}
                  {item.competitorDisadv && (
                    <div className="flex items-start gap-2">
                      <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest w-16 shrink-0 mt-0.5">Disadvantage</span>
                      <span className="text-[11px] text-slate-300 font-sans leading-relaxed">{item.competitorDisadv}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

export default function MarketIntelligence({ themeStyles, isLight, isAmber }: { themeStyles?: any; isLight?: boolean; isAmber?: boolean }) {
  const [activeSubTab, setActiveSubTab] = useState<'curves' | 'matrix' | 'scenarios' | 'ai-advisory'>('curves');
  const [selectedSku, setSelectedSku] = useState<PresetSKU>(PRESET_SKUS[0]);
  
  // Interactive Simulation State
  const [simBasePrice, setSimBasePrice] = useState<number>(PRESET_SKUS[0].basePrice);
  const [simUnitCost, setSimUnitCost] = useState<number>(PRESET_SKUS[0].unitCost);
  const [simVolume, setSimVolume] = useState<number>(PRESET_SKUS[0].baseVolume);
  const [simElasticity, setSimElasticity] = useState<number>(PRESET_SKUS[0].elasticity);
  const [marketPressure, setMarketPressure] = useState<number>(45); // 0-100%

  // Live Query & AI Advisory State
  const [queryInput, setQueryInput] = useState(PRESET_SKUS[0].query);
  const [resultText, setResultText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Synchronize simulation sliders when SKU preset changes
  const handleSelectSku = (sku: PresetSKU) => {
    setSelectedSku(sku);
    setSimBasePrice(sku.basePrice);
    setSimUnitCost(sku.unitCost);
    setSimVolume(sku.baseVolume);
    setSimElasticity(sku.elasticity);
    setQueryInput(sku.query);
  };

  // Mathematical Modeling: Price Elasticity of Demand (PED) & Revenue / Profit Curves
  const { curveData, optimalPrice, optimalProfit, baselineProfit, profitDelta, optimalRevenue, optimalMarginPct, baselineMarginPct } = useMemo(() => {
    const P0 = simBasePrice;
    const C = simUnitCost;
    const Q0 = simVolume;
    const eps = simElasticity;
    
    // Calculate 25 points along price spectrum (from 50% of P0 to 180% of P0)
    const minP = Math.max(C * 1.05, P0 * 0.5);
    const maxP = P0 * 1.8;
    const step = (maxP - minP) / 24;

    const data: Array<{
      price: number;
      priceFormatted: string;
      demand: number;
      revenue: number;
      revenueK: number;
      profit: number;
      profitK: number;
      marginPct: number;
      isBaseline?: boolean;
    }> = [];

    let bestProfit = -Infinity;
    let bestP = P0;
    let bestRev = 0;
    let bestMargin = 0;

    for (let p = minP; p <= maxP + 0.001; p += step) {
      // PED Demand Equation: Q(P) = Q0 * (P / P0)^(-eps)
      const ratio = p / P0;
      const demand = Math.max(1, Math.round(Q0 * Math.pow(ratio, -eps)));
      const revenue = p * demand;
      const profit = (p - C) * demand;
      const marginPct = p > 0 ? Math.round(((p - C) / p) * 100) : 0;

      if (profit > bestProfit) {
        bestProfit = profit;
        bestP = p;
        bestRev = revenue;
        bestMargin = marginPct;
      }

      data.push({
        price: Math.round(p * 100) / 100,
        priceFormatted: `$${p >= 1000 ? (p / 1000).toFixed(1) + 'k' : p.toFixed(p < 10 ? 2 : 0)}`,
        demand,
        revenue: Math.round(revenue),
        revenueK: Math.round(revenue / 1000),
        profit: Math.round(profit),
        profitK: Math.round(profit / 1000),
        marginPct
      });
    }

    const currentBaseProfit = (P0 - C) * Q0;
    const currentBaseMargin = P0 > 0 ? Math.round(((P0 - C) / P0) * 100) : 0;
    const pDelta = bestProfit - currentBaseProfit;

    return {
      curveData: data,
      optimalPrice: bestP,
      optimalProfit: bestProfit,
      baselineProfit: currentBaseProfit,
      profitDelta: pDelta,
      optimalRevenue: bestRev,
      optimalMarginPct: bestMargin,
      baselineMarginPct: currentBaseMargin
    };
  }, [simBasePrice, simUnitCost, simVolume, simElasticity]);

  // Scenario Table Data Generator
  const scenarios = useMemo(() => {
    const P0 = simBasePrice;
    const C = simUnitCost;
    const Q0 = simVolume;
    const eps = simElasticity;

    const computeScenario = (name: string, priceMult: number, riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'OPTIMAL') => {
      const price = P0 * priceMult;
      const demand = Math.max(1, Math.round(Q0 * Math.pow(price / P0, -eps)));
      const revenue = price * demand;
      const profit = (price - C) * demand;
      const marginPct = price > 0 ? ((price - C) / price) * 100 : 0;
      const profitDiff = profit - baselineProfit;

      return {
        name,
        price,
        demand,
        revenue,
        profit,
        marginPct,
        profitDiff,
        riskLevel
      };
    };

    return [
      computeScenario("Aggressive Liquidation (-20%)", 0.80, "HIGH"),
      computeScenario("Competitive Penetration (-10%)", 0.90, "MEDIUM"),
      computeScenario("Current Baseline (0%)", 1.00, "LOW"),
      {
        name: "AI Elasticity Optimal (P*)",
        price: optimalPrice,
        demand: Math.round(simVolume * Math.pow(optimalPrice / simBasePrice, -simElasticity)),
        revenue: optimalRevenue,
        profit: optimalProfit,
        marginPct: optimalMarginPct,
        profitDiff: profitDelta,
        riskLevel: 'OPTIMAL' as const
      },
      computeScenario("Margin Expansion (+10%)", 1.10, "LOW"),
      computeScenario("Premium Skimming (+25%)", 1.25, "HIGH")
    ];
  }, [simBasePrice, simUnitCost, simVolume, simElasticity, optimalPrice, optimalProfit, baselineProfit, profitDelta, optimalRevenue, optimalMarginPct]);

  // Trigger AI Advisory via Gemini 3.6 API
  const triggerAnalysis = async (queryToUse: string) => {
    if (!queryToUse.trim()) return;
    setLoading(true);
    setResultText('');
    try {
      const response = await fetch('/api/market-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryToUse })
      });
      const data = await response.json();
      setResultText(data.text || 'No market report returned.');
    } catch (err: any) {
      console.error(err);
      setResultText(`⚠️ Failed to generate report: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!resultText) return;
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportScenariosCSV = () => {
    const headers = ["Scenario", "Unit Price ($)", "Estimated Demand (units)", "Gross Revenue ($)", "Gross Profit ($)", "Gross Margin (%)", "Profit Delta vs Baseline ($)", "Risk Rating"];
    const rows = scenarios.map(s => [
      `"${s.name}"`,
      s.price.toFixed(2),
      s.demand,
      s.revenue.toFixed(2),
      s.profit.toFixed(2),
      s.marginPct.toFixed(1),
      s.profitDiff.toFixed(2),
      s.riskLevel
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Market_Elasticity_Scenarios_${selectedSku.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Quadrant categorization details
  const quadrantInfo = {
    moat: {
      title: "Strategic Moat (Proprietary / High Margin, Low Elasticity)",
      badge: "bg-purple-950/60 border-purple-500/50 text-purple-300",
      description: "Mission-critical architectures with high switching barriers. Customers prioritize zero-downtime reliability over price sensitivity. Opportunity: Value-based pricing & premium SLAs."
    },
    differentiated: {
      title: "Differentiated Precision (High Margin, High Elasticity)",
      badge: "bg-indigo-950/60 border-indigo-500/50 text-indigo-300",
      description: "Engineered components with available OEM alternatives. Volume sensitive to price differentials. Opportunity: Dynamic discount tiering & warranty bundling."
    },
    staple: {
      title: "Essential MRO Staple (Low Margin, Low Elasticity)",
      badge: "bg-teal-950/60 border-teal-500/50 text-teal-300",
      description: "Non-negotiable consumable parts in high-wear environments. Low margins but continuous mandatory replenishment. Opportunity: Automated Vendor-Managed Inventory (VMI)."
    },
    commodity: {
      title: "Fungible Commodity (Low Margin, High Elasticity)",
      badge: "bg-amber-950/60 border-amber-500/50 text-amber-300",
      description: "Standardized hardware with zero switching friction and heavy gray-market competition. Opportunity: Procurement spot bidding and high-velocity aggregation."
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex-1 flex flex-col p-6 space-y-6 overflow-y-auto global-scroll-container"
    >
      {/* Top Executive Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <motion.div 
              whileHover={{ rotate: 15, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20"
            >
              <TrendingUp size={18} />
            </motion.div>
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
                Market Intelligence & Elasticity Matrix Studio
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-bold">
                  v4.5 PRO
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                Econometric price elasticity modeling (PED), dynamic profit curve optimization & grounded competitor telemetry.
              </p>
            </div>
          </div>
        </div>

        {/* Live Status Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[10px] font-mono flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">PED Engine:</span>
            <span className="text-emerald-300 font-bold">Active ε-Model</span>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="px-3 py-1.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-[10px] font-mono flex items-center gap-2"
          >
            <Zap size={12} className="text-indigo-400" />
            <span className="text-indigo-200">Gemini 3.6 Search Grounding</span>
          </motion.div>
        </div>
      </div>

      {/* Preset SKU Selector Ribbon */}
      <motion.div 
        id="market-preset-skus"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 space-y-3"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Layers size={13} className="text-indigo-400" />
            Benchmark Industrial SKU Models & Elasticity Profiles:
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Click to auto-simulate PED curve</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {PRESET_SKUS.map((sku, idx) => {
            const isSelected = selectedSku.id === sku.id;
            return (
              <motion.button
                key={sku.id}
                onClick={() => handleSelectSku(sku)}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.04 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`p-3 rounded-xl text-left transition-all border flex flex-col justify-between h-24 cursor-pointer relative overflow-hidden ${
                  isSelected 
                    ? 'bg-indigo-950/50 border-indigo-500/80 shadow-lg shadow-indigo-600/10' 
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                {isSelected && (
                  <motion.div 
                    layoutId="selectedSkuGlow"
                    className="absolute top-0 right-0 w-12 h-12 bg-indigo-500/10 rounded-bl-full pointer-events-none" 
                  />
                )}
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">{sku.category.split('&')[0]}</span>
                    <span className={`text-[8px] font-bold font-mono px-1.5 py-0.2 rounded border ${
                      sku.elasticity < 1 ? 'bg-teal-950/80 text-teal-300 border-teal-500/30' : 'bg-amber-950/80 text-amber-300 border-amber-500/30'
                    }`}>
                      ε = {sku.elasticity.toFixed(2)}
                    </span>
                  </div>
                  <span className={`text-[11px] font-bold line-clamp-2 leading-tight ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                    {sku.name}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-slate-800/80 mt-1">
                  <span className="text-slate-400">Base: ${sku.basePrice >= 1000 ? sku.basePrice.toLocaleString() : sku.basePrice.toFixed(2)}</span>
                  <span className="text-indigo-400 font-bold flex items-center gap-0.5">
                    {isSelected ? 'Simulating' : 'Load'} <ChevronRight size={11} />
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2 overflow-x-auto custom-scrollbar">
        <button
          id="market-subtab-curves"
          onClick={() => setActiveSubTab('curves')}
          className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
            activeSubTab === 'curves'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <BarChart2 size={15} />
          <span>Price Curves & Profit Optimization HUD</span>
        </button>

        <button
          id="market-subtab-matrix"
          onClick={() => setActiveSubTab('matrix')}
          className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
            activeSubTab === 'matrix'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Target size={15} />
          <span>4-Quadrant Elasticity Matrix</span>
        </button>

        <button
          id="market-subtab-scenarios"
          onClick={() => setActiveSubTab('scenarios')}
          className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
            activeSubTab === 'scenarios'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Activity size={15} />
          <span>Sensitivity & Scenario Matrix</span>
        </button>

        <button
          id="market-subtab-ai"
          onClick={() => setActiveSubTab('ai-advisory')}
          className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
            activeSubTab === 'ai-advisory'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Compass size={15} />
          <span>Executive AI Grounded Advisory</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* TAB 1: PRICE CURVES & ELASTICITY MODELING HUD */}
        {activeSubTab === 'curves' && (
          <motion.div 
            key="tab-curves"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="space-y-6"
          >
            {/* Real-time KPI Cards HUD */}
            <div id="market-kpi-hud" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div 
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
                className="p-4 rounded-2xl bg-slate-950/60 border border-slate-900 shadow-sm relative overflow-hidden group"
              >
                <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase tracking-wider mb-1">
                  <span>Baseline Price / Unit Cost</span>
                  <DollarSign size={14} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
                </div>
                <motion.div 
                  key={`base-${simBasePrice}-${simUnitCost}`}
                  initial={{ opacity: 0.6, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="text-xl font-bold font-mono text-white"
                >
                  ${simBasePrice.toLocaleString(undefined, { minimumFractionDigits: simBasePrice < 10 ? 2 : 0, maximumFractionDigits: 2 })}
                  <span className="text-xs text-slate-400 font-normal ml-2">/ ${simUnitCost.toLocaleString(undefined, { minimumFractionDigits: simUnitCost < 10 ? 2 : 0, maximumFractionDigits: 2 })} COGS</span>
                </motion.div>
                <div className="text-[10px] text-slate-400 font-mono mt-2 flex items-center justify-between border-t border-slate-900 pt-1.5">
                  <span>Baseline Margin:</span>
                  <span className="text-indigo-400 font-bold">{baselineMarginPct}%</span>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
                className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 shadow-sm relative overflow-hidden group"
              >
                <div className="flex items-center justify-between text-indigo-300 text-[10px] font-mono uppercase tracking-wider mb-1">
                  <span>AI Optimal Price (P*)</span>
                  <Target size={14} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                </div>
                <motion.div 
                  key={`opt-${optimalPrice}`}
                  initial={{ opacity: 0.6, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="text-xl font-bold font-mono text-indigo-200"
                >
                  ${optimalPrice.toLocaleString(undefined, { minimumFractionDigits: optimalPrice < 10 ? 2 : 0, maximumFractionDigits: 2 })}
                  <span className="text-xs text-emerald-400 font-normal ml-2">
                    ({optimalPrice >= simBasePrice ? '+' : ''}{Math.round(((optimalPrice - simBasePrice) / simBasePrice) * 100)}%)
                  </span>
                </motion.div>
                <div className="text-[10px] text-indigo-300 font-mono mt-2 flex items-center justify-between border-t border-indigo-950 pt-1.5">
                  <span>Optimal Margin:</span>
                  <span className="text-emerald-400 font-bold">{optimalMarginPct}%</span>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
                className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 shadow-sm relative overflow-hidden group"
              >
                <div className="flex items-center justify-between text-emerald-300 text-[10px] font-mono uppercase tracking-wider mb-1">
                  <span>Profit Maximization Delta</span>
                  <TrendingUp size={14} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                </div>
                <motion.div 
                  key={`delta-${profitDelta}`}
                  initial={{ opacity: 0.6, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="text-xl font-bold font-mono text-emerald-300 flex items-center gap-1.5"
                >
                  {profitDelta >= 0 ? '+' : '-'}${Math.abs(Math.round(profitDelta)).toLocaleString()}
                  <span className="text-xs font-normal">
                    ({profitDelta >= 0 ? '+' : ''}{baselineProfit > 0 ? Math.round((profitDelta / baselineProfit) * 100) : 0}%)
                  </span>
                </motion.div>
                <div className="text-[10px] text-emerald-400/80 font-mono mt-2 flex items-center justify-between border-t border-emerald-950 pt-1.5">
                  <span>Projected Gross Profit:</span>
                  <span className="font-bold">${Math.round(optimalProfit).toLocaleString()}</span>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
                className="p-4 rounded-2xl bg-slate-950/60 border border-slate-900 shadow-sm relative overflow-hidden group"
              >
                <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase tracking-wider mb-1">
                  <span>Price Elasticity (PED ε)</span>
                  <Activity size={14} className="text-amber-400 group-hover:scale-110 transition-transform" />
                </div>
                <motion.div 
                  key={`ped-${simElasticity}`}
                  initial={{ opacity: 0.6, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="text-xl font-bold font-mono text-white flex items-center gap-2"
                >
                  ε = {simElasticity.toFixed(2)}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    simElasticity < 1 
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' 
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {simElasticity < 1 ? 'Inelastic' : 'Elastic'}
                  </span>
                </motion.div>
                <div className="text-[10px] text-slate-400 font-mono mt-2 flex items-center justify-between border-t border-slate-900 pt-1.5">
                  <span>Demand Sensitivity:</span>
                  <span className="text-slate-200">{simElasticity < 1 ? 'Low price sensitivity' : 'High substitution risk'}</span>
                </div>
              </motion.div>
            </div>

            {/* Interactive Simulation Dashboard (Sliders + Recharts Visualization) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Interactive HUD Sliders Controller */}
              <motion.div 
                id="market-ped-sliders"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="lg:col-span-4 bg-slate-950/60 border border-slate-900 rounded-2xl p-5 space-y-4 flex flex-col justify-between shadow-md"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <Sliders size={14} className="text-indigo-400" />
                      Elasticity & Cost Parameters HUD
                    </span>
                    <button 
                      onClick={() => handleSelectSku(selectedSku)}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 font-mono flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <RefreshCw size={10} /> Reset
                    </button>
                  </div>

                  {/* Slider: Baseline Price */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-slate-400">Baseline Unit Price (P₀):</span>
                      <span className="text-white font-bold">${simBasePrice.toLocaleString()}</span>
                    </div>
                    <input 
                      type="range"
                      min={Math.max(1, Math.round(selectedSku.basePrice * 0.4))}
                      max={Math.round(selectedSku.basePrice * 2.0)}
                      step={selectedSku.basePrice > 100 ? 5 : selectedSku.basePrice > 10 ? 0.5 : 0.05}
                      value={simBasePrice}
                      onChange={(e) => setSimBasePrice(parseFloat(e.target.value))}
                      className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                      <span>${Math.round(selectedSku.basePrice * 0.4)}</span>
                      <span>${Math.round(selectedSku.basePrice * 2.0)}</span>
                    </div>
                  </div>

                  {/* Slider: Unit COGS */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-slate-400">Unit Cost of Goods (COGS):</span>
                      <span className="text-white font-bold">${simUnitCost.toLocaleString()}</span>
                    </div>
                    <input 
                      type="range"
                      min={Math.max(0.5, Math.round(selectedSku.unitCost * 0.5))}
                      max={Math.min(simBasePrice * 0.95, Math.round(selectedSku.unitCost * 1.8))}
                      step={selectedSku.unitCost > 100 ? 5 : selectedSku.unitCost > 10 ? 0.5 : 0.05}
                      value={simUnitCost}
                      onChange={(e) => setSimUnitCost(parseFloat(e.target.value))}
                      className="w-full accent-teal-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                      <span>${Math.round(selectedSku.unitCost * 0.5)}</span>
                      <span>${Math.round(simBasePrice * 0.95)}</span>
                    </div>
                  </div>

                  {/* Slider: Baseline Volume */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-slate-400">Baseline Annual Volume (Q₀):</span>
                      <span className="text-white font-bold">{simVolume.toLocaleString()} units</span>
                    </div>
                    <input 
                      type="range"
                      min={Math.round(selectedSku.baseVolume * 0.2)}
                      max={Math.round(selectedSku.baseVolume * 3.0)}
                      step={selectedSku.baseVolume > 1000 ? 50 : 5}
                      value={simVolume}
                      onChange={(e) => setSimVolume(parseInt(e.target.value))}
                      className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Slider: Elasticity Factor (ε) */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-slate-400">Elasticity Coefficient (ε):</span>
                      <span className="text-amber-400 font-bold">{simElasticity.toFixed(2)}</span>
                    </div>
                    <input 
                      type="range"
                      min={0.10}
                      max={3.00}
                      step={0.05}
                      value={simElasticity}
                      onChange={(e) => setSimElasticity(parseFloat(e.target.value))}
                      className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                      <span>0.10 (Rigid Moat)</span>
                      <span>1.0 (Unitary)</span>
                      <span>3.00 (Pure Commodity)</span>
                    </div>
                  </div>

                  {/* Slider: Competitor Pressure */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-slate-400">Competitor Pressure Index:</span>
                      <span className="text-rose-400 font-bold">{marketPressure}%</span>
                    </div>
                    <input 
                      type="range"
                      min={0}
                      max={100}
                      value={marketPressure}
                      onChange={(e) => setMarketPressure(parseInt(e.target.value))}
                      className="w-full accent-rose-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Theoretical Summary Box */}
                <div className="bg-slate-900/60 border border-slate-850 p-3 rounded-xl space-y-1 text-[10px] text-slate-400 font-mono mt-4">
                  <div className="text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1 mb-1">
                    <Info size={11} /> Econometric Principle
                  </div>
                  <p className="font-sans leading-relaxed">
                    When ε &lt; 1 (inelastic), price hikes increase total revenue. When ε &gt; 1 (elastic), price cuts expand volume and increase revenue. The optimal price point balances unit margin against volume attrition.
                  </p>
                </div>
              </motion.div>

              {/* Recharts Price Curves Chart Display */}
              <motion.div 
                id="market-price-curves-chart"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="lg:col-span-8 bg-slate-950/60 border border-slate-900 rounded-2xl p-5 flex flex-col justify-between shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-3 mb-3">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                      <Activity size={14} className="text-indigo-400" />
                      Demand Volume, Revenue & Profit Optimization Curves
                    </h4>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Live mathematical mapping across price spectrum with P* profit peak
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-mono">
                    <div className="flex items-center gap-1 text-indigo-400">
                      <span className="w-2.5 h-2.5 rounded bg-indigo-500 inline-block" /> Revenue ($k)
                    </div>
                    <div className="flex items-center gap-1 text-emerald-400">
                      <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" /> Profit ($k)
                    </div>
                    <div className="flex items-center gap-1 text-purple-400">
                      <span className="w-2.5 h-2.5 rounded bg-purple-500 inline-block" /> Demand
                    </div>
                  </div>
                </div>

                {/* Main Recharts Area */}
                <div className="w-full h-80 pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={curveData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                      <defs>
                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                        </linearGradient>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                      <XAxis 
                        dataKey="priceFormatted" 
                        stroke="#64748B" 
                        tick={{ fontSize: 10, fontFamily: 'monospace' }}
                        label={{ value: 'Unit Price ($)', position: 'insideBottom', offset: -10, fill: '#64748B', fontSize: 10 }}
                      />
                      <YAxis 
                        yAxisId="left" 
                        stroke="#64748B" 
                        tick={{ fontSize: 10, fontFamily: 'monospace' }}
                        tickFormatter={(val) => `$${val}k`}
                      />
                      <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        stroke="#A855F7" 
                        tick={{ fontSize: 10, fontFamily: 'monospace' }}
                        tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}
                      />
                      <Tooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-slate-900/95 border border-slate-800 p-3 rounded-xl shadow-2xl font-mono text-xs text-white space-y-1">
                                <div className="text-indigo-400 font-bold border-b border-slate-800 pb-1">
                                  Price: ${data.price.toLocaleString()}
                                </div>
                                <div className="text-slate-300 flex justify-between gap-4">
                                  <span>Demand:</span> <strong className="text-purple-300">{data.demand.toLocaleString()} units</strong>
                                </div>
                                <div className="text-slate-300 flex justify-between gap-4">
                                  <span>Gross Revenue:</span> <strong className="text-indigo-300">${data.revenue.toLocaleString()}</strong>
                                </div>
                                <div className="text-slate-300 flex justify-between gap-4">
                                  <span>Gross Profit:</span> <strong className="text-emerald-300">${data.profit.toLocaleString()}</strong>
                                </div>
                                <div className="text-slate-300 flex justify-between gap-4">
                                  <span>Margin:</span> <strong className="text-teal-300">{data.marginPct}%</strong>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <ReferenceLine 
                        yAxisId="left"
                        x={`$${simBasePrice >= 1000 ? (simBasePrice/1000).toFixed(1) + 'k' : simBasePrice.toFixed(simBasePrice < 10 ? 2 : 0)}`}
                        stroke="#F59E0B" 
                        strokeDasharray="4 4"
                        label={{ value: 'Current P₀', position: 'top', fill: '#F59E0B', fontSize: 10, fontFamily: 'monospace' }}
                      />
                      <Area 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="profitK" 
                        name="Gross Profit ($k)" 
                        stroke="#10B981" 
                        strokeWidth={2.5}
                        fillOpacity={1} 
                        fill="url(#colorProfit)" 
                        isAnimationActive={true}
                        animationDuration={500}
                        animationEasing="ease-out"
                      />
                      <Area 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="revenueK" 
                        name="Revenue ($k)" 
                        stroke="#6366F1" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorRevenue)" 
                        isAnimationActive={true}
                        animationDuration={500}
                        animationEasing="ease-out"
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="demand" 
                        name="Demand Quantity" 
                        stroke="#A855F7" 
                        strokeWidth={1.5}
                        dot={false}
                        isAnimationActive={true}
                        animationDuration={500}
                        animationEasing="ease-out"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Bottom Quick Metric Annotations */}
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono pt-3 border-t border-slate-900 mt-2">
                  <div className="bg-slate-900/50 p-2 rounded-xl border border-slate-850">
                    <span className="text-slate-500 block">Unit Cost Floor</span>
                    <span className="text-slate-300 font-bold">${simUnitCost.toLocaleString()}</span>
                  </div>
                  <div className="bg-slate-900/50 p-2 rounded-xl border border-slate-850">
                    <span className="text-slate-500 block">Competitor Index Benchmark</span>
                    <span className="text-rose-400 font-bold">${selectedSku.competitorPrice.toLocaleString()}</span>
                  </div>
                  <div className="bg-slate-900/50 p-2 rounded-xl border border-slate-850">
                    <span className="text-slate-500 block">Recommended Price Action</span>
                    <span className={`font-bold ${optimalPrice > simBasePrice ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {optimalPrice > simBasePrice ? `Expand Price to $${optimalPrice.toFixed(0)}` : `Optimize Volume at $${optimalPrice.toFixed(0)}`}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: 4-QUADRANT ELASTICITY MATRIX */}
        {activeSubTab === 'matrix' && (
          <motion.div 
            key="tab-matrix"
            id="market-quadrant-matrix"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="space-y-6"
          >
            <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-6 shadow-md">
              <div className="border-b border-slate-900 pb-3 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                    <Target size={16} className="text-indigo-400" />
                    Industrial 4-Quadrant Elasticity & Pricing Power Matrix
                  </h3>
                  <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                    Strategic positioning framework mapping catalog SKUs across Price Elasticity (ε) vs Gross Margin %.
                  </p>
                </div>
                <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                  Active Category: <strong className="text-indigo-400">{selectedSku.category}</strong>
                </span>
              </div>

              {/* 4 Quadrants Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Q1: Strategic Moat */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.05 }}
                  whileHover={{ y: -2 }}
                  className={`p-5 rounded-2xl border transition-all ${
                    selectedSku.quadrant === 'moat'
                      ? 'bg-purple-950/40 border-purple-500/80 shadow-lg shadow-purple-600/10 ring-1 ring-purple-500/30'
                      : 'bg-slate-900/40 border-slate-850'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                      <h4 className="text-xs font-bold text-purple-200 uppercase font-mono tracking-wider">
                        Quadrant I: Strategic Moat
                      </h4>
                    </div>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-500/30">
                      High Margin • Inelastic (ε &lt; 1)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-sans leading-relaxed mb-4">
                    Proprietary industrial systems (e.g., Rockwell ControlLogix CPUs, Siemens Safety I/O). Customers face immense re-engineering switching costs and demand zero-failure SLA guarantees.
                  </p>
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-[10px] font-mono space-y-1">
                    <span className="text-purple-400 font-bold uppercase tracking-wider block">Recommended Strategy:</span>
                    <span className="text-slate-300">Value-based premium pricing with guaranteed next-day replacement SLA lock-in.</span>
                  </div>
                </motion.div>

                {/* Q2: Differentiated Precision */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  whileHover={{ y: -2 }}
                  className={`p-5 rounded-2xl border transition-all ${
                    selectedSku.quadrant === 'differentiated'
                      ? 'bg-indigo-950/40 border-indigo-500/80 shadow-lg shadow-indigo-600/10 ring-1 ring-indigo-500/30'
                      : 'bg-slate-900/40 border-slate-850'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                      <h4 className="text-xs font-bold text-indigo-200 uppercase font-mono tracking-wider">
                        Quadrant II: Differentiated Precision
                      </h4>
                    </div>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-500/30">
                      High Margin • Elastic (ε &gt; 1)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-sans leading-relaxed mb-4">
                    Engineered precision parts (e.g., SKF Deep Groove Bearings, Festo Compact Cylinders). High brand preference, but viable direct replacements exist from Timken, NSK, or SMC.
                  </p>
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-[10px] font-mono space-y-1">
                    <span className="text-indigo-400 font-bold uppercase tracking-wider block">Recommended Strategy:</span>
                    <span className="text-slate-300">Dynamic competitive indexing against distributor catalogs with volume threshold tiering.</span>
                  </div>
                </motion.div>

                {/* Q3: Essential MRO Staple */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.15 }}
                  whileHover={{ y: -2 }}
                  className={`p-5 rounded-2xl border transition-all ${
                    selectedSku.quadrant === 'staple'
                      ? 'bg-teal-950/40 border-teal-500/80 shadow-lg shadow-teal-600/10 ring-1 ring-teal-500/30'
                      : 'bg-slate-900/40 border-slate-850'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
                      <h4 className="text-xs font-bold text-teal-200 uppercase font-mono tracking-wider">
                        Quadrant III: Essential MRO Staple
                      </h4>
                    </div>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-teal-950/80 text-teal-300 border border-teal-500/30">
                      Low Margin • Inelastic (ε &lt; 1)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-sans leading-relaxed mb-4">
                    Standardized fluid control valves, heavy pipe flanges, and industrial gaskets. Low unit price, but plant shutdown without them costs thousands per hour.
                  </p>
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-[10px] font-mono space-y-1">
                    <span className="text-teal-400 font-bold uppercase tracking-wider block">Recommended Strategy:</span>
                    <span className="text-slate-300">Cost-plus formula indexing and auto-replenishment smart replenishment contracts.</span>
                  </div>
                </motion.div>

                {/* Q4: Fungible Commodity */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  whileHover={{ y: -2 }}
                  className={`p-5 rounded-2xl border transition-all ${
                    selectedSku.quadrant === 'commodity'
                      ? 'bg-amber-950/40 border-amber-500/80 shadow-lg shadow-amber-600/10 ring-1 ring-amber-500/30'
                      : 'bg-slate-900/40 border-slate-850'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <h4 className="text-xs font-bold text-amber-200 uppercase font-mono tracking-wider">
                        Quadrant IV: Fungible Commodity
                      </h4>
                    </div>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/30">
                      Low Margin • Highly Elastic (ε &gt; 2)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-sans leading-relaxed mb-4">
                    Grade 8 fasteners, standard PPE, zip ties, generic wiring. High buyer price transparency and severe gray market price friction.
                  </p>
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-[10px] font-mono space-y-1">
                    <span className="text-amber-400 font-bold uppercase tracking-wider block">Recommended Strategy:</span>
                    <span className="text-slate-300">Automated programmatic spot-bidding, supplier aggregation and bulk freight optimization.</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: SENSITIVITY & SCENARIO MATRIX */}
        {activeSubTab === 'scenarios' && (
          <motion.div 
            key="tab-scenarios"
            id="market-scenario-table"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="space-y-4"
          >
            <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-5 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900 pb-3 mb-4">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                    <Activity size={15} className="text-indigo-400" />
                    Pricing Scenario Sensitivity Matrix
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Forecasted revenue, demand volume, and profit impact across alternative price strategies.
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={exportScenariosCSV}
                  className="flex items-center gap-1.5 text-xs font-mono font-bold bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500 text-slate-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm self-start sm:self-center"
                >
                  <Download size={13} className="text-indigo-400" />
                  <span>Export Scenario CSV</span>
                </motion.button>
              </div>

              {/* Matrix Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] text-slate-500 uppercase tracking-wider">
                      <th className="py-2.5 px-3">Strategy Scenario</th>
                      <th className="py-2.5 px-3">Unit Price</th>
                      <th className="py-2.5 px-3">Est. Demand</th>
                      <th className="py-2.5 px-3">Gross Revenue</th>
                      <th className="py-2.5 px-3">Gross Profit</th>
                      <th className="py-2.5 px-3">Margin %</th>
                      <th className="py-2.5 px-3">Profit Delta</th>
                      <th className="py-2.5 px-3 text-right">Risk Assessment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60">
                    {scenarios.map((row, idx) => {
                      const isOptimal = row.riskLevel === 'OPTIMAL';
                      const isBaseline = row.name.includes("Baseline");

                      return (
                        <motion.tr 
                          key={idx}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: idx * 0.04 }}
                          className={`transition-colors ${
                            isOptimal 
                              ? 'bg-indigo-950/40 text-white font-bold' 
                              : isBaseline 
                              ? 'bg-slate-900/40 text-slate-200' 
                              : 'hover:bg-slate-900/20 text-slate-300'
                          }`}
                        >
                          <td className="py-3 px-3 flex items-center gap-2">
                            {isOptimal && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                            <span>{row.name}</span>
                          </td>
                          <td className="py-3 px-3 text-white font-bold">
                            ${row.price.toLocaleString(undefined, { minimumFractionDigits: row.price < 10 ? 2 : 0, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-3 text-purple-300 font-mono">
                            {row.demand.toLocaleString()} units
                          </td>
                          <td className="py-3 px-3 text-indigo-300 font-mono">
                            ${Math.round(row.revenue).toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-emerald-300 font-mono font-bold">
                            ${Math.round(row.profit).toLocaleString()}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              row.marginPct > 50 ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-800 text-slate-300'
                            }`}>
                              {row.marginPct.toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`flex items-center gap-0.5 font-bold ${
                              row.profitDiff > 0 ? 'text-emerald-400' : row.profitDiff < 0 ? 'text-rose-400' : 'text-slate-400'
                            }`}>
                              {row.profitDiff > 0 ? <ArrowUpRight size={12} /> : row.profitDiff < 0 ? <ArrowDownRight size={12} /> : null}
                              {row.profitDiff > 0 ? '+' : ''}${Math.round(row.profitDiff).toLocaleString()}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              row.riskLevel === 'OPTIMAL' 
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                                : row.riskLevel === 'LOW' 
                                ? 'bg-slate-800 text-slate-300' 
                                : row.riskLevel === 'MEDIUM' 
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}>
                              {row.riskLevel}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: EXECUTIVE AI GROUNDED ADVISORY */}
        {activeSubTab === 'ai-advisory' && (
          <motion.div 
            key="tab-ai-advisory"
            id="market-ai-advisory-container"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="grid grid-cols-1 lg:grid-cols-5 gap-5 min-h-[440px] items-stretch"
          >
            {/* Search Parameter Section */}
            <motion.div 
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:col-span-2 flex flex-col justify-between bg-slate-950/60 border border-slate-900 rounded-2xl p-5 space-y-4 shadow-md"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                    Procurement Parameter Set
                  </span>
                  <Info className="w-3.5 h-3.5 text-slate-600" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Target Product Query (Model, MPN or Catalog Line)
                  </label>
                  <div className="relative">
                    <input 
                      type="text"
                      value={queryInput}
                      onChange={e => setQueryInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && triggerAnalysis(queryInput)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none font-mono transition-colors"
                      placeholder="e.g. Rockwell 1756-L83E Allen-Bradley"
                    />
                    <Search className="w-4 h-4 text-slate-600 absolute left-3 top-3" />
                  </div>
                </div>

                <div className="space-y-1.5 bg-slate-900/60 border border-slate-850 p-3.5 rounded-xl">
                  <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">
                    Grounding Architecture
                  </span>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                    The advisory pipeline performs Google Search Grounding with Gemini 3.6 to cross-reference real distributor MSRP indexes (Grainger, RS Components, Allied, DigiKey) and evaluate lead-time risks.
                  </p>
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => triggerAnalysis(queryInput)}
                disabled={loading || !queryInput.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/15 cursor-pointer mt-4 font-mono"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                {loading ? "Grounding Market Intelligence..." : "Initiate Market Intelligence"}
              </motion.button>
            </motion.div>

            {/* Display Advisory Section */}
            <motion.div 
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:col-span-3 flex flex-col bg-slate-950/60 border border-slate-900 rounded-2xl p-5 overflow-hidden shadow-md"
            >
              <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 font-mono">
                  <BarChart2 className="w-4 h-4 text-indigo-400" />
                  Executive Grounded Intelligence Report
                </h4>
                {resultText && (
                  <motion.button 
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={copyToClipboard}
                    className="text-[10px] font-mono flex items-center gap-1 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg cursor-pointer hover:bg-slate-850 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-indigo-400" />}
                    {copied ? 'Copied!' : 'Copy Advisory'}
                  </motion.button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto pr-1">
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div 
                      key="loading-report"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center h-full gap-3 text-indigo-400 font-mono text-xs py-20"
                    >
                      <RefreshCw className="w-6 h-6 animate-spin mb-1 text-indigo-400" />
                      <span>Interrogating competitors & grounding pricing indexes via Gemini 3.6...</span>
                    </motion.div>
                  ) : resultText ? (
                    <motion.div
                      key="result-report"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ExecutiveAdvisoryFormatter text={resultText} />
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="empty-report"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center h-full text-slate-500 text-center py-20 font-sans space-y-2"
                    >
                      <Compass className="w-10 h-10 text-slate-600 animate-spin-slow" />
                      <span className="text-xs font-bold text-slate-400 font-mono">System Ready for Market Intelligence</span>
                      <span className="text-[10px] text-slate-600 max-w-[320px]">
                        Select any industrial SKU model above or search a custom part number to trigger real-time Google Search grounded intelligence.
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
