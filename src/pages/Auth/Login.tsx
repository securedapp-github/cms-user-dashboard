import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Lock } from 'lucide-react';
import { authApi } from '../../services/api/auth';
import { userApi } from '../../services/api/userApi';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import logo from '../../assets/STRIGHT.png';

const requestOtpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  phone_number: z.string().min(10, 'Please enter a valid phone number'),
});

type RequestOtpForm = z.infer<typeof requestOtpSchema>;

export default function Login() {
  const [step, setStep] = useState<1 | 2>(1);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30);
  
  const navigate = useNavigate();
  const { setAuthenticated, setCredentials, email: storeEmail, phone_number: storePhone } = useAuthStore();
  const { addToast } = useToastStore();
  
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const { register, handleSubmit, formState: { errors } } = useForm<RequestOtpForm>({
    resolver: zodResolver(requestOtpSchema)
  });

  useEffect(() => {
    if (step === 2 && secondsLeft > 0) {
      const timer = setInterval(() => setSecondsLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [step, secondsLeft]);

  const onRequestSubmit = async (data: RequestOtpForm) => {
    setIsLoading(true);
    try {
      await authApi.requestOtp(data.email, data.phone_number);
      setCredentials(data.email, data.phone_number);
      addToast('OTP sent securely to your device', 'success');
      setStep(2);
      setSecondsLeft(30);
      setTimeout(() => otpRefs[0].current?.focus(), 100);
    } catch (err: any) {
      addToast(err.message || 'Failed to send OTP', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      for (let i = 0; i < pasted.length; i++) {
        if (index + i < 6) newOtp[index + i] = pasted[i];
      }
      setOtp(newOtp);
      const nextFocus = Math.min(index + pasted.length, 5);
      otpRefs[nextFocus].current?.focus();
      return;
    }
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    } else if (e.key === 'Enter' && otp.every(v => v !== '')) {
      handleVerify();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    if (otpValue.length < 6) return;
    setIsLoading(true);
    try {
      const email = storeEmail || 'user@example.com';
      const phone_number = storePhone || '+1234567890';
      
      // Real backend OTP verification
      await authApi.verifyOtp(email, phone_number, otpValue);

      // Actual backend session login
      const sessionRes = await userApi.loginUser({ email, phone_number });
      
      if (sessionRes && sessionRes.token) {
        // Store the JWT for subsequent API requests
        localStorage.setItem('user_token', sessionRes.token);
        
        // Fetch the actual principal profile from the backend
        const userProfile = await userApi.getUser();
        
        if (userProfile && (userProfile.principal_id || userProfile.id)) {
          setAuthenticated(userProfile);
          addToast(`Welcome back!`, 'success');
          navigate('/');
        } else {
          throw new Error("Could not retrieve user profile");
        }
      } else {
        throw new Error("Failed to authenticate with server");
      }
    } catch (err: any) {
      addToast(err.message || 'Verification Failed', 'error');
      setOtp(['', '', '', '', '', '']);
      otpRefs[0].current?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (secondsLeft > 0) return;
    setIsLoading(true);
    try {
      if (storeEmail && storePhone) {
        await authApi.requestOtp(storeEmail, storePhone);
        addToast('OTP resent successfully', 'success');
        setSecondsLeft(30);
        setOtp(['', '', '', '', '', '']);
        otpRefs[0].current?.focus();
      }
    } catch {
      addToast('Failed to resend OTP', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-[#4f46e5]/10 to-[#6366f1]/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-gradient-to-tr from-blue-400/8 to-indigo-300/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#4f46e5]/4 to-transparent blur-3xl" />
      </div>
      
      <div className="w-full max-w-[420px] relative z-10">
        
        {/* Logo + branding */}
        <div className="text-center mb-6">
          <div className="relative inline-block -mt-8 -mb-10">
            <img 
              src={logo} 
              alt="Stright Logo" 
              className="h-40 w-auto mx-auto object-contain drop-shadow-md pointer-events-none" 
            />
          </div>
          <p className="text-[#64748b] text-sm relative z-10">
            {step === 1 ? 'Sign in to your privacy dashboard' : 'Enter your verification code'}
          </p>
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-1 mt-3">
            <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 1 ? 'w-8 bg-[#4f46e5]' : 'w-3 bg-[#e2e8f0]'}`} />
            <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 2 ? 'w-8 bg-[#4f46e5]' : 'w-3 bg-[#e2e8f0]'}`} />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[24px] shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-[#f1f5f9] overflow-hidden">
          {/* Top accent */}
          <div className="h-1 w-full bg-gradient-to-r from-[#4f46e5] to-[#6366f1]" />

          <div className="p-8">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-5">
                    <h2 className="text-lg font-semibold text-[#0f172a] mb-1">Welcome back</h2>
                    <p className="text-sm text-[#64748b]">Enter your credentials to receive a one-time code.</p>
                  </div>
                  <form onSubmit={handleSubmit(onRequestSubmit)} className="flex flex-col gap-4">
                    <Input
                      label="Email Address"
                      placeholder="name@domain.com"
                      {...register('email')}
                      error={errors.email?.message}
                      disabled={isLoading}
                      autoComplete="email"
                    />
                    <Input
                      label="Phone Number"
                      placeholder="+91 98765 43210"
                      {...register('phone_number')}
                      error={errors.phone_number?.message}
                      disabled={isLoading}
                      autoComplete="tel"
                    />
                    <Button type="submit" className="w-full mt-1 group" isLoading={isLoading} size="md">
                      {!isLoading && (
                        <>
                          Continue
                          <ArrowRight size={16} className="ml-1.5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                    <div className="text-center mt-3 pt-3 border-t border-[#f1f5f9]">
                      <p className="text-sm text-[#64748b]">
                        New to SecureCMS?{' '}
                        <Link to="/signup" className="text-[#4f46e5] font-semibold hover:text-[#4338ca] transition-colors">
                          Create Account
                        </Link>
                      </p>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-full mb-5">
                    <button
                      onClick={() => setStep(1)}
                      className="flex items-center gap-1.5 text-sm font-medium text-[#64748b] hover:text-[#0f172a] transition-colors"
                    >
                      <ArrowLeft size={15} /> Back
                    </button>
                  </div>

                  <div className="w-10 h-10 rounded-[12px] bg-[#eef2ff] flex items-center justify-center mb-4">
                    <Lock size={18} className="text-[#4f46e5]" />
                  </div>
                  <h2 className="text-base font-semibold text-[#0f172a] mb-1">Check your inbox</h2>
                  <p className="text-sm text-[#64748b] mb-6 text-center">Enter the 6-digit code we sent to your device.</p>

                  {/* OTP inputs */}
                  <div className="flex gap-3 justify-center mb-6">
                    {otp.map((val, idx) => (
                      <input
                        key={idx}
                        ref={otpRefs[idx]}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={val}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        disabled={isLoading}
                        className={[
                          "w-12 h-14 text-center text-xl font-bold",
                          "rounded-[12px] border-2 transition-all duration-200",
                          "bg-[#f8fafc] text-[#0f172a]",
                          "focus:outline-none focus:border-[#4f46e5] focus:bg-white",
                          "focus:shadow-[0_0_0_3px_rgba(79,70,229,0.12)]",
                          val ? "border-[#4f46e5] bg-[#eef2ff]" : "border-[#e2e8f0]",
                          "disabled:opacity-50",
                        ].join(' ')}
                      />
                    ))}
                  </div>

                  <Button 
                    onClick={handleVerify}
                    className="w-full mb-4" 
                    isLoading={isLoading}
                    disabled={otp.some(v => v === '')}
                  >
                    Verify & Sign In
                  </Button>

                    <div className="text-center text-sm">
                      {secondsLeft > 0 ? (
                        <span className="text-[#64748b]">
                          Resend code in <span className="font-semibold text-[#0f172a] tabular-nums">{secondsLeft}s</span>
                        </span>
                      ) : (
                        <button
                          onClick={handleResend}
                          disabled={isLoading}
                          className="font-semibold text-[#4f46e5] hover:text-[#4338ca] hover:underline focus:outline-none transition-colors"
                        >
                          Didn't receive a code? Resend
                        </button>
                      )}
                    </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-[11px] text-[#94a3b8] mt-6">
          🔒 Secured with end-to-end encryption · Stright v2.0
        </p>
      </div>
    </div>
  );
}
