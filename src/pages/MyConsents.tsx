import { useTranslation, Trans } from 'react-i18next';
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
  const { t, i18n } = useTranslation();
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

  // Track which specific consent record (purpose) is being withdrawn
  const [activeWithdrawConsent, setActiveWithdrawConsent] = useState<{
    id: string;
    purposeName: string;
    fiduciary: string;
  } | null>(null);

  const [consents, setConsents] = useState<any[]>([]);
  const [tenants, setTenants] = useState<{ label: string; value: string }[]>([
    { label: t('consents.filters.tenant'), value: 'all' }
  ]);
  const [apps, setApps] = useState<{ label: string; value: string }[]>([
    { label: t('consents.filters.platform'), value: 'all' }
  ]);

  // Load Tenants on Mount
  useEffect(() => {
    userApi.getTenants().then(res => {
      if (res && res.tenants) {
        const tenantOpts = res.tenants.map((t: any) => ({ label: t.name, value: t.id }));
        setTenants([{ label: t('consents.filters.tenant'), value: 'all' }, ...tenantOpts]);
      }
    }).catch(console.error);
  }, [t]);

  // Load Apps when Tenant changes
  useEffect(() => {
    if (filterTenant === 'all') {
      setApps([{ label: t('consents.filters.platform'), value: 'all' }]);
      setFilterApp('all');
    } else {
      userApi.getApps(filterTenant).then(res => {
        if (res && res.apps) {
          const appOpts = res.apps.map((a: any) => ({ label: a.name, value: a.id }));
          setApps([{ label: t('consents.filters.platform'), value: 'all' }, ...appOpts]);
        }
      }).catch(console.error);
    }
  }, [filterTenant, t]);

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
    const interval = setInterval(fetchConsents, 10000);
    return () => clearInterval(interval);
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

      if (consentData?.purposes?.length > 0) {
        const found = purposeId
          ? consentData.purposes.find((p: any) => p.id === purposeId) || consentData.purposes[0]
          : consentData.purposes[0];
        setSelectedPurpose(found);
      }

      // Pre-fetch preferred language BEFORE rendering the modal (no flicker)
      const appId = consentData?.application?.id;
      const email = (userData?.user || userData)?.email;
      const phone = (userData?.user || userData)?.phone_number;
      if (appId && (email || phone)) {
        try {
          const policy = await userApi.getPublicPolicy(appId, { email, phone_number: phone });
          const preferredLang = policy?.preferred_language;
          if (preferredLang && preferredLang !== i18n.language) {
            await i18n.changeLanguage(preferredLang);
          }
        } catch {
          // Non-fatal: fall back to current language
        }
      }

      setIsDetailModalOpen(true);
    } catch (err: any) {
      addToast(err.message || t('common.error'), 'error');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleInitiateWithdraw = () => {
    if (!selectedDetails) return;
    setActiveWithdrawConsent({
      id: selectedDetails.id,
      purposeName: selectedPurpose?.name || selectedDetails?.purposes?.[0]?.name || t('common.unknown'),
      fiduciary: selectedDetails?.fiduciary?.name || t('common.unknown'),
    });
    setIsDetailModalOpen(false);
    setWithdrawModalOpen(true);
  };

  const handleWithdraw = async () => {
    if (!activeWithdrawConsent) return;
    setIsSubmitting(true);
    try {
      await userApi.withdrawConsent(activeWithdrawConsent.id);
      addToast(t('logs.desc.CONSENT_WITHDRAWN', { purpose: activeWithdrawConsent.purposeName }), 'success');
      setWithdrawModalOpen(false);
      setActiveWithdrawConsent(null);
      fetchConsents();
    } catch (err: any) {
      addToast(err.message || t('common.error'), 'error');
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
      tenantName: c.tenant_name || t('common.unknown'),
      appName: c.app_name || t('common.unknown'),
      title: c.purpose_name || t('common.unknown'),
      purpose: c.description || t('common.unknown'),
      updatedAt: new Date(c.updated_at).toLocaleString(),
      status: isActive
        ? t('status.accepted')
        : lowerStatus === 'revoked'
        ? t('status.withdrawn')
        : lowerStatus === 'expiring_soon'
        ? t('status.expiring_soon')
        : t(`status.${lowerStatus}`, lowerStatus.charAt(0).toUpperCase() + lowerStatus.slice(1)),
      iconBgColor: isActive ? 'bg-emerald-100' : isPending ? 'bg-amber-100' : 'bg-red-100',
      iconTextColor: isActive ? 'text-emerald-700' : isPending ? 'text-amber-700' : 'text-red-700',
      providerType: c.provider_type || (console.warn(`[Consent] Missing provider_type for consent ${c.id}`), 'self'),
      guardianName: c.guardian_name,
      guardianEmail: c.guardian_email,
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
          <h2 className="text-xl font-bold text-[#0f172a] tracking-tight">{t('consents.title')}</h2>
          <p className="text-sm text-[#64748b] mt-0.5">{t('consents.subtitle')}</p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 bg-[#eef2ff] text-[#4f46e5] text-xs font-semibold px-3 py-1.5 rounded-full">
          <ShieldCheck size={13} />
          {t('consents.found_count', { count: mappedConsents.length })}
        </div>
      </motion.div>

      <motion.div variants={itemVars}>
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-[8px] bg-[#eef2ff] flex items-center justify-center">
              <Filter size={13} className="text-[#4f46e5]" />
            </div>
            <span className="text-sm font-semibold text-[#0f172a]">{t('consents.filter_title')}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
              label={t('consents.filters.tenant')}
              value={filterTenant}
              onChange={(e) => setFilterTenant(e.target.value)}
              options={tenants}
            />
            <Select
              label={t('consents.filters.platform')}
              value={filterApp}
              onChange={(e) => setFilterApp(e.target.value)}
              options={apps}
            />
            <Select
              label={t('consents.filters.status')}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={[
                { label: t('consents.filters.all_statuses'), value: 'all' },
                { label: t('consents.filters.accepted_only'), value: 'active' },
                { label: t('consents.filters.rejected_only'), value: 'revoked' },
                { label: t('consents.filters.expired'), value: 'expired' },
              ]}
            />
            <Select
              label={t('consents.filters.period')}
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              options={[
                { label: t('consents.filters.all_time'), value: 'all' },
                { label: t('consents.filters.today'), value: 'today' },
                { label: t('consents.filters.last_7_days'), value: '7days' },
                { label: t('consents.filters.last_30_days'), value: '30days' },
                { label: t('consents.filters.last_3_months'), value: '3months' },
                { label: t('consents.filters.last_6_months'), value: '6months' },
                { label: t('consents.filters.custom_range'), value: 'custom' },
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
                <label className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider ml-1">{t('consents.filters.start_date')}</label>
                <input 
                  type="date"
                  value={customDates.start}
                  onChange={(e) => setCustomDates(d => ({ ...d, start: e.target.value }))}
                  className="w-full px-4 py-2 text-sm rounded-xl border border-[#e2e8f0] bg-[#f9fafb] focus:outline-none focus:border-[#4f46e5] focus:bg-white transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider ml-1">{t('consents.filters.end_date')}</label>
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
              {t('consents.records_found', { count: mappedConsents.length, plural: mappedConsents.length !== 1 ? 's' : '' })}
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
                    status={consent.status as any}
                    onClick={handleCardClick}
                  />
                </motion.div>
              ))
            ) : (
              <div className="text-center py-14">
                <div className="w-14 h-14 rounded-full bg-[#f8fafc] flex items-center justify-center mx-auto mb-3 border border-[#e2e8f0]">
                  <ShieldCheck size={22} className="text-[#94a3b8]" />
                </div>
                <p className="text-sm font-semibold text-[#64748b]">{t('consents.no_consents')}</p>
                <p className="text-xs text-[#94a3b8] mt-1">{t('consents.adjust_filters')}</p>
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
        onWithdraw={handleInitiateWithdraw}
      />

      {/* Withdrawal Confirmation Modal — purpose-specific */}
      <Modal
        isOpen={withdrawModalOpen}
        onClose={() => !isSubmitting && setWithdrawModalOpen(false)}
        title={t('consents.withdraw_title')}
      >
        <div className="flex flex-col gap-6 py-2">
          <div className="flex gap-5">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center shrink-0 shadow-inner">
              <AlertCircle size={28} />
            </div>
            <div className="space-y-2">
              <p className="text-[#0f172a] font-bold text-base">{t('consents.withdraw_confirm')}</p>
              <p className="text-sm text-[#64748b] leading-relaxed">
                <Trans i18nKey="consents.withdraw_desc" values={{ fiduciary: activeWithdrawConsent?.fiduciary, purpose: activeWithdrawConsent?.purposeName }}>
                  This will immediately revoke <span className="font-semibold text-[#0f172a]">{'{{fiduciary}}'}</span>'s
                  access for the purpose of <span className="font-semibold text-[#0f172a]">"{'{{purpose}}'}"</span>.
                  Other consents you've granted will <span className="font-semibold text-[#0f172a]">not</span> be affected.
                </Trans>
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="ghost"
              className="rounded-xl px-6"
              onClick={() => setWithdrawModalOpen(false)}
              disabled={isSubmitting}
            >
              {t('consents.withdraw_keep')}
            </Button>
            <Button
              variant="danger"
              className="rounded-xl px-6 font-bold shadow-lg shadow-red-100"
              onClick={handleWithdraw}
              isLoading={isSubmitting}
            >
              {t('consents.withdraw_btn')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Global Loading Overlay */}
      <AnimatePresence>
        {loadingDetails && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-white/60 backdrop-blur-md flex flex-col items-center justify-center gap-3"
          >
            <div className="w-10 h-10 border-4 border-[#4f46e5]/20 border-t-[#4f46e5] rounded-full animate-spin" />
            <p className="text-sm font-bold text-[#4f46e5] animate-pulse uppercase tracking-widest">{t('consents.loading_details')}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
