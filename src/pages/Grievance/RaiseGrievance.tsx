import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
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
import { userApi } from '../../services/api/userApi';

const grievanceSchema = z.object({
  tenant:      z.string().min(1, 'grievance.form.tenant_error'),
  category:    z.string().min(1, 'grievance.form.category_error'),
  description: z.string().min(10, 'grievance.form.description_error').max(1000),
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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [_file, setFile] = useState<File | null>(null);

  const [tenants, setTenants] = useState<any[]>([]);

  useEffect(() => {
    userApi.getTenants().then(res => {
      if (res && res.tenants) setTenants(res.tenants);
    }).catch(console.error);
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm<GrievanceForm>({
    resolver: zodResolver(grievanceSchema)
  });

  const onSubmit = async (data: GrievanceForm) => {
    setIsSubmitting(true);
    try {
      await userApi.createGrievance({
        tenant_id: data.tenant,
        category: data.category,
        description: data.description,
      });
      addToast(t('common.success'), 'success');
      navigate('/grievance/history');
    } catch (err: any) {
      addToast(err.message || t('common.error'), 'error');
    } finally {
      setIsSubmitting(false);
    }
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
      {t(msg)}
    </p>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#0f172a] tracking-tight">{t('grievance.raise_title')}</h2>
          <p className="text-sm text-[#64748b] mt-0.5">{t('grievance.raise_subtitle')}</p>
        </div>
        <Link to="/grievance/history">
          <Button variant="outline" size="sm">
            <History size={14} className="mr-1.5" />
            {t('grievance.history_btn')}
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
              {t('grievance.sla_banner')}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8 space-y-7 pt-5">

            {/* Tenant */}
            <div>
              <SectionLabel icon={<Building2 size={13} />} label={t('grievance.form.tenant_label')} />
              <select {...register('tenant')} className={inputClass(!!errors.tenant)}>
                <option value="">{t('grievance.form.tenant_placeholder')}</option>
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              {errMsg(errors.tenant?.message)}
            </div>

            {/* Category */}
            <div>
              <SectionLabel icon={<Tag size={13} />} label={t('grievance.form.category_label')} />
              <select {...register('category')} className={inputClass(!!errors.category)}>
                <option value="">{t('grievance.form.category_placeholder')}</option>
                <option value="privacy_leak">{t('grievance.categories.privacy_leak')}</option>
                <option value="data_incorrect">{t('grievance.categories.data_incorrect')}</option>
                <option value="unauthorized_access">{t('grievance.categories.unauthorized_access')}</option>
                <option value="proc_error">{t('grievance.categories.proc_error')}</option>
                <option value="other">{t('grievance.categories.other')}</option>
              </select>
              {errMsg(errors.category?.message)}
            </div>

            {/* Description */}
            <div>
              <SectionLabel icon={<AlignLeft size={13} />} label={t('grievance.form.description_label')} />
              <textarea
                {...register('description')}
                rows={5}
                className={[inputClass(!!errors.description), "resize-y"].join(' ')}
                placeholder={t('grievance.form.description_placeholder')}
              />
              {errMsg(errors.description?.message)}
            </div>

            {/* Attachments */}
            <div>
              <SectionLabel icon={<Paperclip size={13} />} label={t('grievance.form.attachments_label')} />
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
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                variant="danger"
                isLoading={isSubmitting}
                className="group"
              >
                {!isSubmitting && (
                  <>
                    {t('grievance.form.submit_btn')}
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
