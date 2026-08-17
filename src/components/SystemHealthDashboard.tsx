import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Zap, Server, ShieldCheck, Cpu, AlertTriangle, Clock, ArrowRight } from 'lucide-react';

const MOCK_METRICS = [
  { time: '08:00', latency: 210, confidence: 91, throughput: 120 },
  { time: '09:00', latency: 250, confidence: 93, throughput: 150 },
  { time: '10:00', latency: 195, confidence: 94, throughput: 280 },
  { time: '11:00', latency: 310, confidence: 92, throughput: 310 },
  { time: '12:00', latency: 230, confidence: 95, throughput: 190 },
  { time: '13:00', latency: 215, confidence: 96, throughput: 210 },
  { time: '14:00', latency: 200, confidence: 97, throughput: 260 },
];

const MOCK_FLAGGED_RECORDS = [
  { id: 'REC-892', description: 'Parker Hannifin 4-4 FCTX-S', reason: 'Ambiguous taxonomy match', timeFlagged: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), confidence: 78, reviewed: false },
  { id: 'REC-893', description: 'Allen-Bradley 1756-EN2T', reason: 'Missing mandatory attributes', timeFlagged: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), confidence: 82, reviewed: false },
  { id: 'REC-895', description: 'Generic 1/4" Steel Pipe 10ft', reason: 'Low brand confidence', timeFlagged: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(), confidence: 65, reviewed: false },
  { id: 'REC-880', description: 'Old Motor', reason: 'Legacy format', timeFlagged: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), confidence: 55, reviewed: false }, // Older than 24h
  { id: 'REC-890', description: 'SKF 6205', reason: 'Resolved', timeFlagged: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), confidence: 88, reviewed: true }, // Already reviewed
];

