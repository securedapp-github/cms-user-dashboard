import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { ArrowRight, FileText, Building2, AlignLeft, Paperclip, MonitorSmartphone } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FileUpload } from '../../components/ui/FileUpload';
import { useToastStore } from '../../store/toastStore';
import { userApi } from '../../services/api/userApi';

const dsrSchema = z.object({
  tenant_id: z.string().min(1, 'Please select a tenant'),
  app_id: z.string().min(1, 'Please select an application'),
  type: z.string().min(1, 'Please select a request type'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000),
});

type DsrForm = z.infer<typeof dsrSchema>;

const REQUEST_TYPES = [
  { label: 'Access Data (Portability)', value: 'access' },
  { label: 'Correction / Rectification', value: 'rectification' },
  { label: 'Erasure (Right to be Forgotten)', value: 'erasure' },
];

function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-6 h-6 rounded-[6px] bg-[#eef2ff] flex items-center justify-center text-[#4f46e5] shrink-0">
        {icon}
      </div>
      <span className="text-sm font-semibold text-[#0f172a]">{label}</span>
    </div>
  );
}

export default function RaiseDSR() {
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [_file, setFile] = useState<File | null>(null);

  const [tenants, setTenants] = useState<any[]>([]);
  const [apps, setApps] = useState<any[]>([]);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<DsrForm>({
    resolver: zodResolver(dsrSchema)
  });

  const selectedTenantId = watch('tenant_id');

  useEffect(() => {
    userApi.getTenants().then(res => {
      if (res && res.tenants) setTenants(res.tenants);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedTenantId) {
      userApi.getApps(selectedTenantId).then(res => {
        if (res && res.apps) setApps(res.apps);
      }).catch(console.error);
    } else {
      setApps([]);
    }
  }, [selectedTenantId]);

  const onSubmit = async (data: DsrForm) => {
    setIsSubmitting(true);
    try {
      await userApi.submitDSR({
        tenant_id: data.tenant_id,
        app_id: data.app_id,
        request_type: data.type,
        description: data.description,
      });
      addToast('DSR Request Submitted Successfully', 'success');
      navigate('/dsr/track');
    } catch (err: any) {
      addToast(err.message || "Failed to submit request", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (hasError: boolean) => [
    "w-full px-4 py-2.5 text-sm rounded-[10px]",
    "border bg-[#f9fafb] text-[#0f172a]",
    "transition-all duration-200",
    "focus:outline-none focus:bg-white",
    "focus:shadow-[0_0_0_3px_rgba(79,70,229,0.1)]",
    "hover:border-[#cbd5e1]",
    hasError
      ? "border-[#ef4444] focus:border-[#ef4444]"
      : "border-[#e2e8f0] focus:border-[#4f46e5]",
  ].join(' ');

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#0f172a] tracking-tight">Raise DSR Request</h2>
          <p className="text-sm text-[#64748b] mt-0.5">Submit a Data Subject Right request to your connected institutions.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/dsr/track')}>
          Track Existing Requests
        </Button>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className="overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-[#4f46e5] to-[#6366f1]" />

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8 space-y-7">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tenant */}
              <div>
                <SectionLabel icon={<Building2 size={13} />} label="Select Tenant / Bank" />
                <select
                  {...register('tenant_id')}
                  className={inputClass(!!errors.tenant_id)}
                >
                  <option value="">— Select Organisation —</option>
                  {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                {errors.tenant_id && (
                  <p className="text-xs text-[#ef4444] font-medium mt-1.5 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-[#ef4444] inline-block" />
                    {errors.tenant_id.message}
                  </p>
                )}
              </div>

              {/* App */}
              <div>
                <SectionLabel icon={<MonitorSmartphone size={13} />} label="Select Platform / App" />
                <select
                  {...register('app_id')}
                  className={inputClass(!!errors.app_id)}
                  disabled={!selectedTenantId || apps.length === 0}
                >
                  <option value="">— Select Application —</option>
                  {apps.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
                {errors.app_id && (
                  <p className="text-xs text-[#ef4444] font-medium mt-1.5 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-[#ef4444] inline-block" />
                    {errors.app_id.message}
                  </p>
                )}
              </div>
            </div>

            {/* Request type */}
            <div>
              <SectionLabel icon={<FileText size={13} />} label="Request Type" />
              <select
                {...register('type')}
                className={inputClass(!!errors.type)}
              >
                <option value="">— Select Right —</option>
                {REQUEST_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
              {errors.type && (
                <p className="text-xs text-[#ef4444] font-medium mt-1.5 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-[#ef4444] inline-block" />
                  {errors.type.message}
                </p>
              )}
              <div className="mt-2 px-3.5 py-2.5 bg-[#eff6ff] rounded-[8px] border border-[#bfdbfe]">
                <p className="text-xs text-[#1d4ed8] font-medium">
                  🛡️ Protected under DPDP Act 2023 — 30-day SLA guaranteed.
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <SectionLabel icon={<AlignLeft size={13} />} label="Description & Reasoning" />
              <textarea
                {...register('description')}
                rows={4}
                className={[inputClass(!!errors.description), "resize-y"].join(' ')}
                placeholder="Briefly describe what specific data or action you are requesting..."
              />
              {errors.description && (
                <p className="text-xs text-[#ef4444] font-medium mt-1.5 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-[#ef4444] inline-block" />
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Attachments */}
            <div>
              <SectionLabel icon={<Paperclip size={13} />} label="Attachments (Optional)" />
              <FileUpload
                accept="application/pdf,image/jpeg,image/png"
                onFileSelect={(f) => setFile(f)}
              />
            </div>

            {/* Actions */}
            <div className="pt-5 border-t border-[#f1f5f9] flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => window.history.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting} className="group">
                {!isSubmitting && (
                  <>
                    Submit Request
                    <ArrowRight size={15} className="ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
