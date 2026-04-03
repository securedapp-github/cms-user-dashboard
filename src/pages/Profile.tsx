import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  UserCircle, Settings, ShieldCheck, Download,
  Mail, Phone, Globe, Lock
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { cn } from '../utils/cn';

const SECURITY_LOGS = [
  {
    id: 1,
    title: 'Logged In',
    desc: 'Successful authentication via Mobile OTP. Device: Mac OS X.',
    date: 'Today, 11:30 AM',
    status: 'success'
  },
  {
    id: 2,
    title: 'Consent Preferences Updated',
    desc: "Turned OFF 'Analytics' data sharing for Global Trust Bank.",
    date: 'Today, 10:45 AM',
    status: 'neutral'
  },
  {
    id: 3,
    title: 'DSR Raised',
    desc: 'Requested data erasure (ID: DSR-4093) from FinTech App XYZ.',
    date: 'Yesterday, 14:30 PM',
    status: 'neutral'
  },
  {
    id: 4,
    title: 'Language Updated',
    desc: "Set preferred digital communication language to 'English'.",
    date: 'March 20, 2026, 09:15 AM',
    status: 'neutral'
  },
  {
    id: 5,
    title: 'Passwordless Auth Setup',
    desc: 'Linked +91 98*** **892 explicitly for OTP based secure sessions.',
    date: 'March 10, 2026, 12:00 PM',
    status: 'neutral'
  }
];

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
  const { email: storeEmail, phone_number: storePhone, user } = useAuthStore();
  const { addToast } = useToastStore();
  const [isSaving, setIsSaving] = useState(false);
  const [language, setLanguage] = useState('en');

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise(res => setTimeout(res, 1000));
    setIsSaving(false);
    addToast('Preferences Saved Successfully!', 'success');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0f172a] tracking-tight">Profile & Settings</h2>
          <p className="text-sm text-[#64748b] mt-0.5">Manage your account preferences and security logs.</p>
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
                <p className="text-sm text-[#64748b] font-medium">Verified Account</p>
                <div className="flex items-center gap-1.5 mt-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                    <ShieldCheck size={12} className="text-emerald-500" />
                  </div>
                  <span className="text-xs text-emerald-600 font-semibold uppercase tracking-wider">Verified Identity</span>
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
                <h3 className="font-semibold text-[#0f172a] text-sm">My Account</h3>
              </div>
              <div className="p-5 space-y-4">
                <ReadonlyField
                  label="Principal ID"
                  value={user?.principal_id || '3fa85f64-...'}
                  icon={<ShieldCheck size={16} />}
                  mono
                />
                <ReadonlyField
                  label="Verified Email"
                  value={user?.email || storeEmail || 'user@example.com'}
                  icon={<Mail size={16} />}
                />
                <ReadonlyField
                  label="Verified Mobile"
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
                <h3 className="font-semibold text-[#0f172a] text-sm">System Preferences</h3>
              </div>
              <div className="p-5">
                <form onSubmit={handleSavePreferences}>
                  <div className="relative">
                    <Globe className="absolute left-3 top-[34px] z-10 text-[#94a3b8]" size={15} />
                    <Select
                      label="Preferred Digital Language"
                      className="pl-9"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      options={[
                        { label: 'English (Default)', value: 'en' },
                        { label: 'हिंदी (Hindi)', value: 'hi' },
                        { label: 'தமிழ் (Tamil)', value: 'ta' },
                        { label: 'తెలుగు (Telugu)', value: 'te' },
                        { label: 'मराठी (Marathi)', value: 'mr' },
                      ]}
                    />
                  </div>
                  <p className="text-xs text-[#94a3b8] mt-2 mb-4">
                    Applies to DSR communications and email alerts.
                  </p>
                  <Button type="submit" isLoading={isSaving} className="w-full" size="md">
                    Save Preferences
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
                      Security & Action Logs
                    </h3>
                    <p className="text-xs text-[#94a3b8] mt-0.5">Audited log of your platform interactions</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex"
                  onClick={() => addToast('Exporting CSV...', 'info')}
                >
                  <Download size={13} className="mr-1.5" />
                  Export CSV
                </Button>
              </div>

              <div className="p-5 flex-1 overflow-y-auto max-h-[580px]">
                <div className="relative ml-3 space-y-6">
                  {/* Timeline line */}
                  <div className="absolute left-[7px] top-0 bottom-0 w-px bg-[#e2e8f0]" />

                  {SECURITY_LOGS.map((log, i) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.06 }}
                      className="relative pl-7 group"
                    >
                      {/* Timeline dot */}
                      <span className={cn(
                        "absolute left-0 top-1 w-[15px] h-[15px] rounded-full border-2 border-white shadow-sm transition-all duration-200",
                        log.status === 'success'
                          ? 'bg-emerald-500 group-hover:shadow-[0_0_0_3px_rgba(34,197,94,0.2)]'
                          : 'bg-[#cbd5e1] group-hover:bg-[#4f46e5] group-hover:shadow-[0_0_0_3px_rgba(79,70,229,0.2)]'
                      )} />

                      <p className="text-[11px] font-semibold text-[#94a3b8] mb-1 uppercase tracking-wide">{log.date}</p>
                      <p className="font-bold text-sm text-[#0f172a] mb-1">{log.title}</p>
                      <div className="text-xs text-[#64748b] leading-relaxed bg-[#f8fafc] rounded-[10px] px-3.5 py-3 border border-[#e2e8f0] group-hover:border-[#c7d2fe] group-hover:bg-[#eef2ff]/40 transition-all duration-200">
                        {log.desc}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
