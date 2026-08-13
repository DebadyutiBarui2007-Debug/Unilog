import React, { useState } from 'react';
import { 
  TrendingUp, Search, RefreshCw, BarChart2, ShieldCheck, 
  HelpCircle, ArrowRight, ExternalLink, Award, FileText, Check, Copy, AlertCircle, Compass, Globe, Info
} from 'lucide-react';

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

const PRESET_QUERIES = [
  { name: "Rockwell ControlLogix 1756-L83E", query: "Rockwell Allen-Bradley ControlLogix 1756-L83E controller processor module" },
  { name: "SKF 6205-2RSH Ball Bearing", query: "SKF 6205-2RSH Deep Groove Ball Bearing CAD and load ratings" },
  { name: "Parker NPT Brass Ball Valve", query: "Parker 1/2 in NPT female brass ball valve 600 WOG" },
  { name: "Festo DFSP Pneumatic Cylinder", query: "Festo DFSP-20-15-PS-A pneumatic compact cylinder stroke specifications" }
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
      // Detect specialized Recommendation heading
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

      // Peek ahead to grab child items
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
    <div className="space-y-5 text-slate-300">
      {parsedItems.map((item, index) => {
        switch (item.type) {
          case 'h1':
            return (
              <h1 key={index} className="text-sm font-bold text-white border-b border-slate-800 pb-2 mt-6 tracking-tight flex items-center gap-2 font-mono">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                {item.text}
              </h1>
            );
          case 'h2':
            return (
              <h2 key={index} className="text-xs font-bold text-indigo-400 uppercase tracking-wider mt-5 flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-indigo-500 rounded-sm"></span>
                {item.text}
              </h2>
            );
          case 'h3':
            return (
              <h3 key={index} className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-4 border-b border-slate-900 pb-1.5 flex items-center gap-2">
                <span className="w-1 h-2.5 bg-slate-500 rounded-sm"></span>
                {item.text}
              </h3>
            );
          case 'divider':
            return <div key={index} className="border-t border-slate-900 my-4" />;
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
              <div key={index} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 my-4">
                {item.keyValues?.map((kv, kvIdx) => (
                  <div key={kvIdx} className="flex flex-col p-3 rounded-xl bg-slate-950/80 border border-slate-900/80 hover:border-slate-800/60 transition-all shadow-sm">
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
              <div key={index} className={`my-5 p-4 rounded-xl border ${
                isBuy 
                  ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200 shadow-md shadow-emerald-500/5' 
                  : isSell 
                  ? 'bg-rose-950/30 border-rose-500/30 text-rose-200 shadow-md shadow-rose-500/5' 
                  : 'bg-amber-950/30 border-amber-500/30 text-amber-200 shadow-md shadow-amber-500/5'
              }`}>
                <div className="flex items-center gap-2.5 mb-2">
                  <span className={`w-2 h-2 rounded-full animate-pulse ${
                    isBuy ? 'bg-emerald-400' : isSell ? 'bg-rose-400' : 'bg-amber-400'
                  }`} />
                  <h2 className="text-xs font-bold uppercase tracking-widest font-mono">
                    {item.text}
                  </h2>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal font-sans">
                  Comprehensive decision matrix formulated through grounded analysis. Action is recommended immediately based on the total cost of ownership (TCO) assessments and supply branch latency.
                </p>
              </div>
            );
          case 'competitor-card':
            return (
              <div key={index} className="p-4 rounded-xl bg-slate-950/60 border border-slate-900 hover:border-indigo-950/60 transition-all my-3 shadow-md">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-3">
                  <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">{item.competitorBrand}</span>
                  {item.competitorPrice && (
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-lg font-bold font-mono">
                      {item.competitorPrice}
                    </span>
                  )}
                </div>
                <div className="space-y-2">
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

export default function MarketIntelligence() {
  const [queryInput, setQueryInput] = useState('');
  const [resultText, setResultText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

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

  return (
    <div className="flex-1 flex flex-col p-6 space-y-5 overflow-y-auto global-scroll-container">
      {/* Upper Title Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            Industrial Market Intelligence Studio
          </h2>
          <p className="text-[11px] text-slate-500 font-mono mt-1">
            Real-time competitor tracking & actionable BUY-vs-SELL procurement analytics for MRO specialists.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-center">
          <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full font-bold font-mono">
            GEMINI-3.6 PIPELINE ACTIVE
          </span>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-bold font-mono">
            LIVE GOOGLE GROUNDED
          </span>
        </div>
      </div>

      {/* Preset Query Selections */}
      <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-4 space-y-3">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          Select Executive Model Template:
        </span>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {PRESET_QUERIES.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQueryInput(preset.query);
                triggerAnalysis(preset.query);
              }}
              className="px-3.5 py-2 bg-slate-900 border border-slate-800 hover:border-indigo-500/80 rounded-xl text-[11px] font-semibold text-slate-200 text-left hover:scale-[1.01] transition-all cursor-pointer shadow-sm flex flex-col justify-between h-16 hover:bg-slate-850"
            >
              <span className="line-clamp-1 block text-slate-300 font-bold">{preset.name}</span>
              <span className="text-[9px] text-indigo-400 uppercase tracking-widest flex items-center gap-1 mt-1 font-mono">
                Analyze <ArrowRight className="w-2.5 h-2.5" />
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Workstation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 min-h-[420px] items-stretch">
        {/* Search Parameter Section */}
        <div className="lg:col-span-2 flex flex-col justify-between bg-slate-950/40 border border-slate-900 rounded-2xl p-5 space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                Procurement Parameter Set
              </span>
              <Info className="w-3.5 h-3.5 text-slate-600" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Target Product Query (Model, MPN or Catalog Line)
              </label>
              <div className="relative">
                <input 
                  type="text"
                  value={queryInput}
                  onChange={e => setQueryInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && triggerAnalysis(queryInput)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none font-mono"
                  placeholder="e.g. Rockwell 1756-L83E Allen-Bradley"
                />
                <Search className="w-4 h-4 text-slate-600 absolute left-3 top-3" />
              </div>
            </div>

            <div className="space-y-1 bg-slate-900/40 border border-slate-850 p-3 rounded-xl">
              <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">Expert Rationale</span>
              <p className="text-[10px] text-slate-400 leading-normal font-sans">
                By processing catalog records through Google Search Grounding with Gemini 3.6, the intelligence layer dynamically cross-references competitor models, pricing indexes, and engineering lifespans to output high-accuracy commercial advice.
              </p>
            </div>
          </div>

          <button 
            onClick={() => triggerAnalysis(queryInput)}
            disabled={loading || !queryInput.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/15 cursor-pointer mt-4"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
            {loading ? "Analyzing Markets..." : "Initiate Market Analysis"}
          </button>
        </div>

        {/* Display Analysis Section */}
        <div className="lg:col-span-3 flex flex-col bg-slate-950/40 border border-slate-900 rounded-2xl p-5 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 font-mono">
              <BarChart2 className="w-4 h-4 text-indigo-400" />
              Advisory Analysis & Competitor Matrix
            </h4>
            {resultText && (
              <button 
                onClick={copyToClipboard}
                className="text-[10px] flex items-center gap-1 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg cursor-pointer hover:bg-slate-850"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Advisory'}
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto pr-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-indigo-400 font-mono text-xs py-20">
                <RefreshCw className="w-6 h-6 animate-spin mb-1" />
                <span>Interrogating competitors & grounding price metrics via Gemini 3.6...</span>
              </div>
            ) : resultText ? (
              <ExecutiveAdvisoryFormatter text={resultText} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center py-20 font-sans">
                <Compass className="w-10 h-10 text-slate-600 mb-2 animate-spin-slow" />
                <span className="text-xs font-bold text-slate-400">System Ready for Query Input</span>
                <span className="text-[10px] text-slate-600 mt-1 max-w-[280px]">Select one of the preset engineering models above or search a custom part number to trigger the intelligence advisory pipeline.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
