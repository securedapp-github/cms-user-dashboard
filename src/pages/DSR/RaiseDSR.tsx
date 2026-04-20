import { useTranslation } from 'react-i18next';
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
import { mutate } from 'swr';

const dsrSchema = z.object({
  tenant_id: z.string().min(1, 'dsr.form.tenant_error'),
  app_id: z.string().min(1, 'dsr.form.app_error'),
  type: z.string().min(1, 'dsr.form.type_error'),
  description: z.string().min(10, 'dsr.form.description_error').max(1000),
});

type DsrForm = z.infer<typeof dsrSchema>;

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
  const { t } = useTranslation();
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

  const REQUEST_TYPES = [
    { label: t('dsr.types.access'), value: 'access' },
    { label: t('dsr.types.portability'), value: 'portability' },
    { label: t('dsr.types.rectification'), value: 'rectification' },
    { label: t('dsr.types.erasure'), value: 'erasure' },
  ];

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
      addToast(t('common.success'), 'success');
      mutate('user/summary');
      mutate((key: any) => Array.isArray(key) && key[0] === 'user/dsr/requests');
      navigate('/dsr/track');
    } catch (err: any) {
      addToast(err.message || t('common.error'), "error");
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
          <h2 className="text-xl font-bold text-[#0f172a] tracking-tight">{t('dsr.raise_title')}</h2>
          <p className="text-sm text-[#64748b] mt-0.5">{t('dsr.raise_subtitle')}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/dsr/track')}>
          {t('dsr.track_existing')}
        </Button>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className="overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-[#4f46e5] to-[#6366f1]" />

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8 space-y-7">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tenant */}
              <div>
                <SectionLabel icon={<Building2 size={13} />} label={t('dsr.form.tenant_label')} />
                <select
                  {...register('tenant_id')}
                  className={inputClass(!!errors.tenant_id)}
                >
                  <option value="">{t('dsr.form.tenant_placeholder')}</option>
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} {t.industry ? `(${t.industry})` : ''}
                    </option>
                  ))}
                </select>
                {errors.tenant_id && (
                  <p className="text-xs text-[#ef4444] font-medium mt-1.5 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-[#ef4444] inline-block" />
                    {t(errors.tenant_id.message!)}
                  </p>
                )}
              </div>

              {/* App */}
              <div>
                <SectionLabel icon={<MonitorSmartphone size={13} />} label={t('dsr.form.app_label')} />
                <select
                  {...register('app_id')}
                  className={inputClass(!!errors.app_id)}
                  disabled={!selectedTenantId || apps.length === 0}
                >
                  <option value="">{t('dsr.form.app_placeholder')}</option>
                  {apps.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} {a.slug ? `[${a.slug}]` : ''}
                    </option>
                  ))}
                </select>
                {errors.app_id && (
                  <p className="text-xs text-[#ef4444] font-medium mt-1.5 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-[#ef4444] inline-block" />
                    {t(errors.app_id.message!)}
                  </p>
                )}
              </div>
            </div>

            {/* Request type */}
            <div>
              <SectionLabel icon={<FileText size={13} />} label={t('dsr.form.type_label')} />
              <select
                {...register('type')}
                className={inputClass(!!errors.type)}
              >
                <option value="">{t('dsr.form.type_placeholder')}</option>
                {REQUEST_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
              {errors.type && (
                <p className="text-xs text-[#ef4444] font-medium mt-1.5 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-[#ef4444] inline-block" />
                  {t(errors.type.message!)}
                </p>
              )}
              <div className="mt-2 px-3.5 py-2.5 bg-[#eff6ff] rounded-[8px] border border-[#bfdbfe]">
                <p className="text-xs text-[#1d4ed8] font-medium">
                  {t('dsr.sla_message')}
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <SectionLabel icon={<AlignLeft size={13} />} label={t('dsr.form.description_label')} />
              <textarea
                {...register('description')}
                rows={4}
                className={[inputClass(!!errors.description), "resize-y"].join(' ')}
                placeholder={t('dsr.form.description_placeholder')}
              />
              {errors.description && (
                <p className="text-xs text-[#ef4444] font-medium mt-1.5 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-[#ef4444] inline-block" />
                  {t(errors.description.message!)}
                </p>
              )}
            </div>

            {/* Attachments */}
            <div>
              <SectionLabel icon={<Paperclip size={13} />} label={t('dsr.form.attachments_label')} />
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
                {t('common.cancel')}
              </Button>
              <Button type="submit" isLoading={isSubmitting} className="group">
                {!isSubmitting && (
                  <>
                    {t('dsr.form.submit_btn')}
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
