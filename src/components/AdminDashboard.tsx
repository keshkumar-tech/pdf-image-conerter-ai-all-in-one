import React, { useState, useEffect } from 'react';
import { ShieldCheck, Server, Cpu, Database, RefreshCw, CheckCircle2, AlertTriangle, Terminal, Layers } from 'lucide-react';
import { api } from '../services/api';

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      const data = await api.getAdminMetrics();
      setMetrics(data);
    } catch (err) {
      console.warn('Failed to load metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">System & AI Pipeline Administration</h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Real-time pipeline metrics, background job queues, Gemini model orchestration, and system telemetry.
          </p>
        </div>

        <button
          onClick={fetchMetrics}
          className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Videos Analyzed</span>
            <Layers className="h-4 w-4 text-blue-400" />
          </div>
          <p className="mt-3 font-mono text-3xl font-extrabold text-white">
            {metrics?.videosCount || 0}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">Stored in normalized relational store</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Generated Note Docs</span>
            <Database className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-3 font-mono text-3xl font-extrabold text-emerald-400">
            {metrics?.notesCount || 0}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">Complete multi-chapter documents</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active & Recent Jobs</span>
            <Cpu className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="mt-3 font-mono text-3xl font-extrabold text-indigo-400">
            {metrics?.jobsCount || 0}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">Async Map-Reduce pipelines</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Provider Status</span>
            <Server className="h-4 w-4 text-sky-400" />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-sm font-bold text-white">
              {metrics?.providerConfig?.provider?.toUpperCase() || 'GEMINI 3.8 FLASH'}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            {metrics?.providerConfig?.geminiActive ? 'Server API Key Configured' : 'Educational Fallback Ready'}
          </p>
        </div>
      </div>

      {/* Provider & Security Configuration */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
          Runtime Configuration & Guardrails
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <span className="text-slate-400 block mb-1">Server Port & Ingress</span>
            <span className="font-mono font-bold text-blue-400">0.0.0.0:3000 (Cloud Run)</span>
            <p className="text-[11px] text-slate-500 mt-2">Vite middleware + Express fullstack routing.</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <span className="text-slate-400 block mb-1">Token Management</span>
            <span className="font-mono font-bold text-emerald-400">10-Min Semantic Slicing</span>
            <p className="text-[11px] text-slate-500 mt-2">Guarantees multi-hour lectures never breach context limits.</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <span className="text-slate-400 block mb-1">Source Grounding</span>
            <span className="font-mono font-bold text-indigo-400">Verified Timestamp Mapping</span>
            <p className="text-[11px] text-slate-500 mt-2">Every chapter maps directly back to the original video time.</p>
          </div>
        </div>
      </div>

      {/* Live System Logs */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-slate-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Recent Application Logs ({metrics?.logs?.length || 0})
            </h3>
          </div>
          <span className="font-mono text-[10px] text-slate-500">Live FIFO buffer</span>
        </div>

        <div className="h-64 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs space-y-1.5">
          {metrics?.logs && metrics.logs.length > 0 ? (
            metrics.logs.map((log: any, idx: number) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-slate-500 shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span
                  className={`font-bold shrink-0 ${
                    log.level === 'error'
                      ? 'text-rose-400'
                      : log.level === 'warn'
                      ? 'text-amber-400'
                      : 'text-blue-400'
                  }`}
                >
                  [{log.level.toUpperCase()}]
                </span>
                <span className="text-slate-300">{log.message}</span>
              </div>
            ))
          ) : (
            <p className="text-slate-500">No logs captured yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
