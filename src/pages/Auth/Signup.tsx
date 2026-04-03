import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { ArrowRight, UserPlus, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

const signupSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(1, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(15, 'Phone number too long'),
});

type SignupForm = z.infer<typeof signupSchema>;

export default function Signup() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setSignupData } = useAuthStore();
  const { addToast } = useToastStore();

  const { register, handleSubmit, formState: { errors } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema)
  });

  const onSubmit = async (data: SignupForm) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Store signup data globally
      setSignupData(data);
      
      addToast('Profile created! Now verify your mobile/email.', 'success');
      
      // Redirect to login (OTP page)
      navigate('/login');
    } catch (err: any) {
      addToast('Failed to create account. Please try again.', 'error');
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
      </div>
      
      <div className="w-full max-w-[480px] relative z-10">
        
        {/* Logo + branding */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#4f46e5] to-[#6366f1] flex items-center justify-center rounded-[16px] mx-auto shadow-[0_8px_24px_rgba(79,70,229,0.35)] text-white">
              <UserPlus size={26} />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 flex items-center justify-center">
              <Sparkles size={10} className="text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[#0f172a] mb-1.5 tracking-tight">
            Create Account
          </h1>
          <p className="text-[#64748b] text-sm">
            Join SecureCMS to manage your privacy securely
          </p>
        </div>

        {/* Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[24px] shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-[#f1f5f9] overflow-hidden"
        >
          {/* Top accent */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#4f46e5] to-[#6366f1]" />

          <div className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  placeholder="Rhea"
                  {...register('firstName')}
                  error={errors.firstName?.message}
                  disabled={isLoading}
                />
                <Input
                  label="Last Name"
                  placeholder="Sharma"
                  {...register('lastName')}
                  error={errors.lastName?.message}
                  disabled={isLoading}
                />
              </div>

              <Input
                label="Email Address"
                placeholder="rhea@gmail.com"
                type="email"
                {...register('email')}
                error={errors.email?.message}
                disabled={isLoading}
              />

              <Input
                label="Mobile Number"
                placeholder="9876543210"
                {...register('phone')}
                error={errors.phone?.message}
                disabled={isLoading}
              />

              <Button type="submit" className="w-full mt-2 group" isLoading={isLoading} size="md">
                {!isLoading && (
                  <>
                    Sign Up
                    <ArrowRight size={16} className="ml-1.5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
              
              <div className="text-center mt-2">
                <p className="text-sm text-[#64748b]">
                  Already have an account?{' '}
                  <Link to="/login" className="text-[#4f46e5] font-semibold hover:text-[#4338ca] transition-colors">
                    Log In
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Footer note */}
        <p className="text-center text-[11px] text-[#94a3b8] mt-8 uppercase tracking-widest font-medium opacity-60">
          🔒 Enterprise Grade Privacy Protection
        </p>
      </div>
    </div>
  );
}
