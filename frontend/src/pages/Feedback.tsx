import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Star, Smile } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { RatingStars } from '../components/ui/RatingStars';
import { useToastStore } from '../store/toastStore';

export default function Feedback() {
  const { addToast } = useToastStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState('general');
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      addToast('Please provide a star rating', 'error');
      return;
    }
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setSubmitted(true);
    addToast('Thank you for your valuable feedback!', 'success');
  };

  const handleReset = () => {
    setSubmitted(false);
    setRating(0);
    setCategory('general');
    setComments('');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {submitted ? (
          /* Success state */
          <Card className="overflow-hidden text-center">
            <div className="h-1 w-full bg-gradient-to-r from-emerald-400 to-emerald-500" />
            <div className="p-12 flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center">
                <Smile size={36} className="text-emerald-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#0f172a] mb-2">Thank you! 🎉</h2>
                <p className="text-[#64748b] text-sm leading-relaxed max-w-sm">
                  Your feedback helps us build a better privacy experience for everyone.
                </p>
              </div>
              <div className="flex items-center gap-1 mt-2">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} size={20} className={s <= rating ? 'text-amber-400 fill-amber-400' : 'text-[#e2e8f0]'} />
                ))}
              </div>
              <Button variant="secondary" onClick={handleReset} className="mt-2">
                Submit Another Response
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            {/* Top gradient accent */}
            <div className="h-1 w-full bg-gradient-to-r from-[#4f46e5] to-[#6366f1]" />

            {/* Header section */}
            <div className="px-8 pt-8 pb-6 text-center border-b border-[#f1f5f9]">
              <div className="w-14 h-14 rounded-[16px] bg-[#eef2ff] border border-[#c7d2fe] flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={24} className="text-[#4f46e5]" />
              </div>
              <h2 className="text-xl font-bold text-[#0f172a] mb-1.5">Share Your Experience</h2>
              <p className="text-sm text-[#64748b] max-w-sm mx-auto leading-relaxed">
                We constantly strive to make managing your digital consent footprint completely frictionless.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-7">
              {/* Category */}
              <Select
                label="What are you giving feedback on?"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={[
                  { label: 'General Experience', value: 'general' },
                  { label: 'Recent DSR Request', value: 'dsr' },
                  { label: 'Grievance Ticket Resolution', value: 'grievance' },
                ]}
              />

              {/* Star rating */}
              <div className="space-y-2.5">
                <label className="text-sm font-medium text-[#0f172a] block">
                  Overall Rating <span className="text-[#ef4444]">*</span>
                </label>
                <div className="flex items-center gap-2 p-4 bg-[#f8fafc] rounded-[12px] border border-[#e2e8f0]">
                  <RatingStars rating={rating} onRatingChange={setRating} />
                  {rating > 0 && (
                    <span className="text-sm font-semibold text-[#64748b] ml-2">
                      {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][rating]}
                    </span>
                  )}
                </div>
              </div>

              {/* Comments */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#0f172a] block">
                  Detailed Comments <span className="text-[#ef4444]">*</span>
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={4}
                  required
                  className={[
                    "w-full px-4 py-3 text-sm rounded-[10px] resize-none",
                    "border border-[#e2e8f0] bg-[#f9fafb] text-[#0f172a]",
                    "placeholder:text-[#94a3b8]",
                    "transition-all duration-200",
                    "focus:outline-none focus:border-[#4f46e5] focus:bg-white",
                    "focus:shadow-[0_0_0_3px_rgba(79,70,229,0.1)]",
                    "hover:border-[#cbd5e1]",
                  ].join(' ')}
                  placeholder="Tell us what you liked or how we can improve..."
                />
                <p className="text-xs text-[#94a3b8] text-right">{comments.length} / 500</p>
              </div>

              <Button
                type="submit"
                isLoading={isSubmitting}
                className="w-full group"
                size="md"
              >
                {!isSubmitting && (
                  <>
                    Submit Feedback
                    <Send size={15} className="ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
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
