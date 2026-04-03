import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, XCircle, ShieldCheck, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Switch } from '../components/ui/Switch';
import { Modal } from '../components/ui/Modal';
import { useToastStore } from '../store/toastStore';
import { cn } from '../utils/cn';

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <span className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider block">{label}</span>
      <div className="text-sm text-[#0f172a]">{children}</div>
    </div>
  );
}

function ToggleRow({
  title, desc, checked, onCheckedChange, disabled, label
}: {
  title: string; desc: string; checked: boolean;
  onCheckedChange: (v: boolean) => void; disabled?: boolean; label: string;
}) {
  return (
    <div className={cn(
      "flex items-start justify-between gap-4 p-5 rounded-[12px] transition-all duration-200",
      disabled ? "bg-[#f8fafc] opacity-70" : "hover:bg-[#f8fafc] bg-white border border-[#e2e8f0] cursor-default"
    )}>
      <div className="flex-1">
        <h3 className="font-semibold text-[#0f172a] text-sm">{title}</h3>
        <p className="text-xs text-[#64748b] mt-1 leading-relaxed">{desc}</p>
        {disabled && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#94a3b8] mt-1.5">
            <Info size={10} /> Required — cannot be disabled
          </span>
        )}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-label={label}
      />
    </div>
  );
}