export const SystemHealthDashboard: React.FC<{ isAmber: boolean; isDark: boolean }> = ({ isAmber, isDark }) => {
  const [data, setData] = useState(MOCK_METRICS);
  const [flaggedRecords, setFlaggedRecords] = useState(MOCK_FLAGGED_RECORDS);

  // Filter flagged records for the last 24 hours that haven't been reviewed
  const recentUnreviewedFlags = flaggedRecords.filter(record => {
    const isWithin24Hours = (Date.now() - new Date(record.timeFlagged).getTime()) <= 24 * 60 * 60 * 1000;
    return isWithin24Hours && !record.reviewed;
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const newData = [...prev.slice(1)];
        const last = prev[prev.length - 1];
        
        // Generate next timestamp string
        const [hours, minutes] = last.time.split(':');
        let nextHour = parseInt(hours) + 1;
        if (nextHour > 23) nextHour = 0;
        const nextTime = `${nextHour.toString().padStart(2, '0')}:00`;

        newData.push({
          time: nextTime,
          latency: Math.max(150, Math.min(400, last.latency + (Math.random() * 60 - 30))),
          confidence: Math.max(85, Math.min(99.9, last.confidence + (Math.random() * 4 - 2))),
          throughput: Math.max(50, Math.min(500, last.throughput + (Math.random() * 100 - 50))),
        });
        return newData;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const themeClasses = {
    bg: isDark ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900',
    card: isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200',
    textMuted: isDark ? 'text-slate-400' : 'text-gray-500',
    border: isDark ? 'border-slate-700' : 'border-gray-200',
    accent: isAmber ? 'text-amber-500' : 'text-indigo-500',
  };

  return (
    <div className={`p-8 h-full overflow-y-auto ${themeClasses.bg}`}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">System Health & Telemetry</h1>
            <p className={`text-sm mt-1 ${themeClasses.textMuted}`}>Real-time monitoring of AI enrichment pipeline performance.</p>
          </div>
          <div className={`px-4 py-2 rounded-full border flex items-center gap-2 text-sm font-semibold ${themeClasses.card} ${isAmber ? 'border-amber-500/30 text-amber-500' : 'border-emerald-500/30 text-emerald-500'}`}>
            <span className={`w-2 h-2 rounded-full animate-ping ${isAmber ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
            System Operational
          </div>
        </div>

        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Avg Latency', value: `${Math.round(data[data.length-1].latency)} ms`, icon: <Activity size={18} />, color: 'text-emerald-500' },
            { label: 'Avg Confidence', value: `${data[data.length-1].confidence.toFixed(1)}%`, icon: <ShieldCheck size={18} />, color: isAmber ? 'text-amber-500' : 'text-indigo-500' },
            { label: 'Active Workers', value: '12 / 16', icon: <Cpu size={18} />, color: 'text-blue-500' },
            { label: 'Uptime', value: '99.99%', icon: <Server size={18} />, color: 'text-emerald-500' }
          ].map((stat, i) => (
            <div key={i} className={`p-5 rounded-2xl border ${themeClasses.card} flex flex-col justify-center`}>
              <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-500">
                <div className={stat.color}>{stat.icon}</div>
                {stat.label}
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`p-6 rounded-2xl border ${themeClasses.card}`}>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Zap size={18} className={themeClasses.accent} /> 
              Pipeline Latency (ms)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                  <XAxis dataKey="time" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} />
                  <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderColor: isDark ? '#334155' : '#e2e8f0' }}
                    itemStyle={{ color: isDark ? '#f8fafc' : '#0f172a' }}
                  />
                  <Line type="monotone" dataKey="latency" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`p-6 rounded-2xl border ${themeClasses.card}`}>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <ShieldCheck size={18} className={themeClasses.accent} /> 
              Model Confidence Trend (%)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                  <XAxis dataKey="time" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} />
                  <YAxis domain={['auto', 100]} stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderColor: isDark ? '#334155' : '#e2e8f0' }}
                    itemStyle={{ color: isDark ? '#f8fafc' : '#0f172a' }}
                  />
                  <Line type="monotone" dataKey="confidence" stroke={isAmber ? '#f59e0b' : '#6366f1'} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Full Width Area Chart */}
        <div className={`p-6 rounded-2xl border ${themeClasses.card}`}>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Activity size={18} className={themeClasses.accent} /> 
            Enrichment Throughput (Items/hr)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorThroughput" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isAmber ? '#f59e0b' : '#3b82f6'} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={isAmber ? '#f59e0b' : '#3b82f6'} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="time" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} />
                <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderColor: isDark ? '#334155' : '#e2e8f0' }}
                  itemStyle={{ color: isDark ? '#f8fafc' : '#0f172a' }}
                />
                <Area type="monotone" dataKey="throughput" stroke={isAmber ? '#f59e0b' : '#3b82f6'} fillOpacity={1} fill="url(#colorThroughput)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Flagged Records Review Panel */}
        <div className={`p-6 rounded-2xl border ${themeClasses.card} mb-8`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2 text-red-500">
              <AlertTriangle size={18} /> 
              Pending Flagged Reviews (Last 24h)
            </h3>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${isDark ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-red-50 text-red-600 border border-red-200'}`}>
              {recentUnreviewedFlags.length} Actions Required
            </span>
          </div>

          {recentUnreviewedFlags.length === 0 ? (
            <div className={`text-center py-8 ${themeClasses.textMuted}`}>
              <ShieldCheck size={32} className="mx-auto mb-2 opacity-50" />
              <p>All clear! No pending flagged records in the last 24 hours.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b ${themeClasses.border} text-xs uppercase tracking-wider ${themeClasses.textMuted}`}>
                    <th className="pb-3 font-semibold pl-4">Record ID</th>
                    <th className="pb-3 font-semibold">Description</th>
                    <th className="pb-3 font-semibold">Flag Reason</th>
                    <th className="pb-3 font-semibold">Time Flagged</th>
                    <th className="pb-3 font-semibold">Confidence</th>
                    <th className="pb-3 font-semibold text-right pr-4">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {recentUnreviewedFlags.map((record) => (
                    <tr key={record.id} className={`border-b ${themeClasses.border} last:border-0 hover:${isDark ? 'bg-slate-800/50' : 'bg-gray-50'}`}>
                      <td className="py-4 pl-4 font-mono text-xs">{record.id}</td>
                      <td className="py-4 font-medium">{record.description}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-100 text-amber-700'}`}>
                          {record.reason}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Clock size={14} />
                          {new Date(record.timeFlagged).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`font-semibold ${record.confidence < 70 ? 'text-red-500' : 'text-amber-500'}`}>
                          {record.confidence}%
                        </span>
                      </td>
                      <td className="py-4 text-right pr-4">
                        <button
                          onClick={() => {
                            setFlaggedRecords(prev => prev.map(r => r.id === record.id ? { ...r, reviewed: true } : r));
                          }}
                          className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors
                            ${isDark 
                              ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                            }`}
                        >
                          Review <ArrowRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
