import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { loginSchema, type LoginInput } from '../lib/schemas/auth';

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, setError, formState: { errors } } = useForm<LoginInput>({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });

  const onSubmit = async (data: LoginInput) => {
    clearError();
    // Validate with Zod
    const validationResult = loginSchema.safeParse(data);
    if (!validationResult.success) {
      validationResult.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as 'email' | 'password';
        setError(fieldName, { type: 'manual', message: issue.message });
      });
      return;
    }

    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      // Error is handled in authStore
    }
  };

  const handleGoogleLogin = async () => {
    clearError();
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      // Error is handled in authStore
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white p-8 rounded-[24px] border border-white/60 shadow-[12px_12px_24px_#d1d9e6,-12px_-12px_24px_#ffffff,inset_4px_4px_8px_rgba(255,255,255,0.6)] w-full text-left"
    >
      <div className="flex flex-col gap-2 mb-6">
        <h2 className="font-heading font-extrabold text-2xl text-slate-800 flex items-center gap-1.5">
          <span>👋 Welcome Back</span>
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          Sign in to continue your learning journey.
        </p>
      </div>

      {/* Custom Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-4 mb-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs font-semibold flex justify-between items-center shadow-[inset_2px_2px_4px_rgba(239,68,68,0.05)]"
          >
            <span>{error}</span>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700 font-bold ml-2 text-sm"
              type="button"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {/* Email Address */}
        <div className="flex flex-col gap-1 w-full relative">
          <label htmlFor="email" className="text-xs font-bold text-slate-700 pl-1">
            Email Address
          </label>
          <div className="relative flex items-center">
            <Mail size={16} className="absolute left-4 text-slate-400 pointer-events-none" />
            <input
              id="email"
              type="email"
              placeholder="e.g. name@domain.com"
              {...register('email')}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              className={`w-full py-3 pl-11 pr-4 bg-[#f0f4f8] rounded-2xl border outline-none text-slate-800 text-sm font-semibold transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-[#4F46E5]/20 ${errors.email ? 'border-red-300 focus:ring-red-100' : 'border-white/80 shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff]'}`}
            />
          </div>
          {errors.email && (
            <span id="email-error" className="text-[10px] text-red-500 font-bold pl-1" role="alert">
              {errors.email.message}
            </span>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1 w-full relative">
          <div className="flex justify-between items-center px-1">
            <label htmlFor="password" className="text-xs font-bold text-slate-700">
              Password
            </label>
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-xs text-[#4F46E5] hover:underline font-bold"
            >
              Forgot Password?
            </button>
          </div>
          <div className="relative flex items-center">
            <Lock size={16} className="absolute left-4 text-slate-400 pointer-events-none" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter password"
              {...register('password')}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
              className={`w-full py-3 pl-11 pr-12 bg-[#f0f4f8] rounded-2xl border outline-none text-slate-800 text-sm font-semibold transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-[#4F46E5]/20 ${errors.password ? 'border-red-300 focus:ring-red-100' : 'border-white/80 shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff]'}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-4 text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <span id="password-error" className="text-[10px] text-red-500 font-bold pl-1" role="alert">
              {errors.password.message}
            </span>
          )}
        </div>

        {/* Remember Me */}
        <div className="flex items-center gap-2 pl-1 select-none">
          <input
            id="rememberMe"
            type="checkbox"
            {...register('rememberMe')}
            className="w-4 h-4 rounded border-slate-300 text-[#4F46E5] focus:ring-[#4F46E5] cursor-pointer"
          />
          <label htmlFor="rememberMe" className="text-xs font-semibold text-slate-600 cursor-pointer">
            Remember Me
          </label>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 mt-2">
          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#4F46E5] text-white rounded-full font-bold text-sm shadow-[6px_6px_12px_rgba(79,70,229,0.25),-6px_-6px_12px_#ffffff,inset_2px_2px_4px_rgba(255,255,255,0.3)] transition-all duration-200 hover:bg-[#3B82F6] hover:translate-y-[-1px] active:translate-y-[1px] active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Login</span>
            )}
          </button>

          <div className="flex items-center gap-2 my-1">
            <div className="h-px bg-slate-200 flex-1" />
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">or</span>
            <div className="h-px bg-slate-200 flex-1" />
          </div>

          {/* Google Sign-in */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-full font-bold text-sm shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] transition-all duration-200 hover:translate-y-[-1px] active:translate-y-[1px] active:scale-98 flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.33 0 3.328 2.68 1.406 6.58l3.86 3.185z"
              />
              <path
                fill="#34A853"
                d="M16.04 15.345c-1.07.728-2.43 1.164-4.04 1.164-2.927 0-5.41-1.982-6.29-4.664L1.83 15.02c1.91 3.79 5.86 6.38 10.17 6.38 3.1 0 5.92-1.04 8.01-2.827l-3.97-3.228z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.275c0-.827-.074-1.627-.21-2.4H12v4.545h6.455c-.278 1.48-.112 2.3-.955 2.873l3.97 3.227c2.327-2.145 3.97-5.29 3.97-8.945z"
              />
              <path
                fill="#FBBC05"
                d="M5.71 11.845a7.042 7.042 0 0 1 0-2.08L1.85 6.58a12.025 12.025 0 0 0 0 10.84l3.86-3.185c-.23-.69-.35-1.42-.35-2.22l.35-.17z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>
      </form>

      <div className="text-center text-xs font-semibold mt-6">
        <span className="text-slate-500">Don't have an account? </span>
        <button onClick={() => navigate('/signup')} className="text-[#4F46E5] hover:underline font-bold">
          Create Account
        </button>
      </div>
    </motion.div>
  );
};