export default function ConsentDetails() {
  const { id } = useParams();
  const { addToast } = useToastStore();

  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: true,
    marketing: false,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'modify' | 'withdraw'>('modify');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleActionClick = (type: 'modify' | 'withdraw') => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const confirmAction = async () => {
    setIsSubmitting(true);
    await new Promise(res => setTimeout(res, 1000));
    setIsSubmitting(false);
    setIsModalOpen(false);

    if (modalType === 'modify') {
      addToast('Consent preferences updated successfully', 'success');
    } else {
      addToast('Consent withdrawn completely', 'warning');
      setPreferences({ essential: true, analytics: false, marketing: false });
    }
  };

  const auditTrail = [
    { date: 'Today, 10:42 AM', title: 'Consent Renewed', desc: 'Renewed essential processing consent for 6 months.', success: true },
    { date: 'Oct 15, 2025, 14:20 PM', title: 'Marketing Consent Revoked', desc: "Turned off 'Marketing & Partner Offers' switch.", success: false },
    { date: 'Jan 12, 2025, 10:45 AM', title: 'Original Consent Granted', desc: 'Accepted policy v2.3 during account opening.', success: false },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Back nav */}
      <div className="flex items-center gap-3">
        <Link
          to="/consents"
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#f1f5f9] text-[#64748b] hover:text-[#0f172a] transition-all"
        >
          <ArrowLeft size={18} />
        </Link>
        <p className="text-sm text-[#64748b]">Back to My Consents</p>
      </div>

      {/* Hero card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Card className="overflow-hidden">
          {/* Gradient banner */}
          <div className="h-20 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] relative px-8 flex items-end pb-0">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-3 right-10 w-24 h-24 rounded-full bg-white" />
              <div className="absolute -bottom-4 right-32 w-16 h-16 rounded-full bg-white" />
            </div>
          </div>
          <div className="px-6 pb-6 -mt-7 relative z-10">
            <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
              <div className="flex items-end gap-4">
                <div className="w-14 h-14 bg-blue-100 text-blue-700 font-bold text-base rounded-[14px] flex items-center justify-center shadow-lg border-2 border-white shrink-0">
                  GTB
                </div>
                <div className="pb-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-lg font-bold text-[#ffffff]">Global Trust Bank</h1>
                    <Badge variant="active" dot>Active</Badge>
                  </div>
                  <p className="text-xs text-[#64748b]">Personal Loan Processing · Mobile App · ID: {id}</p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="secondary" onClick={() => handleActionClick('modify')}>
                  <ShieldCheck size={14} className="mr-1.5" />
                  Save Changes
                </Button>
                <Button size="sm" variant="danger" onClick={() => handleActionClick('withdraw')}>
                  Withdraw
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left: Preferences + Details */}
        <div className="lg:col-span-2 space-y-5">

          {/* Data Preferences */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
            <Card>
              <div className="px-5 py-4 border-b border-[#f1f5f9] flex items-center gap-2">
                <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-[#4f46e5] to-[#6366f1]" />
                <div>
                  <h2 className="font-semibold text-[#0f172a] text-[15px]">Data Preferences</h2>
                  <p className="text-xs text-[#94a3b8] mt-0.5">Configure what data you share with this institution.</p>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <ToggleRow
                  title="Essential Processing"
                  desc="Required for account maintenance and core banking services."
                  checked={preferences.essential}
                  onCheckedChange={() => {}}
                  disabled
                  label="Essential processing"
                />
                <ToggleRow
                  title="Analytics & Usage"
                  desc="Help improve app performance and features by sharing usage statistics."
                  checked={preferences.analytics}
                  onCheckedChange={(val) => setPreferences(p => ({ ...p, analytics: val }))}
                  label="Analytics sharing"
                />
                <ToggleRow
                  title="Marketing & Partner Offers"
                  desc="Receive personalized loan and credit card offers from partner institutions."
                  checked={preferences.marketing}
                  onCheckedChange={(val) => setPreferences(p => ({ ...p, marketing: val }))}
                  label="Marketing offers"
                />
              </div>
            </Card>
          </motion.div>

          {/* Technical Details */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}>
            <Card>
              <div className="px-5 py-4 border-b border-[#f1f5f9] flex items-center gap-2">
                <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-[#94a3b8] to-[#64748b]" />
                <h2 className="font-semibold text-[#0f172a] text-[15px]">Technical Details</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5">
                <DetailRow label="Policy Version">
                  <span className="font-mono text-xs bg-[#eef2ff] text-[#4f46e5] px-2.5 py-1 rounded-[6px] font-semibold">
                    v2.4 (Updated Oct 2024)
                  </span>
                </DetailRow>
                <DetailRow label="Initial Timestamp">
                  Jan 12, 2025 — 10:45 AM
                </DetailRow>
                <DetailRow label="Data Shared">
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {['Identity', 'Financial History', 'Device Info'].map(d => (
                      <Badge key={d} variant="neutral">{d}</Badge>
                    ))}
                  </div>
                </DetailRow>
                <DetailRow label="Vendors Involved">
                  <span className="text-[#64748b]">CreditBureau India, Equifax, AWS Analytics</span>
                </DetailRow>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Right: Audit Trail */}
        <div className="lg:col-span-1">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.15 }}>
            <Card className="h-full">
              <div className="px-5 py-4 border-b border-[#f1f5f9] flex items-center gap-2">
                <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600" />
                <h2 className="font-semibold text-[#0f172a] text-[15px]">Audit Trail</h2>
              </div>
              <div className="p-5">
                <div className="relative ml-3 space-y-5">
                  <div className="absolute left-[7px] top-0 bottom-0 w-px bg-[#e2e8f0]" />
                  {auditTrail.map((entry, i) => (
                    <div key={i} className="relative pl-7">
                      <span className={cn(
                        "absolute left-0 top-1 w-[15px] h-[15px] rounded-full border-2 border-white shadow-sm",
                        entry.success ? "bg-emerald-500" : "bg-[#cbd5e1]"
                      )} />
                      <p className="text-[11px] font-semibold text-[#94a3b8] mb-0.5 uppercase tracking-wide">{entry.date}</p>
                      <p className="text-sm font-semibold text-[#0f172a] mb-1">{entry.title}</p>
                      <p className="text-xs text-[#64748b] leading-relaxed bg-[#f8fafc] rounded-[8px] px-3 py-2 border border-[#e2e8f0]">
                        {entry.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title={modalType === 'modify' ? 'Confirm Changes' : 'Withdraw Consent'}
      >
        <div className="flex flex-col gap-5">
          <div className="flex gap-4">
            <div className={cn(
              "w-11 h-11 rounded-[12px] flex items-center justify-center shrink-0",
              modalType === 'modify' ? "bg-[#eef2ff] text-[#4f46e5]" : "bg-red-50 text-red-500"
            )}>
              {modalType === 'modify' ? <AlertCircle size={22} /> : <XCircle size={22} />}
            </div>
            <div>
              <p className="text-[#0f172a] font-semibold text-sm mb-1">
                {modalType === 'modify'
                  ? 'Update your consent preferences?'
                  : 'Completely withdraw your consent?'}
              </p>
              <p className="text-xs text-[#64748b] leading-relaxed">
                {modalType === 'modify'
                  ? 'This action will be recorded in your audit trail and take effect immediately.'
                  : 'This may affect your ability to use Global Trust Bank services. This action is reversible.'}
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant={modalType === 'modify' ? 'primary' : 'danger'}
              onClick={confirmAction}
              isLoading={isSubmitting}
            >
              {modalType === 'modify' ? 'Confirm Update' : 'Withdraw Access'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
