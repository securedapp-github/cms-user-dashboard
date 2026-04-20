import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Clock, CheckCircle2, Plus, ArrowLeft, ChevronRight, ChevronDown, MessageSquare, ShieldCheck, HelpCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../utils/cn';

import { useState, useEffect } from 'react';
import { userApi } from '../../services/api/userApi';

export default function GrievanceHistory() {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const res = await userApi.getGrievances();
      if (res && res.grievances) {
        const mapped = res.grievances.map((g: any) => {
          const isEscalated = g.status === 'ESCALATED';
          const isResolved = g.status === 'RESOLVED';
          const isPending = g.status === 'PENDING' || g.status === 'OPEN';

          return {
            id: g.id,
            title: g.description?.length > 60 ? g.description.substring(0, 60) + '...' : g.description || g.category,
            fullDescription: g.description,
            tenant: g.Tenant?.name || t('common.unknown'),
            category: g.category,
            status: t(`status.${g.status.toLowerCase()}`, g.status.charAt(0) + g.status.slice(1).toLowerCase()),
            badgeVariant: isResolved ? 'active' : (isEscalated ? 'expired' : 'pending'),
            reported: new Date(g.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
            lastUpdate: new Date(g.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
            escalated: isEscalated,
            adminReply: g.admin_reply,
            adminReplyAt: g.replied_at ? new Date(g.replied_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : null,
            icon: isResolved ? <CheckCircle2 size={18} /> : (isEscalated ? <AlertCircle size={18} /> : <Clock size={18} />),
            iconBg: isResolved ? 'bg-emerald-50 text-emerald-500' : (isEscalated ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'),
            accentColor: isResolved ? 'bg-emerald-500' : (isEscalated ? 'bg-red-500' : 'bg-amber-500'),
          };
        });
        setTickets(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch grievances:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <Link to="/grievance">
            <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#f1f5f9] text-[#64748b] hover:text-[#0f172a] transition-all">
              <ArrowLeft size={18} />
            </button>
          </Link>
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] tracking-tight flex items-center gap-2">
              {t('grievance.history_title')}
              <span className="text-xs font-semibold bg-[#f1f5f9] text-[#64748b] px-2 py-0.5 rounded-full">
                {t('grievance.total_count', { count: tickets.length })}
              </span>
            </h2>
            <p className="text-sm text-[#64748b] mt-0.5">{t('grievance.history_subtitle')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button 
            onClick={fetchTickets}
            disabled={isLoading}
            className="p-2 text-[#64748b] hover:text-[#4f46e5] hover:bg-[#f1f5f9] rounded-lg transition-all disabled:opacity-50"
          >
            <motion.div
              animate={isLoading ? { rotate: 360 } : {}}
              transition={isLoading ? { repeat: Infinity, duration: 1, ease: "linear" } : {}}
            >
              <Clock size={18} />
            </motion.div>
          </button>
          <Link to="/grievance" className="flex-1 sm:flex-initial">
          <Button size="sm" className="bg-[#ef4444] hover:bg-[#dc2626] text-white shadow-[0_4px_12px_rgba(239,68,68,0.25)] hover:shadow-[0_6px_18px_rgba(239,68,68,0.35)]">
            <Plus size={15} className="mr-1.5" />
            {t('grievance.new_ticket')}
          </Button>
        </Link>
      </div>
    </div>

    {/* Ticket list */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-3 pb-10"
      >
        {tickets.length === 0 && (
          <div className="bg-white rounded-[16px] border border-[#e2e8f0] p-8 text-center text-[#64748b]">
            {t('grievance.no_tickets')}
          </div>
        )}
        {tickets.map((ticket, index) => (
          <motion.div
            key={ticket.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, type: 'spring', duration: 0.45 }}
          >
            <div 
              onClick={() => toggleExpand(ticket.id)}
              className={cn(
                "bg-white rounded-[16px] border",
                expandedId === ticket.id ? "border-[#4f46e5] shadow-[0_8px_30px_rgba(79,70,229,0.12)]" : "border-[#e2e8f0] shadow-[0_1px_3px_rgba(0,0,0,0.06)]",
                "transition-all duration-300 overflow-hidden group relative",
                "hover:border-[#c7d2fe] cursor-pointer"
              )}
            >
              {/* Left color accent */}
              <div className={cn("w-1 h-full shrink-0 absolute left-0 top-0", ticket.accentColor)} />

              <div className="p-5">
                <div className="flex gap-4 items-start">
                  {/* Icon */}
                  <div className={cn(
                    "w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0",
                    "group-hover:scale-105 transition-transform duration-200",
                    ticket.iconBg
                  )}>
                    {ticket.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                      <div>
                        <h3 className={cn(
                          "font-semibold text-sm transition-colors truncate",
                          expandedId === ticket.id ? "text-[#4f46e5]" : "text-[#0f172a] group-hover:text-[#4f46e5]"
                        )}>
                          {ticket.title}
                        </h3>
                        <p className="text-xs text-[#94a3b8] mt-0.5 font-medium">
                          #{ticket.id.substring(0, 8)} · {ticket.tenant} · {ticket.category}
                        </p>
                      </div>
                      <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0">
                        {ticket.escalated && (
                          <span className="text-[10px] font-bold bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full">
                            {t('grievance.auto_escalated')}
                          </span>
                        )}
                        <Badge variant={ticket.badgeVariant as 'active' | 'expired' | 'pending'} dot>{ticket.status}</Badge>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#f1f5f9] text-xs">
                      <div className="flex items-center gap-4">
                        <span className="text-[#94a3b8]">{t('grievance.reported_label')}: <span className="font-medium text-[#64748b]">{ticket.reported}</span></span>
                        {ticket.badgeVariant === 'active' ? (
                          <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                            <ShieldCheck size={12} /> {t('grievance.resolved_label')}: {ticket.lastUpdate}
                          </span>
                        ) : (
                          <span className="text-[#94a3b8]">{t('grievance.updated_label')}: <span className="font-medium text-[#64748b]">{ticket.lastUpdate}</span></span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[#4f46e5] font-semibold text-[11px] uppercase tracking-wider">
                        {expandedId === ticket.id ? t('grievance.collapse') : t('grievance.view_details')}
                        {expandedId === ticket.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </div>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedId === ticket.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="mt-5 pt-5 border-t border-[#f1f5f9] space-y-5">
                        {/* Original Message */}
                        <div>
                          <p className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <HelpCircle size={13} /> {t('grievance.original_message')}
                          </p>
                          <div className="bg-[#f8fafc] rounded-[12px] p-4 text-sm text-[#334155] leading-relaxed border border-[#f1f5f9]">
                            {ticket.fullDescription}
                          </div>
                        </div>

                        {/* Admin Reply */}
                        <div>
                          <p className={cn(
                            "text-[11px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5",
                            ticket.adminReply ? "text-emerald-700" : "text-[#94a3b8]"
                          )}>
                            <MessageSquare size={13} /> {ticket.adminReply ? t('grievance.resolution_update') : t('grievance.admin_response')}
                          </p>
                          
                          {ticket.adminReply ? (
                            <div className="bg-emerald-50/50 rounded-[12px] p-4 border border-emerald-100/80 relative overflow-hidden group/reply">
                              <div className="absolute right-0 top-0 p-3 opacity-10 group-hover/reply:opacity-20 transition-opacity">
                                <ShieldCheck size={64} className="text-emerald-600" />
                              </div>
                              <p className="text-sm text-[#064e3b] leading-relaxed relative z-10">
                                {ticket.adminReply}
                              </p>
                              <div className="mt-4 flex items-center justify-between pt-3 border-t border-emerald-100/50 relative z-10">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                    <ShieldCheck size={12} />
                                  </div>
                                  <span className="text-xs font-semibold text-emerald-800">{t('grievance.super_admin')}</span>
                                </div>
                                <span className="text-[11px] font-medium text-emerald-600/80">
                                  {t('grievance.replied_on', { date: ticket.adminReplyAt })}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-slate-50 rounded-[12px] p-5 text-center border border-dashed border-slate-200">
                              <p className="text-sm text-slate-500 font-medium italic">
                                {t('grievance.no_response')}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
