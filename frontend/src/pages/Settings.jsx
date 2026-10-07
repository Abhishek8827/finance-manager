import { Download, FileJson } from 'lucide-react';
import API from '../lib/api';
import { toast } from 'sonner';
import { useApp } from '../context/AppContext';

export default function Settings() {
  const { selectedAccount } = useApp();

  const handleExport = async (type) => {
    try {
      toast.info('Export endpoint may need backend route — check console if it fails');
      const res = await API.get(`/export.${type}?account=${selectedAccount._id}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `FinanceExport_${selectedAccount?.name}_${type}.${type}`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`${type.toUpperCase()} Exported!`);
    } catch (e) {
      toast.error('Export failed (route may not be set yet)');
    }
  };

  const handleBackup = async () => {
    try {
      const res = await API.get(`/backup.json?account=${selectedAccount._id}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `Backup_${selectedAccount?.name}_${new Date().toISOString().split('T')[0]}.json`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Backup downloaded!');
    } catch (e) {
      toast.error('Backup failed (route may not be set yet)');
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>

      <div className="card overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800">
          <h3 className="text-sm font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-widest">
            Export Data ({selectedAccount?.name})
          </h3>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-zinc-800">
          <button
            onClick={() => handleExport('csv')}
            className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition text-left"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-gray-800 dark:text-zinc-100 text-sm">Export to CSV</p>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                Download entries for Excel / Google Sheets
              </p>
            </div>
          </button>

          <button
            onClick={handleBackup}
            className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition text-left"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-gray-800 dark:text-zinc-100 text-sm">Full JSON Backup</p>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                Download complete account backup
              </p>
            </div>
          </button>
        </div>
      </div>

      <div className="card p-5">
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          Active account: <span className="font-semibold text-gray-800 dark:text-zinc-200">{selectedAccount?.name}</span>
        </p>
        <p className="text-xs text-gray-400 dark:text-zinc-500 mt-2">
          Use the sun/moon icon in the header to toggle theme. Preference is saved in this browser.
        </p>
      </div>
    </div>
  );
}