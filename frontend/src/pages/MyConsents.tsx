import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, ShieldCheck } from 'lucide-react';
import { Select } from '../components/ui/Select';
import { ConsentCard } from '../components/cards/ConsentCard';
import { Card } from '../components/ui/Card';
import { userApi } from '../services/api/userApi';

export default function MyConsents() {
  const [filterTenant, setFilterTenant] = useState('all');
  const [filterApp, setFilterApp] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

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
  useEffect(() => {
    userApi.getConsents({
      tenant_id: filterTenant !== 'all' ? filterTenant : undefined,
      app_id: filterApp !== 'all' ? filterApp : undefined,
      status: filterStatus !== 'all' ? filterStatus.toLowerCase() : undefined,
    }).then(res => {
      if (res && res.consents) setConsents(res.consents);
    }).catch(console.error);
  }, [filterTenant, filterApp, filterStatus]);

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div>
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
                    status={consent.status as 'Active' | 'Revoked' | 'Expired' | 'Expiring Soon'}
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
    </motion.div>
  );
}
