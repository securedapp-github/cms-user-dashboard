import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, Clock, CheckCircle2, Plus, ArrowLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../utils/cn';

const TICKETS = [
  {
    id: 'GR-933',
    title: 'Unauthorized Third-Party Sharing',
    tenant: 'FinTech App XYZ',
    category: 'Data Sharing',
    status: 'Investigating',
    badgeVariant: 'expired' as const,
    reported: 'March 20, 2026',
    lastUpdate: 'Yesterday, 5:44 PM',
    escalated: true,
    icon: <AlertCircle size={18} />,
    iconBg: 'bg-red-50 text-red-500',
    accentColor: 'bg-red-500',
  },
  {
    id: 'GR-992',
    title: 'Consent Violation — Data used without permission',
    tenant: 'Global Trust Bank',
    category: 'Consent',
    status: 'Pending Review',
    badgeVariant: 'pending' as const,
    reported: 'Just Now',
    lastUpdate: 'Just Now',
    escalated: false,
    icon: <Clock size={18} />,
    iconBg: 'bg-amber-50 text-amber-500',
    accentColor: 'bg-amber-500',
  },
  {
    id: 'GR-312',
    title: 'Inaccurate Processing / Error',
    tenant: 'ShopEasy Commerce',
    category: 'Data Quality',
    status: 'Resolved',
    badgeVariant: 'active' as const,
    reported: 'Jan 10, 2026',
    lastUpdate: 'Corrected Data Profile',
    escalated: false,
    icon: <CheckCircle2 size={18} />,
    iconBg: 'bg-emerald-50 text-emerald-500',
    accentColor: 'bg-emerald-500',
  },
] as const;

export default function GrievanceHistory() {
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
              Grievance Tickets
              <span className="text-xs font-semibold bg-[#f1f5f9] text-[#64748b] px-2 py-0.5 rounded-full">
                {TICKETS.length} Total
              </span>
            </h2>
            <p className="text-sm text-[#64748b] mt-0.5">Track status of your grievance submissions.</p>
          </div>
        </div>
        <Link to="/grievance">
          <Button size="sm" className="bg-[#ef4444] hover:bg-[#dc2626] text-white shadow-[0_4px_12px_rgba(239,68,68,0.25)] hover:shadow-[0_6px_18px_rgba(239,68,68,0.35)]">
            <Plus size={15} className="mr-1.5" />
            New Ticket
          </Button>
        </Link>
      </div>

      {/* Ticket list */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-3"
      >
        {TICKETS.map((ticket, index) => (
          <motion.div
            key={ticket.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, type: 'spring', duration: 0.45 }}
          >
            <div className={cn(
              "bg-white rounded-[16px] border border-[#e2e8f0]",
              "shadow-[0_1px_3px_rgba(0,0,0,0.06)]",
              "transition-all duration-250 overflow-hidden group",
              "hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.09)]",
              "hover:border-[#c7d2fe]",
              "cursor-pointer flex",
            )}>
              {/* Left color accent */}
              <div className={cn("w-1 shrink-0 rounded-l-[16px]", ticket.accentColor)} />

              <div className="flex-1 p-5 flex gap-4 items-start">
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
                      <h3 className="font-semibold text-[#0f172a] text-sm group-hover:text-[#4f46e5] transition-colors truncate">
                        {ticket.title}
                      </h3>
                      <p className="text-xs text-[#94a3b8] mt-0.5 font-medium">
                        #{ticket.id} · {ticket.tenant} · {ticket.category}
                      </p>
                    </div>
                    <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0">
                      {ticket.escalated && (
                        <span className="text-[10px] font-bold bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full">
                          🚨 Auto-Escalated to DPO
                        </span>
                      )}
                      <Badge variant={ticket.badgeVariant as 'active' | 'expired' | 'pending'} dot>{ticket.status}</Badge>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#f1f5f9] text-xs">
                    <span className="text-[#94a3b8]">Reported: <span className="font-medium text-[#64748b]">{ticket.reported}</span></span>
                    {ticket.status === 'Resolved' ? (
                      <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-semibold">
                        ✓ {ticket.lastUpdate}
                      </span>
                    ) : (
                      <span className="text-[#94a3b8]">Updated: <span className="font-medium text-[#64748b]">{ticket.lastUpdate}</span></span>
                    )}
                  </div>
                </div>

                <ChevronRight size={15} className="text-[#cbd5e1] group-hover:text-[#4f46e5] transition-colors shrink-0 mt-1" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
