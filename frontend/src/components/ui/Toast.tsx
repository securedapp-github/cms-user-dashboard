import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useToastStore } from '../../store/toastStore';
import { cn } from '../../utils/cn';

const toastConfig = {
  success: {
    icon: <CheckCircle2 className="w-[18px] h-[18px] text-emerald-500 shrink-0" />,
    bar: 'bg-emerald-500',
    bg: 'bg-white',
    ring: 'ring-emerald-100',
  },
  error: {
    icon: <AlertCircle className="w-[18px] h-[18px] text-red-500 shrink-0" />,
    bar: 'bg-red-500',
    bg: 'bg-white',
    ring: 'ring-red-100',
  },
  info: {
    icon: <Info className="w-[18px] h-[18px] text-blue-500 shrink-0" />,
    bar: 'bg-blue-500',
    bg: 'bg-white',
    ring: 'ring-blue-100',
  },
  warning: {
    icon: <AlertTriangle className="w-[18px] h-[18px] text-amber-500 shrink-0" />,
    bar: 'bg-amber-500',
    bg: 'bg-white',
    ring: 'ring-amber-100',
  },
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const config = toastConfig[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92, y: 8, transition: { duration: 0.18 } }}
              transition={{ type: 'spring', duration: 0.4, bounce: 0.2 }}
              className={cn(
                "pointer-events-auto flex items-center gap-3",
                "min-w-[300px] max-w-[380px]",
                "pl-4 pr-3 py-3",
                "rounded-[14px]",
                "shadow-[0_8px_24px_rgba(0,0,0,0.12)]",
                "ring-1",
                "relative overflow-hidden",
                config.bg,
                config.ring,
              )}
            >
              {/* Left accent bar */}
              <div className={cn("absolute left-0 top-0 bottom-0 w-[3px] rounded-l-[14px]", config.bar)} />
              
              {config.icon}
              <p className="flex-1 text-[13px] font-medium text-[#0f172a] leading-snug">
                {toast.message}
              </p>
              <button
                onClick={() => removeToast(toast.id)}
                className="w-7 h-7 flex items-center justify-center rounded-full text-[#94a3b8] hover:text-[#0f172a] hover:bg-[#f1f5f9] transition-all"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
