import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { ArrowRight, AlertTriangle, History, Building2, Tag, AlignLeft, Paperclip } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FileUpload } from '../../components/ui/FileUpload';
import { useToastStore } from '../../store/toastStore';

const grievanceSchema = z.object({
  tenant:      z.string().min(1, 'Please select a tenant'),
  category:    z.string().min(1, 'Please select a category'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000),
});

type GrievanceForm = z.infer<typeof grievanceSchema>;

function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-6 h-6 rounded-[6px] bg-red-50 flex items-center justify-center text-red-500 shrink-0">
        {icon}
      </div>
      <span className="text-sm font-semibold text-[#0f172a]">{label}</span>
    </div>
  );
}

export default function RaiseGrievance() {
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [_file, setFile] = useState<File | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<GrievanceForm>({
    resolver: zodResolver(grievanceSchema)
  });

  const onSubmit = async (_data: GrievanceForm) => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    addToast('Ticket GR-992 Filed Successfully!', 'success');
    navigate('/grievance/history');
  };

  const inputClass = (hasError: boolean) => [
    "w-full px-4 py-2.5 text-sm rounded-[10px]",
    "border bg-[#f9fafb] text-[#0f172a]",
    "transition-all duration-200 focus:outline-none focus:bg-white hover:border-[#cbd5e1]",
    "focus:shadow-[0_0_0_3px_rgba(239,68,68,0.08)]",
    hasError
      ? "border-[#ef4444] focus:border-[#ef4444]"
      : "border-[#e2e8f0] focus:border-[#ef4444]",
  ].join(' ');

  const errMsg = (msg?: string) => msg && (
    <p className="text-xs text-[#ef4444] font-medium mt-1.5 flex items-center gap-1">
      <span className="w-1 h-1 rounded-full bg-[#ef4444] inline-block" />
      {msg}
    </p>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#0f172a] tracking-tight">Raise Grievance</h2>
          <p className="text-sm text-[#64748b] mt-0.5">Report an issue or violation regarding your data privacy.</p>
        </div>
        <Link to="/grievance/history">
          <Button variant="outline" size="sm">
            <History size={14} className="mr-1.5" />
            Ticket History
          </Button>
        </Link>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className="overflow-hidden">
          {/* Red accent top bar */}
          <div className="h-1 w-full bg-gradient-to-r from-[#ef4444] to-[#f97316]" />

          {/* SLA banner */}
          <div className="mx-6 mt-5 flex items-center gap-3 px-4 py-3 rounded-[12px] bg-[#fff7ed] border border-[#fed7aa]">
            <AlertTriangle size={16} className="text-orange-500 shrink-0" />
            <p className="text-xs font-semibold text-orange-800">
              SLA Enforced: Auto-escalates to DPO if unresolved within <span className="font-bold">48 hours</span>.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8 space-y-7 pt-5">

            {/* Tenant */}
            <div>
              <SectionLabel icon={<Building2 size={13} />} label="Involved Organisation" />
              <select {...register('tenant')} className={inputClass(!!errors.tenant)}>
                <option value="">— Select Organisation —</option>
                <option value="Global Trust Bank">Global Trust Bank</option>
                <option value="FinTech App XYZ">FinTech App XYZ</option>
                <option value="ShopEasy Commerce">ShopEasy Commerce</option>
                <option value="other">Other / Unknown</option>
              </select>
              {errMsg(errors.tenant?.message)}
            </div>

            {/* Category */}
            <div>
              <SectionLabel icon={<Tag size={13} />} label="Grievance Category" />
              <select {...register('category')} className={inputClass(!!errors.category)}>
                <option value="">— Select Category —</option>
                <option value="consent_viol">Consent Violation (Data used without permission)</option>
                <option value="breach">Potential Data Breach</option>
                <option value="proc_error">Inaccurate Processing / Error</option>
                <option value="unauth_share">Unauthorized Third-Party Sharing</option>
                <option value="other">Other</option>
              </select>
              {errMsg(errors.category?.message)}
            </div>

            {/* Description */}
            <div>
              <SectionLabel icon={<AlignLeft size={13} />} label="Description of Issue" />
              <textarea
                {...register('description')}
                rows={5}
                className={[inputClass(!!errors.description), "resize-y"].join(' ')}
                placeholder="Provide details about the unauthorized sharing or violation. Be as specific as possible..."
              />
              {errMsg(errors.description?.message)}
            </div>

            {/* Attachments */}
            <div>
              <SectionLabel icon={<Paperclip size={13} />} label="Evidence Attachments (Optional)" />
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
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="danger"
                isLoading={isSubmitting}
                className="group"
              >
                {!isSubmitting && (
                  <>
                    File Grievance
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
