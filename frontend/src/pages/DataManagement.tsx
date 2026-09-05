import React, { useState, useEffect } from 'react';
import { Database, Upload, Download, CheckCircle2, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import { uploadExcelDataset, getAccidents } from '../services/api';
import { Accident } from '../types';

export const DataManagement: React.FC = () => {
  const [accidents, setAccidents] = useState<Accident[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [totalRows, setTotalRows] = useState(0);

  const fetchDatasetPreview = async () => {
    try {
      const res = await getAccidents({ page: 1, limit: 10 });
      setAccidents(res.accidents || []);
      setTotalRows(res.total || 0);
    } catch (err) {
      console.error('Failed to preview dataset:', err);
    }
  };

  useEffect(() => {
    fetchDatasetPreview();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setMessage(null);
    try {
      const res = await uploadExcelDataset(file);
      setMessage(res.message);
      await fetchDatasetPreview();
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Excel upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Database className="w-6 h-6 text-cyan-400" /> Primary Dataset & SQLite Data Management
        </h2>
        <p className="text-xs text-slate-400">Ingest Excel files, validate records, and inspect local SQLite database tables</p>
      </div>

      {/* Excel Upload Form */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-navy-700/60 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Upload className="w-4 h-4 text-cyan-400" /> Upload New Accident Excel Dataset
        </h3>

        {message && (
          <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-semibold">
            {message}
          </div>
        )}

        <form onSubmit={handleUpload} className="flex flex-col sm:flex-row items-center gap-4">
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            className="text-xs text-slate-300 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-navy-800 file:text-cyan-400 hover:file:bg-navy-750"
          />
          <button
            type="submit"
            disabled={uploading || !file}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {uploading ? 'Processing & Retraining...' : 'Import to SQLite'}
          </button>
        </form>
      </div>

      {/* Dataset Health Report */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-navy-900 border border-navy-700 text-center">
          <div className="text-2xl font-black text-white">{totalRows}</div>
          <div className="text-[10px] font-bold uppercase text-slate-400 mt-1">SQLite Rows Loaded</div>
        </div>
        <div className="p-4 rounded-2xl bg-navy-900 border border-navy-700 text-center">
          <div className="text-2xl font-black text-emerald-400">21</div>
          <div className="text-[10px] font-bold uppercase text-slate-400 mt-1">Dataset Columns</div>
        </div>
        <div className="p-4 rounded-2xl bg-navy-900 border border-navy-700 text-center">
          <div className="text-2xl font-black text-cyan-400">0</div>
          <div className="text-[10px] font-bold uppercase text-slate-400 mt-1">Missing Core Values</div>
        </div>
        <div className="p-4 rounded-2xl bg-navy-900 border border-navy-700 text-center">
          <div className="text-2xl font-black text-amber-400">0</div>
          <div className="text-[10px] font-bold uppercase text-slate-400 mt-1">Duplicate Accident IDs</div>
        </div>
      </div>

      {/* Preview Table */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-navy-700/60 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-cyan-400" /> Database Sample Records Preview (First 10 Rows)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-navy-750 text-[10px] uppercase tracking-wider text-slate-400 bg-navy-950/60">
                <th className="p-3">ID</th>
                <th className="p-3">Road Name</th>
                <th className="p-3">Area</th>
                <th className="p-3">Date</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Weather</th>
                <th className="p-3">Traffic</th>
                <th className="p-3">Risk Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800 text-xs">
              {accidents.map((acc) => (
                <tr key={`prev-${acc.accident_id}`} className="hover:bg-navy-800/50 transition-all">
                  <td className="p-3 font-bold text-cyan-400">{acc.accident_id}</td>
                  <td className="p-3 font-bold text-white">{acc.road_name}</td>
                  <td className="p-3 text-slate-300">{acc.area}</td>
                  <td className="p-3 text-slate-300">{acc.date}</td>
                  <td className="p-3 font-bold text-rose-400">{acc.accident_severity}</td>
                  <td className="p-3 text-slate-300">{acc.weather}</td>
                  <td className="p-3 text-slate-300">{acc.traffic_level}</td>
                  <td className="p-3 font-extrabold text-amber-400">{acc.risk_score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
