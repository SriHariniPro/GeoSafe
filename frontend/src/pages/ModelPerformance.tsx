import React, { useEffect, useState } from 'react';
import { Cpu, RefreshCw, AlertCircle, CheckCircle2, BarChart2 } from 'lucide-react';
import { getModelPerformance, retrainModel } from '../services/api';
import { ModelPerformance as ModelPerformanceType } from '../types';
import { StatCard } from '../components/common/StatCard';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export const ModelPerformancePage: React.FC = () => {
  const [metrics, setMetrics] = useState<ModelPerformanceType | null>(null);
  const [loading, setLoading] = useState(true);
  const [retraining, setRetraining] = useState(false);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const data = await getModelPerformance();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load model metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleRetrain = async () => {
    setRetraining(true);
    try {
      await retrainModel();
      await fetchMetrics();
    } catch (err) {
      console.error('Retrain error:', err);
    } finally {
      setRetraining(false);
    }
  };

  if (loading || !metrics) {
    return <div className="py-20 text-center text-slate-400 font-bold animate-pulse">Evaluating Random Forest Model Metrics...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Cpu className="w-6 h-6 text-purple-400" /> Random Forest Model Performance & Evaluation
          </h2>
          <p className="text-xs text-slate-400">Scikit-learn classification & regression evaluation metrics</p>
        </div>

        <button
          onClick={handleRetrain}
          disabled={retraining}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 transition-all w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${retraining ? 'animate-spin' : ''}`} />
          {retraining ? 'Retraining...' : 'Retrain Random Forest Model'}
        </button>
      </div>

      {/* Academic Disclaimer */}
      <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs font-semibold flex items-center gap-3">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <p>{metrics.disclaimer}</p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-navy-900 border border-navy-700 text-center">
          <div className="text-3xl font-black text-emerald-400">{(metrics.accuracy * 100).toFixed(1)}%</div>
          <div className="text-[10px] font-bold uppercase text-slate-400 mt-1">Accuracy</div>
        </div>
        <div className="p-4 rounded-2xl bg-navy-900 border border-navy-700 text-center">
          <div className="text-3xl font-black text-cyan-400">{(metrics.precision * 100).toFixed(1)}%</div>
          <div className="text-[10px] font-bold uppercase text-slate-400 mt-1">Precision</div>
        </div>
        <div className="p-4 rounded-2xl bg-navy-900 border border-navy-700 text-center">
          <div className="text-3xl font-black text-amber-400">{(metrics.recall * 100).toFixed(1)}%</div>
          <div className="text-[10px] font-bold uppercase text-slate-400 mt-1">Recall</div>
        </div>
        <div className="p-4 rounded-2xl bg-navy-900 border border-navy-700 text-center">
          <div className="text-3xl font-black text-indigo-400">{(metrics.f1_score * 100).toFixed(1)}%</div>
          <div className="text-[10px] font-bold uppercase text-slate-400 mt-1">F1 Score</div>
        </div>
        <div className="p-4 rounded-2xl bg-navy-900 border border-navy-700 text-center col-span-2 sm:col-span-1">
          <div className="text-3xl font-black text-purple-400">{metrics.r2_score.toFixed(2)}</div>
          <div className="text-[10px] font-bold uppercase text-slate-400 mt-1">Regressor R² Score</div>
        </div>
      </div>

      {/* Feature Importance Chart & Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Global Feature Importance */}
        <div className="p-6 rounded-2xl bg-navy-900 border border-navy-700/60 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-purple-400" /> Tree Feature Importance Rankings (%)
          </h3>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.feature_importances} layout="vertical">
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="feature" type="category" stroke="#64748b" fontSize={10} width={120} />
                <Tooltip contentStyle={{ backgroundColor: '#0f182e', borderColor: '#1e293b' }} />
                <Bar dataKey="importance" fill="#a855f7" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confusion Matrix Table */}
        <div className="p-6 rounded-2xl bg-navy-900 border border-navy-700/60 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white">Multiclass Confusion Matrix</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-navy-950 text-[10px] text-slate-400 uppercase">
                  <th className="p-2 border border-navy-800">Actual \ Predicted</th>
                  {metrics.classes.map(c => (
                    <th key={`hdr-${c}`} className="p-2 border border-navy-800 text-cyan-400">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-xs font-bold text-white">
                {metrics.confusion_matrix.map((row, rIdx) => (
                  <tr key={`row-${rIdx}`}>
                    <td className="p-2 border border-navy-800 bg-navy-950 text-slate-300 font-extrabold">{metrics.classes[rIdx]}</td>
                    {row.map((val, cIdx) => (
                      <td key={`cell-${rIdx}-${cIdx}`} className={`p-3 border border-navy-800 ${rIdx === cIdx ? 'bg-emerald-950/80 text-emerald-300' : 'bg-navy-850/40 text-slate-400'}`}>
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
