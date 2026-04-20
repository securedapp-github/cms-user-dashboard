import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle2, TrendingUp, ShieldCheck, ChevronDown, ChevronUp, FileText, Calendar } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Stepper } from '../../components/ui/Stepper';
import { userApi } from '../../services/api/userApi';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/Button';
import useSWR from 'swr';

interface DsrRequest {
  id: string;
  status: string;
  request_type: string;
  description?: string;
  created_at: string;
  tenant_name?: string;
  app_name?: string;
  timeline?: Array<{ status: string; created_at: string }>;
}

export default function TrackDSR() {
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [page, setPage] = useState(1);


  const { data: res, isLoading: loading, mutate } = useSWR(
    ['user/dsr/requests', statusFilter, page, startDate, endDate],
    () => userApi.getDsrRequests({
      status: statusFilter || 'All',
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      page
    }),
    { refreshInterval: 10000 } // Polling every 10s as requested
  );

  const requests = res?.data || res?.requests || [];
  const totalPagesCount = res?.pagination?.total_pages || 1;


  const STATUS_OPTIONS = [
    { value: '', label: t('common.all_statuses', 'All Statuses') },
    { value: 'pending', label: t('status.pending', 'Pending') },
    { value: 'processing', label: t('status.processing', 'In Progress') },
    { value: 'completed', label: t('status.completed', 'Completed') },
    { value: 'rejected', label: t('status.rejected', 'Rejected') }
  ];

  const getStatusBadge = (status: string) => {
    if (status === 'completed') return 'active';
    if (status === 'rejected') return 'expired';
    if (status === 'processing') return 'info';
    return 'info'; // pending
  };

  const inputClass = "w-full sm:w-auto px-3.5 py-2 text-sm rounded-[8px] border border-[#e2e8f0] bg-white text-[#0f172a] focus:outline-none focus:border-[#4f46e5] transition-colors";

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/dsr"
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#f1f5f9] text-[#64748b] hover:text-[#0f172a] transition-all"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] tracking-tight">{t('dsr.track_title')}</h2>
            <p className="text-sm text-[#64748b] mt-0.5">{t('dsr.track_subtitle')}</p>
          </div>
        </div>
      </div>

      <Card className="p-4 flex flex-col sm:flex-row items-end sm:items-center gap-4">
        <div className="flex-1 w-full flex flex-col sm:flex-row gap-3">
          <select 
            value={statusFilter} 
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className={inputClass}
          >
            {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <div className="flex w-full sm:w-auto items-center gap-2">
            <span className="text-sm text-[#64748b] whitespace-nowrap"><Calendar size={14} className="inline mr-1" />{t('common.date', 'Date')}:</span>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }} 
              className={inputClass} 
            />
            <span className="text-sm text-[#64748b]">—</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }} 
              className={inputClass} 
            />
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="text-center py-14 text-[#64748b]">{t('common.loading', 'Loading...')}</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-14">
          <div className="w-14 h-14 rounded-full bg-[#f8fafc] flex items-center justify-center mx-auto mb-3 border border-[#e2e8f0]">
            <ShieldCheck size={22} className="text-[#94a3b8]" />
          </div>
          <p className="text-sm font-semibold text-[#64748b]">{t('dsr.no_requests')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req: DsrRequest, idx: number) => {
            const isComplete = req.status === 'completed';
            const isRejected = req.status === 'rejected';
            const isProcessing = req.status === 'processing';
            const isExpanded = expandedId === req.id;

            const timeline = Array.isArray(req.timeline) ? req.timeline : [];
            const steps = timeline.length > 0 
              ? timeline.map((event: any) => ({
                  label: String(t(`status.${event.status}`, event.status)),
                  date: new Date(event.created_at).toLocaleString()
                }))
              : [
                  { label: 'Request Created', date: new Date(req.created_at).toLocaleString() }
                ];

            // Calculate progress percentage based on terminal statuses
            let progressPct = 25;
            if (req.status === 'identity_verified') progressPct = 40;
            if (req.status === 'approved') progressPct = 60;
            if (req.status === 'executing' || req.status === 'processing') progressPct = 80;
            if (req.status === 'completed' || req.status === 'rejected') progressPct = 100;

            const currentStep = steps.length - 1;

            return (
              <Card key={req.id || idx} className="overflow-hidden transition-all duration-300">
                <div className={`h-1 w-full bg-gradient-to-r ${isRejected ? 'from-red-400 to-red-500' : 'from-[#4f46e5] to-[#6366f1]'}`} />

                <div 
                  className="p-5 md:p-6 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : (req.id || null))}
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <h2 className="text-lg font-bold text-[#0f172a]">Request #{req.id?.substring(0, 8).toUpperCase() || 'DSR'}</h2>
                        <Badge variant={getStatusBadge(req.status)} dot>{String(t(`status.${req.status}`, req.status))}</Badge>
                      </div>
                      <p className="text-sm font-semibold text-[#0f172a]">Right to {req.request_type}</p>
                      <p className="text-xs text-[#64748b] mt-0.5">{req.tenant_name ? `${req.tenant_name} / ` : ''}{req.app_name}</p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="flex items-center gap-1.5 bg-[#eef2ff] rounded-[10px] px-3 py-1.5 text-[#4f46e5]">
                        <TrendingUp size={14} />
                        <span className="text-sm font-bold">{progressPct}% Complete</span>
                      </div>
                      {isExpanded ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="h-1.5 w-full bg-[#f1f5f9] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${isRejected ? 'bg-red-500' : 'bg-gradient-to-r from-[#4f46e5] to-[#6366f1]'}`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 md:px-6 pb-6 border-t border-slate-100 bg-white">
                    <div className="mt-6 mb-6">
                      <div className="flex items-start gap-3 bg-slate-50 rounded-lg p-4">
                        <FileText size={18} className="text-[#4f46e5] mt-0.5 shrink-0" />
                        <div>
                          <h4 className="text-sm font-semibold text-slate-800 mb-1">{t('common.description', 'Description')}</h4>
                          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{req.description || 'No description provided.'}</p>
                        </div>
                      </div>
                    </div>

                    {!isComplete && !isRejected && (
                      <div className="flex items-center justify-between p-4 rounded-[12px] bg-emerald-50 border border-emerald-100 mb-6">
                        <div>
                          <p className="text-sm font-semibold text-emerald-900">SLA Status</p>
                          <p className="text-xs text-emerald-700 mt-0.5">Mandated by DPDP Act 2023</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-emerald-700 flex items-center justify-end gap-1.5">
                            <Clock size={17} />
                            30 Days SLA
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle2 size={15} className="text-[#4f46e5]" />
                        <p className="text-sm font-semibold text-[#0f172a]">Request Timeline</p>
                      </div>
                      <div className="px-2 md:px-4">
                        <Stepper steps={steps} currentStep={currentStep} />
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}

          {totalPagesCount > 1 && (
            <div className="flex items-center justify-between pt-6">
              <Button 
                variant="outline" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
              >
                {t('common.back', 'Previous')}
              </Button>
              <div className="text-sm font-medium text-slate-600">
                Page {page} of {totalPagesCount}
              </div>
              <Button 
                variant="outline" 
                onClick={() => setPage(p => Math.min(totalPagesCount, p + 1))}
                disabled={page >= totalPagesCount || loading}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
