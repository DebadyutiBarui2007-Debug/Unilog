import React, { useState } from 'react';
import { Play, Download, Upload, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

interface BatchItem {
  id: string;
  rawDescription: string;
  classpath?: string;
  unspscCode?: string;
  brand?: string;
  mpn?: string;
  invoiceDesc?: string;
  productTitle?: string;
  confidenceScore?: number;
  status: 'PENDING' | 'PROCESSING' | 'AUTO_APPROVED' | 'NEEDS_REVIEW' | 'FAILED';
}

const SAMPLE_DATA: BatchItem[] = [
  { id: 'JOB-1001', rawDescription: 'Parker 1/2 in brass ball valve NPT female 600 PSI WOG 200 WSP', status: 'PENDING' },
  { id: 'JOB-1002', rawDescription: 'Goulds 1/2HP 115V Submersible Sump Pump 3887NO 50 GPM 1-1/2 discharge', status: 'PENDING' },
  { id: 'JOB-1003', rawDescription: 'Square D QO120 20A single pole circuit breaker 120V 10kAIC 22k AIR', status: 'PENDING' },
  { id: 'JOB-1004', rawDescription: 'Milwaukee 2804-20 M18 FUEL 1/2 in Hammer Drill Bare Tool Brushless', status: 'PENDING' },
  { id: 'JOB-1005', rawDescription: 'Eaton HD36132 30A 600V 3P Heavy Duty Safety Switch Fused NEMA 1', status: 'PENDING' }
];

export default function BatchProcessing() {
  const [items, setItems] = useState<BatchItem[]>(SAMPLE_DATA);
  const [processing, setProcessing] = useState(false);
  const [inputText, setInputText] = useState('');
  const [showInputModal, setShowInputModal] = useState(false);

  const runBatchPipeline = async () => {
    setProcessing(true);
    setItems(prev => prev.map(item => ({ ...item, status: 'PROCESSING' })));

    try {
      const response = await fetch('/api/batch-enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ id: i.id, description: i.rawDescription }))
        })
      });

      if (!response.ok) throw new Error('Batch pipeline failed');

      const data = await response.json();
      const updatedMap = new Map<string, any>(data.results.map((r: any) => [r.id, r]));

      setItems(prev => prev.map(item => {
        const result = updatedMap.get(item.id);
        if (result) {
          return {
            ...item,
            classpath: result.classpath,
            unspscCode: result.unspscCode,
            brand: result.brand,
            mpn: result.mpn,
            invoiceDesc: result.invoiceDesc,
            productTitle: result.productTitle,
            confidenceScore: result.confidenceScore,
            status: result.status
          };
        }
        return { ...item, status: 'FAILED' };
      }));
    } catch (e) {
      console.error(e);
      setItems(prev => prev.map(i => ({ ...i, status: 'FAILED' })));
    } finally {
      setProcessing(false);
    }
  };

  const handleAddBatchRows = () => {
    if (!inputText.trim()) return;
    const lines = inputText.split('\n').filter(l => l.trim().length > 0);
    const newRows: BatchItem[] = lines.map((line, idx) => ({
      id: `JOB-${Math.floor(2000 + Math.random() * 8000)}`,
      rawDescription: line.trim(),
      status: 'PENDING'
    }));
    setItems(prev => [...prev, ...newRows]);
    setInputText('');
    setShowInputModal(false);
  };

  const exportCSV = () => {
    const headers = ['Job ID', 'Raw Description', 'Brand', 'MPN', 'UNSPSC Code', 'Classpath', 'Invoice Desc', 'Product Title', 'Confidence Score', 'Status'];
    const csvRows = [headers.join(',')];

    items.forEach(item => {
      const row = [
        item.id,
        `"${(item.rawDescription || '').replace(/"/g, '""')}"`,
        `"${(item.brand || '').replace(/"/g, '""')}"`,
        `"${(item.mpn || '').replace(/"/g, '""')}"`,
        item.unspscCode || '',
        `"${(item.classpath || '').replace(/"/g, '""')}"`,
        `"${(item.invoiceDesc || '').replace(/"/g, '""')}"`,
        `"${(item.productTitle || '').replace(/"/g, '""')}"`,
        item.confidenceScore ? (item.confidenceScore * 100).toFixed(1) + '%' : '',
        item.status
      ];
      csvRows.push(row.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Batch_Product_Intelligence_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const completedCount = items.filter(i => i.status === 'AUTO_APPROVED' || i.status === 'NEEDS_REVIEW').length;
  const approvedCount = items.filter(i => i.status === 'AUTO_APPROVED').length;

  return (
    <div className="flex-1 flex flex-col p-8 space-y-6 overflow-y-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-wider text-white">Catalog Batch Enrichment Engine</h2>
          <p className="text-xs text-gray-400 font-mono mt-0.5">High-throughput bulk intelligence transformation across supplier lines</p>
        </div>
        <div className="flex gap-3">
          <button 
            id="batch-add-rows-btn"
            onClick={() => setShowInputModal(true)}
            className="border border-slate-700 bg-slate-800/60 text-white px-4 py-2 text-xs font-bold rounded-xl uppercase tracking-wider hover:bg-slate-700 transition-all flex items-center gap-2 shadow-sm"
          >
            <Upload size={14} /> Add Rows
          </button>
          <button 
            id="batch-run-pipeline-btn"
            onClick={runBatchPipeline}
            disabled={processing || items.length === 0}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 text-xs font-bold rounded-xl uppercase tracking-wider disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
          >
            {processing ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
            {processing ? 'Processing Batch...' : 'Run Bulk Batch Pipeline'}
          </button>
          <button 
            id="batch-export-csv-btn"
            onClick={exportCSV}
            className="border border-indigo-500/60 text-indigo-400 hover:bg-indigo-500/10 px-4 py-2 text-xs font-bold rounded-xl uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Batch Stats */}
      <div id="batch-stats-container" className="grid grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mb-1">Total Catalog Rows</span>
          <span className="text-2xl font-mono text-white font-bold">{items.length}</span>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mb-1">Enriched / Processed</span>
          <span className="text-2xl font-mono text-indigo-400 font-bold">{completedCount} / {items.length}</span>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mb-1">Auto-Approved (≥90%)</span>
          <span className="text-2xl font-mono text-emerald-400 font-bold">{approvedCount}</span>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mb-1">Needs Human Review</span>
          <span className="text-2xl font-mono text-amber-400 font-bold">{completedCount - approvedCount}</span>
        </div>
      </div>

      {/* Modal for adding custom lines */}
      {showInputModal && (
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4 shadow-2xl">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Paste Supplier Raw Lines (One per line)</h3>
          <textarea
            rows={5}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="e.g. Acme 3/4 inch stainless steel valve NPT 1000 WOG&#10;DeWalt DCD791B 20V MAX 1/2 in Cordless Drill"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono outline-none focus:border-indigo-500"
          />
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowInputModal(false)} className="px-4 py-2 text-xs font-bold text-gray-400 uppercase">Cancel</button>
            <button onClick={handleAddBatchRows} className="bg-indigo-600 text-white px-5 py-2 text-xs font-bold rounded-xl uppercase tracking-wider hover:bg-indigo-500 shadow-md">Import Rows</button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div id="batch-table-container" className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-5 py-3.5 bg-slate-800/40 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-300">Batch Pipeline Queue</span>
          <span className="text-[10px] font-mono text-indigo-400 font-bold">UNILOG MASTER SPEC V4</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-gray-400 border-b border-slate-800">
              <tr>
                <th className="p-3.5 font-semibold">Job ID</th>
                <th className="p-3.5 font-semibold">Raw Supplier Input</th>
                <th className="p-3.5 font-semibold">Brand</th>
                <th className="p-3.5 font-semibold">MPN</th>
                <th className="p-3.5 font-semibold">UNSPSC</th>
                <th className="p-3.5 font-semibold">Canonical Title</th>
                <th className="p-3.5 font-semibold">Conf.</th>
                <th className="p-3.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-gray-300">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3.5 text-indigo-400 font-bold">{item.id}</td>
                  <td className="p-3.5 max-w-[200px] truncate text-gray-400" title={item.rawDescription}>{item.rawDescription}</td>
                  <td className="p-3.5 font-bold text-white">{item.brand || '--'}</td>
                  <td className="p-3.5 text-gray-300">{item.mpn || '--'}</td>
                  <td className="p-3.5 text-purple-400 font-semibold">{item.unspscCode || '--'}</td>
                  <td className="p-3.5 max-w-[240px] truncate text-white" title={item.productTitle}>{item.productTitle || '--'}</td>
                  <td className="p-3.5 font-bold text-emerald-400">
                    {item.confidenceScore ? `${(item.confidenceScore * 100).toFixed(0)}%` : '--'}
                  </td>
                  <td className="p-3.5">
                    {item.status === 'PENDING' && <span className="px-2.5 py-1 rounded-lg text-[10px] bg-gray-800/80 text-gray-400 border border-gray-700 font-bold">QUEUED</span>}
                    {item.status === 'PROCESSING' && <span className="px-2.5 py-1 rounded-lg text-[10px] bg-indigo-950 text-indigo-400 border border-indigo-800 font-bold animate-pulse">ENRICHING</span>}
                    {item.status === 'AUTO_APPROVED' && <span className="px-2.5 py-1 rounded-lg text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1 w-max font-bold"><CheckCircle2 size={12}/> AUTO APPROVED</span>}
                    {item.status === 'NEEDS_REVIEW' && <span className="px-2.5 py-1 rounded-lg text-[10px] bg-amber-950 text-amber-400 border border-amber-800 flex items-center gap-1 w-max font-bold"><AlertTriangle size={12}/> REVIEW REQD</span>}
                    {item.status === 'FAILED' && <span className="px-2.5 py-1 rounded-lg text-[10px] bg-red-950 text-red-400 border border-red-800 font-bold">FAILED</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
