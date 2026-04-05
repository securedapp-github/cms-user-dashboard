import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, ShieldCheck, AlertCircle } from 'lucide-react';
import { Select } from '../components/ui/Select';
import { ConsentCard } from '../components/cards/ConsentCard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { PurposeDetailModal } from '../components/modals/PurposeDetailModal';
import { userApi } from '../services/api/userApi';
import { useToastStore } from '../store/toastStore';
import type { Purpose, ConsentDetailsData } from '../types/consent';

export default function MyConsents() {
  const [filterTenant, setFilterTenant] = useState('all');
  const [filterApp, setFilterApp] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [customDates, setCustomDates] = useState({ start: '', end: '' });
  const { addToast } = useToastStore();
  
  // Modal State
  const [selectedPurpose, setSelectedPurpose] = useState<Purpose | null>(null);
  const [selectedDetails, setSelectedDetails] = useState<ConsentDetailsData | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [consents, setConsents] = useState<any[]>([]);
  const [tenants, setTenants] = useState<{ label: string; value: string }[]>([
    { label: 'All Banks / Tenants', value: 'all' }
  ]);
  const [apps, setApps] = useState<{ label: string; value: string }[]>([
    { label: 'All Platforms', value: 'all' }
  ]);

  // Load Tenants on Mount
  useEffect(() => {
    userApi.getTenants().then(res => {
      if (res && res.tenants) {
        const tenantOpts = res.tenants.map((t: any) => ({ label: t.name, value: t.id }));
        setTenants([{ label: 'All Banks / Tenants', value: 'all' }, ...tenantOpts]);
      }
    }).catch(console.error);
  }, []);

  // Load Apps when Tenant changes
  useEffect(() => {
    if (filterTenant === 'all') {
      setApps([{ label: 'All Platforms', value: 'all' }]);
      setFilterApp('all');
    } else {
      userApi.getApps(filterTenant).then(res => {
        if (res && res.apps) {
          const appOpts = res.apps.map((a: any) => ({ label: a.name, value: a.id }));
          setApps([{ label: 'All Platforms', value: 'all' }, ...appOpts]);
        }
      }).catch(console.error);
    }
  }, [filterTenant]);

  // Load Consents based on Filters
  const fetchConsents = async () => {
    try {
      let startDate: string | undefined;
      let endDate: string | undefined;

      if (filterPeriod !== 'all') {
        const now = new Date();
        const end = new Date();
        let start = new Date();

        if (filterPeriod === 'today') {
          start.setHours(0, 0, 0, 0);
        } else if (filterPeriod === '7days') {
          start.setDate(now.getDate() - 7);
        } else if (filterPeriod === '30days') {
          start.setDate(now.getDate() - 30);
        } else if (filterPeriod === '3months') {
          start.setMonth(now.getMonth() - 3);
        } else if (filterPeriod === '6months') {
          start.setMonth(now.getMonth() - 6);
        } else if (filterPeriod === 'custom') {
          startDate = customDates.start ? new Date(customDates.start).toISOString() : undefined;
          endDate = customDates.end ? new Date(customDates.end).toISOString() : undefined;
        }

        if (filterPeriod !== 'custom') {
          startDate = start.toISOString();
          endDate = end.toISOString();
        }
      }

      const res = await userApi.getConsents({
        tenant_id: filterTenant !== 'all' ? filterTenant : undefined,
        app_id: filterApp !== 'all' ? filterApp : undefined,
        status: filterStatus !== 'all' ? filterStatus.toLowerCase() : undefined,
        startDate,
        endDate,
      });
      if (res && res.consents) setConsents(res.consents);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConsents();
  }, [filterTenant, filterApp, filterStatus, filterPeriod, customDates]);

  const handleCardClick = async (consentId: string, purposeId?: string) => {
    setLoadingDetails(true);
    try {
      const [consentData, userData] = await Promise.all([
        userApi.getConsentDetails(consentId),
        userApi.getUser()
      ]);
      
      setSelectedDetails(consentData);
      setUserProfile(userData?.user || userData);

      if (purposeId && consentData?.purposes) {
        const found = consentData.purposes.find((p: any) => p.id === purposeId);
        if (found) setSelectedPurpose(found);
      }
      setIsDetailModalOpen(true);
    } catch (err: any) {
      addToast(err.message || 'Failed to load details', 'error');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleWithdraw = async () => {
    if (!selectedDetails) return;
    setIsSubmitting(true);
    try {
      await userApi.withdrawConsent(selectedDetails.id);
      addToast('Consent withdrawn completely', 'success');
      setWithdrawModalOpen(false);
      fetchConsents(); // Refresh list
    } catch (err: any) {
      addToast(err.message || 'Failed to withdraw', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  } as const;
  const itemVars = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, duration: 0.45, bounce: 0.2 } }
  } as const;

  const mappedConsents = consents.map(c => {
    const lowerStatus = c.status?.toLowerCase() || '';
    const isActive = lowerStatus === 'active';
    const isPending = lowerStatus === 'pending' || lowerStatus === 'expiring_soon';

    return {
      id: c.id,
      purposeId: c.purpose_id,
      tenantAbbr: c.tenant_name?.substring(0, 2).toUpperCase() || 'GT',
      tenantName: c.tenant_name || 'Unknown Bank',
      appName: c.app_name || 'Unknown App',
      title: c.purpose_name || 'Consent Granted',
      purpose: c.description || 'Data sharing agreement',
      updatedAt: new Date(c.updated_at).toLocaleString(),
      status: lowerStatus === 'expiring_soon' ? 'Expiring Soon' : lowerStatus.charAt(0).toUpperCase() + lowerStatus.slice(1),
      iconBgColor: isActive ? 'bg-emerald-100' : isPending ? 'bg-amber-100' : 'bg-red-100',
      iconTextColor: isActive ? 'text-emerald-700' : isPending ? 'text-amber-700' : 'text-red-700',
    };
  });

  return (
    <motion.div
      variants={containerVars}
      initial="hidden"
      animate="show"
      className="max-w-4xl mx-auto space-y-5"
    >
      <motion.div variants={itemVars} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0f172a] tracking-tight">My Consents</h2>
          <p className="text-sm text-[#64748b] mt-0.5">Manage all data-sharing agreements in one place.</p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 bg-[#eef2ff] text-[#4f46e5] text-xs font-semibold px-3 py-1.5 rounded-full">
          <ShieldCheck size={13} />
          {mappedConsents.length} Found
        </div>
      </motion.div>

      <motion.div variants={itemVars}>
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-[8px] bg-[#eef2ff] flex items-center justify-center">
              <Filter size={13} className="text-[#4f46e5]" />
            </div>
            <span className="text-sm font-semibold text-[#0f172a]">Filter Consents</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
              label="Tenant / Bank"
              value={filterTenant}
              onChange={(e) => setFilterTenant(e.target.value)}
              options={tenants}
            />
            <Select
              label="Platform"
              value={filterApp}
              onChange={(e) => setFilterApp(e.target.value)}
              options={apps}
            />
            <Select
              label="Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={[
                { label: 'All Statuses', value: 'all' },
                { label: 'Active', value: 'active' },
                { label: 'Revoked', value: 'revoked' },
                { label: 'Expired', value: 'expired' },
              ]}
            />
            <Select
              label="Time Period"
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              options={[
                { label: 'All Time', value: 'all' },
                { label: 'Today', value: 'today' },
                { label: 'Last 7 Days', value: '7days' },
                { label: 'Last 30 Days', value: '30days' },
                { label: 'Last 3 Months', value: '3months' },
                { label: 'Last 6 Months', value: '6months' },
                { label: 'Custom Range', value: 'custom' },
              ]}
            />
          </div>

          {filterPeriod === 'custom' && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#f1f5f9]"
            >
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider ml-1">Start Date</label>
                <input 
                  type="date"
                  value={customDates.start}
                  onChange={(e) => setCustomDates(d => ({ ...d, start: e.target.value }))}
                  className="w-full px-4 py-2 text-sm rounded-xl border border-[#e2e8f0] bg-[#f9fafb] focus:outline-none focus:border-[#4f46e5] focus:bg-white transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider ml-1">End Date</label>
                <input 
                  type="date"
                  value={customDates.end}
                  onChange={(e) => setCustomDates(d => ({ ...d, end: e.target.value }))}
                  className="w-full px-4 py-2 text-sm rounded-xl border border-[#e2e8f0] bg-[#f9fafb] focus:outline-none focus:border-[#4f46e5] focus:bg-white transition-all"
                />
              </div>
            </motion.div>
          )}
        </Card>
      </motion.div>

      <motion.div variants={itemVars}>
        <Card className="overflow-hidden">
          <div className="px-5 py-4 border-b border-[#f1f5f9] flex items-center gap-2">
            <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-[#4f46e5] to-[#6366f1]" />
            <h3 className="font-semibold text-[#0f172a] text-[15px]">
              {mappedConsents.length} Consent{mappedConsents.length !== 1 ? 's' : ''} Found
            </h3>
          </div>

          <div className="flex flex-col p-4 gap-3">
            {mappedConsents.length > 0 ? (
              mappedConsents.map((consent) => (
                <motion.div
                  key={consent.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <ConsentCard 
                    {...consent} 
                    purposeId={consent.purposeId}
                    status={consent.status as 'Active' | 'Revoked' | 'Expired' | 'Expiring Soon'}
                    onClick={handleCardClick}
                  />
                </motion.div>
              ))
            ) : (
              <div className="text-center py-14">
                <div className="w-14 h-14 rounded-full bg-[#f8fafc] flex items-center justify-center mx-auto mb-3 border border-[#e2e8f0]">
                  <ShieldCheck size={22} className="text-[#94a3b8]" />
                </div>
                <p className="text-sm font-semibold text-[#64748b]">No consents match the filters</p>
                <p className="text-xs text-[#94a3b8] mt-1">Try adjusting your filter criteria above.</p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Purpose Detail Modal */}
      <PurposeDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        purpose={selectedPurpose}
        consent={selectedDetails}
        user={userProfile}
        onWithdraw={() => setWithdrawModalOpen(true)}
      />

      {/* Withdrawal Confirmation Modal */}
      <Modal
        isOpen={withdrawModalOpen}
        onClose={() => !isSubmitting && setWithdrawModalOpen(false)}
        title="Withdraw Access"
      >
        <div className="flex flex-col gap-6 py-2">
          <div className="flex gap-5">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center shrink-0 shadow-inner">
              <AlertCircle size={28} />
            </div>
            <div className="space-y-2">
              <p className="text-[#0f172a] font-bold text-base">Confirm withdrawal?</p>
              <p className="text-sm text-[#64748b] leading-relaxed">
                This will immediately stop <span className="font-semibold text-[#0f172a]">{selectedDetails?.fiduciary?.name}</span> from accessing your data for the purpose of <span className="font-semibold text-[#0f172a]">{selectedPurpose?.name}</span>.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" className="rounded-xl px-6" onClick={() => setWithdrawModalOpen(false)} disabled={isSubmitting}>
              Keep Access
            </Button>
            <Button
              variant="danger"
              className="rounded-xl px-6 font-bold shadow-lg shadow-red-100"
              onClick={handleWithdraw}
              isLoading={isSubmitting}
            >
              Confirm Withdrawal
            </Button>
          </div>
        </div>
      </Modal>

      {/* Global Loading Overlay for Card Clicks */}
      <AnimatePresence>
        {loadingDetails && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-white/60 backdrop-blur-md flex flex-col items-center justify-center gap-3"
          >
            <div className="w-10 h-10 border-4 border-[#4f46e5]/20 border-t-[#4f46e5] rounded-full animate-spin" />
            <p className="text-sm font-bold text-[#4f46e5] animate-pulse uppercase tracking-widest">Loading Details...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
