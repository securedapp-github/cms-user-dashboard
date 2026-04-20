import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Star, Smile } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { RatingStars } from '../components/ui/RatingStars';
import { useToastStore } from '../store/toastStore';
import { userApi } from '../services/api/userApi';

export default function Feedback() {
  const { t } = useTranslation();
  const { addToast } = useToastStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState('general_experience');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const CATEGORIES = [
    { label: t('feedback.categories.general', 'General Experience'), value: 'general_experience' },
    { label: t('feedback.categories.dsr', 'Recent DSR Request'), value: 'dsr_request' },
    { label: t('feedback.categories.grievance', 'Grievance Ticket Resolution'), value: 'grievance_resolution' }
  ];

  const validate = () => {
    if (rating < 1 || rating > 5) {
      addToast(t('common.error'), 'error');
      return false;
    }
    if (comment.length < 2 || comment.length > 500) {
      addToast(t('common.error'), 'error');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await userApi.submitFeedback({ category, rating, comment });
      setIsSubmitting(false);
      setSubmitted(true);
      addToast(t('common.success'), 'success');
    } catch (err: any) {
      setIsSubmitting(false);
      addToast(err.message || t('common.error'), 'error');
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setRating(0);
    setCategory('general_experience');
    setComment('');
  };

  const ratingLabel = [
    '', 
    t('feedback.rating_text.poor'), 
    t('feedback.rating_text.fair'), 
    t('feedback.rating_text.good'), 
    t('feedback.rating_text.great'), 
    t('feedback.rating_text.excellent')
  ][rating];

  return (
    <div className="max-w-2xl mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {submitted ? (
          /* Success State */
          <Card className="overflow-hidden text-center border-slate-200">
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 to-emerald-500" />
            <div className="p-16 flex flex-col items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center">
                <Smile size={36} className="text-emerald-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{t('feedback.success_title')} 🎉</h2>
                <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
                  {t('feedback.success_subtitle')}
                </p>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star 
                    key={s} 
                    size={24} 
                    className={s <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-100'} 
                  />
                ))}
              </div>
              <Button variant="secondary" onClick={handleReset} className="mt-2 px-8">
                {t('feedback.another_response')}
              </Button>
            </div>
          </Card>
        ) : (
          /* Submission Form */
          <Card className="overflow-hidden shadow-xl border-slate-200/60">
            {/* Top gradient accent */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#4f46e5] to-[#6366f1]" />

            <div className="px-10 pt-10 pb-8 text-center border-b border-slate-100 bg-slate-50/50">
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center mx-auto mb-5 rotate-3">
                <MessageSquare size={28} className="text-[#4f46e5]" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{t('feedback.title')}</h2>
              <p className="text-sm text-slate-500 mt-2 font-medium max-w-sm mx-auto leading-relaxed">
                {t('feedback.subtitle')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-9">
              {/* Category */}
              <Select
                label={t('feedback.labels.category')}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={CATEGORIES}
              />

              {/* Rating */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                  {t('feedback.labels.rating')} <span className="text-rose-500 text-xs">*</span>
                </label>
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between transition-all hover:bg-white hover:border-indigo-200 group">
                  <RatingStars rating={rating} onRatingChange={setRating} />
                  <span className="text-sm font-bold text-slate-400 group-hover:text-amber-500 transition-colors uppercase tracking-widest text-[10px]">
                    {ratingLabel}
                  </span>
                </div>
              </div>

              {/* Comments */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                  {t('feedback.labels.comments')} <span className="text-rose-500 text-xs">*</span>
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={5}
                  required
                  maxLength={500}
                  className="w-full px-6 py-4 text-sm rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 transition-all outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white resize-none"
                  placeholder={t('feedback.placeholders.comments')}
                />
                <div className="flex justify-between items-center px-1">
                   <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t('common.loading')}</span>
                   <span className={`text-[11px] font-bold ${comment.length > 450 ? 'text-amber-500' : 'text-slate-400'}`}>
                     {comment.length} / 500
                   </span>
                </div>
              </div>

              <Button
                type="submit"
                isLoading={isSubmitting}
                className="w-full h-16 text-base font-bold shadow-lg shadow-indigo-100 flex items-center justify-center gap-3"
              >
                {!isSubmitting && (
                  <>
                    {t('feedback.submit_btn')}
                    <Send size={20} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </form>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
