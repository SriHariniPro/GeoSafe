import React, { useEffect, useState } from 'react';
import { ShieldAlert, Lightbulb, RefreshCw, Edit3, X, Save, CheckCircle2 } from 'lucide-react';
import { getInterventions, generateInterventions, updateIntervention } from '../services/api';
import { Intervention, User } from '../types';

interface AuthorityDashboardProps {
  currentUser?: User | null;
}

export const AuthorityDashboard: React.FC<AuthorityDashboardProps> = ({ currentUser }) => {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<Intervention | null>(null);
  const [priority, setPriority] = useState<string>('HIGH');
  const [locationName, setLocationName] = useState<string>('');
  const [recommendedAction, setRecommendedAction] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [expectedImpact, setExpectedImpact] = useState<string>('');
  const [status, setStatus] = useState<string>('Pending');
  const [saving, setSaving] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  const fetchInterventions = async () => {
    setLoading(true);
    try {
      const data = await getInterventions();
      setInterventions(data || []);
    } catch (err) {
      console.error('Failed to load interventions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterventions();
  }, []);

  const handleGenerateNew = async () => {
    setGenerating(true);
    try {
      const data = await generateInterventions();
      setInterventions(data || []);
    } catch (err) {
      console.error('Intervention generation failed:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleOpenEdit = (itv: Intervention) => {
    setEditingItem(itv);
    setPriority(itv.priority);
    setLocationName(itv.location_name);
    setRecommendedAction(itv.recommended_action);
    setReason(itv.reason);
    setExpectedImpact(itv.expected_impact);
    setStatus(itv.status);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setSaving(true);
    try {
      const updated = await updateIntervention(editingItem.id, {
        priority: priority as any,
        location_name: locationName,
        recommended_action: recommendedAction,
        reason,
        expected_impact: expectedImpact,
        status
      });
      setInterventions(prev => prev.map(item => item.id === updated.id ? updated : item));
      setEditingItem(null);
    } catch (err) {
      console.error('Failed to save intervention edit:', err);
    } finally {
      setSaving(false);
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'CRITICAL': return 'bg-rose-950 text-rose-400 border-rose-800';
      case 'HIGH': return 'bg-amber-950 text-amber-400 border-amber-800';
      case 'MEDIUM': return 'bg-yellow-950 text-yellow-300 border-yellow-800';
      default: return 'bg-emerald-950 text-emerald-400 border-emerald-800';
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'Completed': return 'bg-emerald-950 text-emerald-400 border-emerald-800';
      case 'In Progress': return 'bg-cyan-950 text-cyan-400 border-cyan-800';
      case 'Rejected': return 'bg-rose-950 text-rose-400 border-rose-800';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-400" /> Authority Road Safety Intervention Intelligence
          </h2>
          <p className="text-xs text-slate-400">Rule-based decision support matrix & administrative modification portal</p>
        </div>

        {isAdmin && (
          <button
            onClick={handleGenerateNew}
            disabled={generating}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 transition-all w-fit"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Refreshing Rules...' : 'Re-Generate Interventions'}
          </button>
        )}
      </div>

      {/* Priority Table Matrix */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-navy-700/60 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" /> Actionable Safety Interventions Matrix ({interventions.length})
          </h3>
          {isAdmin ? (
            <span className="text-[10px] font-extrabold px-2.5 py-1 rounded bg-rose-950 text-rose-400 border border-rose-800">
              Authority Admin Mode (Editing Enabled)
            </span>
          ) : (
            <span className="text-[10px] font-extrabold px-2.5 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700">
              Standard User (Read-Only Mode)
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-navy-750 text-[10px] uppercase tracking-wider text-slate-400 bg-navy-950/60">
                <th className="p-3">Priority</th>
                <th className="p-3">Target Location / Corridor</th>
                <th className="p-3">Recommended Infrastructure Action</th>
                <th className="p-3">Risk Evidence & Reason</th>
                <th className="p-3">Expected Impact</th>
                <th className="p-3">Status</th>
                {isAdmin && <th className="p-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800 text-xs">
              {interventions.map((itv) => (
                <tr key={itv.id} className="hover:bg-navy-800/50 transition-all">
                  <td className="p-3">
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase border ${getPriorityBadge(itv.priority)}`}>
                      {itv.priority}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-white max-w-[180px]">{itv.location_name}</td>
                  <td className="p-3 font-semibold text-cyan-300 max-w-[240px] leading-snug">{itv.recommended_action}</td>
                  <td className="p-3 text-slate-400 max-w-[260px] leading-relaxed">{itv.reason}</td>
                  <td className="p-3 font-bold text-emerald-400 max-w-[200px]">{itv.expected_impact}</td>
                  <td className="p-3">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${getStatusBadge(itv.status)}`}>
                      {itv.status}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleOpenEdit(itv)}
                        className="px-2.5 py-1 rounded-lg bg-navy-800 hover:bg-navy-700 text-cyan-400 border border-navy-700 text-xs font-bold transition-all flex items-center gap-1 ml-auto"
                      >
                        <Edit3 className="w-3 h-3" /> Edit
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-navy-700 rounded-3xl p-6 max-w-xl w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-navy-750 pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-cyan-400" /> Edit Intervention Record #{editingItem.id}
              </h3>
              <button onClick={() => setEditingItem(null)} className="p-1 rounded text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-xl text-xs text-white"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-xl text-xs text-white"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Target Location Name</label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Recommended Action</label>
                <textarea
                  rows={2}
                  value={recommendedAction}
                  onChange={(e) => setRecommendedAction(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Risk Evidence / Reason</label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Expected Impact</label>
                <input
                  type="text"
                  value={expectedImpact}
                  onChange={(e) => setExpectedImpact(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-cyan-600/30"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? 'Saving to SQLite...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
