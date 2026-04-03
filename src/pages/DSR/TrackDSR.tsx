import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle2, TrendingUp, ShieldCheck } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Stepper } from '../../components/ui/Stepper';
import { userApi } from '../../services/api/userApi';

export default function TrackDSR() {
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    userApi.getDsrRequests().then(res => {
      if (res && res.data) {
        setRequests(res.data);
      } else if (res && res.requests) {
        setRequests(res.requests);
      }
    }).catch(console.error);
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link
          to="/dsr"
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#f1f5f9] text-[#64748b] hover:text-[#0f172a] transition-all"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-[#0f172a] tracking-tight">Track DSR Requests</h2>
          <p className="text-sm text-[#64748b] mt-0.5">Real-time status of your data subject right requests.</p>
        </div>
      </div>

      {requests.length === 0 && (
        <div className="text-center py-14">
          <div className="w-14 h-14 rounded-full bg-[#f8fafc] flex items-center justify-center mx-auto mb-3 border border-[#e2e8f0]">
            <ShieldCheck size={22} className="text-[#94a3b8]" />
          </div>
          <p className="text-sm font-semibold text-[#64748b]">No DSR requests found</p>
        </div>
      )}

      {requests.map((req, idx) => {
        // Build mock steps for now based on status
        const isComplete = req.status === 'completed';
        const steps = [
          { label: 'Request Created',       date: new Date(req.created_at).toLocaleString() },
          { label: 'Identity Verified',     date: 'System Verified' },
          { label: 'Approved by Fiduciary', date: isComplete ? 'Approved' : 'Pending' },
          { label: 'Data Compilation',      date: isComplete ? 'Done' : 'Pending' },
          { label: 'Completed',             date: isComplete ? 'Done' : 'Pending' },
        ];

        let currentStep = 1;
        if (req.status === 'processing') currentStep = 2;
        if (req.status === 'completed') currentStep = 5;
        if (req.status === 'rejected') currentStep = 2;

        const progressPct = Math.round((currentStep / steps.length) * 100);

        return (
          <Card key={req.id || idx} className="overflow-hidden mb-5">
            <div className="h-1 w-full bg-gradient-to-r from-[#4f46e5] to-[#6366f1]" />

            <div className="p-6 md:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <h2 className="text-lg font-bold text-[#0f172a]">Request #{req.id?.substring(0, 8).toUpperCase() || 'DSR'}</h2>
                    <Badge variant={isComplete ? 'active' : 'info'} dot>{req.status}</Badge>
                  </div>
                  <p className="text-sm font-semibold text-[#0f172a]">Right to {req.request_type}</p>
                  <p className="text-xs text-[#64748b] mt-0.5">Application: {req.app_name}</p>
                </div>
                <div className="flex items-center gap-1.5 bg-[#eef2ff] rounded-[10px] px-3.5 py-2 text-[#4f46e5] shrink-0">
                  <TrendingUp size={14} />
                  <span className="text-sm font-bold">{progressPct}% Complete</span>
                </div>
              </div>

              <div>
                <div className="h-2 w-full bg-[#f1f5f9] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#4f46e5] to-[#6366f1] rounded-full transition-all duration-700"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              {!isComplete && (
                <div className="flex items-center justify-between p-4 rounded-[12px] bg-emerald-50 border border-emerald-100">
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
          </Card>
        );
      })}
    </div>
  );
}
