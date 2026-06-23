import { useState, useEffect, useCallback } from 'react';
import { Download, Sparkles, X } from 'lucide-react';
import { toast } from 'react-toastify';
import type { UpdateInfo } from '../types/electron';

const CHECK_INTERVAL = 6 * 60 * 60 * 1000; // هر ۶ ساعت

export default function UpdateManager() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<'idle' | 'downloading' | 'applying'>('idle');

  // فقط داخل الکترون فعال باشه
  const isElectron = typeof window !== 'undefined' && !!window.electronAPI?.checkUpdate;

  const checkForUpdate = useCallback(async () => {
    if (!isElectron) return;
    try {
      const info = await window.electronAPI!.checkUpdate();
      if (info) {
        setUpdateInfo(info);
        setShowModal(true);
      }
    } catch (err) {
      console.error('[UPDATE] check failed:', err);
    }
  }, [isElectron]);

  useEffect(() => {
    if (!isElectron) return;

    // چک اولیه (با کمی تأخیر، بعد از بالا اومدن کامل اپ)
    const initialTimer = setTimeout(checkForUpdate, 3000);

    const interval = setInterval(checkForUpdate, CHECK_INTERVAL);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [isElectron, checkForUpdate]);

  const handleUpdate = async () => {
    if (!updateInfo || !window.electronAPI) return;

    setLoading(true);
    setStage('downloading');
    setProgress(0);

    window.electronAPI.onUpdateProgress((percent) => setProgress(percent));

    try {
      const downloadResult = await window.electronAPI.downloadUpdate(updateInfo);
      if (!downloadResult.success || !downloadResult.zipPath) {
        throw new Error(downloadResult.error || 'دانلود ناموفق بود');
      }

      setStage('applying');
      setProgress(100);

      const applyResult = await window.electronAPI.applyUpdate(downloadResult.zipPath,updateInfo.version);
      if (!applyResult.success) {
        throw new Error(applyResult.error || 'اعمال آپدیت ناموفق بود');
      }

      toast.success('✅ آپدیت با موفقیت نصب شد. در حال راه‌اندازی مجدد...');

      setTimeout(() => {
        window.electronAPI!.restartApp();
      }, 1500);
    } catch (err) {
      toast.error(`❌ خطا در آپدیت: ${(err as Error).message}`);
      setLoading(false);
      setStage('idle');
    }
  };

  const handleDismiss = () => {
    if (loading) return; // در حین آپدیت نمی‌شه بست
    setShowModal(false);
  };

  if (!isElectron || !showModal || !updateInfo) return null;

  const isMandatory = !!updateInfo.mandatory;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-100 px-4">
      <div className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl border border-orange-100 relative" dir="rtl">
        {!isMandatory && !loading && (
          <button
            onClick={handleDismiss}
            className="absolute top-4 left-4 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-3 mb-4">
          <div className="bg-linear-to-br from-orange-400 to-amber-400 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">نسخه جدید آماده است</h2>
            <p className="text-sm text-gray-500">نسخه {updateInfo.version}</p>
          </div>
        </div>

        {updateInfo.releaseNotes && (
          <div className="bg-orange-50 border border-orange-100 p-3 rounded-xl mb-5 max-h-28 overflow-y-auto text-sm text-gray-700 whitespace-pre-line">
            {updateInfo.releaseNotes}
          </div>
        )}

        {loading && (
          <div className="mb-5">
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-linear-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              {stage === 'downloading' ? `در حال دانلود... ${progress}%` : 'در حال نصب آپدیت...'}
            </p>
          </div>
        )}

        <div className="flex gap-3">
          {!isMandatory && (
            <button
              onClick={handleDismiss}
              disabled={loading}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 font-medium transition-colors"
            >
              بعداً
            </button>
          )}
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="flex-1 bg-linear-to-r from-orange-500 to-amber-500 text-white px-4 py-3 rounded-xl hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 font-semibold transition-all"
          >
            <Download className="w-4 h-4" />
            {loading ? 'در حال انجام...' : 'نصب آپدیت'}
          </button>
        </div>
      </div>
    </div>
  );
}