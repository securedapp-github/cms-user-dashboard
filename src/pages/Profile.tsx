import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  UserCircle, Settings, ShieldCheck, Download,
  Mail, Phone, Globe, Lock
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../i18n';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { cn } from '../utils/cn';
import { userApi } from '../services/api/userApi';
import { useEffect } from 'react';

// Dynamically fetched logs instead of hardcoded

function ReadonlyField({
  label, value, icon, mono = false
}: { label: string; value: string; icon: React.ReactNode; mono?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wider">{label}</label>
      <div className="flex items-center gap-3 px-3.5 py-3 rounded-[10px] bg-[#f8fafc] border border-[#e2e8f0]">
        <span className="text-[#94a3b8] shrink-0">{icon}</span>
        <span className={cn(
          "text-sm text-[#64748b] truncate",
          mono && "font-mono text-xs"
        )}>
          {value}
        </span>
      </div>
    </div>
  );
}

export default function Profile() {
  const { t, i18n } = useTranslation();
  const { email: storeEmail, phone_number: storePhone, user } = useAuthStore();
  const { addToast } = useToastStore();
  const [isSaving, setIsSaving] = useState(false);

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise(res => setTimeout(res, 800));
    setIsSaving(false);
    addToast(t('profile.save_success', 'Preferences Saved Successfully!'), 'success');
  };

  const [logs, setLogs] = useState<any[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await userApi.getLogs();
      console.log('Activity Logs API Response:', res);
      if (res && res.logs) {
        setLogs(res.logs);
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatLogTitle = (action: string) => {
    switch(action) {
      case 'USER_LOGIN': return 'Logged In';
      case 'LANGUAGE_UPDATED': return 'Language Updated';
      case 'CONSENT_GRANTED': return 'Consent Granted';
      case 'CONSENT_WITHDRAWN': return 'Consent Withdrawn';
      case 'DSR_CREATED': return 'DSR Request Created';
      case 'GRIEVANCE_CREATED': return 'Grievance Submitted';
      default: return action.replace(/_/g, ' ');
    }
  };

  const formatLogDesc = (log: any) => {
    switch(log.action) {
      case 'USER_LOGIN':
        return `Successful authentication via ${log.metadata?.method?.toUpperCase() || 'Portal'}.`;
      case 'LANGUAGE_UPDATED':
        return `Set preferred digital communication language to '${log.metadata?.language || 'English'}'.`;
      case 'CONSENT_GRANTED':
        return `Granted access for '${log.metadata?.purpose_name || 'Data Processing'}'.`;
      case 'CONSENT_WITHDRAWN':
        return `Withdrew access for '${log.metadata?.purpose_name || 'Data Processing'}'.`;
      case 'DSR_CREATED':
        return `Requested data ${log.metadata?.request_type || 'access'}.`;
      case 'GRIEVANCE_CREATED':
        return `Ticket raised for: ${log.metadata?.category || 'Issue'}.`;
      default:
        return 'System action logged.';
    }
  };

  const handleExportCSV = () => {
    if (!logs.length) {
      addToast('No logs available to export.', 'error');
      return;
    }
    const headers = ['Date', 'Action', 'Description'];
    const csvContent = [
      headers.join(','),
      ...logs.map(log => 
        `"${new Date(log.created_at).toLocaleString()}","${formatLogTitle(log.action)}","${formatLogDesc(log).replace(/"/g, '""')}"`
      )
    ].join('\\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `activity_logs_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Logs exported successfully.', 'success');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0f172a] tracking-tight">{t('profile.title')}</h2>
          <p className="text-sm text-[#64748b] mt-0.5">{t('profile.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left column */}
        <div className="lg:col-span-1 space-y-5">

          {/* Avatar card */}
          <motion.div 
            initial={{ opacity: 0, y: 16 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.35 }}
            className="hover:translate-y-[-4px] transition-transform duration-300"
          >
            <Card className="overflow-visible shadow-lg hover:shadow-xl transition-shadow duration-300">
              {/* Gradient banner */}
              <div className="h-20 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] relative rounded-t-[20px]">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-2 right-6 w-16 h-16 rounded-full bg-white" />
                  <div className="absolute -bottom-3 right-16 w-10 h-10 rounded-full bg-white" />
                </div>
              </div>
              <div className="px-5 pb-5 -mt-8 relative z-10">
                <div className="w-[56px] h-[56px] rounded-[16px] bg-gradient-to-br from-[#4f46e5] to-[#6366f1] shadow-[0_6px_20px_rgba(79,70,229,0.25)] flex items-center justify-center mb-3 border-[3px] border-white text-white font-semibold text-[18px]">
                  {user?.email?.[0].toUpperCase() || 'P'}
                </div>
                <h3 className="font-bold text-[#0f172a] text-lg uppercase tracking-tight">
                  {user?.email?.split('@')[0] || 'Principal'}
                </h3>
                <p className="text-sm text-[#64748b] font-medium">{t('profile.verified_account', 'Verified Account')}</p>
                <div className="flex items-center gap-1.5 mt-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                    <ShieldCheck size={12} className="text-emerald-500" />
                  </div>
                  <span className="text-xs text-emerald-600 font-semibold uppercase tracking-wider">{t('profile.verified_id', 'Verified Identity')}</span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Account fields */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
            <Card>
              <div className="px-5 py-4 border-b border-[#f1f5f9] flex items-center gap-2">
                <div className="w-7 h-7 rounded-[8px] bg-[#eef2ff] flex items-center justify-center">
                  <UserCircle size={14} className="text-[#4f46e5]" />
                </div>
                <h3 className="font-semibold text-[#0f172a] text-sm">{t('profile.account')}</h3>
              </div>
              <div className="p-5 space-y-4">
                <ReadonlyField
                  label={t('profile.principal_id')}
                  value={user?.principal_id || '3fa85f64-...'}
                  icon={<ShieldCheck size={16} />}
                  mono
                />
                <ReadonlyField
                  label={t('profile.verified_email')}
                  value={user?.email || storeEmail || 'user@example.com'}
                  icon={<Mail size={16} />}
                />
                <ReadonlyField
                  label={t('profile.verified_mobile')}
                  value={user?.phone_number || storePhone || '+91 98765 43210'}
                  icon={<Phone size={16} />}
                  mono
                />
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-[8px] bg-emerald-50 border border-emerald-100">
                  <Lock size={12} className="text-emerald-500" />
                  <span className="text-xs text-emerald-600 font-medium">Verified via OTP Authentication</span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Preferences */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}>
            <Card>
              <div className="px-5 py-4 border-b border-[#f1f5f9] flex items-center gap-2">
                <div className="w-7 h-7 rounded-[8px] bg-[#eef2ff] flex items-center justify-center">
                  <Settings size={14} className="text-[#4f46e5]" />
                </div>
                <h3 className="font-semibold text-[#0f172a] text-sm">{t('profile.preferences')}</h3>
              </div>
              <div className="p-5">
                <form onSubmit={handleSavePreferences}>
                  <div className="relative">
                    <Globe className="absolute inset-is-3 top-[34px] z-10 text-[#94a3b8]" size={15} />
                    <Select
                      label={t('profile.lang_pref')}
                      className="ps-9"
                      value={i18n.language}
                      onChange={(e) => i18n.changeLanguage(e.target.value)}
                      options={LANGUAGES.map(l => ({ label: l.label, value: l.value }))}
                    />
                  </div>
                  <p className="text-xs text-[#94a3b8] mt-2 mb-4">
                    {t('profile.lang_hint', 'Applies to DSR communications and email alerts.')}
                  </p>
                  <Button type="submit" isLoading={isSaving} className="w-full" size="md">
                    {t('profile.save')}
                  </Button>
                </form>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Right column: Activity log */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="h-full"
          >
            <Card className="h-full flex flex-col overflow-hidden">
              <div className="px-5 py-4 border-b border-[#f1f5f9] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600" />
                  <div>
                    <h3 className="font-semibold text-[#0f172a] text-[15px] flex items-center gap-1.5">
                      {t('profile.logs')}
                    </h3>
                    <p className="text-xs text-[#94a3b8] mt-0.5">{t('profile.logs_subtitle', 'Audited log of your platform interactions')}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex"
                  onClick={handleExportCSV}
                >
                  <Download size={13} className="mr-1.5" />
                  Export CSV
                </Button>
              </div>

              <div className="p-5 flex-1 overflow-y-auto max-h-[580px]">
                <div className="relative ml-3 space-y-6">
                  {/* Timeline line */}
                  <div className="absolute left-[7px] top-0 bottom-0 w-px bg-[#e2e8f0]" />

                  {isLoadingLogs ? (
                    <div className="flex justify-center items-center py-10">
                      <div className="w-8 h-8 border-4 border-[#4f46e5]/20 border-t-[#4f46e5] rounded-full animate-spin" />
                    </div>
                  ) : logs.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-sm font-semibold text-[#64748b]">No activity yet</p>
                      <p className="text-xs text-[#94a3b8] mt-1">Your recent interactions will appear here.</p>
                    </div>
                  ) : (
                    logs.map((log, i) => {
                      const isSuccess = log.action === 'USER_LOGIN';
                      return (
                        <motion.div
                          key={log.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.05 }}
                          className="relative pl-7 group"
                        >
                          {/* Timeline dot */}
                          <span className={cn(
                            "absolute left-0 top-1 w-[15px] h-[15px] rounded-full border-2 border-white shadow-sm transition-all duration-200",
                            isSuccess
                              ? 'bg-emerald-500 group-hover:shadow-[0_0_0_3px_rgba(34,197,94,0.2)]'
                              : 'bg-[#cbd5e1] group-hover:bg-[#4f46e5] group-hover:shadow-[0_0_0_3px_rgba(79,70,229,0.2)]'
                          )} />

                          <p className="text-[11px] font-semibold text-[#94a3b8] mb-1 uppercase tracking-wide">
                            {new Date(log.created_at).toLocaleString(undefined, {
                              year: 'numeric', month: 'short', day: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                          <p className="font-bold text-sm text-[#0f172a] mb-1">{formatLogTitle(log.action)}</p>
                          <div className="text-xs text-[#64748b] leading-relaxed bg-[#f8fafc] rounded-[10px] px-3.5 py-3 border border-[#e2e8f0] group-hover:border-[#c7d2fe] group-hover:bg-[#eef2ff]/40 transition-all duration-200">
                            {formatLogDesc(log)}
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
