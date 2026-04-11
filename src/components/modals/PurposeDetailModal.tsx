import { Shield, User, FileText } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import type { Purpose, ConsentDetailsData } from '../../types/consent';

interface PurposeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  purpose: Purpose | null;
  consent: ConsentDetailsData | null;
  user: any;
  onWithdraw: () => void;
}

export function PurposeDetailModal({
  isOpen,
  onClose,
  purpose,
  consent,
  user,
  onWithdraw
}: PurposeDetailModalProps) {
  if (!purpose || !consent) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Consent Detail">
      <div className="space-y-6 py-2">
        {/* Fiduciary & App Section */}
        <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#f8fafc] border border-[#f1f5f9]">
          <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-[#e2e8f0] flex items-center justify-center shrink-0">
             <Shield className="text-[#4f46e5]" size={24} />
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1">Service Provide By</h4>
            <p className="text-sm font-bold text-[#0f172a]">{consent.fiduciary.name}</p>
            <p className="text-xs text-[#64748b]">{consent.application.name}</p>
          </div>
        </div>

        {/* Data Principal Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <User size={14} className="text-[#94a3b8]" />
            <h4 className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Data Principal</h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border border-[#e2e8f0] bg-white">
              <p className="text-[10px] text-[#94a3b8] font-bold uppercase mb-1">Email</p>
              <p className="text-xs font-semibold text-[#334155] truncate">{user?.email || 'user@example.com'}</p>
            </div>
            <div className="p-3.5 rounded-xl border border-[#e2e8f0] bg-white">
              <p className="text-[10px] text-[#94a3b8] font-bold uppercase mb-1">Mobile Number</p>
              <p className="text-xs font-semibold text-[#334155]">{user?.phone_number || '+91 98765 43210'}</p>
            </div>
          </div>
        </div>

        {/* Purpose & Data Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <FileText size={14} className="text-[#94a3b8]" />
            <h4 className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Requested Purposes & Data</h4>
          </div>
          <div className="space-y-4">
            {consent.purposes.map((p) => (
              <div key={p.id} className="p-5 rounded-2xl border border-[#e2e8f0] bg-white space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h5 className="text-sm font-bold text-[#0f172a]">{p.name || 'Data Purpose'}</h5>
                    <p className="text-xs text-[#64748b] mt-1 line-clamp-2">{p.description || 'Description not available.'}</p>
                  </div>
                  <div>
                    {p.status === 'rejected' ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-red-50 text-red-700 border border-red-100">
                        Rejected
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        Accepted
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="pt-4 border-t border-[#f1f5f9]">
                  <p className="text-[10px] text-[#94a3b8] font-bold uppercase mb-2">Requested Data Attributes</p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.data_items?.length > 0 ? (
                      p.data_items.map((item: string) => (
                        <span key={item} className="text-[10px] font-bold bg-[#eef2ff] text-[#4f46e5] px-2.5 py-1 rounded-lg border border-[#e0e7ff]">
                          {item.replace(/_/g, ' ')}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-[#94a3b8]">No specific data attributes listed.</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Metadata & Actions */}
        <div className="flex items-center justify-between px-1 pt-6 border-t border-[#f1f5f9]">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#94a3b8] uppercase tracking-tight">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              POLICY VERSION: {consent.policy_version || "N/A"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                onClose();
                onWithdraw();
              }}
              className="h-8 text-[10px] font-bold tracking-wider rounded-lg px-4"
            >
              Withdraw Consent
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 text-[10px] font-bold tracking-wider rounded-lg px-4">
              Understood
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
