import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { useTranslation, Trans } from 'react-i18next';
import {
  Activity, ShieldAlert, BadgeCheck,
  ShieldCheck, FileText, XCircle, AlertCircle,
  Bell, Users
} from 'lucide-react';
import { StatCard } from '../components/cards/StatCard';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { cn } from '../utils/cn';
import { userApi } from '../services/api/userApi';
import { useAuthStore } from '../store/authStore';
import useSWR from 'swr';



interface ActivityItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  badgeVariant: 'active' | 'pending' | 'expired' | 'info';
  status: string;
  iconBg: string;
  icon: React.ReactNode;
}

interface ExpiringConsent {
  id: string;
  tenant_name?: string;
  status: string;
}

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { data: summary } = useSWR('user/summary', () => userApi.getSummary());
  const { data: logsData } = useSWR('user/logs', () => userApi.getLogs(5));
  const { data: consentsData } = useSWR('user/consents', () => userApi.getConsents());

  const activities = (logsData?.logs || []).map((log: any) => {
    const action = log.action;
    const metadata = log.metadata || {};
    
    let description = 'System Event';
    if (action === 'USER_LOGIN') {
      description = t('logs.desc.USER_LOGIN', { method: metadata.method?.toUpperCase() || 'Portal' });
    } else if (action === 'LANGUAGE_UPDATED') {
      description = t('logs.desc.LANGUAGE_UPDATED', { language: metadata.language || 'English' });
    } else if (action === 'CONSENT_GRANTED') {
      description = t('logs.desc.CONSENT_GRANTED', { purpose: metadata.purpose_name || t('common.unknown') });
    } else if (action === 'CONSENT_WITHDRAWN') {
      description = t('logs.desc.CONSENT_WITHDRAWN', { purpose: metadata.purpose_name || t('common.unknown') });
    } else if (action === 'DSR_CREATED') {
      description = t('logs.desc.DSR_CREATED', { type: metadata.request_type || t('common.unknown') });
    } else if (action === 'DSR_COMPLETED') {
      description = t('logs.desc.DSR_COMPLETED', { type: metadata.request_type || t('common.unknown') });
    } else if (action === 'DSR_REJECTED') {
      description = t('logs.desc.DSR_REJECTED', { type: metadata.request_type || t('common.unknown') });
    } else if (action === 'GRIEVANCE_CREATED') {
      description = t('logs.desc.GRIEVANCE_CREATED', { category: metadata.category || t('common.unknown') });
    }

    const isSuccess = action === 'USER_LOGIN' || action === 'DSR_COMPLETED' || action === 'CONSENT_GRANTED';
    const isError = action === 'DSR_REJECTED' || action === 'CONSENT_WITHDRAWN';

    return {
      id: log.id,
      title: t(`logs.${action}`, action.replace(/_/g, ' ')),
      desc: description,
      time: new Date(log.created_at).toLocaleString(),
      badgeVariant: isSuccess ? 'active' : (isError ? 'expired' : 'info'),
      status: isSuccess ? t('common.success') : (isError ? t('common.error') : t('common.status')),
      iconBg: isSuccess ? 'bg-emerald-100' : (isError ? 'bg-red-100' : 'bg-blue-100'),
      icon: isSuccess 
        ? <ShieldCheck size={18} className="text-emerald-600" /> 
        : (isError ? <XCircle size={18} className="text-red-600" /> : <Activity size={18} className="text-blue-600" />)
    };
  });

  const expiringConsents = (consentsData?.consents || []).filter((c: any) => c.status === 'expiring_soon' || c.status === 'EXPIRING');


  const alertsCount = expiringConsents.length + (summary?.pending_dsr ? 1 : 0);

  const containerVars: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVars: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', duration: 0.5 } }
  };

  const displayName = user?.email?.split('@')[0] || t('common.user');

  return (
    <motion.div variants={containerVars} initial="hidden" animate="show" className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {t('dashboard.welcome', { name: displayName })}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            <Trans i18nKey="dashboard.expiring_subtitle" count={summary?.expiring_soon || 0}>
              You have <span className="font-bold text-amber-500">{'{{count}}'} consents</span> expiring soon.
            </Trans>
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <motion.div variants={itemVars}>
          <StatCard
            title={t('dashboard.total_consents')}
            value={summary?.total_consents?.toString() || "0"}
            meta={t('dashboard.stats_meta.across_services')}
            metaType="neutral"
            metaIcon={<Users size={11} />}
            icon={<Activity size={17} />}
            accentColor="bg-gradient-to-r from-[#4f46e5] to-[#6366f1]"
          />
        </motion.div>
        
        <motion.div variants={itemVars}>
          <StatCard
            title={t('dashboard.accepted_consents')}
            value={summary?.active_consents?.toString() || "0"}
            meta={t('dashboard.stats_meta.healthy')}
            metaType="success"
            metaIcon={<BadgeCheck size={11} />}
            icon={<ShieldCheck size={17} />}
            accentColor="bg-gradient-to-r from-emerald-400 to-emerald-500"
          />
        </motion.div>

        <motion.div variants={itemVars}>
          <StatCard
            title={t('dashboard.expiring_soon')}
            value={summary?.expiring_soon?.toString() || "0"}
            meta={t('dashboard.stats_meta.attention')}
            metaType="warning"
            metaIcon={<ShieldAlert size={11} />}
            icon={<ShieldAlert size={17} />}
            accentColor="bg-gradient-to-r from-amber-400 to-amber-500"
          />
        </motion.div>

        <motion.div variants={itemVars}>
          <StatCard
            title={t('dashboard.pending_dsr')}
            value={summary?.pending_dsr?.toString() || "0"}
            meta={t('dashboard.stats_meta.in_progress')}
            metaType="neutral"
            metaIcon={<FileText size={11} />}
            icon={<FileText size={17} />}
            accentColor="bg-gradient-to-r from-blue-400 to-blue-500"
          />
        </motion.div>
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Recent Activity */}
        <motion.div variants={itemVars} className="lg:col-span-2">
          <Card className="h-full flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-[#f1f5f9] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-[#4f46e5] to-[#6366f1]" />
                <h3 className="font-semibold text-[#0f172a] text-[15px]">{t('dashboard.recent_activity')}</h3>
              </div>
              <button className="text-xs font-semibold text-[#4f46e5] hover:text-[#4338ca] hover:underline transition-colors">
                {t('common.view_all')}
              </button>
            </div>
            <div className="p-4 flex flex-col gap-2 flex-1">
                {activities.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">{t('dashboard.no_activity')}</p>
                )}
                {activities.map((item: ActivityItem) => (
                  <div
                    key={item.id}
                    className={cn(
                      "flex gap-3.5 p-3 rounded-[12px]",
                      "border border-transparent",
                      "transition-all duration-200 cursor-pointer group",
                      "hover:bg-[#f8fafc] hover:border-[#e2e8f0]",
                      "hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                    )}
                  >
                    <div className={cn(
                      "w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0",
                      "group-hover:scale-110 transition-transform duration-200",
                      item.iconBg
                    )}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="font-semibold text-[#0f172a] text-sm truncate pr-2 group-hover:text-[#4f46e5] transition-colors">
                          {item.title}
                        </p>
                        <Badge variant={item.badgeVariant as 'active' | 'pending' | 'expired' | 'info'} dot>{item.status}</Badge>
                      </div>
                      <p className="text-xs text-[#64748b] truncate">{item.desc}</p>
                      <p className="text-[11px] text-[#94a3b8] mt-0.5">{item.time}</p>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </motion.div>

        {/* Alerts Panel */}
        <motion.div variants={itemVars} className="lg:col-span-1">
          <Card className="h-full flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-[#f1f5f9] flex items-center gap-2 shrink-0">
              <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-amber-400 to-orange-500" />
              <h3 className="font-semibold text-[#0f172a] text-[15px]">{t('dashboard.alerts')}</h3>
            </div>
            
            <div className="p-5 flex flex-col gap-4 overflow-y-auto">
              {alertsCount === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">{t('dashboard.no_alerts')}</p>
              )}
              {expiringConsents.map((c: ExpiringConsent, idx: number) => (
                <div key={`exp-${c.id}-${idx}`} className="relative rounded-[12px] p-4 bg-[#fffbeb] border-l-[3px] border-amber-400 overflow-hidden">
                  <div className="flex gap-3">
                    <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm text-amber-900 mb-0.5">{t('dashboard.consent_expiring_title')}</h4>
                      <p className="text-xs text-amber-700 mb-2 leading-relaxed">
                        <Trans i18nKey="dashboard.consent_expiring_desc" values={{ tenant: c.tenant_name || t('common.unknown') }}>
                          Your consent for <span className="font-semibold">{'{{tenant}}'}</span> expires soon.
                        </Trans>
                      </p>
                      <button className="text-[11px] font-bold text-amber-700 hover:text-amber-900 underline underline-offset-2 hover:no-underline transition-all">
                        {t('dashboard.review_consent')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {summary?.pending_dsr ? (
                <div className="relative rounded-[12px] p-4 bg-[#eff6ff] border-l-[3px] border-blue-400 overflow-hidden">
                  <div className="flex gap-3">
                    <Bell size={18} className="text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm text-blue-900 mb-0.5">{t('dashboard.dsr_in_progress_title')}</h4>
                      <p className="text-xs text-blue-700 leading-relaxed">
                        {t('dashboard.dsr_in_progress_desc', { count: summary.pending_dsr })}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

