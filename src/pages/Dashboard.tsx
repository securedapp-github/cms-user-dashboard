import { motion } from 'framer-motion';
import {
  Activity, ShieldAlert, BadgeCheck, FileClock,
  ShieldCheck, FileText, XCircle, AlertCircle,
  Bell, TrendingUp, Users
} from 'lucide-react';
import { StatCard } from '../components/cards/StatCard';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { cn } from '../utils/cn';
import { useAuthStore } from '../store/authStore';
import { useUserStore } from '../store/userStore';
import { userApi } from '../services/api/userApi';
import { useEffect } from 'react';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { summary, consents, setSummary, setConsents, setUser } = useUserStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meRes, sumRes, consRes] = await Promise.all([
          userApi.getUser(),
          userApi.getSummary(),
          userApi.getConsents()
        ]);
        if(meRes) setUser(meRes);
        if(sumRes) setSummary(sumRes);
        if(consRes && consRes.consents) setConsents(consRes.consents);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    };
    fetchData();
  }, [setUser, setSummary, setConsents]);

  const userName = user?.email ? user.email.split('@')[0] : 'User';

  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  } as const;

  const itemVars = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, duration: 0.5, bounce: 0.2 } }
  } as const;

  const activities = consents.slice(0, 5).map(c => {
    const lowerStatus = c.status?.toLowerCase() || '';
    const isActive = lowerStatus === 'active';
    const isPending = lowerStatus === 'pending' || lowerStatus === 'expiring_soon';
    
    return {
      id: c.id,
      title: c.purpose_name || "Consent Given",
      desc: c.app_name || c.tenant_name || "Unknown Application",
      time: new Date(c.updated_at).toLocaleString(),
      status: lowerStatus.charAt(0).toUpperCase() + lowerStatus.slice(1),
      badgeVariant: isActive ? 'active' : (isPending ? 'pending' : 'expired'),
      icon: isActive ? <ShieldCheck size={17} className="text-emerald-600" /> : 
            isPending ? <FileClock size={17} className="text-amber-600" /> : 
            <XCircle size={17} className="text-red-500" />,
      iconBg: isActive ? 'bg-emerald-50 text-emerald-600' : 
              isPending ? 'bg-amber-50 text-amber-600' : 
              'bg-red-50 text-red-500',
    };
  });

  return (
    <motion.div 
      variants={containerVars}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* Welcome Banner */}
      <motion.div variants={itemVars}>
        <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-r from-[#4f46e5] via-[#5b52e8] to-[#6366f1] px-6 py-5 text-white shadow-[0_8px_28px_rgba(79,70,229,0.30)]">
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-64 h-full opacity-10">
            <div className="absolute top-4 right-8 w-32 h-32 rounded-full bg-white" />
            <div className="absolute -bottom-4 right-24 w-24 h-24 rounded-full bg-white" />
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Welcome back, {userName}!</h2>
              <p className="text-indigo-200 text-sm mt-1">You have <span className="text-white font-semibold">{summary?.expiring || 0} consents</span> expiring soon.</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-white/15 backdrop-blur rounded-[12px] px-4 py-2.5 border border-white/20">
              <TrendingUp size={18} className="text-white" />
              <span className="text-sm font-semibold text-white">{summary?.active || 0}/{summary?.total_consents || 0} Active</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <motion.div variants={itemVars}>
          <StatCard
            title="Total Consents"
            value={summary?.total_consents?.toString() || "0"}
            meta="Across Services"
            metaType="neutral"
            metaIcon={<Users size={11} />}
            icon={<Activity size={17} />}
            accentColor="bg-gradient-to-r from-[#4f46e5] to-[#6366f1]"
          />
        </motion.div>
        
        <motion.div variants={itemVars}>
          <StatCard
            title="Active Consents"
            value={summary?.active?.toString() || "0"}
            meta="Healthy status"
            metaType="success"
            metaIcon={<BadgeCheck size={11} />}
            icon={<ShieldCheck size={17} />}
            accentColor="bg-gradient-to-r from-emerald-400 to-emerald-500"
          />
        </motion.div>

        <motion.div variants={itemVars}>
          <StatCard
            title="Expiring Soon"
            value={summary?.expiring?.toString() || "0"}
            meta="Needs attention"
            metaType="warning"
            metaIcon={<ShieldAlert size={11} />}
            icon={<ShieldAlert size={17} />}
            accentColor="bg-gradient-to-r from-amber-400 to-amber-500"
          />
        </motion.div>

        <motion.div variants={itemVars}>
          <StatCard
            title="Pending DSR"
            value={summary?.dsr_pending?.toString() || "0"}
            meta="In progress"
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
                <h3 className="font-semibold text-[#0f172a] text-[15px]">Recent Activity</h3>
              </div>
              <button className="text-xs font-semibold text-[#4f46e5] hover:text-[#4338ca] hover:underline transition-colors">
                View All
              </button>
            </div>
            <div className="p-4 flex flex-col gap-2 flex-1">
                {activities.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No recent activity detected.</p>
                )}
                {activities.map((item) => (
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
                        <Badge variant={item.badgeVariant as 'active' | 'pending' | 'expired'} dot>{item.status}</Badge>
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
              <h3 className="font-semibold text-[#0f172a] text-[15px]">Alerts</h3>
              <span className="ml-auto w-5 h-5 rounded-full bg-[#fef3c7] text-amber-700 text-[10px] font-bold flex items-center justify-center">2</span>
            </div>
            <div className="p-4 flex flex-col gap-3 flex-1">
              
              {/* Warning alert */}
              <div className="relative rounded-[12px] p-4 bg-[#fffbeb] border-l-[3px] border-amber-400 overflow-hidden">
                <div className="flex gap-3">
                  <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-amber-900 mb-0.5">Consent Expiring Soon</h4>
                    <p className="text-xs text-amber-700 mb-2 leading-relaxed">
                      Your consent for <span className="font-semibold">'Health Plus App'</span> expires in 3 days.
                    </p>
                    <button className="text-[11px] font-bold text-amber-700 hover:text-amber-900 underline underline-offset-2 hover:no-underline transition-all">
                      Review Consent →
                    </button>
                  </div>
                </div>
              </div>

              {/* Info alert */}
              <div className="relative rounded-[12px] p-4 bg-[#eff6ff] border-l-[3px] border-blue-400 overflow-hidden">
                <div className="flex gap-3">
                  <Bell size={18} className="text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-blue-900 mb-0.5">Policy Updated</h4>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      Global Trust Bank has updated its data usage policy.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
