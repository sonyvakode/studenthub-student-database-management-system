import React, { useState } from 'react';
import {
  Download,
  Upload,
  RotateCcw,
  FileSpreadsheet,
  FileJson,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { useToast } from '../context/ToastContext';
import { apiService } from '../services/api';

export const SettingsPage: React.FC = () => {
  const { success, error: toastError, info } = useToast();

  const [importJsonText, setImportJsonText] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Export JSON
  const handleExportJSON = () => {
    try {
      const dataStr = apiService.exportJSON();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `student_records_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      success('JSON Exported', 'Student records exported to JSON successfully.');
    } catch (err) {
      toastError('Export Failed', (err as Error).message);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    try {
      const csvStr = apiService.exportCSV();
      const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `student_records_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      success('CSV Exported', 'Student records exported to CSV for Excel/Sheets.');
    } catch (err) {
      toastError('Export Failed', (err as Error).message);
    }
  };

  // Reset to default sample records
  const handleResetSampleData = () => {
    if (window.confirm('Are you sure you want to restore the initial sample students? Current modifications will be reset.')) {
      apiService.resetToDefault();
      info('Sample Records Restored', 'Restored the original sample student records.');
    }
  };

  // Import JSON
  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importJsonText.trim()) return;

    setIsProcessing(true);
    try {
      const count = apiService.importJSON(importJsonText);
      success('Import Successful', `Successfully imported ${count} student records.`);
      setImportJsonText('');
      setShowImportModal(false);
    } catch (err) {
      toastError('Import Failed', (err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Data & Backups"
        subtitle="Export a copy of your student records or restore them from a JSON backup."
      />

      {/* Backup & Export Actions */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="pb-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Backup & Restore</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Records are saved in this browser on this device. Export a backup before switching devices or browsers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-between p-4 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-200 rounded-xl transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg group-hover:bg-emerald-200 transition-colors">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900">Export as CSV Spreadsheet</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Compatible with Excel, Google Sheets</p>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center justify-between p-4 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-200 rounded-xl transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-lg group-hover:bg-indigo-200 transition-colors">
                <FileJson className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900">Export as JSON Backup</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Student records with complete metadata</p>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </button>
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import / Restore Records</span>
          </button>

          <button
            onClick={handleResetSampleData}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Initial Sample Students</span>
          </button>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Import Students JSON</h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Paste a valid JSON array of student records to replace or restore the records in this browser.
            </p>

            <form onSubmit={handleImportSubmit} className="space-y-3">
              <textarea
                rows={6}
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='[{"name": "...", "dob": "YYYY-MM-DD", "email": "..."}]'
                className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={!importJsonText.trim() || isProcessing}
                  className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg cursor-pointer"
                >
                  {isProcessing ? 'Importing...' : 'Confirm Import'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
